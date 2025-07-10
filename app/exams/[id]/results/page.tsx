"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Target, RotateCcw, Home, Eye } from "lucide-react"
import { getExamResults } from "@/lib/actions/user-actions"

interface ExamResults {
  examId: string
  attemptId: string
  examTitle: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  timeSpent: number
  score: number
  questions: Array<{
    id: string
    statement: string
    options: string[]
    correctAnswer: number
    userAnswer: number
    isCorrect: boolean
  }>
}

export default function ExamResultsPage() {
  const params = useParams()
  const examId = params.id as string
  const [results, setResults] = useState<ExamResults | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadResults() {
      try {
        const resultsData = await getExamResults(examId)
        setResults(resultsData)
      } catch (error) {
        console.error("Erro ao carregar resultados:", error)
        alert("Erro ao carregar resultados")
        window.location.href = "/dashboard"
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [examId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (isLoading) {
    return (
        <DashboardLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DashboardLayout>
    )
  }

  if (!results) {
    return (
        <DashboardLayout>
          <div className="max-w-4xl mx-auto text-center">
            <p>Resultados não encontrados</p>
          </div>
        </DashboardLayout>
    )
  }

  return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Resultado da Prova</h1>
            <p className="text-gray-600 mt-2">{results.examTitle}</p>
          </div>

          {/* Score Overview */}
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(results.score)}`}
                >
                  <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>{results.score}%</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">
                    {results.score >= 80 ? "Excelente!" : results.score >= 60 ? "Bom trabalho!" : "Continue praticando!"}
                  </h2>
                  <p className="text-gray-600">
                    Você acertou {results.correctAnswers} de {results.totalQuestions} questões
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Acertos</p>
                    <p className="text-2xl font-bold text-green-600">{results.correctAnswers}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Erros</p>
                    <p className="text-2xl font-bold text-red-600">{results.wrongAnswers}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tempo Gasto</p>
                    <p className="text-2xl font-bold text-blue-600">{formatTime(results.timeSpent)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aproveitamento</p>
                    <p className={`text-2xl font-bold ${getScoreColor(results.score)}`}>{results.score}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Questão</CardTitle>
              <CardDescription>Visualize seu desempenho em cada questão da prova</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.questions.map((question, index) => (
                    <div key={question.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        {question.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{question.statement}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>
                        Sua resposta:{" "}
                        <strong>
                          {String.fromCharCode(65 + question.userAnswer)}) {question.options[question.userAnswer]}
                        </strong>
                      </span>
                          {!question.isCorrect && (
                              <span className="text-green-600">
                          Correta:{" "}
                                <strong>
                            {String.fromCharCode(65 + question.correctAnswer)}){" "}
                                  {question.options[question.correctAnswer]}
                          </strong>
                        </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={question.isCorrect ? "default" : "destructive"}>
                        {question.isCorrect ? "Correto" : "Incorreto"}
                      </Badge>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => setShowReview(!showReview)}>
              <Eye className="h-4 w-4 mr-2" />
              {showReview ? "Ocultar" : "Revisar"} Questões
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = `/exams/${examId}`)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer Prova
            </Button>
            <Button onClick={() => (window.location.href = "/dashboard")}>
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>

          {/* Question Review */}
          {showReview && (
              <Card>
                <CardHeader>
                  <CardTitle>Revisão Detalhada</CardTitle>
                  <CardDescription>Revise todas as questões e suas respostas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {results.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Badge variant="outline" className="mt-1">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-4">{question.statement}</h3>
                            <div className="space-y-3">
                              {question.options.map((option, optIndex) => {
                                const isUserAnswer = optIndex === question.userAnswer
                                const isCorrectAnswer = optIndex === question.correctAnswer

                                let bgColor = ""
                                if (isCorrectAnswer) bgColor = "bg-green-100 border-green-300"
                                else if (isUserAnswer && !isCorrectAnswer) bgColor = "bg-red-100 border-red-300"
                                else bgColor = "bg-gray-50 border-gray-200"

                                return (
                                    <div key={optIndex} className={`p-3 border rounded-lg ${bgColor} transition-colors`}>
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium">{String.fromCharCode(65 + optIndex)})</span>
                                        <span className="flex-1">{option}</span>
                                        <div className="flex items-center gap-2">
                                          {isUserAnswer && (
                                              <Badge variant="outline" className="text-xs">
                                                Sua resposta
                                              </Badge>
                                          )}
                                          {isCorrectAnswer && <Badge className="text-xs bg-green-600">Correta</Badge>}
                                        </div>
                                      </div>
                                    </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="mt-1">
                            {question.isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
          )}
        </div>
      </DashboardLayout>
  )
}
