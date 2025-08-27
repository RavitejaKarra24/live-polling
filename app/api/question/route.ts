import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// POST /api/question -> Teacher creates a new ACTIVE question
// body: { text: string; timeLimitMs: number; options: { text: string; isCorrect?: boolean }[] }
type IncomingOption = { text: string; isCorrect?: boolean };

export async function POST(req: NextRequest) {
  const { pollId, role } = await getSession();
  if (!pollId || role !== "TEACHER")
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const text = String(body?.text || "").trim();
  const timeLimitMs = Math.max(10_000, Number(body?.timeLimitMs || 60_000));
  const options = (body?.options as IncomingOption[]) ?? [];
  if (!text || options.length < 2)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Close any existing active question first
  await prisma.question.updateMany({
    where: { pollId, status: "ACTIVE" },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  const order = (await prisma.question.count({ where: { pollId } })) + 1;
  const created = await prisma.question.create({
    data: {
      pollId,
      text,
      status: "ACTIVE",
      askedAt: new Date(),
      timeLimitMs,
      order,
      options: {
        create: options.map((o: IncomingOption, idx: number) => ({
          text: String(o.text || "Option " + (idx + 1)),
          isCorrect: Boolean(o.isCorrect),
          order: idx + 1,
        })),
      },
    },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ question: created });
}

// PATCH /api/question -> close the active question
export async function PATCH() {
  const { pollId, role } = await getSession();
  if (!pollId || role !== "TEACHER")
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const updated = await prisma.question.updateMany({
    where: { pollId, status: "ACTIVE" },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  return NextResponse.json({ closed: updated.count });
}
