/**
 * Recipe Comments API Route
 * GET: list comments (paginated, public)
 * POST: create comment (auth required)
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";

type RouteParams = { params: Promise<{ id: string }> };

const COMMENT_PAGE_SIZE = 10;
const MAX_CONTENT_LENGTH = 1000;

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: recipeId } = await params;
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor") ?? undefined;
        const limit = Math.min(Number(searchParams.get("limit")) || COMMENT_PAGE_SIZE, 50);

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true },
        });

        if (!recipe) {
            return NextResponse.json({ success: false, message: "Resep tidak ditemukan." }, { status: 404 });
        }

        const comments = await prisma.recipeComment.findMany({
            where: { recipeId },
            orderBy: { createdAt: "desc" },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

        const hasMore = comments.length > limit;
        const items = hasMore ? comments.slice(0, limit) : comments;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        const total = await prisma.recipeComment.count({
            where: { recipeId },
        });

        return NextResponse.json({
            success: true,
            data: items.map((c) => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                user: {
                    id: c.user.id,
                    name: c.user.name,
                    image: c.user.image,
                },
            })),
            pagination: {
                nextCursor,
                total,
                hasMore,
            },
        });
    } catch (error) {
        console.error("[RECIPE_COMMENTS_GET]", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil komentar." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Anda harus masuk untuk mengirim komentar." },
                { status: 401 }
            );
        }

        const { id: recipeId } = await params;

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true },
        });

        if (!recipe) {
            return NextResponse.json({ success: false, message: "Resep tidak ditemukan." }, { status: 404 });
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

        const comment = await prisma.recipeComment.create({
            data: {
                recipeId,
                userId: session.user.id,
                content,
            },
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
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                user: {
                    id: comment.user.id,
                    name: comment.user.name,
                    image: comment.user.image,
                },
            },
        });
    } catch (error) {
        console.error("[RECIPE_COMMENTS_POST]", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengirim komentar." },
            { status: 500 }
        );
    }
}
