import { AgentCard } from "@/app/components/AgentCard";
import { Headset, BarChart3, Megaphone, FileText, ArrowRight } from "lucide-react";

const agents = [
  {
    id: "helpdesk",
    title: "問い合わせ対応",
    description: "ヘルプデスクの問い合わせに対して、ナレッジベースを検索し自動で回答を生成します。",
    pattern: "Plan → Reflection → Retry",
    href: "/helpdesk",
    icon: <Headset className="h-5 w-5" />,
    accent: "from-blue-500 to-blue-600",
    features: ["ナレッジ検索", "自動回答", "品質評価"],
  },
  {
    id: "data-analysis",
    title: "データ分析",
    description: "CSV をアップロードすると、分析コードを自動生成しサンドボックスで実行します。",
    pattern: "Code Gen → Sandbox → Review",
    href: "/data-analysis",
    icon: <BarChart3 className="h-5 w-5" />,
    accent: "from-emerald-500 to-emerald-600",
    features: ["CSV 解析", "コード生成", "可視化"],
  },
  {
    id: "marketing",
    title: "マーケティング支援",
    description: "複数のエージェントが協調し、マーケティング施策を多角的に提案します。",
    pattern: "Multi-Agent Collaboration",
    href: "/marketing",
    icon: <Megaphone className="h-5 w-5" />,
    accent: "from-violet-500 to-violet-600",
    features: ["市場分析", "施策提案", "競合調査"],
  },
  {
    id: "proposal",
    title: "提案資料作成",
    description: "情報収集から構成設計、資料生成までを一気通貫で自動化します。",
    pattern: "Multi-Chain + Evaluation",
    href: "/proposal",
    icon: <FileText className="h-5 w-5" />,
    accent: "from-amber-500 to-amber-600",
    features: ["情報収集", "構成設計", "資料生成"],
  },
];

export default function PortalPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">Portfolio</p>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">AI Agent Demo</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          LangGraph ベースの AI エージェントデモ。<br className="hidden sm:inline" />
          各エージェントを選択してお試しください。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            title={agent.title}
            description={agent.description}
            pattern={agent.pattern}
            href={agent.href}
            icon={agent.icon}
            accent={agent.accent}
            features={agent.features}
          />
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          エージェントを選択すると詳細ページへ遷移します
          <ArrowRight className="h-3 w-3" />
        </p>
      </div>
    </div>
  );
}
