/**
 * Recipe Engagement Hooks (Likes & Comments)
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const RECIPE_LIKES_QUERY_KEY = "recipe-likes";
export const RECIPE_COMMENTS_QUERY_KEY = "recipe-comments";

export interface RecipeLikeData {
    likeCount: number;
    userLiked: boolean;
}

export interface RecipeCommentUser {
    id: string;
    name: string;
    image: string | null;
}

export interface RecipeCommentItem {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: RecipeCommentUser;
}

export interface RecipeCommentsResponse {
    success: boolean;
    data: RecipeCommentItem[];
    pagination: {
        nextCursor: string | null;
        total: number;
        hasMore: boolean;
    };
}

async function fetchRecipeLikes(recipeId: string): Promise<{ success: boolean; data: RecipeLikeData }> {
    const res = await fetch(`/api/recipes/${recipeId}/likes`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal mengambil like");
    return json;
}

async function toggleRecipeLike(recipeId: string): Promise<{
    success: boolean;
    data: { liked: boolean; likeCount: number };
    message: string;
}> {
    const res = await fetch(`/api/recipes/${recipeId}/likes`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal mengubah like");
    return json;
}

async function fetchRecipeComments(
    recipeId: string,
    cursor?: string | null
): Promise<RecipeCommentsResponse> {
    const url = new URL(`/api/recipes/${recipeId}/comments`, window.location.origin);
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString());
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal mengambil komentar");
    return json;
}

async function createRecipeComment(
    recipeId: string,
    content: string
): Promise<{ success: boolean; data: RecipeCommentItem }> {
    const res = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal mengirim komentar");
    return json;
}

async function updateComment(
    commentId: string,
    content: string
): Promise<{ success: boolean; data: RecipeCommentItem }> {
    const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal mengedit komentar");
    return json;
}

async function deleteComment(commentId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal menghapus komentar");
    return json;
}

export function useRecipeLikes(recipeId: string) {
    return useQuery({
        queryKey: [RECIPE_LIKES_QUERY_KEY, recipeId],
        queryFn: () => fetchRecipeLikes(recipeId),
        enabled: !!recipeId,
    });
}

export function useToggleLike(recipeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => toggleRecipeLike(recipeId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: [RECIPE_LIKES_QUERY_KEY, recipeId] });
            const prev = queryClient.getQueryData<{ success: boolean; data: RecipeLikeData }>([
                RECIPE_LIKES_QUERY_KEY,
                recipeId,
            ]);
            if (prev?.data) {
                queryClient.setQueryData([RECIPE_LIKES_QUERY_KEY, recipeId], {
                    ...prev,
                    data: {
                        likeCount: prev.data.userLiked ? prev.data.likeCount - 1 : prev.data.likeCount + 1,
                        userLiked: !prev.data.userLiked,
                    },
                });
            }
            return { prev };
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.setQueryData([RECIPE_LIKES_QUERY_KEY, recipeId], {
                    success: true,
                    data: { likeCount: data.data.likeCount, userLiked: data.data.liked },
                });
                toast.success(data.message);
            }
        },
        onError: (err, _v, context) => {
            if (context?.prev) {
                queryClient.setQueryData([RECIPE_LIKES_QUERY_KEY, recipeId], context.prev);
            }
            toast.error(err instanceof Error ? err.message : "Gagal mengubah like");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [RECIPE_LIKES_QUERY_KEY, recipeId] });
        },
    });
}

export function useRecipeComments(recipeId: string) {
    return useInfiniteQuery({
        queryKey: [RECIPE_COMMENTS_QUERY_KEY, recipeId],
        queryFn: ({ pageParam }) => fetchRecipeComments(recipeId, pageParam),
        getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
        enabled: !!recipeId,
    });
}

export function useCreateComment(recipeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (content: string) => createRecipeComment(recipeId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [RECIPE_COMMENTS_QUERY_KEY, recipeId] });
            toast.success("Komentar berhasil dikirim.");
        },
        onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Gagal mengirim komentar");
        },
    });
}

export function useUpdateComment(recipeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
            updateComment(commentId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [RECIPE_COMMENTS_QUERY_KEY, recipeId] });
            toast.success("Komentar berhasil diperbarui.");
        },
        onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Gagal mengedit komentar");
        },
    });
}

export function useDeleteComment(recipeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [RECIPE_COMMENTS_QUERY_KEY, recipeId] });
            toast.success("Komentar berhasil dihapus.");
        },
        onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Gagal menghapus komentar");
        },
    });
}
