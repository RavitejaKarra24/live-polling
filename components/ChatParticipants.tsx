"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  text: string;
  userId: string;
  name: string;
  createdAt: string;
};
type Participant = { id: string; name: string };

export default function ChatParticipants({
  canKick = false,
}: {
  canKick?: boolean;
}) {
  const [tab, setTab] = useState<"chat" | "people">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [people, setPeople] = useState<Participant[]>([]);

  useEffect(() => {
    let cancel = false;
    const tick = async () => {
      const [c, p] = await Promise.all([
        fetch("/api/chat"),
        fetch("/api/participants"),
      ]);
      if (!cancel) {
        if (c.ok) setMessages((await c.json()).messages ?? []);
        if (p.ok) setPeople((await p.json()).participants ?? []);
      }
      if (!cancel) setTimeout(tick, 2000);
    };
    tick();
    return () => {
      cancel = true;
    };
  }, []);

  async function send() {
    if (!text.trim()) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
  }

  async function kick(id: string) {
    if (!canKick) return;
    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (response.ok) {
        // Remove the kicked user from the local list immediately
        setPeople((prev) => prev.filter((p) => p.id !== id));
        // Show a brief notification
        alert("Participant has been removed from the poll");
      }
    } catch (error) {
      console.error("Failed to kick participant:", error);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-[340px] bg-white border rounded-lg shadow-xl overflow-hidden">
      <div className="flex border-b">
        <button
          className={`flex-1 px-4 py-2 text-sm ${
            tab === "chat" ? "border-b-2 border-[#7765DA]" : ""
          }`}
          onClick={() => setTab("chat")}
        >
          Chat
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm ${
            tab === "people" ? "border-b-2 border-[#7765DA]" : ""
          }`}
          onClick={() => setTab("people")}
        >
          Participants
        </button>
      </div>
      {tab === "chat" ? (
        <div className="p-3 flex flex-col gap-2 max-h-80 overflow-auto">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-semibold mr-1">{m.name}</span>
              {m.text}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 flex flex-col gap-2 max-h-80 overflow-auto">
          {people.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{p.name}</span>
              {canKick ? (
                <button className="text-blue-600" onClick={() => kick(p.id)}>
                  Kick out
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div className="flex border-t p-2 gap-2">
        <input
          className="flex-1 rounded-md border px-2 py-1 text-sm"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="px-3 py-1 rounded-md bg-[#7765DA] text-white text-sm"
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
