import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// GET /api/stats -> returns counts per option for the latest question
export async function GET() {
  const { pollId } = await getSession();
  if (!pollId) return NextResponse.json({ error: "No poll" }, { status: 400 });

  const question = await prisma.question.findFirst({
    where: { pollId },
    orderBy: [{ status: "desc" }, { order: "desc" }],
  });
  if (!question) return NextResponse.json({ votes: [] });

  const options = await prisma.option.findMany({
    where: { questionId: question.id },
    orderBy: { order: "asc" },
  });
  const grouped = await prisma.vote.groupBy({
    by: ["optionId"],
    where: { questionId: question.id },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    grouped.map((g) => [g.optionId, g._count._all])
  );
  return NextResponse.json({
    questionId: question.id,
    options: options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
      count: counts[o.id] ?? 0,
    })),
  });
}
