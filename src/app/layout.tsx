import type { Metadata } from "next";
import "./globals.css";
import { MiniKitWrapper } from "@/components/providers/MiniKitWrapper";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MoodMap — Daily Mood Tracker",
  description: "Share your mood with the world, every day.",
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "worldcoin-mini-app": "true",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <MiniKitWrapper>{children}</MiniKitWrapper>
      </body>
    </html>
  );
}
