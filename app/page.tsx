"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "student" | "teacher" | null;

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const router = useRouter();

  return (
    <div className="min-h-dvh w-full flex items-center justify-center">
      <main className="w-full max-w-5xl px-4 md:px-8">
        <div className="flex flex-col items-center text-center gap-3">
          <Badge className="px-3 py-1 rounded-full bg-[#F2F2F2] text-[#373737]">
            Intervue Poll
          </Badge>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em]">
            Welcome to the{" "}
            <span className="text-[#373737]">Live Polling System</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Please select the role that best describes you to begin using the
            live polling system
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard
            title="I’m a Student"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry"
            active={selectedRole === "student"}
            onClick={() => setSelectedRole("student")}
          />
          <RoleCard
            title="I’m a Teacher"
            description="Submit answers and view live poll results in real-time."
            active={selectedRole === "teacher"}
            onClick={() => setSelectedRole("teacher")}
          />
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            className="h-12 w-44 rounded-full text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #5767D0 0%, #7765DA 50%, #4F0DCE 100%)",
            }}
            onClick={async () => {
              if (selectedRole === "teacher") {
                // Always create a fresh poll for a teacher entry
                const res = await fetch("/api/bootstrap", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: "Teacher", role: "TEACHER" }),
                });
                if (!res.ok) {
                  alert("Failed to start a new poll");
                  return;
                }
                router.push("/teacher/create-question");
              } else {
                router.push("/student/get-started");
              }
            }}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
}

function RoleCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={
        "cursor-pointer transition-colors" +
        (active ? " border-[#5767D0]" : " hover:border-[#E5E7EB]")
      }
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0" />
    </Card>
  );
}
