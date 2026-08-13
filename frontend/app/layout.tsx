import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NusaQC - Fish Quality Control AI",
  description:
    "AI-Powered visual quality control system for fish processing units.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen grid grid-cols-[240px_1fr] overflow-x-hidden">
        <Sidebar />
        <div className="min-w-0 flex flex-col">
          <Topbar />
          <main className="flex-1 flex flex-col overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
