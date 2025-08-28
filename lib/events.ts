type Subscriber = {
  id: string;
  pollId: string;
  send: (data: string) => void;
};

class EventBus {
  private subs: Map<string, Subscriber> = new Map();

  subscribe(pollId: string, send: (data: string) => void): string {
    const id = Math.random().toString(36).slice(2);
    this.subs.set(id, { id, pollId, send });
    return id;
  }

  unsubscribe(id: string) {
    this.subs.delete(id);
  }

  publish(pollId: string, event: string, payload: unknown) {
    const data = `event: ${event}\n` + `data: ${JSON.stringify(payload)}\n\n`;
    for (const sub of this.subs.values()) {
      if (sub.pollId === pollId) {
        try {
          sub.send(data);
        } catch {}
      }
    }
  }
}

export const eventsBus = new EventBus();
