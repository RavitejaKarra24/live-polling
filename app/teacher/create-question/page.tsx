"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: string; text: string; correct: boolean };

export default function CreateQuestionPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(60);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: crypto.randomUUID(), text: "", correct: false },
    { id: crypto.randomUUID(), text: "", correct: false },
  ]);

  function addOption() {
    setOptions((o) => [
      ...o,
      { id: crypto.randomUUID(), text: "", correct: false },
    ]);
  }

  function toggleCorrect(id: string, value: boolean) {
    setOptions((o) =>
      o.map((op) => (op.id === id ? { ...op, correct: value } : op))
    );
  }

  function updateText(id: string, text: string) {
    setOptions((o) => o.map((op) => (op.id === id ? { ...op, text } : op)));
  }

  function onAsk() {
    // Placeholder storage so student and stats pages can read the last question
    const payload = { question, options, seconds };
    sessionStorage.setItem("currentQuestion", JSON.stringify(payload));
    router.push("/teacher/question-stats");
  }

  return (
    <div className="min-h-dvh w-full flex items-start justify-center">
      <main className="w-full max-w-5xl px-4 md:px-8 py-12">
        <div className="flex items-center gap-3">
          <Badge className="px-3 py-1 rounded-full bg-[#4F0DCE]/80 text-white">
            Intervue Poll
          </Badge>
          <h1 className="text-3xl md:text-5xl font-semibold">
            Let’s <span className="font-black">Get Started</span>
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          you’ll have the ability to create and manage polls, ask questions, and
          monitor your students&#39; responses in real-time.
        </p>

        <div className="mt-10 flex items-start justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold">Enter your question</label>
              <select
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value))}
                className="h-9 rounded-md border px-3 text-sm"
              >
                {[30, 45, 60, 90, 120].map((s) => (
                  <option key={s} value={s}>
                    {s} seconds
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-muted h-36"
              maxLength={100}
            />
            <div className="text-right text-sm text-muted-foreground">
              {question.length}/100
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
          <div>
            <h3 className="font-semibold">Edit Options</h3>
            <div className="mt-4 flex flex-col gap-4">
              {options.map((op, idx) => (
                <div key={op.id} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#7765DA] text-white flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    className="bg-muted"
                    value={op.text}
                    onChange={(e) => updateText(op.id, e.target.value)}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="rounded-full w-44"
                onClick={addOption}
              >
                + Add More option
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Is it Correct?</h3>
            <div className="mt-6 flex flex-col gap-6">
              {options.map((op) => (
                <div key={op.id} className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${op.id}`}
                      checked={op.correct}
                      onChange={() => toggleCorrect(op.id, true)}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${op.id}`}
                      checked={!op.correct}
                      onChange={() => toggleCorrect(op.id, false)}
                    />
                    No
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-20" />
        <div className="fixed left-0 right-0 bottom-0 border-t bg-background">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex justify-end">
            <Button
              className="h-12 w-48 rounded-full text-white font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, #5767D0 0%, #7765DA 50%, #4F0DCE 100%)",
              }}
              onClick={onAsk}
            >
              Ask Question
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
