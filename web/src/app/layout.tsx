import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import Sidebar from "../components/Sidebar";
import Providers from "@/app/providers";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Lottery",
  description: "The best on-chain lottery!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full min-h-screen`}
      >
        <div className="relative min-h-screen">
          <Sidebar />
          <main className="ml-64 p-4">
            <Providers session={session} cookie={cookie} >
              {children}
            </Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
