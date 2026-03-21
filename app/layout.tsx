import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { CivicAuthProvider } from "@civic/auth/nextjs";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "mimi — AI Travel Planner",
  description: "Plan your perfect trip with mimi, your AI travel companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${fredoka.className}`}>
        <CivicAuthProvider>{children}</CivicAuthProvider>
      </body>
    </html>
  );
}
