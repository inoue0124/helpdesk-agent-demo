# api-endpoints — 詳細設計書

## 1. ルーター構成

```python
# backend/api/routes/inquiries.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api")
```

## 2. POST /api/inquiries

```python
@router.post("/inquiries", status_code=202)
async def create_inquiry(
    request: CreateInquiryRequest,
    background_tasks: BackgroundTasks,
    inquiry_repo: InquiryRepository = Depends(get_inquiry_repo),
    settings: Settings = Depends(get_settings),
):
    # レート制限チェック
    today_count = await inquiry_repo.count_today()
    if today_count >= settings.daily_limit:
        raise HTTPException(status_code=429, detail="本日の利用上限に達しました。")

    # 問い合わせ作成
    inquiry = await inquiry_repo.create(
        question=request.question,
        user_name=request.user_name,
    )

    # バックグラウンドでエージェント処理を開始
    background_tasks.add_task(run_agent, inquiry.id)

    return CreateInquiryResponse(
        id=inquiry.id,
        status=inquiry.status,
        created_at=inquiry.created_at,
    )
```

## 3. GET /api/inquiries/{id}/stream（SSE）

```python
@router.get("/inquiries/{inquiry_id}/stream")
async def stream_inquiry(inquiry_id: str):
    return EventSourceResponse(agent_event_generator(inquiry_id))

async def agent_event_generator(inquiry_id: str):
    inquiry = await inquiry_repo.get(inquiry_id)
    agent = HelpDeskAgent(settings=settings, tools=[...])
    app = agent.create_graph()

    async for event in app.astream(
        {"question": inquiry.question, "current_step": 0}
    ):
        for node_name, output in event.items():
            yield {
                "event": node_name,
                "data": json.dumps(
                    format_event(node_name, output), ensure_ascii=False
                ),
            }

    # 信頼度に基づくルーティング
    confidence = calc_confidence(result.subtasks)
    await inquiry_repo.update_draft(inquiry_id, result.last_answer, confidence)

    if confidence >= 0.9:
        await auto_approve(inquiry_id, result.last_answer)
        yield {"event": "auto_approved", "data": json.dumps({"confidence": confidence})}
    elif confidence < 0.5:
        await escalate(inquiry_id)
        yield {"event": "escalated", "data": json.dumps({"confidence": confidence})}
    else:
        yield {"event": "done", "data": json.dumps({"confidence": confidence})}
```

## 4. SSE イベント形式

```python
# 計画
data: {"step": "plan", "subtasks": ["サブタスク1", "サブタスク2"]}

# サブタスク進捗
data: {"step": "subtask", "index": 0, "status": "tool_selection", "tool": "search_xyz_manual"}
data: {"step": "subtask", "index": 0, "status": "searching", "query": "..."}
data: {"step": "subtask", "index": 0, "status": "answering"}
data: {"step": "subtask", "index": 0, "status": "reflecting", "is_completed": true}

# リトライ
data: {"step": "subtask", "index": 1, "status": "retrying", "attempt": 2, "tool": "search_xyz_manual"}

# 統合・完了
data: {"step": "integrating"}
data: {"step": "done", "draft_answer": "...", "confidence": 0.8}
```

## 5. PATCH /api/inquiries/{id}（承認 + フィードバックループ）

```python
@router.patch("/inquiries/{inquiry_id}")
async def update_inquiry(
    inquiry_id: str,
    request: UpdateInquiryRequest,
    inquiry_repo: InquiryRepository = Depends(get_inquiry_repo),
    qa_repo: QAPairRepository = Depends(get_qa_repo),
):
    inquiry = await inquiry_repo.get(inquiry_id)

    if request.status == "approved":
        final_answer = request.final_answer or inquiry.draft_answer
        await inquiry_repo.approve(inquiry_id, final_answer)

        # フィードバックループ
        await qa_repo.create(
            question=inquiry.question,
            answer=final_answer,
            source="agent_approved",
            inquiry_id=inquiry_id,
        )
        await register_to_qdrant(inquiry.question, final_answer)

    elif request.status == "rejected":
        await inquiry_repo.update_status(inquiry_id, "rejected")

    return await inquiry_repo.get(inquiry_id)
```

## 6. main.py へのルーター登録

```python
# backend/api/main.py
from api.routes.inquiries import router as inquiries_router
from api.routes.health import router as health_router

app.include_router(inquiries_router)
app.include_router(health_router)

@app.on_event("startup")
async def startup():
    await init_db()
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/api/routes/inquiries.py` | 問い合わせ CRUD + SSE |
| `backend/api/routes/health.py` | ヘルスチェック |
| `backend/api/main.py` | ルーター登録 + 起動処理 |
