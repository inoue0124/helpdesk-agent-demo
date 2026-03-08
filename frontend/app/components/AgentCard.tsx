import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  title: string;
  description: string;
  pattern: string;
  href: string;
  icon: ReactNode;
  accent: string;
  features: string[];
}

export function AgentCard({ title, description, pattern, href, icon, accent, features }: AgentCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
        <CardHeader className="pt-6 gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-sm`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
            </div>
          </div>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {features.map((f) => (
              <Badge key={f} variant="secondary" className="text-[11px] font-normal">{f}</Badge>
            ))}
          </div>
          <div className="pt-2 flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-[11px]">{pattern}</Badge>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              詳細へ →
            </span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
