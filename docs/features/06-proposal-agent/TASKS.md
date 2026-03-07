# proposal-agent — タスクリスト

## バックエンド
- [ ] State 定義 — `agents/proposal/models.py`
- [ ] プロンプト — `agents/proposal/prompts.py`
- [ ] Hearing Chain — `agents/proposal/chains/hearing.py`
- [ ] Goal Optimizer
- [ ] Query Decomposer
- [ ] Searcher (Tavily 連携) — `agents/proposal/chains/search.py`
- [ ] Task Evaluator — `agents/proposal/chains/evaluate.py`
- [ ] Reporter — `agents/proposal/chains/report.py`
- [ ] LangGraph グラフ — `agents/proposal/agent.py`
- [ ] API エンドポイント + SSE — `api/routes/proposal.py`

## フロントエンド
- [ ] ThemeInput（ヒアリング UI） — `components/proposal/ThemeInput.tsx`
- [ ] ReportViewer（Markdown 表示） — `components/proposal/ReportViewer.tsx`
- [ ] 提案資料画面 — `proposal/page.tsx`

## 依存関係

- 前提: 01-shared-infrastructure, 02-portal-frontend
- 外部サービス: Tavily API キーが必要
