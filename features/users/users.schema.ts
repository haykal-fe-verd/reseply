/**
 * Users Zod Schemas
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import { z } from "zod";

/**
 * User Role Enum
 */
export const userRoleEnum = z.enum(["user", "admin"]);

/**
 * Ban User Schema
 */
export const banUserSchema = z.object({
    reason: z.string().min(1, "Alasan ban harus diisi.").max(500, "Alasan ban maksimal 500 karakter."),
    expiresAt: z.string().datetime().optional().nullable(),
});

/**
 * Update User Schema (for changing role)
 */
export const updateUserSchema = z.object({
    name: z.string().min(1, "Nama harus diisi.").max(100, "Nama maksimal 100 karakter.").optional(),
    role: userRoleEnum.optional(),
});

/**
 * User Query Params Schema
 */
export const userQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    role: userRoleEnum.optional(),
    banned: z.coerce.boolean().optional(),
    sortBy: z.enum(["name", "email", "createdAt", "updatedAt", "role"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type UserRole = z.infer<typeof userRoleEnum>;
export type BanUserSchema = z.infer<typeof banUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type UserQuerySchema = z.infer<typeof userQuerySchema>;
