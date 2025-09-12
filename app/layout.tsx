import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import "./globals.css";

import { cn } from "@/lib/utils";

import { ActiveThemeProvider } from "@/components/active-theme";
import { ThemeProvider } from "./../components/theme-provider";

export const metadata: Metadata = {
  title: "Next Hive - Beekeeping Helper App",
  description:
    "Your personal beekeeping assistant. Track your hives, manage tasks, and monitor health with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "bg-background overscroll-none font-sans antialiased",
            activeThemeValue ? `theme-${activeThemeValue}` : "",
            isScaled ? "theme-scaled" : ""
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <ActiveThemeProvider initialTheme={activeThemeValue}>
              {children}
            </ActiveThemeProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
