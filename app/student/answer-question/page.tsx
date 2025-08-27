"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = { id: string; text: string; correct: boolean };

export default function AnswerQuestionPage() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(60);

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
      setRemaining(q.seconds ?? 60);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  function onSubmit() {
    // Placeholder: store last submitted option for demo
    sessionStorage.setItem(
      "studentAnswer",
      JSON.stringify({ optionId: selected })
    );
    alert("Answer submitted!");
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
    </div>
  );
}
