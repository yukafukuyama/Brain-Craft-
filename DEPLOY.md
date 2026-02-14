# BrainCraft 公開手順

Vercel で誰でも使えるように公開する手順です。

---

## 事前準備

- [LINE Developers](https://developers.line.biz/console/) でチャネル作成済み
- Messaging API を有効化し、チャネルアクセストークン発行済み
- ローカルの `.env.local` に必要な値が入っていること

---

## 方法A: GitHub + Vercel（推奨）

### 1. GitHub にプッシュ

```bash
cd "/Users/luvsaint/Downloads/Brain craft"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/braincraft.git
git push -u origin main
```

### 2. Vercel でプロジェクト作成

1. [Vercel](https://vercel.com) にログイン（GitHub 連携可）
2. **Add New** → **Project**
3. リポジトリを選んで **Import**
4. **Environment Variables** で以下を追加（`.env.local` の値をコピー）:

| 名前 | 値 |
|------|-----|
| `LINE_CHANNEL_ID` | LINE Developers のチャネルID |
| `LINE_CHANNEL_SECRET` | チャネルシークレット |
| `LINE_CHANNEL_ACCESS_TOKEN` | チャネルアクセストークン（長期） |
| `NEXT_PUBLIC_LINE_ADD_FRIEND_URL` | LINE友だち追加URL（例: https://line.me/ti/p/~@xxx） |
| `NEXT_PUBLIC_APP_URL` | デプロイ後のURL（後で設定） |
| `CRON_SECRET` | ランダムな文字列（英数字20文字程度） |

5. **Deploy** をクリック

### 3. Upstash Redis を追加

1. プロジェクト **Storage** タブ → **Create Database**
2. **Upstash Redis** → **Continue** → **Create**
3. リンクすると `KV_REST_API_URL` / `KV_REST_API_TOKEN` が自動設定されます

### 4. 環境変数を更新して再デプロイ

1. **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_APP_URL` を `https://あなたのプロジェクト.vercel.app` に設定
3. **Deployments** → 最新のデプロイの **⋯** → **Redeploy**

### 5. LINE Developers でコールバックURLを追加

1. [LINE Developers](https://developers.line.biz/console/) → チャネル → **LINEログイン設定**
2. コールバックURL に追加:
   ```
   https://あなたのプロジェクト.vercel.app/api/auth/line/callback
   ```

---

## 方法B: Vercel CLI（GitHub なし）

```bash
cd "/Users/luvsaint/Downloads/Brain craft"
npm i -g vercel
vercel
```

初回はログインとプロジェクト設定が聞かれます。環境変数は `vercel env add` で追加するか、Vercel ダッシュボードで設定してください。

---

## 動作確認

- デプロイURLを開いてログインできるか確認
- 単語登録 → LINE に届くか確認
- 設定画面で通知時刻を設定 → 翌日（またはその時刻）に復習通知が届くか確認

---

## Cron（復習通知）について

ユーザーが時刻を最大3つまで選べるようにするには、**cron-job.org** で定期的にAPIを叩く必要があります。

### cron-job.org の設定手順

1. [cron-job.org](https://cron-job.org) に無料登録
2. **Create cronjob** をクリック
3. 以下を設定：
   - **URL**: `https://あなたのプロジェクト.vercel.app/api/cron/send-notifications`
   - **Schedule**: 5分ごと（`*/5 * * * *`）
   - **Request Settings** → **Headers** を追加：
     - Name: `Authorization`
     - Value: `Bearer CRON_SECRETの値`（例: `Bearer braincraft2024secret`）
4. **Create** をクリック

これで5分ごとにチェックされ、ユーザーが設定した時刻に通知が送られます。

---

## トラブルシューティング

| 症状 | 確認すること |
|------|-------------|
| ログインできない | コールバックURLが LINE Developers に正しく登録されているか |
| 単語が保存されない | Storage で Upstash Redis がリンクされているか |
| 通知が届かない | `LINE_CHANNEL_ACCESS_TOKEN` が設定されているか、LINEアプリの通知設定を確認 |

---

**完了！** デプロイURLをシェアすれば、誰でも BrainCraft を利用できます。
