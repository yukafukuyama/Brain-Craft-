import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

function buildSystemPrompt(generateQuiz: boolean, generateAnswer: boolean): string {
  const base = `単語学習アプリ用のデータを生成してください。

【多言語対応】
入力された単語の言語を自動で判別し、その言語の学習に最適な例文を作成してください。
英語、韓国語、中国語、フランス語、スペイン語など、あらゆる言語に対応してください。

【日本語訳の必須追加】
例文（example）には、必ずその日本語訳（example_jt）をセットで付けてください。`;

  const quizSection = generateQuiz
    ? `穴埋め問題（quiz）を作成する場合も、必ずその日本語訳（quiz_jt）をセットで付けてください。`
    : "";

  const jsonFields = [
    '"meaning": "単語の意味（日本語）"',
    '"example": "例文（対象言語）"',
    '"example_jt": "例文の日本語訳"',
  ];
  if (generateQuiz) {
    jsonFields.push('"quiz": "穴埋め問題（対象言語。空欄は ___ で示す）"');
    jsonFields.push('"quiz_jt": "穴埋め問題の日本語訳"');
  }
  if (generateAnswer) {
    jsonFields.push('"answer": "穴埋めの答え（入力された単語そのもの）"');
  }

  return `${base}
${quizSection}

【出力フォーマット】
レスポンスは必ず以下のJSON形式のみで返してください。他のテキストやマークダウンは含めないでください。
{
  ${jsonFields.join(",\n  ")}
}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("braincraft_session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  try {
    JSON.parse(sessionCookie);
  } catch {
    return NextResponse.json({ error: "セッションが無効です" }, { status: 401 });
  }

  const body = await request.json();
  const word = String(body.word ?? "").trim();
  const generateQuiz = body.generateQuiz !== false;
  const generateAnswer = body.generateAnswer !== false;

  if (!word) {
    return NextResponse.json({ error: "単語を入力してください" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(generateQuiz, generateAnswer);
  const parts = ["意味", "例文"];
  if (generateQuiz) parts.push("穴埋め形式の問題");
  if (generateAnswer) parts.push("その答え");
  const userPrompt = `次の単語の${parts.join("、")}を生成してください：${word}`;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `${systemPrompt}

${userPrompt}`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-pro"] as const;

  let lastError: unknown = null;
  try {
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const content = response.text?.trim();
      if (!content) continue;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsed = JSON.parse(jsonStr) as {
        meaning?: string;
        example?: string;
        example_jt?: string;
        quiz?: string;
        quiz_jt?: string;
        question?: string;
        answer?: string;
      };

      const ex = String(parsed.example ?? "").trim();
      const exJt = String(parsed.example_jt ?? "").trim();
      const q = generateQuiz ? String(parsed.quiz ?? parsed.question ?? "").trim() : "";
      const qJt = generateQuiz ? String(parsed.quiz_jt ?? "").trim() : "";
      const ans = generateAnswer ? (String(parsed.answer ?? word).trim() || word) : "";

      return NextResponse.json({
        meaning: String(parsed.meaning ?? "").trim(),
        example: exJt ? `${ex}\n（訳）${exJt}` : ex,
        question: qJt ? `${q}\n（訳）${qJt}` : q,
        answer: ans,
      });
    } catch (err: unknown) {
      const errMsg = err && typeof err === "object" && "message" in err ? String((err as { message?: unknown }).message) : "";
      const isNotFound = (err && typeof err === "object" && "status" in err && (err as { status?: string }).status === "NOT_FOUND")
        || errMsg.includes("not found") || errMsg.includes("NOT_FOUND");
      if (isNotFound) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  if (lastError) {
    return NextResponse.json(
      { error: "利用可能なモデルが見つかりません。Google AI Studioの設定を確認してください。" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "生成に失敗しました" },
    { status: 500 }
  );
  } catch (err: unknown) {
    console.error("Gemini generate error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "生成結果の解析に失敗しました" },
        { status: 500 }
      );
    }
    const errObj = err && typeof err === "object" ? (err as { message?: unknown; status?: unknown }) : {};
    const msg = String(errObj.message ?? "").toLowerCase();
    if (msg.includes("401") || msg.includes("api key") || msg.includes("invalid")) {
      return NextResponse.json(
        { error: "APIキーが無効です。Google AI Studioでキーを確認してください。" },
        { status: 500 }
      );
    }
    if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) {
      return NextResponse.json(
        { error: "利用制限に達しました。しばらく時間をおいてからお試しください。" },
        { status: 500 }
      );
    }
    if (msg.includes("403") || msg.includes("permission_denied")) {
      return NextResponse.json(
        { error: "APIへのアクセスが拒否されました。Google AI StudioでAPIが有効か確認してください。" },
        { status: 500 }
      );
    }
    const errMsg = errObj.message ? String(errObj.message) : "";
    return NextResponse.json(
      { error: errMsg || "生成に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}
