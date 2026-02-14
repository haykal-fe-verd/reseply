/**
 * User Sessions API Route
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
 * DELETE - Terminate all user sessions
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
            select: { id: true, name: true },
        });

        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        // Delete all sessions for this user
        const result = await prisma.session.deleteMany({
            where: { userId: id },
        });

        return NextResponse.json({
            success: true,
            data: { deletedSessions: result.count },
            message: `${result.count} sesi berhasil diakhiri.`,
        });
    } catch (error) {
        console.error("Error terminating user sessions:", error);
        return NextResponse.json({ success: false, message: "Gagal mengakhiri sesi pengguna." }, { status: 500 });
    }
}
