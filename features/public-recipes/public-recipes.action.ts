/**
 * Public Recipes Actions (Server Actions)
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use server";

import { prisma } from "@/config/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

type CategoryType = "DISH" | "CUISINE" | "DIET";

export interface PublicRecipe {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    servings: number | null;
    createdAt: Date;
    categories: {
        id: string;
        name: string;
        slug: string;
        type: CategoryType;
    }[];
}

export interface PublicRecipesParams {
    cursor?: string;
    limit?: number;
    search?: string;
    categoryId?: string;
    categoryType?: CategoryType;
    sortBy?: "title" | "createdAt" | "prepMinutes" | "cookMinutes";
    sortOrder?: "asc" | "desc";
}

export interface PublicRecipesResponse {
    success: boolean;
    data: PublicRecipe[];
    nextCursor: string | null;
    hasNextPage: boolean;
}

export interface PublicCategoriesResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        slug: string;
        type: CategoryType;
        _count: {
            recipes: number;
        };
    }[];
}

/**
 * Get public recipes with cursor-based pagination (no auth required)
 */
export async function getPublicRecipes(params: PublicRecipesParams = {}): Promise<PublicRecipesResponse> {
    try {
        const {
            cursor,
            limit = 12,
            search,
            categoryId,
            categoryType,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = params;

        // Build where clause
        const where: Prisma.RecipeWhereInput = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (categoryId) {
            where.categories = {
                some: {
                    categoryId: categoryId,
                },
            };
        }

        if (categoryType) {
            where.categories = {
                some: {
                    category: {
                        type: categoryType,
                    },
                },
            };
        }

        // Fetch recipes with cursor pagination
        const recipes = await prisma.recipe.findMany({
            where,
            take: limit + 1, // Take one extra to check if there's a next page
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor,
                },
            }),
            orderBy: [
                { [sortBy]: sortOrder },
                { id: "asc" }, // Secondary sort by id for stable cursor pagination
            ],
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                imageUrl: true,
                prepMinutes: true,
                cookMinutes: true,
                servings: true,
                createdAt: true,
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        });

        // Check if there's a next page
        const hasNextPage = recipes.length > limit;
        const data = hasNextPage ? recipes.slice(0, -1) : recipes;

        // Get next cursor
        const nextCursor = hasNextPage ? (data[data.length - 1]?.id ?? null) : null;

        // Transform data
        const transformedData: PublicRecipe[] = data.map((recipe) => ({
            ...recipe,
            categories: recipe.categories.map((rc) => rc.category),
        }));

        return {
            success: true,
            data: transformedData,
            nextCursor,
            hasNextPage,
        };
    } catch (error) {
        console.error("Error fetching public recipes:", error);
        return {
            success: false,
            data: [],
            nextCursor: null,
            hasNextPage: false,
        };
    }
}

/**
 * Get all categories for filter (no auth required)
 */
export async function getPublicCategories(): Promise<PublicCategoriesResponse> {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                _count: {
                    select: {
                        recipes: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: categories,
        };
    } catch (error) {
        console.error("Error fetching public categories:", error);
        return {
            success: false,
            data: [],
        };
    }
}

export interface RecipeDetailIngredient {
    id: string;
    name: string;
    amount: string | null;
    unit: string | null;
    order: number;
}

export interface RecipeDetailInstruction {
    id: string;
    stepNumber: number;
    content: string;
}

export interface RecipeDetail {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    servings: number | null;
    createdAt: Date;
    updatedAt: Date;
    ingredients: RecipeDetailIngredient[];
    instructions: RecipeDetailInstruction[];
    categories: {
        id: string;
        name: string;
        slug: string;
        type: CategoryType;
    }[];
}

export interface RecipeDetailResponse {
    success: boolean;
    data: RecipeDetail | null;
    error?: string;
}

/**
 * Get recipe detail by slug (no auth required)
 */
export async function getRecipeBySlug(slug: string): Promise<RecipeDetailResponse> {
    try {
        const recipe = await prisma.recipe.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                imageUrl: true,
                prepMinutes: true,
                cookMinutes: true,
                servings: true,
                createdAt: true,
                updatedAt: true,
                ingredients: {
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        unit: true,
                        order: true,
                    },
                },
                instructions: {
                    orderBy: { stepNumber: "asc" },
                    select: {
                        id: true,
                        stepNumber: true,
                        content: true,
                    },
                },
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        });

        if (!recipe) {
            return {
                success: false,
                data: null,
                error: "Recipe not found",
            };
        }

        const transformedData: RecipeDetail = {
            ...recipe,
            categories: recipe.categories.map((rc) => rc.category),
        };

        return {
            success: true,
            data: transformedData,
        };
    } catch (error) {
        console.error("Error fetching recipe detail:", error);
        return {
            success: false,
            data: null,
            error: "Failed to fetch recipe",
        };
    }
}

export interface RecommendedRecipesResponse {
    success: boolean;
    data: PublicRecipe[];
}

/**
 * Get recommended recipes based on category (no auth required)
 */
export async function getRecommendedRecipes(
    recipeId: string,
    categoryIds: string[],
    limit = 8,
): Promise<RecommendedRecipesResponse> {
    try {
        const recipes = await prisma.recipe.findMany({
            where: {
                id: { not: recipeId },
                categories: {
                    some: {
                        categoryId: { in: categoryIds },
                    },
                },
            },
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                imageUrl: true,
                prepMinutes: true,
                cookMinutes: true,
                servings: true,
                createdAt: true,
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        });

        const transformedData: PublicRecipe[] = recipes.map((recipe) => ({
            ...recipe,
            categories: recipe.categories.map((rc) => rc.category),
        }));

        return {
            success: true,
            data: transformedData,
        };
    } catch (error) {
        console.error("Error fetching recommended recipes:", error);
        return {
            success: false,
            data: [],
        };
    }
}
