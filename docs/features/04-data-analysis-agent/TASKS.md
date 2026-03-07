# data-analysis-agent — タスクリスト

## バックエンド
- [ ] State 定義 — `agents/data_analysis/models.py`
- [ ] プロンプト（コード生成/レビュー/レポート） — `agents/data_analysis/prompts.py`
- [ ] generate_code ノード — `agents/data_analysis/nodes/generate_code.py`
- [ ] execute_code ノード（E2B 連携） — `agents/data_analysis/nodes/execute_code.py`
- [ ] generate_review ノード — `agents/data_analysis/nodes/generate_review.py`
- [ ] Programmer サブグラフ
- [ ] Data Analysis メイングラフ — `agents/data_analysis/agent.py`
- [ ] CSV アップロード + データ概要取得 API
- [ ] 分析セッション API + SSE — `api/routes/data_analysis.py`

## フロントエンド
- [ ] FileUploader — `components/data-analysis/FileUploader.tsx`
- [ ] AnalysisPlan 表示 — `components/data-analysis/AnalysisPlan.tsx`
- [ ] ReportViewer（Markdown + 画像） — `components/data-analysis/ReportViewer.tsx`
- [ ] データ分析画面 — `data-analysis/page.tsx`

## 依存関係

- 前提: 01-shared-infrastructure, 02-portal-frontend
- 外部サービス: E2B API キーが必要
