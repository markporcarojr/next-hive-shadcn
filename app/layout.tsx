import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";

import { ActiveThemeProvider } from "@/components/active-theme";
import { AppSidebar } from "@/components/app-sidebar";
import GoogleMapsScript from "@/components/client/MapScript";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { checkUser } from "@/lib/auth/checkUser";
import "@/lib/setupLeafletGesture"; // 👈 one-line global gesture setup
import { cn } from "@/lib/utils";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import "./globals.css";

import { CustomTrigger } from "@/components/custom-sidebar-trigger";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import ClientSetup from "./client-setup";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Hive-Tool - Beekeeping Helper App",
    template: "%s | Hive-Tool", // For page-specific titles
  },
  description:
    "Your personal beekeeping assistant. Track your hives, manage tasks, and monitor health with ease.",
  applicationName: "Hive-Tool",
  keywords: ["beekeeping", "hive management", "beekeeping app", "hive tracker"],
  authors: [{ name: "Mark Porcaro" }],
  creator: "Mark Porcaro",
  icons: [{ rel: "icon", url: "/favicon.ico" }],

  // Open Graph (for social media sharing)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    title: "Next Hive - Beekeeping Helper App",
    description:
      "Your personal beekeeping assistant. Track your hives, manage tasks, and monitor health with ease.",
    siteName: "Next Hive",
    images: [
      {
        url: "/og-image.png", // Create this image (1200x630px recommended)
        width: 1200,
        height: 630,
        alt: "Next Hive Beekeeping App",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Hive-Tool - Beekeeping Helper App",
    description:
      "Your personal beekeeping assistant. Track your hives, manage tasks, and monitor health with ease.",
    images: ["/twitter-image.png"], // Can use same as og-image
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Manifest for PWA (optional)
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        // signIn: { baseTheme: neobrutalism },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={cn(
            "bg-background overscroll-none font-sans antialiased",
            activeThemeValue ? `theme-${activeThemeValue}` : "theme-default",
            isScaled ? "theme-scaled" : ""
          )}
          data-theme={activeThemeValue || "default"}
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
                    <div className="ml-4 mt-4">
                      <CustomTrigger />
                    </div>
                    {children}
                  </main>
                  <Toaster />
                </SidebarInset>
              </SidebarProvider>
            </ActiveThemeProvider>
          </ThemeProvider>
          <ClientSetup />
          <GoogleMapsScript />
        </body>
      </html>
    </ClerkProvider>
  );
}
