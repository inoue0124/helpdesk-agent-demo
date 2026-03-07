# deploy — タスクリスト

## タスク

- [ ] Hetzner VPS セットアップ（Docker インストール）
- [ ] DNS 設定（独自ドメイン → VPS IP）
- [ ] `.env` 設定（本番用 OPENAI_API_KEY 等）
- [ ] `docker compose -f docker-compose.prod.yml up -d` で起動
- [ ] 初期データ投入（`scripts.create_index`）
- [ ] 動作確認（ユーザー画面 → エージェント → オペレーター承認の一連のフロー）
- [ ] README.md 作成（アーキテクチャ図、スクリーンショット、技術選定理由）
- [ ] デモ動画 or GIF 作成

## 依存関係

- 前提: 全フィーチャー（01〜07）が完成していること
