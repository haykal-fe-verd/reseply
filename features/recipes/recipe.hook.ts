/**
 * Recipe Hooks
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    type CreateRecipeSchema,
    createRecipe,
    deleteRecipe,
    getRecipe,
    getRecipes,
    type RecipeQuerySchema,
    type UpdateRecipeSchema,
    updateRecipe,
} from "@/features/recipes";

export const RECIPE_QUERY_KEY = "recipes";

/**
 * Hook to get all recipes
 */
export function useRecipes(params?: Partial<RecipeQuerySchema>) {
    return useQuery({
        queryKey: [RECIPE_QUERY_KEY, params],
        queryFn: () => getRecipes(params),
    });
}

/**
 * Hook to get a single recipe
 */
export function useRecipe(id: string) {
    return useQuery({
        queryKey: [RECIPE_QUERY_KEY, id],
        queryFn: () => getRecipe(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a recipe
 */
export function useCreateRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: CreateRecipeSchema) => createRecipe(values),
        onSuccess: (data) => {
            toast.success(data.message || "Resep berhasil dibuat.");
            queryClient.invalidateQueries({ queryKey: [RECIPE_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat resep.");
        },
    });
}

/**
 * Hook to update a recipe
 */
export function useUpdateRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, values }: { id: string; values: UpdateRecipeSchema }) => updateRecipe(id, values),
        onSuccess: (data) => {
            toast.success(data.message || "Resep berhasil diperbarui.");
            queryClient.invalidateQueries({ queryKey: [RECIPE_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal memperbarui resep.");
        },
    });
}

/**
 * Hook to delete a recipe
 */
export function useDeleteRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteRecipe(id),
        onSuccess: (data) => {
            toast.success(data.message || "Resep berhasil dihapus.");
            queryClient.invalidateQueries({ queryKey: [RECIPE_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus resep.");
        },
    });
}
