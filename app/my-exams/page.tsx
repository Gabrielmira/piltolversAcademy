"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, Search, Eye, RotateCcw, Calendar } from "lucide-react"
import { getUserStats, getUserExamHistory } from "@/lib/actions/user-actions"

interface ExamHistoryItem {
  id: string
  attemptId: string
  title: string
  completedAt: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  status: string
}

interface Stats {
  totalExams: number
  correctAnswers: number
  wrongAnswers: number
  averageTime: string
}

export default function MyExamsPage() {
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([])
  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    averageTime: "0m 0s",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [filterBy, setFilterBy] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [userStats, history] = await Promise.all([getUserStats(), getUserExamHistory()])

        setStats(userStats)
        setExamHistory(history)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const filteredAndSortedExams = examHistory
      .filter((exam) => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter =
            filterBy === "all" ||
            (filterBy === "high" && exam.score >= 80) ||
            (filterBy === "medium" && exam.score >= 60 && exam.score < 80) ||
            (filterBy === "low" && exam.score < 60)
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          case "score":
            return b.score - a.score
          case "title":
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })

  const handleViewResults = (examId: string) => {
    window.location.href = `/exams/${examId}/results`
  }

  const handleRetakeExam = (examId: string) => {
    window.location.href = `/exams/${examId}`
  }

  // Calculate additional stats
  const averageScore =
      examHistory.length > 0 ? Math.round(examHistory.reduce((sum, exam) => sum + exam.score, 0) / examHistory.length) : 0
  const highScoreExams = examHistory.filter((exam) => exam.score >= 80).length
  const totalTimeSpent = examHistory.reduce((sum, exam) => sum + exam.timeSpent, 0)

  if (isLoading) {
    return (
        <DashboardLayout>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Provas</h1>
            <p className="text-gray-600 mt-2">Histórico completo das suas provas realizadas</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Provas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Média Geral</p>
                    <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
                  </div>
                  <Badge className="h-8 w-8 rounded-full flex items-center justify-center">{averageScore}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notas Altas</p>
                    <p className="text-2xl font-bold text-green-600">{highScoreExams}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                    <p className="text-2xl font-bold text-purple-600">{formatTime(totalTimeSpent)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Provas</CardTitle>
              <CardDescription>Visualize e gerencie todas as suas provas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por título da prova..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                  </div>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data (mais recente)</SelectItem>
                    <SelectItem value="score">Pontuação (maior)</SelectItem>
                    <SelectItem value="title">Título (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as provas</SelectItem>
                    <SelectItem value="high">Notas altas (80%+)</SelectItem>
                    <SelectItem value="medium">Notas médias (60-79%)</SelectItem>
                    <SelectItem value="low">Notas baixas (&lt;60%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exam History Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prova</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Pontuação</TableHead>
                      <TableHead>Acertos</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedExams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {examHistory.length === 0 ? "Nenhuma prova realizada ainda" : "Nenhuma prova encontrada"}
                          </TableCell>
                        </TableRow>
                    ) : (
                        filteredAndSortedExams.map((exam) => (
                            <TableRow key={exam.attemptId}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{exam.title}</div>
                                  <div className="text-sm text-gray-500">{exam.totalQuestions} questões</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{formatDate(exam.completedAt)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getScoreBadgeVariant(exam.score)}>{exam.score}%</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-medium">{exam.correctAnswers}</span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-gray-600">{exam.totalQuestions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{formatTime(exam.timeSpent)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleViewResults(exam.id)}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Ver
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleRetakeExam(exam.id)}>
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Refazer
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
  )
}
