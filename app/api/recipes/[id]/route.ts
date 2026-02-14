/**
 * Recipe by ID API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { updateRecipeSchema } from "@/features/recipes";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET - Get a single recipe by ID with all related data
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const recipe = await prisma.recipe.findUnique({
            where: { id },
            include: {
                ingredients: { orderBy: { order: "asc" } },
                instructions: { orderBy: { stepNumber: "asc" } },
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!recipe) {
            return NextResponse.json({ success: false, message: "Resep tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: recipe,
        });
    } catch (error) {
        console.error("[RECIPE_GET]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat mengambil data resep.",
            },
            { status: 500 },
        );
    }
}

/**
 * PUT - Update a recipe (Admin only)
 * Body: {
 *   title?: string,
 *   description?: string,
 *   imageUrl?: string,
 *   prepMinutes?: number,
 *   cookMinutes?: number,
 *   servings?: number,
 *   ingredients?: Array<{ id?: string, name: string, amount?: string, unit?: string, order?: number }>,
 *   instructions?: Array<{ id?: string, stepNumber: number, content: string }>,
 *   categoryIds?: string[]
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // Check authentication
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Anda harus login untuk mengakses fitur ini." },
                { status: 401 },
            );
        }

        // Check admin role
        const role = (session.user as { role?: string }).role;
        if (role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Anda tidak memiliki izin untuk mengakses fitur ini." },
                { status: 403 },
            );
        }

        const { id } = await params;

        // Check if recipe exists
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id },
        });

        if (!existingRecipe) {
            return NextResponse.json({ success: false, message: "Resep tidak ditemukan." }, { status: 404 });
        }

        const body = await request.json();

        // Validate with Zod
        const validationResult = updateRecipeSchema.safeParse(body);
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

        const {
            title,
            description,
            imageUrl,
            prepMinutes,
            cookMinutes,
            servings,
            ingredients,
            instructions,
            categoryIds,
        } = validationResult.data;

        // Build update data
        const updateData: {
            title?: string;
            slug?: string;
            description?: string | null;
            imageUrl?: string | null;
            prepMinutes?: number | null;
            cookMinutes?: number | null;
            servings?: number | null;
        } = {};

        if (title !== undefined) {
            // Generate new slug if title changed
            if (title.trim() !== existingRecipe.title) {
                const baseSlug = title
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-");

                let slug = baseSlug;
                let slugCounter = 1;
                while (true) {
                    const existing = await prisma.recipe.findFirst({
                        where: { slug, NOT: { id } },
                    });
                    if (!existing) break;
                    slug = `${baseSlug}-${slugCounter}`;
                    slugCounter++;
                }

                updateData.slug = slug;
            }

            updateData.title = title.trim();
        }

        if (description !== undefined) {
            updateData.description = description?.trim() || null;
        }

        if (imageUrl !== undefined) {
            updateData.imageUrl = imageUrl?.trim() || null;
        }

        if (prepMinutes !== undefined) {
            updateData.prepMinutes = prepMinutes ?? null;
        }

        if (cookMinutes !== undefined) {
            updateData.cookMinutes = cookMinutes ?? null;
        }

        if (servings !== undefined) {
            updateData.servings = servings ?? null;
        }

        // Validate categoryIds if provided
        if (categoryIds !== undefined && categoryIds.length > 0) {
            const existingCategories = await prisma.category.findMany({
                where: { id: { in: categoryIds } },
                select: { id: true },
            });

            if (existingCategories.length !== categoryIds.length) {
                return NextResponse.json(
                    { success: false, message: "Satu atau lebih kategori tidak ditemukan." },
                    { status: 400 },
                );
            }
        }

        // Update recipe using transaction
        const recipe = await prisma.$transaction(async (tx) => {
            // Update basic recipe data
            if (Object.keys(updateData).length > 0) {
                await tx.recipe.update({
                    where: { id },
                    data: updateData,
                });
            }

            // Update ingredients if provided
            if (ingredients !== undefined) {
                // Delete existing ingredients
                await tx.recipeIngredient.deleteMany({
                    where: { recipeId: id },
                });

                // Create new ingredients
                if (ingredients.length > 0) {
                    await tx.recipeIngredient.createMany({
                        data: ingredients.map((ing, index) => ({
                            recipeId: id,
                            name: ing.name.trim(),
                            amount: ing.amount?.trim() || null,
                            unit: ing.unit?.trim() || null,
                            order: ing.order ?? index,
                        })),
                    });
                }
            }

            // Update instructions if provided
            if (instructions !== undefined) {
                // Delete existing instructions
                await tx.recipeInstruction.deleteMany({
                    where: { recipeId: id },
                });

                // Create new instructions
                if (instructions.length > 0) {
                    await tx.recipeInstruction.createMany({
                        data: instructions.map((inst) => ({
                            recipeId: id,
                            stepNumber: inst.stepNumber,
                            content: inst.content.trim(),
                        })),
                    });
                }
            }

            // Update categories if provided
            if (categoryIds !== undefined) {
                // Delete existing category relations
                await tx.recipeCategory.deleteMany({
                    where: { recipeId: id },
                });

                // Create new category relations
                if (categoryIds.length > 0) {
                    await tx.recipeCategory.createMany({
                        data: categoryIds.map((catId) => ({
                            recipeId: id,
                            categoryId: catId,
                        })),
                    });
                }
            }

            // Return updated recipe with all relations
            return tx.recipe.findUnique({
                where: { id },
                include: {
                    ingredients: { orderBy: { order: "asc" } },
                    instructions: { orderBy: { stepNumber: "asc" } },
                    categories: { include: { category: true } },
                },
            });
        });

        return NextResponse.json({
            success: true,
            message: "Resep berhasil diperbarui.",
            data: recipe,
        });
    } catch (error) {
        console.error("[RECIPE_PUT]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat memperbarui resep.",
            },
            { status: 500 },
        );
    }
}

/**
 * PATCH - Partial update a recipe (Admin only)
 * Same as PUT, allows partial updates
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    return PUT(request, { params });
}

/**
 * DELETE - Delete a recipe (Admin only)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        // Check authentication
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Anda harus login untuk mengakses fitur ini." },
                { status: 401 },
            );
        }

        // Check admin role
        const role = (session.user as { role?: string }).role;
        if (role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Anda tidak memiliki izin untuk mengakses fitur ini." },
                { status: 403 },
            );
        }

        const { id } = await params;

        // Check if recipe exists
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id },
        });

        if (!existingRecipe) {
            return NextResponse.json({ success: false, message: "Resep tidak ditemukan." }, { status: 404 });
        }

        // Delete recipe (cascade will delete related ingredients, instructions, categories)
        await prisma.recipe.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Resep berhasil dihapus.",
        });
    } catch (error) {
        console.error("[RECIPE_DELETE]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat menghapus resep.",
            },
            { status: 500 },
        );
    }
}
