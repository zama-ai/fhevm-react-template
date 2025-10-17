import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cloak SDK Demo - Confidential dApps with FHEVM',
  description: 'A comprehensive demo showcasing the Cloak SDK for building confidential dApps with FHEVM',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers cookies={cookies}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
