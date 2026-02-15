import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `単語学習アプリ用のデータです。日本語で分かりやすく、覚えやすい例文を作ってください。
出力は必ず以下のJSON形式のみで返してください。他のテキストやマークダウンは含めないでください。
{
  "meaning": "意味（日本語）",
  "example": "例文（英単語を含む英文）",
  "question": "問題（穴埋め形式・日本語で、例：「〇〇を表す英単語は？」）",
  "answer": "答え（入力された単語そのもの）"
}`;

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
  if (!word) {
    return NextResponse.json({ error: "単語を入力してください" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `${SYSTEM_PROMPT}

次の英単語の意味、例文、穴埋め形式の問題、その答えを生成してください：${word}`;

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
        question?: string;
        answer?: string;
      };

      return NextResponse.json({
        meaning: String(parsed.meaning ?? "").trim(),
        example: String(parsed.example ?? "").trim(),
        question: String(parsed.question ?? "").trim(),
        answer: String(parsed.answer ?? word).trim() || word,
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
