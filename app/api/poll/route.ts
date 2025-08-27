import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, setSession } from "../_utils/session";

// GET /api/poll -> returns current poll info for session
export async function GET() {
  const { pollId } = await getSession();
  if (!pollId) return NextResponse.json({ error: "No poll" }, { status: 404 });
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) return NextResponse.json({ error: "No poll" }, { status: 404 });
  return NextResponse.json({ id: poll.id, code: poll.code, title: poll.title });
}


