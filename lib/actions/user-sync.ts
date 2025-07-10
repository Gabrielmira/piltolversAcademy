"use server"

import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function ensureUserExists() {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
        throw new Error("Usuário não autenticado")
    }

    // Primeiro, tenta encontrar o usuário pelo clerkId atual
    let user = await prisma.user.findUnique({
        where: { clerkId },
    })

    // Se não encontrar, busca os dados completos do Clerk e cria o usuário
    if (!user) {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            throw new Error("Não foi possível obter dados do usuário")
        }

        const { nanoid } = await import("nanoid")

        // Pega o email principal do usuário
        const primaryEmail =
            clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            ""

        // Para o nome, usa o que está no Clerk ou um nome padrão
        let fullName = null
        if (clerkUser.firstName && clerkUser.lastName) {
            fullName = `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
        } else if (clerkUser.firstName) {
            fullName = clerkUser.firstName
        } else if (clerkUser.lastName) {
            fullName = clerkUser.lastName
        }

        user = await prisma.user.create({
            data: {
                id: nanoid(),
                clerkId,
                email: primaryEmail,
                name: fullName,
            },
        })

        console.log("✅ Usuário criado no banco:", {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
        })
    } else {
        // Se o usuário já existe, verifica se precisa atualizar os dados
        const clerkUser = await currentUser()

        if (clerkUser) {
            const primaryEmail =
                clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
                clerkUser.emailAddresses[0]?.emailAddress ||
                ""

            let fullName = null
            if (clerkUser.firstName && clerkUser.lastName) {
                fullName = `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
            } else if (clerkUser.firstName) {
                fullName = clerkUser.firstName
            } else if (clerkUser.lastName) {
                fullName = clerkUser.lastName
            }

            // Atualiza se os dados mudaram
            if (user.email !== primaryEmail || user.name !== fullName) {
                user = await prisma.user.update({
                    where: { clerkId },
                    data: {
                        email: primaryEmail,
                        name: fullName,
                    },
                })

                console.log("✅ Dados do usuário atualizados:", {
                    email: user.email,
                    name: user.name,
                })
            }
        }
    }

    return user
}

export async function getUserByClerkId() {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
        throw new Error("Usuário não autenticado")
    }

    // Garante que o usuário existe e está atualizado
    const user = await ensureUserExists()
    return user
}

export async function updateUserProfile(data: { name?: string; email?: string }) {
    const user = await getUserByClerkId()

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
            },
        })

        return { success: true, user: updatedUser }
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error)
        throw new Error("Erro ao atualizar perfil")
    }
}
