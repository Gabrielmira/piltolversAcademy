"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save } from "lucide-react"
import { createExam } from "@/lib/actions/exam-actions"

interface Question {
  id: string
  statement: string
  options: string[]
  correctAnswer: number
}

export default function NewExamPage() {
  const [examTitle, setExamTitle] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      statement: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
        questions.map((q) =>
            q.id === questionId ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) } : q,
        ),
    )
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, options: [...q.options, ""] } : q)))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
        questions.map((q) =>
            q.id === questionId
                ? {
                  ...q,
                  options: q.options.filter((_, idx) => idx !== optionIndex),
                  correctAnswer: q.correctAnswer > optionIndex ? q.correctAnswer - 1 : q.correctAnswer,
                }
                : q,
        ),
    )
  }

  const handleSave = async () => {
    if (!examTitle.trim()) {
      alert("Por favor, insira um título para a prova")
      return
    }

    if (questions.length === 0) {
      alert("Adicione pelo menos uma questão")
      return
    }

    // Validar questões
    for (const question of questions) {
      if (!question.statement.trim()) {
        alert("Todas as questões devem ter um enunciado")
        return
      }
      if (question.options.some((opt) => !opt.trim())) {
        alert("Todas as alternativas devem ser preenchidas")
        return
      }
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", examTitle)
      formData.append(
          "questions",
          JSON.stringify(
              questions.map((q) => ({
                statement: q.statement,
                options: q.options,
                correctAnswer: q.correctAnswer,
              })),
          ),
      )

      const result = await createExam(formData)

      if (result.success) {
        alert("Prova criada com sucesso!")
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Erro ao criar prova:", error)
      alert("Erro ao criar prova. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Prova</h1>
              <p className="text-gray-600 mt-2">Crie uma nova prova adicionando questões manualmente</p>
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Prova"}
            </Button>
          </div>

          {/* Exam Title */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Prova</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Prova</Label>
                  <Input
                      id="title"
                      placeholder="Ex: Matemática - Álgebra Linear"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Questões</h2>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Questão
              </Button>
            </div>

            {questions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">Nenhuma questão adicionada ainda</p>
                    <Button onClick={addQuestion} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Questão
                    </Button>
                  </CardContent>
                </Card>
            ) : (
                questions.map((question, questionIndex) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Questão {questionIndex + 1}</CardTitle>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Question Statement */}
                        <div>
                          <Label>Enunciado</Label>
                          <Textarea
                              placeholder="Digite o enunciado da questão..."
                              value={question.statement}
                              onChange={(e) => updateQuestion(question.id, "statement", e.target.value)}
                              rows={3}
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Alternativas</Label>
                            <Button variant="outline" size="sm" onClick={() => addOption(question.id)}>
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <Badge variant="outline" className="min-w-[32px] justify-center">
                                    {String.fromCharCode(65 + optionIndex)}
                                  </Badge>
                                  <Input
                                      placeholder={`Alternativa ${String.fromCharCode(65 + optionIndex)}`}
                                      value={option}
                                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                      className="flex-1"
                                  />
                                  {question.options.length > 2 && (
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeOption(question.id, optionIndex)}
                                          className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                  )}
                                </div>
                            ))}
                          </div>
                        </div>

                        {/* Correct Answer */}
                        <div>
                          <Label>Resposta Correta</Label>
                          <Select
                              value={question.correctAnswer.toString()}
                              onValueChange={(value) => updateQuestion(question.id, "correctAnswer", Number.parseInt(value))}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options.map((_, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    Alternativa {String.fromCharCode(65 + index)}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                ))
            )}
          </div>
        </div>
      </DashboardLayout>
  )
}
