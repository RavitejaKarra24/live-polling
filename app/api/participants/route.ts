import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "../_utils/session";

// GET /api/participants -> list names
export async function GET() {
  try {
    const { pollId } = await getSession();
    if (!pollId) return NextResponse.json({ participants: [] });
    const rows = await prisma.participation.findMany({
      where: { pollId, kickedAt: null },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
    return NextResponse.json({
      participants: rows.map((r) => ({ id: r.userId, name: r.user.name })),
    });
  } catch (e) {
    console.error("/api/participants GET error", e);
    return NextResponse.json({ participants: [] }, { status: 500 });
  }
}

// POST /api/participants/kick -> body { userId }
export async function POST(req: NextRequest) {
  try {
    const { pollId, role } = await getSession();
    if (!pollId || role !== "TEACHER")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { userId } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    await prisma.participation.updateMany({
      where: { pollId, userId },
      data: { kickedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("/api/participants POST error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
