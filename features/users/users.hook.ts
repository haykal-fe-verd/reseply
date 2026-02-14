/**
 * Users Hooks
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BanUserSchema, UpdateUserSchema, UserQuerySchema } from "./users.schema";
import { banUser, deleteUser, getUser, getUsers, terminateUserSessions, unbanUser, updateUser } from "./users.service";

export const USER_QUERY_KEY = "users";

/**
 * Hook to get all users
 */
export function useUsers(params?: Partial<UserQuerySchema>) {
    return useQuery({
        queryKey: [USER_QUERY_KEY, params],
        queryFn: () => getUsers(params),
    });
}

/**
 * Hook to get a single user
 */
export function useUser(id: string) {
    return useQuery({
        queryKey: [USER_QUERY_KEY, id],
        queryFn: () => getUser(id),
        enabled: !!id,
    });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, values }: { id: string; values: UpdateUserSchema }) => updateUser(id, values),
        onSuccess: (data) => {
            toast.success(data.message || "Pengguna berhasil diperbarui.");
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal memperbarui pengguna.");
        },
    });
}

/**
 * Hook to ban a user
 */
export function useBanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, values }: { id: string; values: BanUserSchema }) => banUser(id, values),
        onSuccess: (data) => {
            toast.success(data.message || "Pengguna berhasil diblokir.");
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal memblokir pengguna.");
        },
    });
}

/**
 * Hook to unban a user
 */
export function useUnbanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => unbanUser(id),
        onSuccess: (data) => {
            toast.success(data.message || "Blokir pengguna berhasil dibuka.");
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuka blokir pengguna.");
        },
    });
}

/**
 * Hook to terminate user sessions
 */
export function useTerminateUserSessions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => terminateUserSessions(id),
        onSuccess: (data) => {
            toast.success(data.message || "Sesi pengguna berhasil diakhiri.");
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal mengakhiri sesi pengguna.");
        },
    });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: (data) => {
            toast.success(data.message || "Pengguna berhasil dihapus.");
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus pengguna.");
        },
    });
}
