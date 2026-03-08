"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StreamEvent } from "@/app/types/stream";

interface StreamViewerProps {
  events: StreamEvent[];
}

export function StreamViewer({ events }: StreamViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">イベントログ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto rounded bg-muted p-3 font-mono text-xs space-y-1">
          {events.length === 0 && (
            <p className="text-muted-foreground">イベント待機中...</p>
          )}
          {events.map((ev, i) => (
            <div key={`${ev.timestamp}-${ev.event}-${i}`} className="flex gap-2">
              <span className="text-muted-foreground shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString("ja-JP")}
              </span>
              <span className="font-semibold text-primary">{ev.event}</span>
              <span className="text-foreground break-all">
                {JSON.stringify(ev.data)}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
