/**
 * Users Service
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { BanUserSchema, UpdateUserSchema, UserQuerySchema, UserRole } from "@/features/users";

export interface UserSession {
    id: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    ipAddress: string | null;
    userAgent: string | null;
}

export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    twoFactorEnabled: boolean;
    role: UserRole | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: string | null;
    _count?: {
        sessions: number;
    };
    sessions?: UserSession[];
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface UserResponse {
    success: boolean;
    data: User;
    message?: string;
}

export interface ApiError {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * Get all users with pagination, search, filter, and sort
 */
export async function getUsers(params?: Partial<UserQuerySchema>): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role) searchParams.set("role", params.role);
    if (params?.banned !== undefined) searchParams.set("banned", String(params.banned));
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const response = await fetch(`/api/users?${searchParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengambil data pengguna.");
    }

    return data as UsersResponse;
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string): Promise<UserResponse> {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengambil data pengguna.");
    }

    return data as UserResponse;
}

/**
 * Update user
 */
export async function updateUser(id: string, values: UpdateUserSchema): Promise<UserResponse> {
    const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal memperbarui pengguna.");
    }

    return data as UserResponse;
}

/**
 * Ban user
 */
export async function banUser(id: string, values: BanUserSchema): Promise<UserResponse> {
    const response = await fetch(`/api/users/${id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal memblokir pengguna.");
    }

    return data as UserResponse;
}

/**
 * Unban user
 */
export async function unbanUser(id: string): Promise<UserResponse> {
    const response = await fetch(`/api/users/${id}/unban`, {
        method: "POST",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal membuka blokir pengguna.");
    }

    return data as UserResponse;
}

/**
 * Terminate all user sessions
 */
export async function terminateUserSessions(id: string): Promise<UserResponse> {
    const response = await fetch(`/api/users/${id}/sessions`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengakhiri sesi pengguna.");
    }

    return data as UserResponse;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<UserResponse> {
    const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal menghapus pengguna.");
    }

    return data as UserResponse;
}
