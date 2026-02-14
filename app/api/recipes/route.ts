/**
 * Recipes API Route
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { createRecipeSchema, recipeQuerySchema } from "@/features/recipes";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * GET - List all recipes with pagination, filter, search, and sort
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (search by title or description)
 * - categoryId: string (filter by category ID)
 * - categoryType: CategoryType (filter by category type: DISH, CUISINE, DIET)
 * - minPrepTime: number (filter by minimum prep time in minutes)
 * - maxPrepTime: number (filter by maximum prep time in minutes)
 * - minCookTime: number (filter by minimum cook time in minutes)
 * - maxCookTime: number (filter by maximum cook time in minutes)
 * - minServings: number (filter by minimum servings)
 * - maxServings: number (filter by maximum servings)
 * - sortBy: string (default: "createdAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse and validate query params with Zod
        const queryResult = recipeQuerySchema.safeParse({
            page: searchParams.get("page") || undefined,
            limit: searchParams.get("limit") || undefined,
            search: searchParams.get("search") || undefined,
            categoryId: searchParams.get("categoryId") || undefined,
            categoryType: searchParams.get("categoryType") || undefined,
            minPrepTime: searchParams.get("minPrepTime") || undefined,
            maxPrepTime: searchParams.get("maxPrepTime") || undefined,
            minCookTime: searchParams.get("minCookTime") || undefined,
            maxCookTime: searchParams.get("maxCookTime") || undefined,
            minServings: searchParams.get("minServings") || undefined,
            maxServings: searchParams.get("maxServings") || undefined,
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

        const {
            page,
            limit,
            search,
            categoryId,
            categoryType,
            minPrepTime,
            maxPrepTime,
            minCookTime,
            maxCookTime,
            minServings,
            maxServings,
            sortBy,
            sortOrder,
        } = queryResult.data;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.RecipeWhereInput = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
            ];
        }

        // Category filters
        if (categoryId) {
            where.categories = {
                some: { categoryId },
            };
        }

        if (categoryType) {
            where.categories = {
                ...where.categories,
                some: {
                    ...((where.categories as Prisma.RecipeCategoryListRelationFilter)?.some || {}),
                    category: { type: categoryType },
                },
            };
        }

        // Time and servings filters
        if (minPrepTime !== undefined || maxPrepTime !== undefined) {
            where.prepMinutes = {};
            if (minPrepTime !== undefined) where.prepMinutes.gte = minPrepTime;
            if (maxPrepTime !== undefined) where.prepMinutes.lte = maxPrepTime;
        }

        if (minCookTime !== undefined || maxCookTime !== undefined) {
            where.cookMinutes = {};
            if (minCookTime !== undefined) where.cookMinutes.gte = minCookTime;
            if (maxCookTime !== undefined) where.cookMinutes.lte = maxCookTime;
        }

        if (minServings !== undefined || maxServings !== undefined) {
            where.servings = {};
            if (minServings !== undefined) where.servings.gte = minServings;
            if (maxServings !== undefined) where.servings.lte = maxServings;
        }

        // Execute queries
        const [recipes, total] = await Promise.all([
            prisma.recipe.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    _count: {
                        select: {
                            ingredients: true,
                            instructions: true,
                        },
                    },
                },
            }),
            prisma.recipe.count({ where }),
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            data: recipes,
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
        console.error("[RECIPES_GET]", error);
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
 * POST - Create a new recipe (Admin only)
 * Body: {
 *   title: string,
 *   description?: string,
 *   imageUrl?: string,
 *   prepMinutes?: number,
 *   cookMinutes?: number,
 *   servings?: number,
 *   ingredients?: Array<{ name: string, amount?: string, unit?: string, order?: number }>,
 *   instructions?: Array<{ stepNumber: number, content: string }>,
 *   categoryIds?: string[]
 * }
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json();

        // Validate with Zod
        const validationResult = createRecipeSchema.safeParse(body);
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

        // Generate slug from title
        const baseSlug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        // Check if slug already exists and append number if needed
        let slug = baseSlug;
        let slugCounter = 1;
        while (await prisma.recipe.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${slugCounter}`;
            slugCounter++;
        }

        // Validate categoryIds if provided
        if (categoryIds && categoryIds.length > 0) {
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

        // Create recipe with related data
        const recipe = await prisma.recipe.create({
            data: {
                title: title.trim(),
                slug,
                description: description?.trim() || null,
                imageUrl: imageUrl?.trim() || null,
                prepMinutes: prepMinutes ?? null,
                cookMinutes: cookMinutes ?? null,
                servings: servings ?? null,
                ingredients: ingredients
                    ? {
                          create: ingredients.map((ing, index) => ({
                              name: ing.name.trim(),
                              amount: ing.amount?.trim() || null,
                              unit: ing.unit?.trim() || null,
                              order: ing.order ?? index,
                          })),
                      }
                    : undefined,
                instructions: instructions
                    ? {
                          create: instructions.map((inst) => ({
                              stepNumber: inst.stepNumber,
                              content: inst.content.trim(),
                          })),
                      }
                    : undefined,
                categories: categoryIds
                    ? {
                          create: categoryIds.map((catId) => ({
                              categoryId: catId,
                          })),
                      }
                    : undefined,
            },
            include: {
                ingredients: { orderBy: { order: "asc" } },
                instructions: { orderBy: { stepNumber: "asc" } },
                categories: { include: { category: true } },
            },
        });

        return NextResponse.json({ success: true, message: "Resep berhasil dibuat.", data: recipe }, { status: 201 });
    } catch (error) {
        console.error("[RECIPES_POST]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat membuat resep.",
            },
            { status: 500 },
        );
    }
}
