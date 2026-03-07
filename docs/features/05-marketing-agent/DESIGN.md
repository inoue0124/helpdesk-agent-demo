# marketing-agent — 詳細設計書

## 1. グラフ構造（Chapter 7 MACRS パターン）

```
user_input → router → question_agent     → router (ループ)
                     → recommendation_agent → router (ループ)
                     → end (終了判定)
```

## 2. State 定義

```python
# backend/agents/marketing/models.py

class AgentState(TypedDict):
    user_input: str
    conversation_history: list[dict]  # {"role": "user"/"agent", "content": "..."}
    current_agent: str | None         # router / question / recommendation
    should_exit: bool
```

## 3. サブエージェント

### Router Agent

```python
# ユーザー入力を分類
# - 情報が不足 → question_agent
# - 十分な情報あり → recommendation_agent
# - 終了の意図 → end
```

### Question Agent

```python
# 以下の観点で深掘り質問を生成:
# - ターゲット顧客は誰か
# - 現在の課題は何か
# - 予算・期間の制約
# - KPI / 目標指標
```

### Recommendation Agent

```python
# 会話履歴を踏まえて施策を提案:
# - 具体的なアクションプラン
# - 期待される効果
# - 必要なリソース
# - 優先度の提示
```

## 4. API

```
POST   /api/marketing/sessions                  セッション作成
POST   /api/marketing/sessions/{id}/messages     メッセージ送信
GET    /api/marketing/sessions/{id}/stream       SSE ストリーム
GET    /api/marketing/sessions/{id}              会話履歴取得
```

## 5. フロントエンド

```
/marketing
├── チャットインターフェース
│   ├── メッセージ履歴表示
│   ├── メッセージ入力欄
│   └── 送信ボタン
└── サイドバー（オプション）
    └── 現在のエージェント表示 + 提案まとめ
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/agents/marketing/agent.py` | LangGraph グラフ |
| `backend/agents/marketing/models.py` | State 定義 |
| `backend/agents/marketing/prompts.py` | プロンプト |
| `backend/agents/marketing/sub_agents/router.py` | Router |
| `backend/agents/marketing/sub_agents/question.py` | 質問生成 |
| `backend/agents/marketing/sub_agents/recommendation.py` | 施策提案 |
| `backend/api/routes/marketing.py` | API |
| `frontend/app/marketing/page.tsx` | 画面 |
| `frontend/app/components/marketing/ChatInterface.tsx` | チャット UI |
| `frontend/app/components/marketing/RecommendationCard.tsx` | 提案カード |
