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
  const [pollCode, setPollCode] = useState<string>("");

  useEffect(() => {
    let cancel = false;
    const pull = async () => {
      const [qRes, sRes, pRes] = await Promise.all([
        fetch("/api/active-question"),
        fetch("/api/stats"),
        fetch("/api/poll"),
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
        if (pRes.ok) {
          const jp = await pRes.json();
          setPollCode(jp.code || "");
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
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Question</h2>
            {pollCode && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-700">Code:</span>
                <span className="font-mono font-bold text-gray-900">
                  {pollCode}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(pollCode)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            )}
          </div>
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
            {(() => {
              const totalVotes = Object.values(votes).reduce(
                (sum, count) => sum + count,
                0
              );
              return options.map((op, idx) => {
                const voteCount = votes[op.id] ?? 0;
                const percentage =
                  totalVotes > 0
                    ? Math.round((voteCount / totalVotes) * 100)
                    : 0;
                const isCorrect = op.correct;
                return (
                  <div
                    key={op.id}
                    className="w-full rounded-md border bg-muted"
                  >
                    <div className="flex items-center justify-between p-4 rounded-md">
                      <div className="flex items-center gap-3 flex-1">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-semibold ${
                            isCorrect ? "bg-[#16a34a]" : "bg-[#6B5AD9]"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium flex-1">
                          {op.text || `Option ${idx + 1}`}
                        </span>
                        {isCorrect && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
                            Correct
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div
                          className="h-3 bg-gray-200 rounded-full overflow-hidden"
                          style={{ width: "100px" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                              background: isCorrect ? "#22c55e" : "#7765DA",
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-right">
                          {percentage}% ({voteCount})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
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
                  {(() => {
                    const totalVotes = q.options.reduce(
                      (sum, o) => sum + o.count,
                      0
                    );
                    return q.options.map((o, idx: number) => {
                      const percentage =
                        totalVotes > 0
                          ? Math.round((o.count / totalVotes) * 100)
                          : 0;
                      const isCorrect = o.isCorrect;
                      return (
                        <div
                          key={o.id}
                          className="w-full rounded-md border bg-muted"
                        >
                          <div className="flex items-center justify-between p-4 rounded-md">
                            <div className="flex items-center gap-3 flex-1">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-semibold ${
                                  isCorrect ? "bg-[#16a34a]" : "bg-[#6B5AD9]"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-sm font-medium flex-1">
                                {o.text}
                              </span>
                              {isCorrect && (
                                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
                                  Correct
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                              <div
                                className="h-3 bg-gray-200 rounded-full overflow-hidden"
                                style={{ width: "100px" }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.max(percentage, 5)}%`,
                                    background: isCorrect
                                      ? "#22c55e"
                                      : "#7765DA",
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-right">
                                {percentage}% ({o.count})
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
