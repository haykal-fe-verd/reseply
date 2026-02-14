/**
 * Home Hooks
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedRecipes } from "@/features/home";

export const FEATURED_RECIPES_QUERY_KEY = "featured-recipes";

/**
 * Hook to get featured recipes for homepage
 */
export function useFeaturedRecipes(limit = 6) {
    return useQuery({
        queryKey: [FEATURED_RECIPES_QUERY_KEY, limit],
        queryFn: () => getFeaturedRecipes(limit),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
