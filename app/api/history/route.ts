import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// GET /api/history -> closed questions (and active) with counts
export async function GET() {
  const { pollId } = await getSession();
  if (!pollId) return NextResponse.json({ questions: [] });

  const questions = await prisma.question.findMany({
    where: { pollId },
    orderBy: [{ order: "asc" }],
    include: { options: { orderBy: { order: "asc" } } },
  });
  const countsByQuestion: Record<string, Record<string, number>> = {};
  for (const q of questions) {
    const grouped = await prisma.vote.groupBy({
      by: ["optionId"],
      where: { questionId: q.id },
      _count: { _all: true },
    });
    countsByQuestion[q.id] = Object.fromEntries(
      grouped.map((g) => [g.optionId, g._count._all])
    );
  }
  return NextResponse.json({
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      status: q.status,
      order: q.order,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
        count: countsByQuestion[q.id]?.[o.id] ?? 0,
      })),
    })),
  });
}


