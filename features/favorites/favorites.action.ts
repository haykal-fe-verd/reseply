/**
 * Favorites Server Actions
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use server";

import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

type CategoryType = "DISH" | "CUISINE" | "DIET";

export interface FavoriteRecipe {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    servings: number | null;
    createdAt: Date;
    favoritedAt: Date;
    categories: {
        id: string;
        name: string;
        slug: string;
        type: CategoryType;
    }[];
}

export interface FavoritesParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    categoryType?: CategoryType;
    sortBy?: "title" | "favoritedAt" | "prepMinutes" | "cookMinutes";
    sortOrder?: "asc" | "desc";
}

export interface FavoritesResponse {
    success: boolean;
    data: FavoriteRecipe[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface ToggleFavoriteResponse {
    success: boolean;
    isFavorited: boolean;
    message: string;
}

export interface CheckFavoriteResponse {
    success: boolean;
    isFavorited: boolean;
}

export interface FavoriteIdsResponse {
    success: boolean;
    favoriteIds: string[];
}

/**
 * Toggle favorite status for a recipe
 */
export async function toggleFavorite(recipeId: string): Promise<ToggleFavoriteResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                isFavorited: false,
                message: "Anda harus masuk terlebih dahulu untuk menyimpan resep favorit.",
            };
        }

        const userId = session.user.id;

        // Check if favorite exists
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_recipeId: {
                    userId,
                    recipeId,
                },
            },
        });

        if (existingFavorite) {
            // Remove favorite
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });

            return {
                success: true,
                isFavorited: false,
                message: "Resep dihapus dari favorit.",
            };
        }

        // Add favorite
        await prisma.favorite.create({
            data: {
                userId,
                recipeId,
            },
        });

        return {
            success: true,
            isFavorited: true,
            message: "Resep ditambahkan ke favorit.",
        };
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return {
            success: false,
            isFavorited: false,
            message: "Gagal mengubah status favorit.",
        };
    }
}

/**
 * Check if a recipe is favorited by the current user
 */
export async function checkFavorite(recipeId: string): Promise<CheckFavoriteResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: true,
                isFavorited: false,
            };
        }

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_recipeId: {
                    userId: session.user.id,
                    recipeId,
                },
            },
        });

        return {
            success: true,
            isFavorited: !!favorite,
        };
    } catch (error) {
        console.error("Error checking favorite:", error);
        return {
            success: false,
            isFavorited: false,
        };
    }
}

/**
 * Get all favorite recipe IDs for the current user
 */
export async function getFavoriteIds(): Promise<FavoriteIdsResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: true,
                favoriteIds: [],
            };
        }

        const favorites = await prisma.favorite.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                recipeId: true,
            },
        });

        return {
            success: true,
            favoriteIds: favorites.map((f) => f.recipeId),
        };
    } catch (error) {
        console.error("Error getting favorite IDs:", error);
        return {
            success: false,
            favoriteIds: [],
        };
    }
}

/**
 * Get user's favorite recipes with pagination
 */
export async function getFavorites(params: FavoritesParams = {}): Promise<FavoritesResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                data: [],
                pagination: {
                    page: 1,
                    limit: 12,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            };
        }

        const {
            page = 1,
            limit = 12,
            search,
            categoryId,
            categoryType,
            sortBy = "favoritedAt",
            sortOrder = "desc",
        } = params;

        const skip = (page - 1) * limit;

        // Build where clause for recipes
        const recipeWhere: Prisma.RecipeWhereInput = {};

        if (search) {
            recipeWhere.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (categoryId) {
            recipeWhere.categories = {
                some: {
                    categoryId: categoryId,
                },
            };
        }

        if (categoryType) {
            recipeWhere.categories = {
                some: {
                    category: {
                        type: categoryType,
                    },
                },
            };
        }

        // Build orderBy based on sortBy
        let favoriteOrderBy: Prisma.FavoriteOrderByWithRelationInput = {};

        if (sortBy === "favoritedAt") {
            favoriteOrderBy = { createdAt: sortOrder };
        } else if (sortBy === "title") {
            favoriteOrderBy = { recipe: { title: sortOrder } };
        } else if (sortBy === "prepMinutes") {
            favoriteOrderBy = { recipe: { prepMinutes: sortOrder } };
        } else if (sortBy === "cookMinutes") {
            favoriteOrderBy = { recipe: { cookMinutes: sortOrder } };
        }

        // Base where clause for favorites
        const favoriteWhere: Prisma.FavoriteWhereInput = {
            userId: session.user.id,
            recipe: recipeWhere,
        };

        // Get total count
        const total = await prisma.favorite.count({
            where: favoriteWhere,
        });

        // Get favorites with recipes
        const favorites = await prisma.favorite.findMany({
            where: favoriteWhere,
            orderBy: favoriteOrderBy,
            skip,
            take: limit,
            include: {
                recipe: {
                    include: {
                        categories: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        const totalPages = Math.ceil(total / limit);

        const data: FavoriteRecipe[] = favorites.map((favorite) => ({
            id: favorite.recipe.id,
            title: favorite.recipe.title,
            slug: favorite.recipe.slug,
            description: favorite.recipe.description,
            imageUrl: favorite.recipe.imageUrl,
            prepMinutes: favorite.recipe.prepMinutes,
            cookMinutes: favorite.recipe.cookMinutes,
            servings: favorite.recipe.servings,
            createdAt: favorite.recipe.createdAt,
            favoritedAt: favorite.createdAt,
            categories: favorite.recipe.categories.map((rc) => ({
                id: rc.category.id,
                name: rc.category.name,
                slug: rc.category.slug,
                type: rc.category.type as CategoryType,
            })),
        }));

        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error("Error getting favorites:", error);
        return {
            success: false,
            data: [],
            pagination: {
                page: 1,
                limit: 12,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            },
        };
    }
}

/**
 * Get categories that have favorites
 */
export async function getFavoriteCategories() {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                data: [],
            };
        }

        // Get all categories from user's favorite recipes
        const categories = await prisma.category.findMany({
            where: {
                recipes: {
                    some: {
                        recipe: {
                            favorites: {
                                some: {
                                    userId: session.user.id,
                                },
                            },
                        },
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        recipes: {
                            where: {
                                recipe: {
                                    favorites: {
                                        some: {
                                            userId: session.user.id,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return {
            success: true,
            data: categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                type: cat.type as CategoryType,
                _count: {
                    recipes: cat._count.recipes,
                },
            })),
        };
    } catch (error) {
        console.error("Error getting favorite categories:", error);
        return {
            success: false,
            data: [],
        };
    }
}

/**
 * Remove all favorites (bulk delete)
 */
export async function removeAllFavorites(): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Anda harus masuk terlebih dahulu.",
            };
        }

        await prisma.favorite.deleteMany({
            where: {
                userId: session.user.id,
            },
        });

        return {
            success: true,
            message: "Semua favorit berhasil dihapus.",
        };
    } catch (error) {
        console.error("Error removing all favorites:", error);
        return {
            success: false,
            message: "Gagal menghapus semua favorit.",
        };
    }
}

/**
 * Get favorites count for current user
 */
export async function getFavoritesCount(): Promise<{
    success: boolean;
    count: number;
}> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: true,
                count: 0,
            };
        }

        const count = await prisma.favorite.count({
            where: {
                userId: session.user.id,
            },
        });

        return {
            success: true,
            count,
        };
    } catch (error) {
        console.error("Error getting favorites count:", error);
        return {
            success: false,
            count: 0,
        };
    }
}
