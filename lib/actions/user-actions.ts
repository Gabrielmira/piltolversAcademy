"use server"

import { prisma } from "@/lib/prisma"
import { getUserByClerkId } from "./user-sync"

export async function getUserStats() {
    try {
        const user = await getUserByClerkId()

        const attempts = await prisma.attempt.findMany({
            where: { userId: user.id }, // Usa o ID interno
            include: {
                Answer: true,
            },
        })

        const totalExams = attempts.length
        const correctAnswers = attempts.reduce(
            (sum, attempt) => sum + attempt.Answer.filter((answer) => answer.isCorrect).length,
            0,
        )
        const wrongAnswers = attempts.reduce(
            (sum, attempt) => sum + attempt.Answer.filter((answer) => !answer.isCorrect).length,
            0,
        )
        const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0)
        const averageTimeSeconds = totalExams > 0 ? Math.round(totalTime / totalExams) : 0

        const avgMins = Math.floor(averageTimeSeconds / 60)
        const avgSecs = averageTimeSeconds % 60
        const averageTime = `${avgMins}m ${avgSecs}s`

        return {
            totalExams,
            correctAnswers,
            wrongAnswers,
            averageTime,
        }
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
        return {
            totalExams: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            averageTime: "0m 0s",
        }
    }
}

export async function getUserExamHistory() {
    try {
        const user = await getUserByClerkId()

        const attempts = await prisma.attempt.findMany({
            where: { userId: user.id }, // Usa o ID interno
            include: {
                Exam: {
                    include: {
                        Question: true,
                    },
                },
                Answer: true,
            },
            orderBy: {
                completedAt: "desc",
            },
        })

        return attempts.map((attempt) => ({
            id: attempt.Exam.id,
            attemptId: attempt.id,
            title: attempt.Exam.title,
            completedAt: attempt.completedAt.toISOString(),
            score: attempt.score,
            totalQuestions: attempt.Exam.Question.length,
            correctAnswers: attempt.Answer.filter((a) => a.isCorrect).length,
            timeSpent: attempt.timeSpent,
            status: "completed",
        }))
    } catch (error) {
        console.error("Erro ao buscar histórico:", error)
        return []
    }
}

export async function getExamResults(examId: string, attemptId?: string) {
    try {
        const user = await getUserByClerkId()

        // Get the most recent attempt if no attemptId provided
        const attempt = await prisma.attempt.findFirst({
            where: {
                userId: user.id, // Usa o ID interno
                examId,
                ...(attemptId && { id: attemptId }),
            },
            include: {
                Exam: {
                    include: {
                        Question: true,
                    },
                },
                Answer: {
                    include: {
                        Question: true,
                    },
                },
            },
            orderBy: {
                completedAt: "desc",
            },
        })

        if (!attempt) {
            throw new Error("Tentativa não encontrada")
        }

        const results = {
            examId: attempt.examId,
            attemptId: attempt.id,
            examTitle: attempt.Exam.title,
            totalQuestions: attempt.Exam.Question.length,
            correctAnswers: attempt.Answer.filter((a) => a.isCorrect).length,
            wrongAnswers: attempt.Answer.filter((a) => !a.isCorrect).length,
            timeSpent: attempt.timeSpent,
            score: attempt.score,
            questions: attempt.Answer.map((answer) => ({
                id: answer.Question.id,
                statement: answer.Question.statement,
                options: answer.Question.options,
                correctAnswer: answer.Question.correctAnswer,
                userAnswer: answer.selected,
                isCorrect: answer.isCorrect,
            })),
        }

        return results
    } catch (error) {
        console.error("Erro ao buscar resultados:", error)
        throw new Error("Erro ao buscar resultados")
    }
}
