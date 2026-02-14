/**
 * Categories API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { categoryQuerySchema, createCategorySchema } from "@/features/category";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * GET - List all categories with pagination, filter, search, and sort
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (search by name)
 * - type: CategoryType (filter by type: DISH, CUISINE, DIET)
 * - sortBy: string (default: "name")
 * - sortOrder: "asc" | "desc" (default: "asc")
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse and validate query params with Zod
        const queryResult = categoryQuerySchema.safeParse({
            page: searchParams.get("page") || undefined,
            limit: searchParams.get("limit") || undefined,
            search: searchParams.get("search") || undefined,
            type: searchParams.get("type") || undefined,
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

        const { page, limit, search, type, sortBy, sortOrder } = queryResult.data;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.CategoryWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
            ];
        }

        if (type) {
            where.type = type;
        }

        // Execute queries
        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { recipes: true },
                    },
                },
            }),
            prisma.category.count({ where }),
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage,
            },
        });
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat mengambil data kategori.",
            },
            { status: 500 },
        );
    }
}

/**
 * POST - Create a new category (Admin only)
 * Body: { name: string, type: CategoryType }
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Anda harus login untuk mengakses fitur ini.",
                },
                { status: 401 },
            );
        }

        // Check admin role
        const role = (session.user as { role?: string }).role;
        if (role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Anda tidak memiliki izin untuk mengakses fitur ini.",
                },
                { status: 403 },
            );
        }

        const body = await request.json();

        // Validate with Zod
        const validationResult = createCategorySchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || "Data tidak valid.";
            return NextResponse.json(
                {
                    success: false,
                    message: firstError,
                    errors,
                },
                { status: 400 },
            );
        }

        const { name, type } = validationResult.data;

        // Generate slug from name
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        // Check if slug already exists
        const existingCategory = await prisma.category.findUnique({
            where: { slug },
        });

        if (existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Kategori dengan nama yang sama sudah ada.",
                },
                { status: 409 },
            );
        }

        // Create category
        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                slug,
                type,
            },
        });

        return NextResponse.json(
            { success: true, message: "Kategori berhasil dibuat.", data: category },
            { status: 201 },
        );
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan saat membuat kategori." },
            { status: 500 },
        );
    }
}
