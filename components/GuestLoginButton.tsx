"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GuestLoginButton() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    if (!isLoaded) return;

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: "guest_demo@next-hive.app", // same as seed email
        password: "demo123",
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard"); // redirect wherever your main page is
      } else {
        console.error("Unexpected Clerk result:", result);
      }
    } catch (error: any) {
      console.error("Guest login failed:", error);
      alert("Guest login unavailable right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGuestLogin}
      disabled={loading}
      className="rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium transition hover:opacity-90 disabled:opacity-60"
    >
      {loading ? "Logging in..." : "Try Demo"}
    </button>
  );
}
