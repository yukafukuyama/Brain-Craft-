import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { getLanguage } from "@/lib/settings-store";
import type { Locale } from "@/lib/settings-store";

const IDIOM_EXAMPLE = `例：「get back to」の場合は
{
  "meaning": "改めて連絡し直す",
  "breakdown": "get（得る）＋ back（戻る）＋ to（〜へ）",
  "reaction": "「返答が自分のところに戻ってくる」というイメージから、単なる返事ではなく「改めてこちらから連絡し直す」というニュアンスになります。",
  "usage": "ビジネスメールや会議のフォローアップでよく使われます。「I'll get back to you.」は「後で改めて連絡します」の意味。",
  "example": "I'll get back to you with the details by Friday.",
  "example_jt": "金曜日までに詳細を改めてお伝えします。"
}`;

const FURIGANA_INSTRUCTION_EN = `【Japanese translations with furigana (when app language is English)】
The user learns English while also learning to read Japanese kanji. For all Japanese text you output (meaning, example_jt, quiz_jt, and any idiom fields in Japanese):
1. Use both hiragana and kanji (do not use only kanji or only kana).
2. Add furigana to kanji so readings are clear. Prefer the inline format 漢字(かんじ) (e.g. 学習(がくしゅう), 例文(れいぶん)) for compatibility. HTML <ruby>漢字<rt>かんじ</rt></ruby> is also acceptable.
Use the same format consistently throughout.`;

const BEGINNER_MODE_EN = `【初心者モード】
・語彙制限：専門用語や難解な漢字を使わず、小学校低学年が理解できる言葉で説明してください。
・具体例の重視：辞書的な定義（例：〜科の植物）ではなく、見た目・味・使い方（例：赤い、甘い、食べる）を優先してください。
・ふりがなの徹底：全ての漢字に 漢字(かんじ) 形式でふりがなを付けてください。`;

const BEGINNER_MODE_EN_SUPPLEMENT = `【Beginner mode — English supplement】
When app language is English: After the Japanese explanation, add one line in Plain English (simple, easy words) to summarize or clarify.`;

const JAPANESE_IDIOM_DETECTION_EN = `【When input is in Japanese: detect 単語 vs 慣用句】
If the input appears to be Japanese, first determine whether it is:
- 単語 (a simple word): output as usual.
- 慣用句・イディオム・ことわざ (idiom/proverb): apply the idiom format below.

Detection criteria:
1. Morphological: If multiple words/phrases combine to have a figurative meaning different from their literal meaning → treat as idiom (e.g. 猫をかぶる, 手が届く).
2. Dictionary: Prioritize expressions commonly found in idiom dictionaries (e.g. 猫をかぶる, 手が届く, 頭に来る).

【For Japanese idiom in English mode】
When the input is a Japanese idiom and the user's language is English: explain the idiom's meaning in English first, then add the Japanese explanation with furigana (漢字(かんじ)). Format: "English: [meaning]. 日本語: [explanation with 漢字(かんじ) furigana]."`;

function getLanguageInstruction(locale: Locale): string {
  if (locale === "en") {
    return `The user's language setting is English. Output word/idiom meanings and example/quiz translations in **Japanese** (so they can learn English vocabulary while also learning to read Japanese). All such Japanese text must include both hiragana and kanji, with furigana on kanji using the format 漢字(かんじ) or <ruby>漢字<rt>かんじ</rt></ruby>. Use example_jt and quiz_jt for the Japanese translation of the example and quiz sentences in this furigana format.

${BEGINNER_MODE_EN}

${BEGINNER_MODE_EN_SUPPLEMENT}

${FURIGANA_INSTRUCTION_EN}

${JAPANESE_IDIOM_DETECTION_EN}`;
  }
  return "ユーザーの言語設定は『日本語』です。単語・イディオムの解説、意味、例文の訳はすべて日本語で出力してください。ふりがなは不要です。";
}

