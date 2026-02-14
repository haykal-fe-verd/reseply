/**
 * Users API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { userQuerySchema } from "@/features/users/users.schema";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * GET - List all users with pagination, filter, search, and sort
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (search by name or email)
 * - role: "user" | "admin" (filter by role)
 * - banned: boolean (filter by banned status)
 * - sortBy: string (default: "createdAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 */
export async function GET(request: NextRequest) {
    try {
        // Check admin
        const session = await getSession();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Akses ditolak. Hanya admin yang dapat mengakses." },
                { status: 403 },
            );
        }

        const { searchParams } = new URL(request.url);

        // Parse and validate query params with Zod
        const queryResult = userQuerySchema.safeParse({
            page: searchParams.get("page") || undefined,
            limit: searchParams.get("limit") || undefined,
            search: searchParams.get("search") || undefined,
            role: searchParams.get("role") || undefined,
            banned: searchParams.get("banned") || undefined,
            sortBy: searchParams.get("sortBy") || undefined,
            sortOrder: searchParams.get("sortOrder") || undefined,
        });

        if (!queryResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Parameter tidak valid.",
                    errors: queryResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { page, limit, search, role, banned, sortBy, sortOrder } = queryResult.data;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (banned !== undefined) {
            where.banned = banned;
        }

        // Count total
        const total = await prisma.user.count({ where });
        const totalPages = Math.ceil(total / limit);

        // Get users
        const users = await prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
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
                _count: {
                    select: { sessions: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ success: false, message: "Gagal mengambil data pengguna." }, { status: 500 });
    }
}
