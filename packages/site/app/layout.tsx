import type { Metadata } from "next";
import "@/styles/globals.css";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={`text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
