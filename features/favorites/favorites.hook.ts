/**
 * Favorites Hooks
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    checkFavorite,
    type FavoritesParams,
    getFavoriteCategories,
    getFavoriteIds,
    getFavorites,
    getFavoritesCount,
    removeAllFavorites,
    toggleFavorite,
} from "@/features/favorites";

export const FAVORITES_QUERY_KEY = "favorites";
export const FAVORITE_IDS_QUERY_KEY = "favorite-ids";
export const FAVORITES_COUNT_QUERY_KEY = "favorites-count";
export const FAVORITE_CATEGORIES_QUERY_KEY = "favorite-categories";

/**
 * Hook to get user's favorite recipes with pagination
 */
export function useFavorites(params: FavoritesParams = {}) {
    return useQuery({
        queryKey: [FAVORITES_QUERY_KEY, params],
        queryFn: () => getFavorites(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to get all favorite recipe IDs for quick lookup
 */
export function useFavoriteIds() {
    return useQuery({
        queryKey: [FAVORITE_IDS_QUERY_KEY],
        queryFn: getFavoriteIds,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to check if a specific recipe is favorited
 */
export function useCheckFavorite(recipeId: string) {
    return useQuery({
        queryKey: [FAVORITES_QUERY_KEY, "check", recipeId],
        queryFn: () => checkFavorite(recipeId),
        enabled: !!recipeId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get favorites count
 */
export function useFavoritesCount() {
    return useQuery({
        queryKey: [FAVORITES_COUNT_QUERY_KEY],
        queryFn: getFavoritesCount,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to get categories from favorite recipes
 */
export function useFavoriteCategories() {
    return useQuery({
        queryKey: [FAVORITE_CATEGORIES_QUERY_KEY],
        queryFn: getFavoriteCategories,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleFavorite,
        onMutate: async (recipeId: string) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: [FAVORITE_IDS_QUERY_KEY] });
            await queryClient.cancelQueries({
                queryKey: [FAVORITES_QUERY_KEY, "check", recipeId],
            });

            // Snapshot previous values
            const previousIds = queryClient.getQueryData<{
                success: boolean;
                favoriteIds: string[];
            }>([FAVORITE_IDS_QUERY_KEY]);
            const previousCheck = queryClient.getQueryData<{
                success: boolean;
                isFavorited: boolean;
            }>([FAVORITES_QUERY_KEY, "check", recipeId]);

            // Optimistically update
            if (previousIds) {
                const isCurrentlyFavorited = previousIds.favoriteIds.includes(recipeId);
                queryClient.setQueryData([FAVORITE_IDS_QUERY_KEY], {
                    ...previousIds,
                    favoriteIds: isCurrentlyFavorited
                        ? previousIds.favoriteIds.filter((id) => id !== recipeId)
                        : [...previousIds.favoriteIds, recipeId],
                });
            }

            if (previousCheck) {
                queryClient.setQueryData([FAVORITES_QUERY_KEY, "check", recipeId], {
                    ...previousCheck,
                    isFavorited: !previousCheck.isFavorited,
                });
            }

            return { previousIds, previousCheck, recipeId };
        },
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        },
        onError: (_error, _recipeId, context) => {
            // Rollback on error
            if (context?.previousIds) {
                queryClient.setQueryData([FAVORITE_IDS_QUERY_KEY], context.previousIds);
            }
            if (context?.previousCheck) {
                queryClient.setQueryData([FAVORITES_QUERY_KEY, "check", context.recipeId], context.previousCheck);
            }
            toast.error("Gagal mengubah status favorit.");
        },
        onSettled: () => {
            // Invalidate queries to refetch
            queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [FAVORITE_IDS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [FAVORITES_COUNT_QUERY_KEY] });
            queryClient.invalidateQueries({
                queryKey: [FAVORITE_CATEGORIES_QUERY_KEY],
            });
        },
    });
}

/**
 * Hook to remove all favorites
 */
export function useRemoveAllFavorites() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeAllFavorites,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [FAVORITE_IDS_QUERY_KEY] });
                queryClient.invalidateQueries({
                    queryKey: [FAVORITES_COUNT_QUERY_KEY],
                });
                queryClient.invalidateQueries({
                    queryKey: [FAVORITE_CATEGORIES_QUERY_KEY],
                });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => {
            toast.error("Gagal menghapus semua favorit.");
        },
    });
}
