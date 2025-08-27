import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// POST /api/answer -> Student submits an answer
// body: { optionId: string }
export async function POST(req: NextRequest) {
  const { pollId, userId, role } = await getSession();
  if (!pollId || !userId || role !== "STUDENT")
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const optionId = String(body?.optionId || "");
  if (!optionId)
    return NextResponse.json({ error: "optionId required" }, { status: 400 });

  const option = await prisma.option.findUnique({
    include: { question: true },
    where: { id: optionId },
  });
  if (!option || option.question.pollId !== pollId)
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  if (option.question.status !== "ACTIVE")
    return NextResponse.json({ error: "Question not active" }, { status: 409 });

  await prisma.vote.upsert({
    where: {
      questionId_userId: { questionId: option.questionId, userId },
    },
    update: { optionId },
    create: { questionId: option.questionId, optionId, userId },
  });

  return NextResponse.json({ ok: true });
}
