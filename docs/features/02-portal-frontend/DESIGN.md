# portal-frontend — 詳細設計書

## 1. ルーティング構成

```
/                      → ポータル（エージェント選択）
/helpdesk              → ユーザー問い合わせフォーム
/helpdesk/operator     → オペレーターダッシュボード
/data-analysis         → データ分析画面
/marketing             → マーケティング支援画面
/proposal              → 提案資料作成画面
```

## 2. ポータルページ

```typescript
// app/page.tsx
const agents = [
  {
    id: "helpdesk",
    title: "問い合わせ対応",
    description: "ヘルプデスクの問い合わせに自動回答",
    pattern: "Plan → Reflection → Retry",
    href: "/helpdesk",
  },
  {
    id: "data-analysis",
    title: "データ分析",
    description: "CSV をアップロードして自動分析",
    pattern: "Code Gen → Sandbox → Review",
    href: "/data-analysis",
  },
  {
    id: "marketing",
    title: "マーケティング支援",
    description: "マーケティング施策の提案・深掘り",
    pattern: "Multi-Agent Collaboration",
    href: "/marketing",
  },
  {
    id: "proposal",
    title: "提案資料作成",
    description: "情報収集から提案資料を自動生成",
    pattern: "Multi-Chain + Evaluation",
    href: "/proposal",
  },
];
```

## 3. AgentCard

```typescript
// app/components/AgentCard.tsx
interface AgentCardProps {
  title: string;
  description: string;
  pattern: string;
  href: string;
}
// shadcn/ui Card + Link で実装
```

## 4. 共通コンポーネント

### AgentProgress

```typescript
// app/components/AgentProgress.tsx
// 各ノードの実行状態をステップリストで表示
// - pending: グレーアイコン
// - running: スピナー
// - completed: チェックマーク
// - failed: エラーアイコン
```

### StreamViewer

```typescript
// app/components/StreamViewer.tsx
// SSE イベントをリアルタイムに表示するログビュー
// useAgentStream(url) フックで SSE 接続管理
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `frontend/app/page.tsx` | ポータル |
| `frontend/app/layout.tsx` | 共通レイアウト |
| `frontend/app/components/AgentCard.tsx` | エージェント選択カード |
| `frontend/app/components/AgentProgress.tsx` | 進捗表示 |
| `frontend/app/components/StreamViewer.tsx` | SSE 表示 |
