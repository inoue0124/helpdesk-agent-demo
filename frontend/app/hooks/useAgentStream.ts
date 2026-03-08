"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentStep, StepPhase } from "@/app/components/AgentProgress";
import type { StreamEvent } from "@/app/components/StreamViewer";
import { API_URL } from "@/app/lib/api";

export type StreamStatus = "idle" | "connecting" | "streaming" | "done" | "error";

export interface AgentError {
  code: string;
  message: string;
  node?: string;
  retry_count?: number;
}

interface UseAgentStreamReturn {
  steps: AgentStep[];
  events: StreamEvent[];
  error: AgentError | null;
  status: StreamStatus;
  result: Record<string, unknown> | null;
  connect: (agentType: string, sessionId: string) => void;
}

function updateLastStep(prev: AgentStep[], data: { node: string; output?: unknown }, phase: StepPhase): AgentStep[] {
  const idx = prev.findLastIndex((s) => s.node === data.node);
  if (idx === -1) return prev;
  const updated = [...prev];
  updated[idx] = { ...updated[idx], phase, output: data.output };
  return updated;
}

export function useAgentStream(): UseAgentStreamReturn {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [error, setError] = useState<AgentError | null>(null);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  const pushEvent = useCallback((event: string, data: Record<string, unknown>) => {
    setEvents((prev) => [
      ...prev,
      { event, data, timestamp: (data.timestamp as string) || new Date().toISOString() },
    ]);
  }, []);

  const connect = useCallback((agentType: string, sessionId: string) => {
    sourceRef.current?.close();
    setSteps([]);
    setEvents([]);
    setError(null);
    setResult(null);
    setStatus("connecting");

    const source = new EventSource(
      `${API_URL}/api/${agentType}/sessions/${sessionId}/stream`
    );
    sourceRef.current = source;

    source.onopen = () => setStatus("streaming");

    source.addEventListener("session_start", (e) => {
      const data = JSON.parse(e.data);
      pushEvent("session_start", data);
    });

    source.addEventListener("node_start", (e) => {
      const data = JSON.parse(e.data);
      setSteps((prev) => [...prev, { node: data.node, phase: "running", message: data.message }]);
      pushEvent("node_start", data);
    });

    source.addEventListener("node_complete", (e) => {
      const data = JSON.parse(e.data);
      setSteps((prev) => updateLastStep(prev, data, "completed"));
      pushEvent("node_complete", data);
    });

    source.addEventListener("error", (e: Event) => {
      const messageEvent = e as MessageEvent;
      if (messageEvent.data) {
        const data = JSON.parse(messageEvent.data);
        setError(data);
        pushEvent("error", data);
      } else {
        setStatus("error");
      }
    });

    source.addEventListener("done", (e) => {
      const data = JSON.parse(e.data);
      setStatus("done");
      setResult(data.result ?? null);
      pushEvent("done", data);
      source.close();
    });
  }, [pushEvent]);

  useEffect(() => {
    return () => {
      sourceRef.current?.close();
    };
  }, []);

  return { steps, events, error, status, result, connect };
}
