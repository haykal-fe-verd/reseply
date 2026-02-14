/**
 * Recipe Service
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { CreateRecipeSchema, RecipeQuerySchema, UpdateRecipeSchema } from "@/features/recipes";

export interface Ingredient {
    id: string;
    name: string;
    amount: string | null;
    unit: string | null;
    order: number;
}

export interface Instruction {
    id: string;
    stepNumber: number;
    content: string;
}

export interface RecipeCategory {
    categoryId: string;
    category: {
        id: string;
        name: string;
        slug: string;
        type: "DISH" | "CUISINE" | "DIET";
    };
}

export interface Recipe {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    servings: number | null;
    createdAt: string;
    updatedAt: string;
    ingredients?: Ingredient[];
    instructions?: Instruction[];
    categories?: RecipeCategory[];
    _count?: {
        ingredients: number;
        instructions: number;
    };
}

export interface RecipesResponse {
    success: boolean;
    data: Recipe[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface RecipeResponse {
    success: boolean;
    data: Recipe;
    message?: string;
}

export interface ApiError {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * Get all recipes with pagination, search, filter, and sort
 */
export async function getRecipes(params?: Partial<RecipeQuerySchema>): Promise<RecipesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params?.categoryType) searchParams.set("categoryType", params.categoryType);
    if (params?.minPrepTime !== undefined) searchParams.set("minPrepTime", String(params.minPrepTime));
    if (params?.maxPrepTime !== undefined) searchParams.set("maxPrepTime", String(params.maxPrepTime));
    if (params?.minCookTime !== undefined) searchParams.set("minCookTime", String(params.minCookTime));
    if (params?.maxCookTime !== undefined) searchParams.set("maxCookTime", String(params.maxCookTime));
    if (params?.minServings !== undefined) searchParams.set("minServings", String(params.minServings));
    if (params?.maxServings !== undefined) searchParams.set("maxServings", String(params.maxServings));
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const response = await fetch(`/api/recipes?${searchParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengambil data resep.");
    }

    return data as RecipesResponse;
}

/**
 * Get a single recipe by ID
 */
export async function getRecipe(id: string): Promise<RecipeResponse> {
    const response = await fetch(`/api/recipes/${id}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal mengambil data resep.");
    }

    return data as RecipeResponse;
}

/**
 * Create a new recipe
 */
export async function createRecipe(values: CreateRecipeSchema): Promise<RecipeResponse> {
    const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal membuat resep.");
    }

    return data as RecipeResponse;
}

/**
 * Update a recipe
 */
export async function updateRecipe(id: string, values: UpdateRecipeSchema): Promise<RecipeResponse> {
    const response = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal memperbarui resep.");
    }

    return data as RecipeResponse;
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).message || "Gagal menghapus resep.");
    }

    return data as { success: boolean; message: string };
}
