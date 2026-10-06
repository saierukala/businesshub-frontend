import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./sidebar-themes.css";
import { Providers } from "./providers";
import { SIDEBAR_THEME_COOKIE, toSidebarTheme } from "@/lib/sidebar-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "HomeFix", template: "%s · HomeFix" },
  description: "Book appliance repairs with HomeFix Appliance Services, Hyderabad.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Sidebar palette picked on the Settings page; set on <html> so the phone drawer (a portal) gets it too.
  const sidebarTheme = toSidebarTheme((await cookies()).get(SIDEBAR_THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      data-sidebar-theme={sidebarTheme}
      // next-themes adds the light/dark class before React loads.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Browser extensions (antivirus, shopping...) add attributes like bis_skin_checked to the page before React loads.
          That is not our bug; this flag stops React warning about attributes it did not render. It covers only <body> itself. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
