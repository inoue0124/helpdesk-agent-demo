# operator-dashboard — 詳細設計書

## 1. 画面構成

```
/operator          → 問い合わせ一覧（左ペイン + 右ペイン 2カラム）
/operator/[id]     → 問い合わせ詳細（単独ページ or 右ペインに表示）
```

## 2. コンポーネント構成

```
app/operator/
├── page.tsx                    # ダッシュボード（一覧 + 詳細の 2カラム）
└── [id]/
    └── page.tsx                # 問い合わせ詳細（フォールバック用）

app/components/
├── InquiryList.tsx             # 問い合わせ一覧
├── AgentProgress.tsx           # エージェント進捗表示
├── DraftEditor.tsx             # 回答ドラフト編集
└── ConfidenceBadge.tsx         # 信頼度バッジ
```

## 3. InquiryList

```typescript
// 問い合わせ一覧コンポーネント
interface InquiryListProps {
  onSelect: (id: string) => void;
  selectedId?: string;
}

// API: GET /api/inquiries?status=draft
// ポーリング間隔: 5秒
// フィルタ: pending, processing, draft, approved, auto_approved, rejected, escalated
```

## 4. AgentProgress（SSE 受信）

```typescript
// SSE 接続フック
function useAgentStream(inquiryId: string) {
    const [steps, setSteps] = useState<AgentStep[]>([]);

    useEffect(() => {
        const source = new EventSource(
            `${API_URL}/api/inquiries/${inquiryId}/stream`
        );
        source.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setSteps((prev) => [...prev, data]);
        };
        source.addEventListener("done", () => source.close());
        source.addEventListener("auto_approved", () => source.close());
        source.addEventListener("escalated", () => source.close());
        return () => source.close();
    }, [inquiryId]);

    return steps;
}
```

### 進捗表示の UI 構造

```
[v] 計画: 2つのサブタスク
[v] サブタスク1: パスワード文字制限
    ツール: ES検索
    回答生成 → リフレクション → 完了
[>] サブタスク2: 通知制限
    ツール: Qdrant検索
    回答生成 → リフレクション → リトライ
    ツール: ES検索 (切替)
    回答生成 → リフレクション → 完了
[>] 最終回答を統合中...
```

- 各ステップはアイコン + テキストで表示
- 実行中のステップはアニメーション（スピナー）
- 完了したステップはチェックマーク

## 5. DraftEditor

```typescript
interface DraftEditorProps {
  inquiryId: string;
  draftAnswer: string;
  confidence: number;
  onApprove: (finalAnswer: string) => void;
  onReject: () => void;
}

// テキストエリアで回答を編集可能
// 承認ボタン: PATCH /api/inquiries/{id} { status: "approved", final_answer: "..." }
// 却下ボタン: PATCH /api/inquiries/{id} { status: "rejected" }
```

## 6. ConfidenceBadge

```typescript
// 信頼度に応じた色分け
// >= 0.9: 緑（高信頼 / 自動承認）
// 0.5〜0.89: 黄（中信頼 / 要確認）
// < 0.5: 赤（低信頼 / エスカレーション）
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `frontend/app/operator/page.tsx` | ダッシュボード |
| `frontend/app/operator/[id]/page.tsx` | 詳細画面 |
| `frontend/app/components/InquiryList.tsx` | 一覧 |
| `frontend/app/components/AgentProgress.tsx` | 進捗可視化 |
| `frontend/app/components/DraftEditor.tsx` | 回答編集 |
| `frontend/app/components/ConfidenceBadge.tsx` | 信頼度バッジ |
