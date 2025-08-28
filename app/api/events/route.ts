import { NextRequest } from "next/server";
import { eventsBus } from "@/lib/events";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const jar = await cookies();
  const pollId = jar.get("pid")?.value;
  if (!pollId) {
    return new Response("Missing poll", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: string) => controller.enqueue(encoder.encode(data));
      const id = eventsBus.subscribe(pollId, send);
      // initial comment to keep connection open
      send(":ok\n\n");
      const interval = setInterval(() => send(":keepalive\n\n"), 15000);
      return () => {
        clearInterval(interval);
        eventsBus.unsubscribe(id);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
