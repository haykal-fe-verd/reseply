/**
 * Recipe Likes API Route
 * GET: like count + whether current user liked (optional auth)
 * POST: toggle like (auth required)
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
    try {
        const { id: recipeId } = await params;

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true },
        });

        if (!recipe) {
            return NextResponse.json({ success: false, message: "Resep tidak ditemukan." }, { status: 404 });
        }

        const likeCount = await prisma.recipeLike.count({
            where: { recipeId },
        });

        const session = await getSession();
        let userLiked = false;
        if (session?.user?.id) {
            const like = await prisma.recipeLike.findUnique({
                where: {
                    userId_recipeId: { userId: session.user.id, recipeId },
                },
            });
            userLiked = !!like;
        }

        return NextResponse.json({
            success: true,
            data: { likeCount, userLiked },
        });
    } catch (error) {
        console.error("[RECIPE_LIKES_GET]", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil data like." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Anda harus masuk untuk memberi like." },
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

        const userId = session.user.id;

        const existing = await prisma.recipeLike.findUnique({
            where: {
                userId_recipeId: { userId, recipeId },
            },
        });

        if (existing) {
            await prisma.recipeLike.delete({
                where: { id: existing.id },
            });
            const likeCount = await prisma.recipeLike.count({ where: { recipeId } });
            return NextResponse.json({
                success: true,
                data: { liked: false, likeCount },
                message: "Like dihapus.",
            });
        }

        await prisma.recipeLike.create({
            data: { userId, recipeId },
        });
        const likeCount = await prisma.recipeLike.count({ where: { recipeId } });
        return NextResponse.json({
            success: true,
            data: { liked: true, likeCount },
            message: "Resep disukai.",
        });
    } catch (error) {
        console.error("[RECIPE_LIKES_POST]", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengubah like." },
            { status: 500 }
        );
    }
}
