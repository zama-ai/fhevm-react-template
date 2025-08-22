import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mail | Zmail",
  description: "X | Zmail",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
