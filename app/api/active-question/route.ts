import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// GET /api/active-question -> returns the current ACTIVE question for the session poll
export async function GET() {
  const { pollId } = await getSession();
  if (!pollId)
    return NextResponse.json({ error: "No poll in session" }, { status: 400 });

  const q = await prisma.question.findFirst({
    where: { pollId, status: "ACTIVE" },
    orderBy: { order: "desc" },
    include: { options: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ question: q });
}
