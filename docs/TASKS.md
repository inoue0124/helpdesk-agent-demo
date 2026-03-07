# AI Agent Demo Portfolio — タスクリスト

## Phase 1: 共通基盤

### 01-shared-infrastructure
- [x] Docker Compose（ローカル / 本番）
- [x] Dockerfile (backend / frontend)
- [ ] Dockerfile (Elasticsearch + kuromoji)
- [x] Caddyfile, .env.example
- [ ] 共通 Settings / Logger
- [ ] 共通 DB (SQLite) + Repository 基盤
- [ ] 共通 SSE ストリーミングヘルパー（イベントコントラクト準拠）
- [ ] 共通エラーハンドリング（AppError + 例外ハンドラ + リトライヘルパー）
- [ ] 共通 API スキーマ

### 02-portal-frontend
- [ ] Next.js + shadcn/ui + Tailwind CSS セットアップ
- [ ] ポータルページ（エージェント選択）
- [ ] 共通レイアウト + ナビゲーション
- [ ] AgentProgress 共通コンポーネント
- [ ] StreamViewer 共通コンポーネント

---

## Phase 2: エージェント実装

### 03-helpdesk-agent
- [ ] LangGraph グラフ（planner → reflector → integrator）
- [ ] ES / Qdrant 検索ツール
- [ ] 問い合わせ API (CRUD + SSE)
- [ ] ユーザーフォーム画面
- [ ] オペレーターダッシュボード
- [ ] フィードバックループ
- [ ] 初期データ投入スクリプト

### 04-data-analysis-agent
- [ ] LangGraph グラフ（plan → code gen → execute → review → report）
- [ ] E2B サンドボックス連携
- [ ] CSV アップロード API
- [ ] データ分析画面

### 05-marketing-agent
- [ ] マルチエージェント（Router → Question → Recommendation）
- [ ] 会話履歴管理
- [ ] マーケティング対話 API
- [ ] チャット形式画面

### 06-proposal-agent
- [ ] Multi-chain（hearing → search → evaluate → report）
- [ ] Web 検索連携 (Tavily)
- [ ] 提案資料 API
- [ ] テーマ入力 + レポート表示画面

---

## Phase 3: デプロイ + 仕上げ

### 07-deploy
- [ ] Hetzner VPS セットアップ
- [ ] 動作確認
- [ ] README.md
- [ ] デモ動画 / GIF
