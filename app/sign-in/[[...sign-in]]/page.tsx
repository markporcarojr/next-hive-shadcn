"use client";

import { SignIn } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: "guest_demo@next-hive.app",
        password: "Guest2025!",
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Guest login successful!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Guest login failed:", error);
      toast.error("Guest login unavailable right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[#141414] shadow-2xl border border-[#262626] p-8 space-y-6">
          <h2 className="text-center text-xl font-semibold text-white">
            Sign in to <span className="text-purple-400">Hive Tool</span>
          </h2>
          <p className="text-center text-sm text-gray-400">
            Welcome back! Please sign in to continue
          </p>

          {/* Clerk Sign In Component */}
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                formButtonPrimary:
                  "bg-gradient-to-r from-[#6a5acd] to-[#9b59b6] hover:opacity-90 text-white font-semibold",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                footer: "hidden",
                dividerLine: "bg-[#333]",
                socialButtonsBlockButton:
                  "bg-[#1e1e1e] hover:bg-[#2b2b2b] text-gray-200 border border-[#333]",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#141414] px-3 text-gray-400">or</span>
            </div>
          </div>

          {/* Guest Login Button */}
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#3a3b43] hover:bg-[#4a4b53] text-white px-4 py-3.5 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="text-lg">🎭</span>
            {loading ? "Logging in..." : "Try Demo Account"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Explore all features with a pre-loaded demo account
          </p>

          {/* Development Mode Banner */}
          <p className="text-center text-xs text-orange-400 mt-4">
            Development mode
          </p>
        </div>
      </div>
    </div>
  );
}