function buildIdiomPrompt(generateQuiz: boolean, generateAnswer: boolean, locale: Locale): string {
  const langPrefix = getLanguageInstruction(locale);
  const isEn = locale === "en";
  const jsonFields = isEn
    ? [
        '"meaning": "イディオムの意味（日本語・漢字にふりがな）。最後に Plain English: [1行] で補足"',
        '"breakdown": "構成要素の分解。各単語の意味を 漢字(かんじ) 形式で。例：get（得る）＋ back（戻る）＋ to（〜へ）"',
        '"reaction": "化学反応の解説（日本語）。漢字には 漢字(かんじ) でふりがな"',
        '"usage": "使い分けの解説（日本語）。漢字には 漢字(かんじ) でふりがな"',
        '"example": "例文（英語など対象言語）"',
        '"example_jt": "例文の日本語訳。ひらがなと漢字を併記し、漢字には 漢字(かんじ) でふりがな"',
      ]
    : [
        '"meaning": "イディオムの意味（日本語、簡潔に）"',
        '"breakdown": "構成要素の分解（各単語の本来の意味を＋で繋ぐ。例：get（得る）＋ back（戻る）＋ to（〜へ））"',
        '"reaction": "化学反応：組み合わさることでなぜ今の意味になるかを、イメージで解説"',
        '"usage": "使い分け：ビジネス、日常会話など、どんな場面で使われるのが自然か"',
        '"example": "例文（イディオムのニュアンスが一番伝わるシチュエーション）"',
        '"example_jt": "例文の日本語訳"',
      ];
  if (generateQuiz) {
    jsonFields.push(isEn ? '"quiz": "穴埋め問題（対象言語。空欄は ___ で示す）"' : '"quiz": "穴埋め問題（対象言語。空欄は ___ で示す）"');
    jsonFields.push(isEn ? '"quiz_jt": "穴埋めの日本語訳（___は使わず完全な文）。漢字には 漢字(かんじ) でふりがな"' : '"quiz_jt": "穴埋めの日本語訳（___は使わず、空欄を埋めた完全な文、ふりがな不要）"');
  }
  if (generateAnswer) {
    jsonFields.push('"answer": "穴埋めの答え（入力されたイディオムそのもの）"');
  }

  const furiganaNote = isEn
    ? "\n【ふりがな】\n全ての日本語（meaning, breakdown, reaction, usage, example_jt, quiz_jt）にはひらがなと漢字の両方を使い、漢字には 漢字(かんじ) の形式でふりがなを付けてください。HTMLの <ruby>漢字<rt>かんじ</rt></ruby> でも可。\n\n"
    : "";

  return `${langPrefix}
${furiganaNote}
イディオム（慣用句・句動詞）学習用のデータを生成してください。
入力は2語以上のフレーズです。イディオムとして特別に解析してください。

【必須項目】
1. 構成要素の分解：それぞれの単語の本来の意味を説明
2. 化学反応（意味の変化）：組み合わさることで、なぜ今の意味になるかを「イメージ」で解説
3. 使い分け：ビジネス、日常会話など、どんな場面で使うのが自然か明記
4. 例文：イディオムのニュアンスが一番伝わるシチュエーションで作成

【和訳について】
example_jt（例文の日本語訳）および quiz_jt（穴埋め問題の日本語訳）は、省略や要約をせず、全文を漏れなく書いてください。
quiz_jt は穴埋め部分（___）を含めず、空欄を埋めた状態の文を日本語で完全に書いてください。

【出力フォーマット】
以下のJSON形式のみで返してください。他のテキストは含めないでください。

${IDIOM_EXAMPLE}

{
  ${jsonFields.join(",\n  ")}
}`;
}

