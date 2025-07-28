import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { getConfig } from "@/wagmi.config";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Zama FHEVM SDK Quickstart",
  description: "Zama FHEVM SDK Quickstart app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get("cookie") ?? ""
  );
  return (
    <html lang="en">
      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black bg-opacity-90 text-foreground antialiased`}
      > */}
      <body
        className={`zama-bg text-foreground antialiased`}
      >

        <div className="fixed inset-0 w-full h-full zama-bg z-[-20] min-w-[850px]"></div>
        <main className="flex flex-col max-w-screen-lg mx-auto pb-20 min-w-[850px]">
          <Providers initialState={initialState}>
            <Navbar />
            {children}
          </Providers>
        </main>
      </body>
    </html>
  );
}
