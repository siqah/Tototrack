import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TotoTrack — Every child. Every journey. Accounted for.",
  description: "AI-powered school bus tracking for Kenyan schools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
