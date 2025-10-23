import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Universal FHEVM SDK - Privacy-Preserving dApps",
  description: "Framework-agnostic SDK for building privacy-preserving dApps with Fully Homomorphic Encryption. Created by mk83 for Zama Developer Program Bounty Track.",
  keywords: ["FHEVM", "privacy", "encryption", "blockchain", "ethereum", "SDK", "framework-agnostic"],
  authors: [{ name: "mk83" }],
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`zama-bg text-foreground antialiased`}>
        <div className="fixed inset-0 w-full h-full zama-bg z-[-20]"></div>
        <main className="flex flex-col max-w-screen-xl mx-auto pb-20">
          <nav className="flex w-full px-4 md:px-6 lg:px-8 h-fit py-6 md:py-10 justify-between items-center">
            <Image
              src="/zama-logo.svg"
              alt="Zama Logo"
              width={80}
              height={80}
              className="md:w-[120px] md:h-[120px]"
            />
          </nav>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
