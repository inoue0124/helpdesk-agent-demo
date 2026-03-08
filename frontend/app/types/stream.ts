/** SSE ストリーミングで使用する共通型定義 */

export type StepPhase = "pending" | "running" | "completed" | "failed";

export interface AgentStep {
  node: string;
  phase: StepPhase;
  message?: string;
  output?: unknown;
}

export interface StreamEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}
