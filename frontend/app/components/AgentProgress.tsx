"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type StepPhase = "pending" | "running" | "completed" | "failed";

export interface AgentStep {
  node: string;
  phase: StepPhase;
  message?: string;
  output?: unknown;
}

interface AgentProgressProps {
  steps: AgentStep[];
}

const phaseIcon: Record<StepPhase, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  running: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
};

export function AgentProgress({ steps }: AgentProgressProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={`${step.node}-${i}`} className="flex items-center gap-2">
          {phaseIcon[step.phase]}
          <span className="text-sm font-medium">{step.node}</span>
          {step.message && (
            <span className="text-xs text-muted-foreground">{step.message}</span>
          )}
        </div>
      ))}
    </div>
  );
}
