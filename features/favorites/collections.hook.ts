/**
 * Collections (Koleksi) Hooks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    addRecipeToCollection,
    createCollection,
    deleteCollection,
    getCollectionBySlug,
    getCollectionsContainingRecipe,
    getMyCollections,
    removeRecipeFromCollection,
    updateCollection,
    updateCollectionsOrder,
} from "./collections.action";

export const COLLECTIONS_QUERY_KEY = "collections";
export const COLLECTION_BY_SLUG_QUERY_KEY = "collection-by-slug";
export const COLLECTIONS_FOR_RECIPE_QUERY_KEY = "collections-for-recipe";

export function useMyCollections() {
    return useQuery({
        queryKey: [COLLECTIONS_QUERY_KEY],
        queryFn: getMyCollections,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCollectionBySlug(slug: string) {
    return useQuery({
        queryKey: [COLLECTION_BY_SLUG_QUERY_KEY, slug],
        queryFn: () => getCollectionBySlug(slug),
        enabled: !!slug,
        staleTime: 1000 * 60,
    });
}

export function useCollectionsContainingRecipe(recipeId: string) {
    return useQuery({
        queryKey: [COLLECTIONS_FOR_RECIPE_QUERY_KEY, recipeId],
        queryFn: () => getCollectionsContainingRecipe(recipeId),
        enabled: !!recipeId,
        staleTime: 1000 * 60,
    });
}

export function useCreateCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCollection,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => toast.error("Gagal membuat koleksi."),
    });
}

export function useUpdateCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ collectionId, name }: { collectionId: string; name: string }) =>
            updateCollection(collectionId, name),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
                if (data.data?.slug) {
                    queryClient.invalidateQueries({
                        queryKey: [COLLECTION_BY_SLUG_QUERY_KEY, data.data.slug],
                    });
                }
            } else {
                toast.error(data.message);
            }
        },
        onError: () => toast.error("Gagal memperbarui koleksi."),
    });
}

export function useUpdateCollectionsOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCollectionsOrder,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => toast.error("Gagal memperbarui urutan koleksi."),
    });
}

export function useDeleteCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCollection,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => toast.error("Gagal menghapus koleksi."),
    });
}

export function useAddRecipeToCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ collectionId, recipeId }: { collectionId: string; recipeId: string }) =>
            addRecipeToCollection(collectionId, recipeId),
        onSuccess: (data, variables) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
                queryClient.invalidateQueries({
                    queryKey: [COLLECTIONS_FOR_RECIPE_QUERY_KEY, variables.recipeId],
                });
                // Invalidate collection detail by refetching any slug that might be open
                queryClient.invalidateQueries({ queryKey: [COLLECTION_BY_SLUG_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => toast.error("Gagal menambahkan resep ke koleksi."),
    });
}

export function useRemoveRecipeFromCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ collectionId, recipeId }: { collectionId: string; recipeId: string }) =>
            removeRecipeFromCollection(collectionId, recipeId),
        onSuccess: (data, variables) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] });
                queryClient.invalidateQueries({
                    queryKey: [COLLECTIONS_FOR_RECIPE_QUERY_KEY, variables.recipeId],
                });
                queryClient.invalidateQueries({ queryKey: [COLLECTION_BY_SLUG_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => toast.error("Gagal menghapus resep dari koleksi."),
    });
}
