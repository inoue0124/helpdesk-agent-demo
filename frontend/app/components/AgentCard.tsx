import Link from "next/link";
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
}

export function AgentCard({ title, description, pattern, href }: AgentCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="pt-2">
            <Badge variant="secondary">{pattern}</Badge>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
