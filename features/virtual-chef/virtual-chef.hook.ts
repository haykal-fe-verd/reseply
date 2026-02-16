/**
 * Virtual Chef Chat Hooks
 * @date February 16, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    deleteConversation,
    getConversation,
    getConversations,
    getConversationsCount,
    saveConversation,
    updateConversationTitle,
} from "./virtual-chef.action";

export const CONVERSATIONS_QUERY_KEY = "virtual-chef-conversations";
export const CONVERSATION_QUERY_KEY = "virtual-chef-conversation";
export const CONVERSATIONS_COUNT_QUERY_KEY = "virtual-chef-conversations-count";

/**
 * Hook to get user's conversations with pagination
 */
export function useConversations(params: { page?: number; limit?: number; search?: string } = {}) {
    return useQuery({
        queryKey: [CONVERSATIONS_QUERY_KEY, params],
        queryFn: () => getConversations(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to get a single conversation
 */
export function useConversation(conversationId: string | null) {
    return useQuery({
        queryKey: [CONVERSATION_QUERY_KEY, conversationId],
        queryFn: () => getConversation(conversationId as string),
        enabled: !!conversationId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to get conversations count
 */
export function useConversationsCount() {
    return useQuery({
        queryKey: [CONVERSATIONS_COUNT_QUERY_KEY],
        queryFn: getConversationsCount,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook to save a conversation
 */
export function useSaveConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveConversation,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_COUNT_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => {
            toast.error("Gagal menyimpan percakapan.");
        },
    });
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteConversation,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_COUNT_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => {
            toast.error("Gagal menghapus percakapan.");
        },
    });
}

/**
 * Hook to update conversation title
 */
export function useUpdateConversationTitle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
            updateConversationTitle(conversationId, title),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY] });
            } else {
                toast.error(data.message);
            }
        },
        onError: () => {
            toast.error("Gagal memperbarui judul percakapan.");
        },
    });
}
