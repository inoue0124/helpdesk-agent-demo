# helpdesk-agent — タスクリスト

## バックエンド
- [ ] State 定義 — `agents/helpdesk/models.py`
- [ ] プロンプト — `agents/helpdesk/prompts.py`
- [ ] ES 検索ツール — `agents/helpdesk/tools/search_manual.py`
- [ ] Qdrant 検索ツール — `agents/helpdesk/tools/search_qa.py`
- [ ] LangGraph グラフ（メイン + サブグラフ） — `agents/helpdesk/agent.py`
- [ ] 信頼度算出ロジック
- [ ] API エンドポイント — `api/routes/helpdesk.py`
- [ ] inquiries / qa_pairs テーブル
- [ ] フィードバックループ（承認時 QA 蓄積 + Qdrant 登録）
- [ ] レート制限
- [ ] 初期データ投入スクリプト — `scripts/create_index.py`
- [ ] サンプルデータ — `data/manual/`, `data/qa/`

## フロントエンド
- [ ] InquiryForm — `components/helpdesk/InquiryForm.tsx`
- [ ] InquiryResult — `components/helpdesk/InquiryResult.tsx`
- [ ] ユーザーフォーム画面 — `helpdesk/page.tsx`
- [ ] InquiryList — `components/helpdesk/InquiryList.tsx`
- [ ] DraftEditor — `components/helpdesk/DraftEditor.tsx`
- [ ] ConfidenceBadge — `components/helpdesk/ConfidenceBadge.tsx`
- [ ] オペレーターダッシュボード — `helpdesk/operator/page.tsx`

## 依存関係

- 前提: 01-shared-infrastructure, 02-portal-frontend
