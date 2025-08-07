"use client"

import type React from "react"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Mail, ArrowRight } from "lucide-react"

export default function VerifyEmailPage() {
    const { signUp, isLoaded, setActive } = useSignUp()
    const router = useRouter()
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        setIsLoading(true)

        try {
            // Verifica o código
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (completeSignUp.status === "complete") {
                // Agora sim temos o userId definitivo
                console.log("✅ Verificação completa! UserId:", completeSignUp.createdUserId)

                // Ativa a sessão
                await setActive({ session: completeSignUp.createdSessionId })

                // Redireciona para o dashboard (o ensureUserExists será chamado automaticamente)
                router.push("/dashboard")
            }
        } catch (err: any) {
            console.error("Erro na verificação:", err)
            alert(err.errors[0]?.message || "Código inválido")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (!isLoaded) return

        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
            alert("Novo código enviado!")
        } catch (err: any) {
            alert(err.errors[0]?.message || "Erro ao reenviar código")
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
                    <CardTitle className="text-2xl font-bold">Verificar Email</CardTitle>
                    <CardDescription>
                        Enviamos um código de verificação para seu email. Digite-o abaixo para ativar sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Código de Verificação</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="pl-10 text-center text-lg tracking-widest"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading || !code}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {isLoading ? "Verificando..." : "Verificar e Continuar"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">Não recebeu o código?</p>
                        <Button variant="outline" onClick={handleResendCode} className="text-sm bg-transparent">
                            Reenviar código
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
