import type { Metadata } from "next";
import "./globals.css";
import { MiniKitWrapper } from "@/components/providers/MiniKitWrapper";

export const metadata: Metadata = {
  title: "MoodMap",
  description: "Share your mood with the world, every day.",
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
    <html lang="en">
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
