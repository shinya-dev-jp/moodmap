import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MiniKitWrapper } from "@/components/providers/MiniKitWrapper";

export const metadata: Metadata = {
  title: "MoodMap",
  description: "Log your mood in seconds. Discover your emotional patterns.",
  other: {
    "worldcoin-mini-app": "true",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d0d14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0d0d14]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body>
        <MiniKitWrapper>{children}</MiniKitWrapper>
      </body>
    </html>
  );
}
