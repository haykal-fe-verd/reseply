/**
 * Comment by ID API Route
 * PATCH: update comment (author only)
 * DELETE: delete comment (author or admin)
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";

type RouteParams = { params: Promise<{ id: string }> };

const MAX_CONTENT_LENGTH = 1000;

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Anda harus masuk untuk mengedit komentar." },
                { status: 401 }
            );
        }

        const { id: commentId } = await params;

        const comment = await prisma.recipeComment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true, content: true },
        });

        if (!comment) {
            return NextResponse.json({ success: false, message: "Komentar tidak ditemukan." }, { status: 404 });
        }

        if (comment.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, message: "Anda hanya dapat mengedit komentar sendiri." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (!content) {
            return NextResponse.json(
                { success: false, message: "Komentar tidak boleh kosong." },
                { status: 400 }
            );
        }

        if (content.length > MAX_CONTENT_LENGTH) {
            return NextResponse.json(
                { success: false, message: `Komentar maksimal ${MAX_CONTENT_LENGTH} karakter.` },
                { status: 400 }
            );
        }

        const updated = await prisma.recipeComment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updated.id,
                content: updated.content,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
                user: {
                    id: updated.user.id,
                    name: updated.user.name,
                    image: updated.user.image,
                },
            },
        });
    } catch (error) {
        console.error("[COMMENT_PATCH]", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengedit komentar." },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Anda harus masuk untuk menghapus komentar." },
                { status: 401 }
            );
        }

        const { id: commentId } = await params;
        const role = (session.user as { role?: string }).role;

        const comment = await prisma.recipeComment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true },
        });

        if (!comment) {
            return NextResponse.json({ success: false, message: "Komentar tidak ditemukan." }, { status: 404 });
        }

        const isAuthor = comment.userId === session.user.id;
        const isAdmin = role === "admin";

        if (!isAuthor && !isAdmin) {
            return NextResponse.json(
                { success: false, message: "Anda tidak memiliki akses untuk menghapus komentar ini." },
                { status: 403 }
            );
        }

        await prisma.recipeComment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({
            success: true,
            message: "Komentar berhasil dihapus.",
        });
    } catch (error) {
        console.error("[COMMENT_DELETE]", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghapus komentar." },
            { status: 500 }
        );
    }
}
