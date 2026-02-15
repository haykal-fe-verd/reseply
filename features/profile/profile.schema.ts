/**
 * Profile Schemas
 * @date February 15, 2026
 * @author Muhammad Haykal
 */

import { z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE"]);
export type Gender = z.infer<typeof genderEnum>;

export const updateProfileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
    dateOfBirth: z.date().nullable(),
    gender: genderEnum.nullable(),
    weight: z.number().min(1, "Berat badan minimal 1 kg").max(500, "Berat badan maksimal 500 kg").nullable(),
    height: z.number().min(30, "Tinggi badan minimal 30 cm").max(300, "Tinggi badan maksimal 300 cm").nullable(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
