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

export default function QuestionStatsPage() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let cancel = false;
    const pull = async () => {
      const [qRes, sRes] = await Promise.all([
        fetch("/api/active-question"),
        fetch("/api/stats"),
      ]);
      if (!cancel) {
        if (qRes.ok) {
          const jq = await qRes.json();
          const q = jq.question as { text: string; options: Option[] } | null;
          if (q) {
            setQuestion(q.text);
            setOptions(q.options);
          }
        }
        if (sRes.ok) {
          const js = await sRes.json();
          const v: Record<string, number> = {};
          for (const o of js.options ?? []) v[o.id] = o.count ?? 0;
          setVotes(v);
        }
      }
      const h = await fetch("/api/history");
      if (!cancel && h.ok) setHistory((await h.json()).questions ?? []);
      if (!cancel) setTimeout(pull, 1000);
    };
    pull();
    return () => {
      cancel = true;
    };
  }, []);

  // In a real-time implementation, you can compute totals from live votes

  function askNew() {
    location.assign("/teacher/create-question");
  }

  return (
    <div className="min-h-dvh w-full flex items-start justify-center">
      <main className="w-full max-w-5xl px-4 md:px-8 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Question</h2>
          <Button
            className="h-10 rounded-full px-5 text-white"
            style={{
              background:
                "linear-gradient(135deg, #5767D0 0%, #7765DA 50%, #4F0DCE 100%)",
            }}
            onClick={askNew}
          >
            + Ask a new question
          </Button>
        </div>

        <div className="mt-6 rounded-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-400 text-white px-4 py-3 font-semibold">
            {question || "Which planet is known as the Red Planet?"}
          </div>
          <div className="p-4 space-y-3">
            {options.map((op, idx) => {
              const pct = votes[op.id] ?? 0;
              return (
                <div key={op.id} className="w-full rounded-md border bg-muted">
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-md text-white"
                    style={{
                      width: `${pct}%`,
                      background: "#7765DA",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#6B5AD9] text-white text-xs">
                        {idx + 1}
                      </span>
                      <span>{op.text || `Option ${idx + 1}`}</span>
                    </div>
                    <span className="ml-auto pr-2 text-sm font-semibold">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center mt-10 text-lg font-semibold">
          Wait for the teacher to ask a new question
        </p>
      </main>
      <ChatParticipants canKick={true} />
      {history.length > 0 && (
        <section className="w-full max-w-5xl px-4 md:px-8 py-8">
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
