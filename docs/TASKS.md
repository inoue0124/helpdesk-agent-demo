# ヘルプデスクエージェント デモシステム — タスクリスト

## Phase 1: インフラ + バックエンド API

### 1.1 Docker / インフラ基盤
- [x] Docker Compose 構成 (ローカル開発用 `docker-compose.yml`)
- [x] Docker Compose 構成 (本番用 `docker-compose.prod.yml`)
- [x] Dockerfile (backend)
- [x] Dockerfile (frontend)
- [ ] Dockerfile (Elasticsearch + kuromoji プラグイン) — `.docker/Dockerfile`
- [x] Caddyfile
- [x] `.env.example`

### 1.2 バックエンド基盤
- [ ] Settings / 環境変数管理 — `backend/src/configs.py`
- [ ] Pydantic モデル定義 — `backend/src/models.py`
- [ ] API スキーマ定義 — `backend/api/schemas.py`
- [ ] DI / 依存注入 — `backend/api/dependencies.py`
- [ ] カスタムロガー — `backend/src/custom_logger.py`

### 1.3 データベース
- [ ] SQLite 接続管理 (aiosqlite) — `backend/db/database.py`
- [ ] inquiries テーブル CRUD — `backend/db/repository.py`
- [ ] qa_pairs テーブル CRUD — `backend/db/repository.py`
- [ ] ステータス遷移ロジック

### 1.4 検索ツール
- [ ] ES キーワード検索ツール — `backend/src/tools/search_xyz_manual.py`
- [ ] Qdrant ベクトル検索ツール — `backend/src/tools/search_xyz_qa.py`
- [ ] 初期データ投入スクリプト — `backend/scripts/create_index.py`

### 1.5 LangGraph エージェント
- [ ] プロンプト定義 — `backend/src/prompts.py`
- [ ] planner ノード — 質問をサブタスクに分解
- [ ] tool_selector ノード — 検索戦略の選択
- [ ] searcher ノード — ES / Qdrant 検索実行
- [ ] answerer ノード — 回答生成
- [ ] reflector ノード — 自己評価 + リトライ判定
- [ ] integrator ノード — サブタスク結果の統合
- [ ] グラフ構築 + サイクル制御 (最大3回リトライ) — `backend/src/agent.py`
- [ ] 信頼度算出ロジック

### 1.6 API エンドポイント
- [x] `GET /api/health` — ヘルスチェック
- [ ] `POST /api/inquiries` — 問い合わせ受付 + エージェント処理開始
- [ ] `GET /api/inquiries` — 一覧取得（フィルタ対応）
- [ ] `GET /api/inquiries/{id}` — 詳細取得
- [ ] `GET /api/inquiries/{id}/stream` — SSE ストリーム
- [ ] `PATCH /api/inquiries/{id}` — 承認/却下 + フィードバックループ
- [ ] レート制限 (50件/日)

---

## Phase 2: オペレーター画面

### 2.1 プロジェクト基盤
- [ ] Next.js + shadcn/ui + Tailwind CSS セットアップ
- [ ] 共通レイアウト — `frontend/app/layout.tsx`
- [ ] API クライアント設定

### 2.2 問い合わせ一覧
- [ ] InquiryList コンポーネント — `frontend/app/components/InquiryList.tsx`
- [ ] ステータスフィルタ（未対応/対応中/完了/自動承認）
- [ ] オペレーターダッシュボード — `frontend/app/operator/page.tsx`

### 2.3 問い合わせ詳細
- [ ] AgentProgress コンポーネント (SSE 受信) — `frontend/app/components/AgentProgress.tsx`
- [ ] ノードごとの進捗可視化（計画→ツール選択→検索→回答→リフレクション→リトライ→統合）
- [ ] DraftEditor コンポーネント — `frontend/app/components/DraftEditor.tsx`
- [ ] ConfidenceBadge コンポーネント — `frontend/app/components/ConfidenceBadge.tsx`
- [ ] 承認/却下ボタン
- [ ] 問い合わせ詳細画面 — `frontend/app/operator/[id]/page.tsx`

---

## Phase 3: ユーザー画面

### 3.1 問い合わせフォーム
- [ ] InquiryForm コンポーネント — `frontend/app/components/InquiryForm.tsx`
  - フォーム項目: ユーザー名（任意）、問い合わせ内容（必須）
  - バリデーション: 問い合わせ内容は必須、空欄不可
- [ ] InquiryResult コンポーネント — `frontend/app/components/InquiryResult.tsx`
  - 受付完了メッセージ + 受付番号の表示
  - 回答が届いたら表示（ポーリング）
- [ ] ユーザー画面 — `frontend/app/user/page.tsx`

---

## Phase 4: デプロイ + 仕上げ

### 4.1 デプロイ
- [ ] Hetzner VPS セットアップ
- [ ] 本番環境での動作確認

### 4.2 ドキュメント・公開準備
- [ ] README.md（アーキテクチャ図、スクリーンショット、技術選定理由）
- [ ] デモ動画 or GIF の作成
- [ ] GitHub リポジトリの整備
