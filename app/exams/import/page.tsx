"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { importExam } from "@/lib/actions/exam-actions"

interface ImportedExam {
  title: string
  questions: {
    statement: string
    options: string[]
    correctAnswer: number
  }[]
}

export default function ImportExamPage() {
  const [jsonInput, setJsonInput] = useState("")
  const [importedExam, setImportedExam] = useState<ImportedExam | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonInput(content)
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = () => {
    try {
      setError("")
      const parsed = JSON.parse(jsonInput)

      // Validar estrutura
      if (!parsed.title || typeof parsed.title !== "string") {
        throw new Error("Campo 'title' é obrigatório e deve ser uma string")
      }

      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("Campo 'questions' deve ser um array com pelo menos uma questão")
      }

      // Validar cada questão
      parsed.questions.forEach((question: any, index: number) => {
        if (!question.statement || typeof question.statement !== "string") {
          throw new Error(`Questão ${index + 1}: campo 'statement' é obrigatório`)
        }

        if (!Array.isArray(question.options) || question.options.length < 2) {
          throw new Error(`Questão ${index + 1}: deve ter pelo menos 2 alternativas`)
        }

        if (
            typeof question.correctAnswer !== "number" ||
            question.correctAnswer < 0 ||
            question.correctAnswer >= question.options.length
        ) {
          throw new Error(`Questão ${index + 1}: 'correctAnswer' deve ser um índice válido das alternativas`)
        }
      })

      setImportedExam(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar JSON")
      setImportedExam(null)
    }
  }

  const handleImport = async () => {
    if (!importedExam) return

    setIsLoading(true)

    try {
      const result = await importExam(importedExam)

      if (result.success) {
        alert("Prova importada com sucesso!")
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Erro ao importar prova:", error)
      alert("Erro ao importar prova. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const exampleJson = {
    title: "Exemplo de Prova",
    questions: [
      {
        statement: "Qual é a capital do Brasil?",
        options: ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte"],
        correctAnswer: 2,
      },
      {
        statement: "Quanto é 2 + 2?",
        options: ["3", "4", "5"],
        correctAnswer: 1,
      },
    ],
  }

  return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Importar Prova</h1>
            <p className="text-gray-600 mt-2">Importe uma prova através de arquivo JSON</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload de Arquivo</CardTitle>
                  <CardDescription>Selecione um arquivo JSON ou cole o conteúdo abaixo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="file">Arquivo JSON</Label>
                    <Input id="file" type="file" accept=".json" onChange={handleFileUpload} />
                  </div>

                  <div className="text-center text-gray-500">ou</div>

                  <div>
                    <Label htmlFor="json">Cole o JSON aqui</Label>
                    <Textarea
                        id="json"
                        placeholder="Cole o conteúdo JSON da prova..."
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                    />
                  </div>

                  <Button onClick={validateAndParseJson} className="w-full" disabled={!jsonInput.trim()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Validar JSON
                  </Button>
                </CardContent>
              </Card>

              {/* Error Alert */}
              {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              {/* Success Alert */}
              {importedExam && !error && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      JSON válido! Prova "{importedExam.title}" com {importedExam.questions.length} questões.
                    </AlertDescription>
                  </Alert>
              )}
            </div>

            {/* Example and Preview */}
            <div className="space-y-6">
              {/* Example JSON */}
              <Card>
                <CardHeader>
                  <CardTitle>Exemplo de Estrutura</CardTitle>
                  <CardDescription>Use esta estrutura como referência para seu JSON</CardDescription>
                </CardHeader>
                <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(exampleJson, null, 2)}
                </pre>
                </CardContent>
              </Card>

              {/* Preview */}
              {importedExam && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Preview da Prova</CardTitle>
                          <CardDescription>Confira os dados antes de importar</CardDescription>
                        </div>
                        <Button onClick={handleImport} disabled={isLoading}>
                          <Upload className="h-4 w-4 mr-2" />
                          {isLoading ? "Importando..." : "Importar"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{importedExam.title}</h3>
                        <p className="text-sm text-gray-600">{importedExam.questions.length} questões</p>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {importedExam.questions.map((question, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start gap-2 mb-2">
                                <Badge variant="outline">{index + 1}</Badge>
                                <p className="text-sm font-medium">{question.statement}</p>
                              </div>
                              <div className="ml-8 space-y-1">
                                {question.options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`text-xs p-1 rounded ${
                                            optIndex === question.correctAnswer ? "bg-green-100 text-green-800" : "text-gray-600"
                                        }`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}) {option}
                                      {optIndex === question.correctAnswer && " ✓"}
                                    </div>
                                ))}
                              </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
  )
}
