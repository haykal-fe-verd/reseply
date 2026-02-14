/**
 * User API Route (Single User)
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import { del } from "@vercel/blob";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { updateUserSchema } from "@/features/users/users.schema";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET - Get a single user by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
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

        const user = await prisma.user.findUnique({
            where: { id },
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
                sessions: {
                    select: {
                        id: true,
                        token: true,
                        expiresAt: true,
                        createdAt: true,
                        ipAddress: true,
                        userAgent: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ success: false, message: "Gagal mengambil data pengguna." }, { status: 500 });
    }
}

/**
 * PATCH - Update user
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
        const validationResult = updateUserSchema.safeParse(body);
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

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        // Prevent self-demotion
        if (id === session.user.id && validationResult.data.role && validationResult.data.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Tidak dapat mengubah role diri sendiri." },
                { status: 400 },
            );
        }

        // Update user
        const user = await prisma.user.update({
            where: { id },
            data: validationResult.data,
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
            message: "Pengguna berhasil diperbarui.",
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ success: false, message: "Gagal memperbarui pengguna." }, { status: 500 });
    }
}

/**
 * DELETE - Delete user and their avatar from Vercel Blob
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

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json(
                { success: false, message: "Tidak dapat menghapus akun diri sendiri." },
                { status: 400 },
            );
        }

        // Check if user exists and get their image
        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true, image: true },
        });

        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        // Delete avatar from Vercel Blob if exists
        if (existingUser.image?.includes("vercel-storage")) {
            try {
                await del(existingUser.image);
            } catch (blobError) {
                console.error("Failed to delete avatar from Vercel Blob:", blobError);
                // Continue with user deletion even if blob deletion fails
            }
        }

        // Delete user (cascade will delete sessions, accounts, etc.)
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            data: { id },
            message: "Pengguna berhasil dihapus.",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ success: false, message: "Gagal menghapus pengguna." }, { status: 500 });
    }
}
