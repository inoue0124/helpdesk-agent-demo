"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentStep, StepPhase, StreamEvent } from "@/app/types/stream";
import { API_URL } from "@/lib/api";

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
  connect: (agentType: string, sessionId: string) => void;
}

function safeParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
  const cleanupRef = useRef<(() => void) | null>(null);

  const pushEvent = useCallback((event: string, data: Record<string, unknown>) => {
    setEvents((prev) => [
      ...prev,
      { event, data, timestamp: (data.timestamp as string) || new Date().toISOString() },
    ]);
  }, []);

  const closeSource = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const connect = useCallback((agentType: string, sessionId: string) => {
    closeSource();
    setSteps([]);
    setEvents([]);
    setError(null);
    setStatus("connecting");

    const source = new EventSource(
      `${API_URL}/api/${encodeURIComponent(agentType)}/sessions/${encodeURIComponent(sessionId)}/stream`
    );

    const onOpen = () => setStatus("streaming");

    const onSessionStart = (e: MessageEvent) => {
      const data = safeParse(e.data);
      if (data) pushEvent("session_start", data);
    };

    const onNodeStart = (e: MessageEvent) => {
      const data = safeParse(e.data);
      if (!data) return;
      setSteps((prev) => [...prev, { node: data.node as string, phase: "running", message: data.message as string | undefined }]);
      pushEvent("node_start", data);
    };

    const onNodeComplete = (e: MessageEvent) => {
      const data = safeParse(e.data);
      if (!data) return;
      setSteps((prev) => updateLastStep(prev, data as { node: string; output?: unknown }, "completed"));
      pushEvent("node_complete", data);
    };

    const onError = (e: Event) => {
      if (e instanceof MessageEvent && e.data) {
        const data = safeParse(e.data);
        if (data) {
          setError(data as unknown as AgentError);
          setStatus("error");
          pushEvent("error", data);
        }
      } else {
        source.close();
        setStatus("error");
      }
    };

    const onDone = (e: MessageEvent) => {
      const data = safeParse(e.data);
      if (data) {
        pushEvent("done", data);
      }
      setStatus("done");
      source.close();
    };

    source.addEventListener("open", onOpen);
    source.addEventListener("session_start", onSessionStart);
    source.addEventListener("node_start", onNodeStart);
    source.addEventListener("node_complete", onNodeComplete);
    source.addEventListener("error", onError);
    source.addEventListener("done", onDone);

    cleanupRef.current = () => {
      source.removeEventListener("open", onOpen);
      source.removeEventListener("session_start", onSessionStart);
      source.removeEventListener("node_start", onNodeStart);
      source.removeEventListener("node_complete", onNodeComplete);
      source.removeEventListener("error", onError);
      source.removeEventListener("done", onDone);
      source.close();
    };
  }, [pushEvent, closeSource]);

  useEffect(() => {
    return () => {
      closeSource();
    };
  }, [closeSource]);

  return { steps, events, error, status, connect };
}
