"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function KickedPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any existing session data when kicked
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }, []);

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-gray-50">
      <main className="w-full max-w-md px-4 md:px-8 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Badge className="px-3 py-1 rounded-full bg-red-100 text-red-800">
            Access Denied
          </Badge>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            You have been removed from the poll
          </h1>
          <p className="text-gray-600 max-w-sm">
            The teacher has removed you from this poll session. You can no
            longer participate or view the results.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full h-12 rounded-full text-white font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #5767D0 0%, #7765DA 50%, #4F0DCE 100%)",
            }}
          >
            Return to Home
          </Button>

          <p className="text-xs text-gray-500">
            If you believe this was done in error, please contact your teacher.
          </p>
        </div>
      </main>
    </div>
  );
}
