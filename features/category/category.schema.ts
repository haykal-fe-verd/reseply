/**
 * Category Zod Schemas
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import { z } from "zod";

// Category Type Enum
export const categoryTypeEnum = z.enum(["DISH", "CUISINE", "DIET"]);

/**
 * Create Category Schema
 */
export const createCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori harus diisi.").max(100, "Nama kategori maksimal 100 karakter."),
    type: categoryTypeEnum.refine((val) => ["DISH", "CUISINE", "DIET"].includes(val), {
        message: "Tipe kategori tidak valid. Pilih: DISH, CUISINE, atau DIET.",
    }),
});

/**
 * Update Category Schema
 */
export const updateCategorySchema = z
    .object({
        name: z
            .string()
            .min(1, "Nama kategori harus diisi.")
            .max(100, "Nama kategori maksimal 100 karakter.")
            .optional(),
        type: categoryTypeEnum.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Tidak ada data yang diperbarui.",
    });

/**
 * Category Query Params Schema
 */
export const categoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    type: categoryTypeEnum.optional(),
    sortBy: z.enum(["name", "slug", "type", "id"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Type exports
export type CategoryType = z.infer<typeof categoryTypeEnum>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type CategoryQuerySchema = z.infer<typeof categoryQuerySchema>;
