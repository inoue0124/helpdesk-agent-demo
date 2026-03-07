# portal-frontend — タスクリスト

- [ ] Next.js + shadcn/ui + Tailwind CSS セットアップ
- [ ] 共通レイアウト（ヘッダー + ナビゲーション） — `app/layout.tsx`
- [ ] AgentCard コンポーネント — `app/components/AgentCard.tsx`
- [ ] ポータルページ — `app/page.tsx`
- [ ] AgentProgress 共通コンポーネント — `app/components/AgentProgress.tsx`
- [ ] StreamViewer 共通コンポーネント — `app/components/StreamViewer.tsx`
- [ ] useAgentStream フック（SSE 接続管理）
- [ ] API クライアント設定（fetch ラッパー）

## 依存関係

- 前提: 01-shared-infrastructure
- 後続: 各エージェント画面がこの共通基盤を利用
