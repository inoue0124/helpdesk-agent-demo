import { AgentCard } from "@/app/components/AgentCard";

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

export default function PortalPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">AI Agent Demo Portfolio</h1>
        <p className="text-muted-foreground">
          LangGraph ベースの AI エージェントデモ。各エージェントを選択してお試しください。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            title={agent.title}
            description={agent.description}
            pattern={agent.pattern}
            href={agent.href}
          />
        ))}
      </div>
    </div>
  );
}
