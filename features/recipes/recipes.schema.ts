/**
 * Recipes Zod Schemas
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import { z } from "zod";
import { categoryTypeEnum } from "@/features/category";

/**
 * Ingredient Schema
 */
export const ingredientSchema = z.object({
    name: z.string().min(1, "Nama bahan harus diisi.").max(200, "Nama bahan maksimal 200 karakter."),
    amount: z.string().max(50, "Jumlah maksimal 50 karakter.").optional().nullable(),
    unit: z.string().max(50, "Satuan maksimal 50 karakter.").optional().nullable(),
    order: z.number().int().min(0).optional(),
});

/**
 * Instruction Schema
 */
export const instructionSchema = z.object({
    stepNumber: z.number().int().min(1, "Nomor langkah harus minimal 1."),
    content: z.string().min(1, "Isi langkah harus diisi.").max(2000, "Isi langkah maksimal 2000 karakter."),
});

/**
 * Create Recipe Schema
 */
export const createRecipeSchema = z.object({
    title: z.string().min(1, "Judul resep harus diisi.").max(200, "Judul resep maksimal 200 karakter."),
    description: z.string().max(5000, "Deskripsi maksimal 5000 karakter.").optional().nullable(),
    imageUrl: z.string().url("URL gambar tidak valid.").optional().nullable(),
    prepMinutes: z.number().int().min(0, "Waktu persiapan tidak boleh negatif.").optional().nullable(),
    cookMinutes: z.number().int().min(0, "Waktu masak tidak boleh negatif.").optional().nullable(),
    servings: z.number().int().min(1, "Jumlah porsi minimal 1.").optional().nullable(),
    ingredients: z.array(ingredientSchema).optional(),
    instructions: z.array(instructionSchema).optional(),
    categoryIds: z.array(z.string().min(1, "ID kategori tidak valid.")).optional(),
});

/**
 * Update Recipe Schema
 */
export const updateRecipeSchema = z
    .object({
        title: z.string().min(1, "Judul resep harus diisi.").max(200, "Judul resep maksimal 200 karakter.").optional(),
        description: z.string().max(5000, "Deskripsi maksimal 5000 karakter.").optional().nullable(),
        imageUrl: z.string().url("URL gambar tidak valid.").optional().nullable(),
        prepMinutes: z.number().int().min(0, "Waktu persiapan tidak boleh negatif.").optional().nullable(),
        cookMinutes: z.number().int().min(0, "Waktu masak tidak boleh negatif.").optional().nullable(),
        servings: z.number().int().min(1, "Jumlah porsi minimal 1.").optional().nullable(),
        ingredients: z.array(ingredientSchema).optional(),
        instructions: z.array(instructionSchema).optional(),
        categoryIds: z.array(z.string().min(1, "ID kategori tidak valid.")).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Tidak ada data yang diperbarui.",
    });

/**
 * Recipe Query Params Schema
 */
export const recipeQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    categoryType: categoryTypeEnum.optional(),
    minPrepTime: z.coerce.number().int().min(0).optional(),
    maxPrepTime: z.coerce.number().int().min(0).optional(),
    minCookTime: z.coerce.number().int().min(0).optional(),
    maxCookTime: z.coerce.number().int().min(0).optional(),
    minServings: z.coerce.number().int().min(1).optional(),
    maxServings: z.coerce.number().int().min(1).optional(),
    sortBy: z
        .enum(["title", "slug", "createdAt", "updatedAt", "prepMinutes", "cookMinutes", "servings"])
        .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type IngredientSchema = z.infer<typeof ingredientSchema>;
export type InstructionSchema = z.infer<typeof instructionSchema>;
export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>;
export type RecipeQuerySchema = z.infer<typeof recipeQuerySchema>;
