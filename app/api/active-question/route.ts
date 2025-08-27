import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// GET /api/active-question -> returns the next question for the student to answer
export async function GET() {
  const { pollId, userId } = await getSession();
  if (!pollId || !userId)
    return NextResponse.json(
      { error: "No poll or user in session" },
      { status: 400 }
    );

  // Get all questions for this poll (both active and closed)
  const allQuestions = await prisma.question.findMany({
    where: { pollId },
    orderBy: { order: "asc" },
    include: {
      options: { orderBy: { order: "asc" } },
      votes: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  if (allQuestions.length === 0) return NextResponse.json({ question: null });

  // Find the first unanswered question
  let nextQuestion = null;
  for (const question of allQuestions) {
    if (question.votes.length === 0) {
      nextQuestion = question;
      break;
    }
  }

  // If no unanswered questions, show the current active question (for ongoing polls)
  if (!nextQuestion) {
    nextQuestion = await prisma.question.findFirst({
      where: { pollId, status: "ACTIVE" },
      orderBy: { order: "desc" },
      include: { options: { orderBy: { order: "asc" } } },
    });
  }

  if (!nextQuestion) return NextResponse.json({ question: null });

  // Calculate remaining time based on when the question was asked
  let remainingMs = nextQuestion.timeLimitMs;
  if (nextQuestion.askedAt) {
    const elapsed = Date.now() - new Date(nextQuestion.askedAt).getTime();
    remainingMs = Math.max(0, nextQuestion.timeLimitMs - elapsed);
  } else if (nextQuestion.status === "ACTIVE") {
    // For active questions, start the timer from now
    remainingMs = nextQuestion.timeLimitMs;
  }

  return NextResponse.json({
    question: {
      ...nextQuestion,
      remainingMs,
      isSequential: nextQuestion.status !== "ACTIVE", // Indicate if this is a sequential question
    },
  });
}
