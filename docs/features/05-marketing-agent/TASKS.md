# marketing-agent — タスクリスト

## バックエンド
- [ ] State 定義 — `agents/marketing/models.py`
- [ ] プロンプト — `agents/marketing/prompts.py`
- [ ] Router Agent — `agents/marketing/sub_agents/router.py`
- [ ] Question Agent — `agents/marketing/sub_agents/question.py`
- [ ] Recommendation Agent — `agents/marketing/sub_agents/recommendation.py`
- [ ] LangGraph グラフ（マルチエージェント協調） — `agents/marketing/agent.py`
- [ ] 会話セッション API + SSE — `api/routes/marketing.py`

## フロントエンド
- [ ] ChatInterface — `components/marketing/ChatInterface.tsx`
- [ ] RecommendationCard — `components/marketing/RecommendationCard.tsx`
- [ ] マーケティング画面 — `marketing/page.tsx`

## 依存関係

- 前提: 01-shared-infrastructure, 02-portal-frontend
- 外部サービス: OpenAI API のみ
