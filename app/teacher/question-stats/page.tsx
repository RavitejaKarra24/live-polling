"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = { id: string; text: string; correct: boolean };

export default function QuestionStatsPage() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem("currentQuestion");
    if (stored) {
      const q = JSON.parse(stored) as {
        question: string;
        options: Option[];
        seconds: number;
      };
      setQuestion(q.question);
      setOptions(q.options);
      // Seed with dummy percentages for UI preview
      const seed: Record<string, number> = {};
      q.options.forEach((op, idx) => (seed[op.id] = [75, 5, 5, 15][idx] ?? 0));
      setVotes(seed);
    }
  }, []);

  // In a real-time implementation, you can compute totals from live votes

  function askNew() {
    sessionStorage.removeItem("currentQuestion");
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
    </div>
  );
}
