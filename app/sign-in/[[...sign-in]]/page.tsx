"use client";

import { SignIn } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { dark } from "@clerk/themes";

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
    <div className="flex min-h-screen items-start sm:items-center justify-center bg-[#0a0a0a] p-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "mx-auto",
                card: "shadow-2xl",
                headerTitle: "text-lg sm:text-xl",
                headerSubtitle: "text-xs sm:text-sm",
                socialButtonsBlockButton: "text-sm py-2",
                formButtonPrimary: "py-2.5",
                footer: "hidden", // Hide "Don't have an account?" on mobile
              },
            }}
          />
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0a0a0a] px-3 text-gray-400">or</span>
          </div>
        </div>

        {/* Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full rounded-lg bg-[#3a3b43] hover:bg-[#4a4b53] text-white px-4 py-3 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          <span className="text-base">🎭</span>
          {loading ? "Logging in..." : "Try Demo Account"}
        </button>

        <p className="text-xs text-gray-500 text-center pb-4">
          Explore all features with a pre-loaded demo account
        </p>
      </div>
    </div>
  );
}
