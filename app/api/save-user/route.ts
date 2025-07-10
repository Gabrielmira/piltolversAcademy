import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma"
import {nanoid} from "nanoid";

export async function POST(req: Request) {
    const body = await req.json()
    const prisma = new PrismaClient()
    const { clerkId, email, name } = body

    const id = nanoid()


    try {
        const existingUser = await prisma.user.findUnique({
            where: { clerkId },
        })

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    id,
                    clerkId,
                    email,
                    name,
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Erro ao salvar usuário:", err)
        return NextResponse.json({ success: false, error: "Erro ao salvar usuário" }, { status: 500 })
    }
}
