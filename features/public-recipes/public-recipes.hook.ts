/**
 * Public Recipes Hooks
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
    getPublicCategories,
    getPublicRecipes,
    getRecipeBySlug,
    getRecommendedRecipes,
    type PublicRecipesParams,
} from "@/features/public-recipes";

export const PUBLIC_RECIPES_QUERY_KEY = "public-recipes";
export const PUBLIC_CATEGORIES_QUERY_KEY = "public-categories";
export const RECIPE_DETAIL_QUERY_KEY = "recipe-detail";
export const RECOMMENDED_RECIPES_QUERY_KEY = "recommended-recipes";

/**
 * Hook to get public recipes with infinite scroll
 */
export function usePublicRecipes(params: Omit<PublicRecipesParams, "cursor"> = {}) {
    return useInfiniteQuery({
        queryKey: [PUBLIC_RECIPES_QUERY_KEY, params],
        queryFn: async ({ pageParam }) => {
            const result = await getPublicRecipes({
                ...params,
                cursor: pageParam,
            });
            return result;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasNextPage && lastPage.nextCursor) {
                return lastPage.nextCursor;
            }
            return undefined;
        },
        initialPageParam: undefined as string | undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get public categories for filter
 */
export function usePublicCategories() {
    return useQuery({
        queryKey: [PUBLIC_CATEGORIES_QUERY_KEY],
        queryFn: async () => {
            const result = await getPublicCategories();
            return result;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook to get recipe detail by slug
 */
export function useRecipeDetail(slug: string) {
    return useQuery({
        queryKey: [RECIPE_DETAIL_QUERY_KEY, slug],
        queryFn: async () => {
            const result = await getRecipeBySlug(slug);
            return result;
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get recommended recipes
 */
export function useRecommendedRecipes(recipeId: string, categoryIds: string[], limit = 8) {
    return useQuery({
        queryKey: [RECOMMENDED_RECIPES_QUERY_KEY, recipeId, categoryIds],
        queryFn: async () => {
            const result = await getRecommendedRecipes(recipeId, categoryIds, limit);
            return result;
        },
        enabled: !!recipeId && categoryIds.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
