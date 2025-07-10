"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Mail, Lock, User } from "lucide-react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    if (password !== confirmPassword) {
      alert("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      // Cria o usuário no Clerk (apenas email e senha)
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      })

      // Envia email de verificação
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      console.log("✅ Usuário criado no Clerk:", result.id)
      console.log("📝 Nome será salvo no banco:", name)

      alert("Código de verificação enviado ao email.")

      // Salva o nome no localStorage temporariamente para usar depois
      if (name.trim()) {
        localStorage.setItem("pendingUserName", name.trim())
      }

      // Redireciona para verificação
      router.push("/verify-email")
    } catch (err: any) {
      console.error("Erro ao registrar:", err)
      alert(err.errors[0]?.message || "Erro ao registrar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
            <CardDescription>Cadastre-se para começar a usar a plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
