/**
 * Category Hooks
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    type CategoryQuerySchema,
    type CreateCategorySchema,
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    type UpdateCategorySchema,
    updateCategory,
} from "@/features/category";

export const CATEGORY_QUERY_KEY = "categories";

/**
 * Hook to get all categories
 */
export function useCategories(params?: Partial<CategoryQuerySchema>) {
    return useQuery({
        queryKey: [CATEGORY_QUERY_KEY, params],
        queryFn: () => getCategories(params),
    });
}

/**
 * Hook to get a single category
 */
export function useCategory(id: string) {
    return useQuery({
        queryKey: [CATEGORY_QUERY_KEY, id],
        queryFn: () => getCategory(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: CreateCategorySchema) => createCategory(values),
        onSuccess: (data) => {
            toast.success(data.message || "Kategori berhasil dibuat.");
            queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat kategori.");
        },
    });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, values }: { id: string; values: UpdateCategorySchema }) => updateCategory(id, values),
        onSuccess: (data) => {
            toast.success(data.message || "Kategori berhasil diperbarui.");
            queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal memperbarui kategori.");
        },
    });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: (data) => {
            toast.success(data.message || "Kategori berhasil dihapus.");
            queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus kategori.");
        },
    });
}
