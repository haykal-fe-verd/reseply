import { z } from "zod";

export const signinSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
});

export const signUpSchema = z
    .object({
        name: z.string().min(3, "Nama harus minimal 3 karakter"),
        email: z.string().email("Email tidak valid"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Kata sandi tidak cocok",
    });

export const twoFactorSchema = z.object({
    code: z.string().min(6, "Kode harus 6 digit."),
    trustDevice: z.boolean(),
});

export const otpSchema = z.object({
    password: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
});

export const twoFactorPasswordSchema = z.object({
    password: z.string().min(1, "Kata sandi wajib"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
        confirmPassword: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Kata sandi tidak cocok",
    });

export type SigninSchema = z.infer<typeof signinSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type TwoFactorSchema = z.infer<typeof twoFactorSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type TwoFactorPasswordSchema = z.infer<typeof twoFactorPasswordSchema>;
