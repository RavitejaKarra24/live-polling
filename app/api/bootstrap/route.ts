import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// POST /api/bootstrap
// Body: { name: string; role: 'TEACHER'|'STUDENT'; pollCode?: string; title?: string }
// - If teacher: ensures a poll exists (creates one) and returns { pollId, code, userId }
// - If student: finds poll by code, creates/fetches user and participation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body?.name || "").trim();
  const role = body?.role === "TEACHER" ? "TEACHER" : "STUDENT";
  const pollCode = body?.pollCode as string | undefined;
  const title = (body?.title as string | undefined) ?? null;

  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // ensure user
  const user = await prisma.user.create({ data: { name, role } });

  if (role === "TEACHER") {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const poll = await prisma.poll.create({
      data: { code, title, teacherId: user.id },
    });
    const res = NextResponse.json({
      userId: user.id,
      pollId: poll.id,
      code: poll.code,
    });
    const jar = await cookies();
    jar.set("uid", user.id, { httpOnly: false, sameSite: "lax" });
    jar.set("pid", poll.id, { httpOnly: false, sameSite: "lax" });
    jar.set("role", role, { httpOnly: false, sameSite: "lax" });
    return res;
  }

  // student path
  if (!pollCode)
    return NextResponse.json(
      { error: "pollCode is required" },
      { status: 400 }
    );
  const poll = await prisma.poll.findUnique({ where: { code: pollCode } });
  if (!poll)
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  await prisma.participation.upsert({
    where: { pollId_userId: { pollId: poll.id, userId: user.id } },
    update: {},
    create: { pollId: poll.id, userId: user.id },
  });
  const res = NextResponse.json({
    userId: user.id,
    pollId: poll.id,
    code: poll.code,
  });
  const jar = await cookies();
  jar.set("uid", user.id, { httpOnly: false, sameSite: "lax" });
  jar.set("pid", poll.id, { httpOnly: false, sameSite: "lax" });
  jar.set("role", role, { httpOnly: false, sameSite: "lax" });
  return res;
}
