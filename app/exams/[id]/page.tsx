"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight, Flag } from "lucide-react"
import { getExamById, submitExamAttempt } from "@/lib/actions/exam-actions"

interface Question {
  id: string
  statement: string
  options: string[]
  correctAnswer: number
}

interface Exam {
  id: string
  title: string
  Question: Question[]
}

export default function ExamPage() {
  const params = useParams()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [isStarted, setIsStarted] = useState(false)
  const [customTime, setCustomTime] = useState("15")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadExam() {
      try {
        const examData = await getExamById(examId)
        if (examData) {
          setExam(examData)
        } else {
          alert("Prova não encontrada")
          window.location.href = "/dashboard"
        }
      } catch (error) {
        console.error("Erro ao carregar prova:", error)
        alert("Erro ao carregar prova")
        window.location.href = "/dashboard"
      } finally {
        setIsLoading(false)
      }
    }

    loadExam()
  }, [examId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartExam = () => {
    const minutes = Number.parseInt(customTime) || 15
    setTimeLeft(minutes * 60)
    setIsStarted(true)
  }

  const handleAnswerChange = (value: string) => {
    if (!exam) return

    setAnswers({
      ...answers,
      [exam.Question[currentQuestion].id]: Number.parseInt(value),
    })
  }

  const handleNextQuestion = () => {
    if (!exam) return

    if (currentQuestion < exam.Question.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleFinishExam()
    }
  }

  const handleFinishExam = async () => {
    if (!exam || isSubmitting) return

    setIsSubmitting(true)

    try {
      const timeSpent = Number.parseInt(customTime) * 60 - timeLeft
      const result = await submitExamAttempt(exam.id, answers, timeSpent)

      if (result.success) {
        window.location.href = `/exams/${examId}/results`
      }
    } catch (error) {
      console.error("Erro ao finalizar prova:", error)
      alert("Erro ao finalizar prova. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
        <DashboardLayout>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DashboardLayout>
    )
  }

  if (!exam) {
    return (
        <DashboardLayout>
          <div className="max-w-2xl mx-auto text-center">
            <p>Prova não encontrada</p>
          </div>
        </DashboardLayout>
    )
  }

  const progress = ((currentQuestion + 1) / exam.Question.length) * 100
  const currentQ = exam.Question[currentQuestion]
  const currentAnswer = answers[currentQ.id]

  if (!isStarted) {
    return (
        <DashboardLayout>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{exam.title}</CardTitle>
                <CardDescription>Prepare-se para começar a prova</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{exam.Question.length}</div>
                    <div className="text-sm text-gray-600">Questões</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{customTime}</div>
                    <div className="text-sm text-gray-600">Minutos</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <div className="text-sm text-gray-600">Por vez</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="time">Tempo da prova (minutos)</Label>
                    <Input
                        id="time"
                        type="number"
                        min="1"
                        max="180"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-32"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Instruções:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Você terá {customTime} minutos para completar a prova</li>
                      <li>• Cada questão deve ser respondida antes de prosseguir</li>
                      <li>• O timer não pode ser pausado</li>
                      <li>• Suas respostas são salvas automaticamente</li>
                    </ul>
                  </div>

                  <Button onClick={handleStartExam} className="w-full" size="lg">
                    <Clock className="h-5 w-5 mr-2" />
                    Iniciar Prova
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
    )
  }

  return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with timer and progress */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">{exam.title}</h1>
                  <p className="text-sm text-gray-600">
                    Questão {currentQuestion + 1} de {exam.Question.length}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className={`font-mono text-lg ${timeLeft < 300 ? "text-red-600" : "text-gray-900"}`}>
                    {formatTime(timeLeft)}
                  </span>
                  </div>
                  <Button
                      variant="outline"
                      onClick={handleFinishExam}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Finalizando..." : "Finalizar"}
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {currentQuestion + 1}
                </Badge>
                <CardTitle className="text-xl">{currentQ.statement}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={currentAnswer?.toString() || ""} onValueChange={handleAnswerChange}>
                {currentQ.options.map((option, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                        <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
                        {option}
                      </Label>
                    </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-6">
                <div className="text-sm text-gray-500">
                  {Object.keys(answers).length} de {exam.Question.length} questões respondidas
                </div>
                <Button onClick={handleNextQuestion} disabled={currentAnswer === undefined || isSubmitting} size="lg">
                  {currentQuestion === exam.Question.length - 1 ? "Finalizar Prova" : "Próxima Questão"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
  )
}
