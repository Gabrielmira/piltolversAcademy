import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import {ClerkProvider, SignedOut} from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Piltover's Academy - Sistema de Provas Online",
  description: "Plataforma moderna para criação e execução de provas online",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <ClerkProvider>
      <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
      </html>
  </ClerkProvider>

  )
}
