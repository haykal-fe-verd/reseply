/**
 * Category Service
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type {
    CategoryQuerySchema,
    CategoryType,
    CreateCategorySchema,
    UpdateCategorySchema,
} from "@/features/category";

export interface Category {
    id: string;
    name: string;
    slug: string;
    type: CategoryType;
    _count?: {
        recipes: number;
    };
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CategoryResponse {
    success: boolean;
    data: Category;
    message?: string;
}

export interface ApiError {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * Get all categories with pagination, search, filter, and sort
 */
export async function getCategories(params?: Partial<CategoryQuerySchema>): Promise<CategoriesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const response = await fetch(`/api/categories?${searchParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengambil data kategori.");
    }

    return data as CategoriesResponse;
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string): Promise<CategoryResponse> {
    const response = await fetch(`/api/categories/${id}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengambil data kategori.");
    }

    return data as CategoryResponse;
}

/**
 * Create a new category
 */
export async function createCategory(values: CreateCategorySchema): Promise<CategoryResponse> {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal membuat kategori.");
    }

    return data as CategoryResponse;
}

/**
 * Update a category
 */
export async function updateCategory(id: string, values: UpdateCategorySchema): Promise<CategoryResponse> {
    const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal memperbarui kategori.");
    }

    return data as CategoryResponse;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal menghapus kategori.");
    }

    return data as { success: boolean; message: string };
}
