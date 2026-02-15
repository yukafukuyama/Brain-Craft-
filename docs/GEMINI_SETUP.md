# Gemini API 設定ガイド（AI自動入力機能）

単語の意味・例文・問題を自動生成する機能で、Google の Gemini API を使うための設定手順です。

---

## 1. Google AI Studio で API キーを取得する

### 1-1. Google AI Studio にアクセス

1. ブラウザで [Google AI Studio](https://aistudio.google.com/) を開く
2. Google アカウントでログインする

### 1-2. API キーを作成

1. 左上メニュー（≡）→ **「Get API key」**（または「APIキーを取得」）をクリック
2. **「Create API key」** をクリック
3. プロジェクトを選ぶか、**「Create API key in new project」** で新規作成
4. 表示された API キー（`AIza...` で始まる文字列）をコピーする
   - ⚠️ この画面を閉じると再表示されないため、必ず保存しておく

### 1-3. 無料枠について

- 無料枠で使えるリクエスト数に上限があります
- 制限は [Google AI の料金ページ](https://ai.google.dev/pricing) で確認できます

---

## 2. プロジェクトに API キーを設定する

### 2-1. ローカル開発（.env.local）

1. プロジェクトルートに `.env.local` ファイルがあることを確認
2. 次の行を追加または編集する：

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

`AIza...` の部分を、取得した API キーに置き換えてください。

### 2-2. 本番環境（Vercel）

1. [Vercel Dashboard](https://vercel.com/dashboard) を開く
2. 対象プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 次を追加：
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 取得した API キー
   - **Environment**: Production, Preview, Development を必要に応じて選択
5. **Save** をクリック
6. 変更を反映するため、再度デプロイする

---

## 3. 動作確認

1. 開発サーバーを起動：

```bash
npm run dev
```

2. ブラウザで `http://localhost:3000/home` を開く
3. ログイン後、単語欄に英単語（例：`Resilience`）を入力
4. **「AIで自動入力」** ボタンをクリック
5. 意味・例文・問題・答えが自動で入力されれば設定完了です

---

## 4. エラーが出た場合

| エラーメッセージ | 対処 |
|------------------|------|
| `GEMINI_API_KEY が設定されていません` | `.env.local` に `GEMINI_API_KEY` を設定しているか確認。設定後はサーバーを再起動 |
| `ログインしてください` | 先に LINE ログイン（または開発用ログイン）を行う |
| `生成に失敗しました` | API キーが正しいか確認。無料枠を超えていないか確認 |
| `429` や `Quota exceeded` | 無料枠の制限に達している可能性。しばらく時間をおいて再試行 |

---

## 5. 使用モデルについて

現在は `gemini-1.5-flash` を使用しています。無料枠との相性が良いモデルです。

別のモデルを使いたい場合は、`app/api/words/generate/route.ts` の `model` を変更してください：

- `gemini-1.5-flash` … 高速・無料枠あり（推奨）
- `gemini-1.5-pro` … より高品質（無料枠は少なめ）
- `gemini-2.0-flash` … 新世代（利用可能な場合）
