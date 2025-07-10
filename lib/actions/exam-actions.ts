"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserByClerkId } from "./user-sync"

export async function createExam(formData: FormData) {
    // Usa a função que garante que o usuário existe
    const user = await getUserByClerkId()

    const title = formData.get("title") as string
    const questionsData = formData.get("questions") as string

    if (!title || !questionsData) {
        throw new Error("Título e questões são obrigatórios")
    }

    const questions = JSON.parse(questionsData)

    try {
        const exam = await prisma.exam.create({
            data: {
                id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title,
                difficulty: "Médio",
                estimatedTime: questions.length * 2,
                creatorId: user.id, // Usa o ID interno do banco
                Question: {
                    create: questions.map((q: any, index: number) => ({
                        id: `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                        statement: q.statement,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: {
                Question: true,
            },
        })

        revalidatePath("/dashboard")
        return { success: true, examId: exam.id }
    } catch (error) {
        console.error("Erro ao criar prova:", error)
        throw new Error("Erro ao criar prova")
    }
}

export async function importExam(examData: {
    title: string
    questions: Array<{
        statement: string
        options: string[]
        correctAnswer: number
    }>
}) {
    const user = await getUserByClerkId()

    try {
        const exam = await prisma.exam.create({
            data: {
                id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: examData.title,
                difficulty: "Médio",
                estimatedTime: examData.questions.length * 2,
                creatorId: user.id,
                Question: {
                    create: examData.questions.map((q, index) => ({
                        id: `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                        statement: q.statement,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: {
                Question: true,
            },
        })

        revalidatePath("/dashboard")
        return { success: true, examId: exam.id }
    } catch (error) {
        console.error("Erro ao importar prova:", error)
        throw new Error("Erro ao importar prova")
    }
}

export async function getExamById(examId: string) {
    try {
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                Question: true,
                User: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return exam
    } catch (error) {
        console.error("Erro ao buscar prova:", error)
        return null
    }
}

export async function getAvailableExams() {
    const user = await getUserByClerkId()

    try {
        const exams = await prisma.exam.findMany({
            include: {
                Question: true,
                Attempt: {
                    where: {
                        userId: user.id, // Usa o ID interno
                    },
                    select: {
                        id: true,
                        score: true,
                        completedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return exams.map((exam) => ({
            id: exam.id,
            title: exam.title,
            questions: exam.Question.length,
            difficulty: exam.difficulty || "Médio",
            estimatedTime: `${exam.estimatedTime || exam.Question.length * 2} min`,
            completed: exam.Attempt.length > 0,
            lastAttempt: exam.Attempt[0] || null,
        }))
    } catch (error) {
        console.error("Erro ao buscar provas:", error)
        return []
    }
}

export async function submitExamAttempt(examId: string, answers: { [questionId: string]: number }, timeSpent: number) {
    const user = await getUserByClerkId()

    try {
        // Get exam with questions
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: { Question: true },
        })

        if (!exam) {
            throw new Error("Prova não encontrada")
        }

        // Calculate score
        let correctAnswers = 0
        const answerData = []

        for (const question of exam.Question) {
            const userAnswer = answers[question.id]
            const isCorrect = userAnswer === question.correctAnswer

            if (isCorrect) correctAnswers++

            answerData.push({
                id: `answer_${Date.now()}_${question.id}_${Math.random().toString(36).substr(2, 9)}`,
                questionId: question.id,
                selected: userAnswer,
                isCorrect,
            })
        }

        const score = Math.round((correctAnswers / exam.Question.length) * 100)

        // Create attempt with answers
        const attempt = await prisma.attempt.create({
            data: {
                id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id, // Usa o ID interno
                examId,
                score,
                timeSpent,
                Answer: {
                    create: answerData,
                },
            },
            include: {
                Answer: {
                    include: {
                        Question: true,
                    },
                },
            },
        })

        revalidatePath("/dashboard")
        revalidatePath("/my-exams")

        return { success: true, attemptId: attempt.id, score }
    } catch (error) {
        console.error("Erro ao submeter prova:", error)
        throw new Error("Erro ao submeter prova")
    }
}
