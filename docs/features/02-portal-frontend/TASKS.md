# portal-frontend — タスクリスト

- [x] Next.js + shadcn/ui + Tailwind CSS セットアップ
- [x] 共通レイアウト（ヘッダー + ナビゲーション） — `app/layout.tsx`
- [x] AgentCard コンポーネント — `app/components/AgentCard.tsx`
- [x] ポータルページ — `app/page.tsx`
- [x] AgentProgress 共通コンポーネント — `app/components/AgentProgress.tsx`
- [x] StreamViewer 共通コンポーネント — `app/components/StreamViewer.tsx`
- [x] useAgentStream フック（SSE 接続管理）
- [x] API クライアント設定（fetch ラッパー）

## 依存関係

- 前提: 01-shared-infrastructure
- 後続: 各エージェント画面がこの共通基盤を利用
