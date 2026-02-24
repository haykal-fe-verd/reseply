/**
 * Home Actions (Server Actions)
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use server";

import { prisma } from "@/config/prisma";

export interface FeaturedRecipe {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    servings: number | null;
    likeCount: number;
    category: string | null;
}

export interface FeaturedRecipesResponse {
    success: boolean;
    data: FeaturedRecipe[];
}

/**
 * Get featured/popular recipes for homepage (most liked first, no auth required)
 */
export async function getFeaturedRecipes(limit = 6): Promise<FeaturedRecipesResponse> {
    try {
        const recipes = await prisma.recipe.findMany({
            take: limit,
            orderBy: {
                likes: { _count: "desc" },
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
                _count: {
                    select: { likes: true },
                },
                categories: {
                    take: 1,
                    select: {
                        category: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedRecipes: FeaturedRecipe[] = recipes.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            slug: recipe.slug,
            description: recipe.description,
            imageUrl: recipe.imageUrl,
            prepMinutes: recipe.prepMinutes,
            cookMinutes: recipe.cookMinutes,
            servings: recipe.servings,
            likeCount: recipe._count.likes,
            category: recipe.categories[0]?.category.name ?? null,
        }));

        return {
            success: true,
            data: formattedRecipes,
        };
    } catch (error) {
        console.error("Error fetching featured recipes:", error);
        return {
            success: false,
            data: [],
        };
    }
}
