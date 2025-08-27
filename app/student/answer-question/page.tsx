"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ChatParticipants from "@/components/ChatParticipants";

type Option = { id: string; text: string; correct: boolean };
type HistoryItem = {
  id: string;
  text: string;
  order: number;
  status: string;
  options: { id: string; text: string; isCorrect: boolean; count: number }[];
};

export default function AnswerQuestionPage() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(60);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // poll the active question
  useEffect(() => {
    let cancel = false;
    const tick = async () => {
      const res = await fetch("/api/active-question");
      if (!cancel && res.ok) {
        const j = await res.json();
        const q = j.question as {
          id: string;
          text: string;
          timeLimitMs: number;
          remainingMs?: number;
          askedAt?: string;
          options: Option[];
        } | null;
        if (q) {
          setQuestion(q.text);
          setOptions(q.options);
          const rem =
            typeof q.remainingMs === "number"
              ? q.remainingMs
              : q.timeLimitMs ?? 60000;
          setRemaining(Math.max(0, Math.round(rem / 1000)));
        }
      }
      const h = await fetch("/api/history");
      if (!cancel && h.ok) setHistory((await h.json()).questions ?? []);
      if (!cancel) setTimeout(tick, 1000);
    };
    tick();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  async function onSubmit() {
    if (!selected) return;
    const res = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId: selected }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "Failed to submit");
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-start justify-center">
      <main className="w-full max-w-4xl px-4 md:px-8 py-12">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Question 1</h2>
          <div className="text-red-600 font-semibold">
            {new Date(remaining * 1000).toISOString().substring(14, 19)}
          </div>
        </div>

        <div className="mt-6 rounded-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-400 text-white px-4 py-3 font-semibold">
            {question || "Which planet is known as the Red Planet?"}
          </div>
          <div className="p-4 space-y-3">
            {options.length > 0 ? (
              options.map((op, idx) => (
                <button
                  key={op.id}
                  onClick={() => setSelected(op.id)}
                  className={`w-full text-left rounded-md px-4 py-3 border bg-muted ${
                    selected === op.id ? "ring-2 ring-[#7c66e4]" : ""
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7c66e4] text-white text-xs mr-3">
                    {idx + 1}
                  </span>
                  {op.text || `Option ${idx + 1}`}
                </button>
              ))
            ) : (
              <div className="text-muted-foreground">
                Wait for the teacher to ask questions..
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            className="h-12 w-44 rounded-full text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #5767D0 0%, #7765DA 50%, #4F0DCE 100%)",
            }}
            disabled={!selected}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      </main>
      <ChatParticipants canKick={false} />
      {/* History */}
      {history.length > 0 && (
        <section className="w-full max-w-4xl px-4 md:px-8 py-8">
          <h3 className="text-2xl font-semibold mb-4">View Poll History</h3>
          <div className="flex flex-col gap-8">
            {history.map((q) => (
              <div key={q.id} className="rounded-lg border overflow-hidden">
                <div className="bg-gradient-to-r from-zinc-700 to-zinc-400 text-white px-4 py-3 font-semibold">
                  {q.text}
                </div>
                <div className="p-4 space-y-3">
                  {q.options.map((o, idx: number) => (
                    <div
                      key={o.id}
                      className="w-full rounded-md border bg-muted"
                    >
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-md text-white"
                        style={{ width: `${o.count}%`, background: "#7765DA" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#6B5AD9] text-white text-xs">
                            {idx + 1}
                          </span>
                          <span>{o.text}</span>
                        </div>
                        <span className="ml-auto pr-2 text-sm font-semibold">
                          {o.count}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
