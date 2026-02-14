/**
 * Category by ID API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { updateCategorySchema } from "@/features/category";
import type { CategoryType } from "@/lib/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET - Get a single category by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { recipes: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("[CATEGORY_GET]", error);
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
 * PUT - Update a category (Admin only)
 * Body: { name?: string, type?: CategoryType }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

        const { id } = await params;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });
        }

        const body = await request.json();

        // Validate with Zod
        const validationResult = updateCategorySchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;
            const formErrors = validationResult.error.flatten().formErrors;
            const firstError = formErrors[0] || Object.values(errors).flat()[0] || "Data tidak valid.";
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

        // Build update data
        const updateData: { name?: string; slug?: string; type?: CategoryType } = {};

        if (name !== undefined) {
            const newSlug = name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");

            // Check if slug already exists (but not for current category)
            const slugExists = await prisma.category.findFirst({
                where: {
                    slug: newSlug,
                    NOT: { id },
                },
            });

            if (slugExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Kategori dengan nama yang sama sudah ada.",
                    },
                    { status: 409 },
                );
            }

            updateData.name = name.trim();
            updateData.slug = newSlug;
        }

        if (type !== undefined) {
            updateData.type = type;
        }

        // Update category
        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: "Kategori berhasil diperbarui.",
            data: category,
        });
    } catch (error) {
        console.error("[CATEGORY_PUT]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat memperbarui kategori.",
            },
            { status: 500 },
        );
    }
}

/**
 * PATCH - Partial update a category (Admin only)
 * Same as PUT, allows partial updates
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    return PUT(request, { params });
}

/**
 * DELETE - Delete a category (Admin only)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

        const { id } = await params;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { recipes: true },
                },
            },
        });

        if (!existingCategory) {
            return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });
        }

        // Optional: Check if category is being used by recipes
        if (existingCategory._count.recipes > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${existingCategory._count.recipes} resep.`,
                },
                { status: 400 },
            );
        }

        // Delete category
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Kategori berhasil dihapus.",
        });
    } catch (error) {
        console.error("[CATEGORY_DELETE]", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan saat menghapus kategori." },
            { status: 500 },
        );
    }
}
