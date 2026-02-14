/**
 * Ban User API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { banUserSchema } from "@/features/users/users.schema";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST - Ban a user
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
        const body = await request.json();

        // Validate body
        const validationResult = banUserSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Data tidak valid.",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        // Prevent self-ban
        if (id === session.user.id) {
            return NextResponse.json(
                { success: false, message: "Tidak dapat memblokir diri sendiri." },
                { status: 400 },
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        // Prevent banning other admins
        if (existingUser.role === "admin") {
            return NextResponse.json({ success: false, message: "Tidak dapat memblokir admin lain." }, { status: 400 });
        }

        const { reason, expiresAt } = validationResult.data;

        // Ban user and delete all their sessions
        const [user] = await prisma.$transaction([
            prisma.user.update({
                where: { id },
                data: {
                    banned: true,
                    banReason: reason,
                    banExpires: expiresAt ? new Date(expiresAt) : null,
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
            }),
            // Terminate all sessions when banning
            prisma.session.deleteMany({
                where: { userId: id },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: user,
            message: "Pengguna berhasil diblokir.",
        });
    } catch (error) {
        console.error("Error banning user:", error);
        return NextResponse.json({ success: false, message: "Gagal memblokir pengguna." }, { status: 500 });
    }
}
