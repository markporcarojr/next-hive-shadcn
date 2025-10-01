import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import "./globals.css";

import { ActiveThemeProvider } from "@/components/active-theme";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { checkUser } from "@/lib/auth/checkUser";
import Script from "next/script";
import GoogleMapsScript from "@/components/client/MapScript";

export const metadata: Metadata = {
  title: "Next Hive - Beekeeping Helper App",
  description:
    "Your personal beekeeping assistant. Track your hives, manage tasks, and monitor health with ease.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkUser();

  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
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
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
                <AppSidebar variant="inset" />
                <SidebarInset>
                  <SiteHeader />
                  <main className="flex-1 flex flex-col overflow-y-auto">
                    <SidebarTrigger />
                    {children}
                  </main>
                  <Toaster />
                </SidebarInset>
              </SidebarProvider>
            </ActiveThemeProvider>
          </ThemeProvider>
          <GoogleMapsScript />
        </body>
      </html>
    </ClerkProvider>
  );
}
