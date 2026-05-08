"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCoachStore } from "@/stores/useCoachStore";

export default function CoachPage() {
  const [message, setMessage] = useState("");
  const messages = useCoachStore((state) => state.messages);
  const addMessage = useCoachStore((state) => state.addMessage);

  async function sendMessage() {
    if (!message.trim()) return;

    addMessage({ id: crypto.randomUUID(), role: "user", content: message });
    const current = message;
    setMessage("");

    const response = await fetch("/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: current }),
    });

    const text = await response.text();
    addMessage({ id: crypto.randomUUID(), role: "assistant", content: text });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Coach IA" subtitle="Resume et conversation" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-text-soft text-sm">Aujourd&apos;hui</p>
          <Button
            className="mt-4"
            onClick={async () => {
              await fetch("/api/ai/summary", { method: "POST" });
            }}
          >
            Generer mon resume
          </Button>
        </Card>

        <Card className="space-y-3">
          <div className="border-border h-72 space-y-2 overflow-y-auto rounded-xl border p-3">
            {messages.map((row) => (
              <div
                key={row.id}
                className={`rounded-xl p-2 text-sm ${row.role === "assistant" ? "bg-surface-2" : "bg-primary-soft"}`}
              >
                <p className="font-medium">{row.role === "assistant" ? "Lift" : "Moi"}</p>
                <p>{row.content}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Pose une question au coach..."
            />
            <Button onClick={sendMessage}>Envoyer</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