function buildSystemPrompt(generateQuiz: boolean, generateAnswer: boolean, locale: Locale): string {
  const langPrefix = getLanguageInstruction(locale);
  const isJa = locale === "ja";
  const translationNote = isJa
    ? "【日本語訳の必須追加】\n例文（example）には、必ずその日本語訳（example_jt）をセットで付けてください。\nquiz_jt（穴埋めの日本語訳）は、___ は使わず、空欄を埋めた状態の完全な文を書いてください。"
    : "Always include example_jt (translation of the example in the user's language). For quiz_jt, write the full sentence with the blank filled, no ___.";
  const quizSection = generateQuiz
    ? (isJa ? "穴埋め問題（quiz）を作成する場合も、必ずその日本語訳（quiz_jt）をセットで付けてください。" : "Include quiz_jt (translation of the quiz sentence) when generating quiz.")
    : "";

  const jsonFields = isJa
    ? [
        '"type": "word" or "idiom" — 入力が慣用句・ことわざの場合は "idiom"、単語の場合は "word"',
        '"meaning": "単語の意味（日本語、ふりがな不要）"',
        '"example": "例文（対象言語）"',
        '"example_jt": "例文の日本語訳（ふりがな不要）"',
      ]
    : [
        '"type": "word" or "idiom" — when input is Japanese idiom (慣用句) set "idiom", else "word"',
        '"meaning": "Japanese explanation with 漢字(かんじ) furigana; then add one line Plain English: [simple summary]"',
        '"example": "example sentence (target language, e.g. English)"',
        '"example_jt": "Japanese translation with 漢字(かんじ) furigana"',
      ];
  if (generateQuiz) {
    jsonFields.push(isJa ? '"quiz": "穴埋め問題（対象言語。空欄は ___ で示す）"' : '"quiz": "fill-in-blank quiz (use ___ for blank)"');
    jsonFields.push(isJa ? '"quiz_jt": "穴埋めの日本語訳（___は使わず、空欄を埋めた完全な文、ふりがな不要）"' : '"quiz_jt": "Japanese translation of quiz sentence (full sentence, no ___); use 漢字(かんじ) or <ruby> for furigana"');
  }
  if (generateAnswer) {
    jsonFields.push('"answer": "穴埋めの答え（入力された単語そのもの）"');
  }

  const base = `${langPrefix}

単語学習アプリ用のデータを生成してください。

【多言語対応】
入力された単語の言語を自動で判別し、その言語の学習に最適な例文を作成してください。
英語、韓国語、中国語、フランス語、スペイン語など、あらゆる言語に対応してください。

${translationNote}
${quizSection ? `\n${quizSection}` : ""}

【出力フォーマット】
レスポンスは必ず以下のJSON形式のみで返してください。他のテキストやマークダウンは含めないでください。
{
  ${jsonFields.join(",\n  ")}
}`;
  return base;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const hint =
      process.env.NODE_ENV === "development"
        ? " .env.local に GEMINI_API_KEY を追加し、サーバーを再起動してください。.env.development.local に GEMINI_API_KEY= が空で入っていると上書きされます。"
        : "";
    return NextResponse.json(
      { error: `GEMINI_API_KEY が設定されていません${hint}` },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("braincraft_session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  let session: { lineId: string };
  try {
    session = JSON.parse(sessionCookie);
  } catch {
    return NextResponse.json({ error: "セッションが無効です" }, { status: 401 });
  }

  const language: Locale = (await getLanguage(session.lineId)) ?? "ja";

  const body = await request.json();
  const word = String(body.word ?? "").trim();
  const generateQuiz = body.generateQuiz !== false;
  const generateAnswer = body.generateAnswer !== false;

  if (!word) {
    return NextResponse.json({ error: "単語を入力してください" }, { status: 400 });
  }

  const isIdiom = word.includes(" ");
  const systemPrompt = isIdiom
    ? buildIdiomPrompt(generateQuiz, generateAnswer, language)
    : buildSystemPrompt(generateQuiz, generateAnswer, language);
  const userPrompt = isIdiom
    ? `次のイディオムのデータを生成してください：${word}`
    : `次の単語の意味、例文${generateQuiz ? "、穴埋め形式の問題" : ""}${generateAnswer ? "、その答え" : ""}を生成してください：${word}`;

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
        type?: "word" | "idiom";
        meaning?: string;
        example?: string;
        example_jt?: string;
        breakdown?: string;
        reaction?: string;
        usage?: string;
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

      let exampleOut: string;
      if (isIdiom) {
        const parts: string[] = [];
        if (ex) parts.push(exJt ? `${ex}\n（訳）${exJt}` : ex);
        const breakdown = String(parsed.breakdown ?? "").trim();
        const reaction = String(parsed.reaction ?? "").trim();
        const usage = String(parsed.usage ?? "").trim();
        if (breakdown || reaction || usage) {
          const explanation: string[] = [];
          if (breakdown) explanation.push(breakdown);
          if (reaction) explanation.push(reaction);
          if (usage) explanation.push(`【使い分け】${usage}`);
          parts.push(explanation.join("\n\n"));
        }
        exampleOut = parts.join("\n\n");
      } else {
        exampleOut = exJt ? `${ex}\n（訳）${exJt}` : ex;
      }

      const detectedType = isIdiom ? ("idiom" as const) : (parsed.type === "idiom" ? "idiom" : "word");
      return NextResponse.json({
        type: detectedType,
        meaning: String(parsed.meaning ?? "").trim(),
        example: exampleOut,
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
