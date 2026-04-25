import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Replyo — Human-Friendly Support, Powered by AI",
    template: "%s | Replyo",
  },
  description:
    "Instantly resolve customer questions with an assistant that reads your docs and speaks with empathy. No robotic replies, just answers.",
  keywords: ["AI chatbot", "customer support AI", "knowledge base chatbot", "automated support", "Replyo"],
  openGraph: {
    title: "Replyo — Human-Friendly Support, Powered by AI",
    description: "Instantly resolve customer questions with an AI that reads your docs and responds with empathy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
