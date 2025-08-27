import { cookies } from "next/headers";

export type SessionInfo = {
  userId?: string;
  pollId?: string;
  role?: "TEACHER" | "STUDENT";
};

const UID = "uid";
const PID = "pid";
const ROLE = "role";

export async function getSession(): Promise<SessionInfo> {
  const jar = await cookies();
  const userId = jar.get(UID)?.value;
  const pollId = jar.get(PID)?.value;
  const role = jar.get(ROLE)?.value as SessionInfo["role"] | undefined;
  return { userId, pollId, role };
}

export async function setSession(partial: SessionInfo) {
  const jar = await cookies();
  if (partial.userId)
    jar.set(UID, partial.userId, { httpOnly: false, sameSite: "lax" });
  if (partial.pollId)
    jar.set(PID, partial.pollId, { httpOnly: false, sameSite: "lax" });
  if (partial.role)
    jar.set(ROLE, partial.role, { httpOnly: false, sameSite: "lax" });
}
