/**
 * Unban User API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST - Unban a user
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
    try {
        // Check admin
        const session = await getSession();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Akses ditolak. Hanya admin yang dapat mengakses." },
                { status: 403 },
            );
        }

        const { id } = await params;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        if (!existingUser.banned) {
            return NextResponse.json({ success: false, message: "Pengguna tidak sedang diblokir." }, { status: 400 });
        }

        // Unban user
        const user = await prisma.user.update({
            where: { id },
            data: {
                banned: false,
                banReason: null,
                banExpires: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                twoFactorEnabled: true,
                role: true,
                banned: true,
                banReason: true,
                banExpires: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: user,
            message: "Blokir pengguna berhasil dibuka.",
        });
    } catch (error) {
        console.error("Error unbanning user:", error);
        return NextResponse.json({ success: false, message: "Gagal membuka blokir pengguna." }, { status: 500 });
    }
}
