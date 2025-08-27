"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StudentGetStartedPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    const existing = sessionStorage.getItem("studentName");
    if (existing) setName(existing);
  }, []);

  function onContinue() {
    if (!name.trim()) return;
    sessionStorage.setItem("studentName", name.trim());
    router.push("/student/answer-question");
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center">
      <main className="w-full max-w-2xl px-4 md:px-8 text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Badge className="px-3 py-1 rounded-full bg-[#4F0DCE]/80 text-white">
            Intervue Poll
          </Badge>
          <h1 className="text-3xl md:text-5xl font-semibold">
            Let’s <span className="font-black">Get Started</span>
          </h1>
          <p className="text-muted-foreground">
            If you’re a student, you’ll be able to{" "}
            <strong>submit your answers</strong>, participate in live polls, and
            see how your responses compare with your classmates
          </p>
        </div>

        <div className="text-left space-y-2 max-w-xl mx-auto">
          <label className="text-base font-medium">Enter your Name</label>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 bg-muted"
          />
        </div>

        <div className="flex justify-center">
          <Button
            className="h-12 w-44 rounded-full text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #5767D0 0%, #7765DA 50%, #4F0DCE 100%)",
            }}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
}
