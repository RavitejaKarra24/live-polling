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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );
  const [isSequentialQuestion, setIsSequentialQuestion] =
    useState<boolean>(false);

  // Initial kick check on page load
  useEffect(() => {
    const checkKickStatus = async () => {
      try {
        const response = await fetch("/api/participants", { method: "PATCH" });
        if (response.ok) {
          const data = await response.json();
          if (data.kicked) {
            window.location.href = "/student/kicked";
          }
        }
      } catch (error) {
        console.error("Error checking kick status:", error);
      }
    };
    checkKickStatus();
  }, []);

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
          isSequential?: boolean;
        } | null;
        if (q) {
          setQuestion(q.text);
          setOptions(q.options);
          setCurrentQuestionId(q.id);
          setIsSequentialQuestion(q.isSequential || false);
          const rem =
            typeof q.remainingMs === "number"
              ? q.remainingMs
              : q.timeLimitMs ?? 60000;
          setRemaining(Math.max(0, Math.round(rem / 1000)));

          // Check if user has already answered this question
          const hasAnsweredThisQuestion = answeredQuestions.has(q.id);
        } else {
          // No active question
          setCurrentQuestionId(null);
        }
      }
      const h = await fetch("/api/history");
      if (!cancel && h.ok) {
        const historyData = await h.json();
        const questions = historyData.questions ?? [];
        setHistory(questions);

        // Update answered questions based on history
        const answeredIds = new Set<string>();
        questions.forEach((q: HistoryItem) => {
          if (q.options.some((o) => o.count > 0)) {
            answeredIds.add(q.id);
          }
        });
        setAnsweredQuestions(answeredIds);
      }

      // Check if user has been kicked
      const kickCheck = await fetch("/api/participants", { method: "PATCH" });
      if (!cancel && kickCheck.ok) {
        const kickData = await kickCheck.json();
        if (kickData.kicked) {
          // Redirect to kicked page
          window.location.href = "/student/kicked";
          return;
        }
      }

      if (!cancel) setTimeout(tick, 1000);
    };
    tick();
    return () => {
      cancel = true;
    };
  }, [answeredQuestions]);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  async function onSubmit() {
    if (!selected) {
      alert("Please select an option before submitting");
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to submit answer");
      }

      // Success - clear selection and show confirmation
      setSelected(null);
      setHasAnswered(true);
      if (currentQuestionId) {
        setAnsweredQuestions((prev) => new Set([...prev, currentQuestionId]));
      }
      alert("Answer submitted successfully!");

      // Optionally refresh the page or update state to show results
      // For now, we'll just clear the selection
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        (error as Error).message || "Failed to submit answer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-start justify-center">
      <main className="w-full max-w-4xl px-4 md:px-8 py-12">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">
              {isSequentialQuestion ? "Catch-up Question" : "Live Question"}
            </h2>
            {isSequentialQuestion && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Previous Question
              </span>
            )}
          </div>
          <div
            className={`font-semibold ${
              remaining === 0 ? "text-gray-500" : "text-red-600"
            }`}
          >
            {remaining === 0
              ? isSequentialQuestion
                ? "Time's up - Answer now!"
                : "Time's up"
              : new Date(remaining * 1000).toISOString().substring(14, 19)}
          </div>
        </div>

        <div className="mt-6 rounded-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-400 text-white px-4 py-3 font-semibold">
            {question || "Which planet is known as the Red Planet?"}
          </div>
          {isSequentialQuestion && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This is a previous question. Answer it to catch up with the
                    class and unlock the poll history with correct answers.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 space-y-3">
            {options.length > 0 ? (
              options.map((op, idx) => (
                <button
                  key={op.id}
                  onClick={() => setSelected(op.id)}
                  className={`w-full text-left rounded-md p-4 border bg-muted transition-colors ${
                    selected === op.id
                      ? "ring-2 ring-[#7c66e4] bg-[#7c66e4]/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#7c66e4] text-white text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium flex-1">
                      {op.text || `Option ${idx + 1}`}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-lg font-medium mb-2">
                  {history.length > 0
                    ? "All caught up!"
                    : "Wait for the teacher to ask questions"}
                </div>
                <div className="text-sm">
                  {history.length > 0
                    ? "You've answered all questions. The teacher will ask new questions soon."
                    : "Questions will appear here once the teacher starts the poll."}
                </div>
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
            disabled={
              !selected ||
              isSubmitting ||
              (!isSequentialQuestion && remaining === 0)
            }
            onClick={onSubmit}
          >
            {isSubmitting
              ? "Submitting..."
              : isSequentialQuestion
              ? "Submit Answer"
              : "Submit"}
          </Button>
        </div>
      </main>
      <ChatParticipants canKick={false} />
      {/* History */}
      {history.length > 0 && (
        <section className="w-full max-w-4xl px-4 md:px-8 py-8">
          <h3 className="text-2xl font-semibold mb-4">
            {answeredQuestions.size > 0 ? "Answered Questions" : "Poll History"}
          </h3>
          {answeredQuestions.size === 0 && (
            <p className="text-muted-foreground mb-4">
              Answer questions to see results and correct answers here.
            </p>
          )}
          <div className="flex flex-col gap-8">
            {history.map((q) => {
              const hasAnsweredThisQuestion = answeredQuestions.has(q.id);
              return (
                <div key={q.id} className="rounded-lg border overflow-hidden">
                  <div className="bg-gradient-to-r from-zinc-700 to-zinc-400 text-white px-4 py-3 font-semibold">
                    {q.text}
                  </div>
                  <div className="p-4 space-y-3">
                    {hasAnsweredThisQuestion ? (
                      (() => {
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
                                      isCorrect
                                        ? "bg-[#16a34a]"
                                        : "bg-[#6B5AD9]"
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
                      })()
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-lg font-medium mb-2">
                          Answer this question first to see results
                        </div>
                        <div className="text-sm">
                          Complete the current question to view historical
                          results and correct answers.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
