import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// GET /api/chat -> latest 50 messages for the poll
export async function GET() {
  const { pollId } = await getSession();
  if (!pollId) return NextResponse.json({ messages: [] });
  const rows = await prisma.chatMessage.findMany({
    where: { pollId },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: { user: true },
  });
  return NextResponse.json({
    messages: rows.map((r) => ({
      id: r.id,
      text: r.text,
      userId: r.userId,
      name: r.user.name,
      createdAt: r.createdAt,
    })),
  });
}

// POST /api/chat -> body { text }
export async function POST(req: NextRequest) {
  const { pollId, userId } = await getSession();
  if (!pollId || !userId)
    return NextResponse.json({ error: "Not in poll" }, { status: 403 });
  const body = await req.json();
  const text = String(body?.text || "").trim();
  if (!text) return NextResponse.json({ error: "Empty" }, { status: 400 });
  const msg = await prisma.chatMessage.create({
    data: { pollId, userId, text },
  });
  return NextResponse.json({ id: msg.id });
}
