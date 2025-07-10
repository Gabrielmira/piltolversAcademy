"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CheckCircle, XCircle, Clock, TrendingUp, Play } from "lucide-react"
import { getUserStats } from "@/lib/actions/user-actions"
import { getAvailableExams as getExams } from "@/lib/actions/exam-actions"

interface Stats {
  totalExams: number
  correctAnswers: number
  wrongAnswers: number
  averageTime: string
}

interface ExamItem {
  id: string
  title: string
  questions: number
  difficulty: string
  estimatedTime: string
  completed: boolean
  lastAttempt?: {
    score: number
    completedAt: string
  } | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    averageTime: "0m 0s",
  })
  const [availableExams, setAvailableExams] = useState<ExamItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [userStats, exams] = await Promise.all([getUserStats(), getExams()])

        const mappedExams = exams.map((exam) => ({
          ...exam,
          lastAttempt: exam.lastAttempt
              ? {
                ...exam.lastAttempt,
                completedAt: new Date(exam.lastAttempt.completedAt).toISOString(), // ou .toLocaleString()
              }
              : null,
        }))

        setStats(userStats)
        setAvailableExams(mappedExams)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleStartExam = (examId: string) => {
    window.location.href = `/exams/${examId}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-100 text-green-800"
      case "Médio":
        return "bg-yellow-100 text-yellow-800"
      case "Difícil":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
        <DashboardLayout>
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
    )
  }

  return (
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Acompanhe seu progresso e acesse suas provas</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Provas Realizadas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalExams}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Total de tentativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acertos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                <p className="text-xs text-muted-foreground">Questões corretas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erros</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.wrongAnswers}</div>
                <p className="text-xs text-muted-foreground">Questões incorretas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageTime}</div>
                <p className="text-xs text-muted-foreground">Por prova realizada</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Exams */}
          <Card>
            <CardHeader>
              <CardTitle>Provas Disponíveis</CardTitle>
              <CardDescription>Selecione uma prova para começar a resolver</CardDescription>
            </CardHeader>
            <CardContent>
              {availableExams.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhuma prova disponível ainda</p>
                    <Button onClick={() => (window.location.href = "/exams/new")}>Criar primeira prova</Button>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {availableExams.map((exam) => (
                        <div
                            key={exam.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                              <Badge className={getDifficultyColor(exam.difficulty)}>{exam.difficulty}</Badge>
                              {exam.completed && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Concluída
                                  </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{exam.questions} questões</span>
                              <span>•</span>
                              <span>{exam.estimatedTime}</span>
                              {exam.lastAttempt && (
                                  <>
                                    <span>•</span>
                                    <span>Última nota: {exam.lastAttempt.score}%</span>
                                  </>
                              )}
                            </div>
                          </div>
                          <Button onClick={() => handleStartExam(exam.id)} className="ml-4">
                            <Play className="h-4 w-4 mr-2" />
                            {exam.completed ? "Refazer" : "Fazer Prova"}
                          </Button>
                        </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
  )
}
