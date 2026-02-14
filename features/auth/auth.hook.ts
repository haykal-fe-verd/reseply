"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
    type ForgotPasswordSchema,
    type ResetPasswordSchema,
    requestPasswordReset,
    resetPassword as resetPasswordService,
    type SigninSchema,
    type SignUpSchema,
    sendTwoFactorOtp,
    signInWithEmail,
    signInWithOAuth,
    signUpWithEmail,
    type TwoFactorSchema,
    verifyTwoFactorTotp,
} from "@/features/auth";
import {
    addPasskey,
    deletePasskey,
    disableTwoFactor,
    enableTwoFactor,
    listUserPasskeys,
    signInWithPasskey,
    updatePasskey,
    verifyTwoFactorOtp,
} from "./auth.service";

type OAuthProvider = "google" | "discord";

const OAUTH_FALLBACK_MESSAGES: Record<OAuthProvider, { signin: string; signup: string }> = {
    google: {
        signin: "Gagal masuk dengan Google. Silakan coba lagi.",
        signup: "Gagal daftar dengan Google. Silakan coba lagi.",
    },
    discord: {
        signin: "Gagal masuk dengan Discord. Silakan coba lagi.",
        signup: "Gagal daftar dengan Discord. Silakan coba lagi.",
    },
};

function createOAuthHandler(
    provider: OAuthProvider,
    context: "signin" | "signup",
    callbackURL?: string,
): () => Promise<void> {
    return async () => {
        try {
            const { error } = await signInWithOAuth(provider, callbackURL);
            if (error) {
                toast.error(error.message);
            }
        } catch {
            toast.error(OAUTH_FALLBACK_MESSAGES[provider][context]);
        }
    };
}

interface UseSignInOptions {
    redirectTo?: string;
}

interface UseSignInReturn {
    signIn: (values: SigninSchema) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithDiscord: () => Promise<void>;
}

export function useSignIn(options: UseSignInOptions = {}): UseSignInReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const redirectTo = options.redirectTo ?? "/";

    const signIn = React.useCallback(
        async (values: SigninSchema) => {
            try {
                const { data, error } = await signInWithEmail(values);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
                    router.push("/two-factor");
                    return;
                }
                // Invalidate favorites cache after login for fresh data
                queryClient.invalidateQueries({ queryKey: ["favorites"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
                queryClient.invalidateQueries({ queryKey: ["favorites-count"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-categories"] });
                toast.success("Berhasil masuk.");
                router.push(redirectTo);
            } catch {
                toast.error("Terjadi kesalahan saat masuk. Silakan coba lagi.");
            }
        },
        [router, redirectTo, queryClient],
    );

    const signInWithGoogle = React.useMemo(() => createOAuthHandler("google", "signin", redirectTo), [redirectTo]);
    const signInWithDiscord = React.useMemo(() => createOAuthHandler("discord", "signin", redirectTo), [redirectTo]);

    return { signIn, signInWithGoogle, signInWithDiscord };
}

interface UseSignUpOptions {
    redirectTo?: string;
}

interface UseSignUpReturn {
    signUp: (values: SignUpSchema) => Promise<void>;
    signUpWithGoogle: () => Promise<void>;
    signUpWithDiscord: () => Promise<void>;
}

export function useSignUp(options: UseSignUpOptions = {}): UseSignUpReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const redirectTo = options.redirectTo ?? "/";

    const signUp = React.useCallback(
        async (values: SignUpSchema) => {
            try {
                const { error } = await signUpWithEmail(values);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                // Invalidate favorites cache after signup for fresh state
                queryClient.invalidateQueries({ queryKey: ["favorites"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
                queryClient.invalidateQueries({ queryKey: ["favorites-count"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-categories"] });
                toast.success("Akun berhasil dibuat.");
                router.push(redirectTo);
            } catch {
                toast.error("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
            }
        },
        [router, redirectTo, queryClient],
    );

    const signUpWithGoogle = React.useMemo(() => createOAuthHandler("google", "signup", redirectTo), [redirectTo]);
    const signUpWithDiscord = React.useMemo(() => createOAuthHandler("discord", "signup", redirectTo), [redirectTo]);

    return { signUp, signUpWithGoogle, signUpWithDiscord };
}

const RESEND_COOLDOWN_SECONDS = 60;

interface UseForgotPasswordOptions {
    redirectTo?: string;
}

interface UseForgotPasswordReturn {
    requestReset: (values: ForgotPasswordSchema) => Promise<void>;
    resend: () => Promise<void>;
    isSubmitting: boolean;
    lastEmail: string | null;
    resendCooldownSeconds: number;
    canResend: boolean;
}

export function useForgotPassword(options: UseForgotPasswordOptions = {}): UseForgotPasswordReturn {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [lastSentAt, setLastSentAt] = React.useState<number | null>(null);
    const [lastEmail, setLastEmail] = React.useState<string | null>(null);
    const [resendCooldownSeconds, setResendCooldownSeconds] = React.useState(0);

    const redirectTo =
        options.redirectTo ??
        (typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "/reset-password");

    React.useEffect(() => {
        const sentAt = lastSentAt;
        if (sentAt === null) return;

        const updateCooldown = () => {
            const elapsed = Math.floor((Date.now() - sentAt) / 1000);
            const remaining = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);
            setResendCooldownSeconds(remaining);
            if (remaining <= 0) return true;
            return false;
        };

        updateCooldown();
        const interval = setInterval(() => {
            if (updateCooldown()) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastSentAt]);

    const requestReset = React.useCallback(
        async (values: ForgotPasswordSchema) => {
            setIsSubmitting(true);
            try {
                const { error } = await requestPasswordReset(values, { redirectTo });
                if (error) {
                    toast.error(error.message);
                    return;
                }
                setLastSentAt(Date.now());
                setLastEmail(values.email);
                toast.success("Jika email terdaftar, Anda akan menerima link reset di inbox.");
            } catch {
                toast.error("Terjadi kesalahan. Silakan coba lagi.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [redirectTo],
    );

    const resend = React.useCallback(async () => {
        if (!lastEmail || resendCooldownSeconds > 0) return;
        setIsSubmitting(true);
        try {
            const { error } = await requestPasswordReset({ email: lastEmail }, { redirectTo });
            if (error) {
                toast.error(error.message);
                return;
            }
            setLastSentAt(Date.now());
            toast.success("Email reset kata sandi telah dikirim ulang.");
        } catch {
            toast.error("Gagal mengirim ulang. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    }, [lastEmail, redirectTo, resendCooldownSeconds]);

    return {
        requestReset,
        resend,
        isSubmitting,
        lastEmail,
        resendCooldownSeconds,
        canResend: resendCooldownSeconds === 0,
    };
}

interface UseResetPasswordOptions {
    /** Redirect after successful reset. Default: "/sign-in" */
    redirectTo?: string;
}

interface UseResetPasswordReturn {
    resetPassword: (values: ResetPasswordSchema) => Promise<void>;
    isSubmitting: boolean;
}

export function useResetPassword(token: string | null, options: UseResetPasswordOptions = {}): UseResetPasswordReturn {
    const router = useRouter();
    const redirectTo = options.redirectTo ?? "/sign-in";
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const resetPassword = React.useCallback(
        async (values: ResetPasswordSchema) => {
            if (!token) {
                toast.error("Link reset tidak valid.");
                return;
            }
            setIsSubmitting(true);
            try {
                const { error } = await resetPasswordService(values, token);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                toast.success("Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.");
                router.push(redirectTo);
            } catch {
                toast.error("Terjadi kesalahan. Silakan coba lagi.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [token, router, redirectTo],
    );

    return { resetPassword, isSubmitting };
}

const TWO_FACTOR_EMAIL_COOLDOWN_SECONDS = 60;

interface UseTwoFactorOptions {
    redirectTo?: string;
}

interface UseTwoFactorReturn {
    verifyCode: (values: TwoFactorSchema) => Promise<void>;
    sendEmailCode: () => Promise<void>;
    isSubmitting: boolean;
    sendEmailCooldownSeconds: number;
    canSendEmail: boolean;
}

export function useTwoFactor(options: UseTwoFactorOptions = {}): UseTwoFactorReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const redirectTo = options.redirectTo ?? "/";
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [lastSentAt, setLastSentAt] = React.useState<number | null>(null);
    const [sendEmailCooldownSeconds, setSendEmailCooldownSeconds] = React.useState(0);
    /** True setelah user berhasil minta kode lewat email → verifikasi pakai verifyOtp, bukan verifyTotp */
    const [usedEmailOtp, setUsedEmailOtp] = React.useState(false);

    React.useEffect(() => {
        const sentAt = lastSentAt;
        if (sentAt === null) return;

        const update = () => {
            const elapsed = Math.floor((Date.now() - sentAt) / 1000);
            const remaining = Math.max(0, TWO_FACTOR_EMAIL_COOLDOWN_SECONDS - elapsed);
            setSendEmailCooldownSeconds(remaining);
            return remaining <= 0;
        };

        update();
        const interval = setInterval(() => {
            if (update()) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastSentAt]);

    const verifyCode = React.useCallback(
        async (values: TwoFactorSchema) => {
            setIsSubmitting(true);
            try {
                const verify = usedEmailOtp ? verifyTwoFactorOtp : verifyTwoFactorTotp;
                const { error } = await verify(values);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                // Invalidate favorites cache after 2FA verification for fresh data
                queryClient.invalidateQueries({ queryKey: ["favorites"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
                queryClient.invalidateQueries({ queryKey: ["favorites-count"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-categories"] });
                toast.success("Verifikasi berhasil. Selamat datang!");
                router.push(redirectTo);
            } catch {
                toast.error("Kode tidak valid atau kedaluwarsa. Silakan coba lagi.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [router, redirectTo, usedEmailOtp, queryClient],
    );

    const sendEmailCode = React.useCallback(async () => {
        if (sendEmailCooldownSeconds > 0) return;
        setIsSubmitting(true);
        try {
            const { error } = await sendTwoFactorOtp({ trustDevice: true });
            if (error) {
                toast.error(error.message);
                return;
            }
            setLastSentAt(Date.now());
            setUsedEmailOtp(true);
            toast.success("Kode verifikasi telah dikirim ke email Anda.");
        } catch {
            toast.error("Gagal mengirim kode. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    }, [sendEmailCooldownSeconds]);

    return {
        verifyCode,
        sendEmailCode,
        isSubmitting,
        sendEmailCooldownSeconds,
        canSendEmail: sendEmailCooldownSeconds === 0,
    };
}

export interface EnableTwoFactorResult {
    totpURI: string;
    backupCodes: string[];
}

interface UseTwoFactorSettingsReturn {
    enableTwoFactor: (password: string) => Promise<EnableTwoFactorResult | null>;
    disableTwoFactor: (password: string) => Promise<boolean>;
    isEnabling: boolean;
    isDisabling: boolean;
}

export function useTwoFactorSettings(): UseTwoFactorSettingsReturn {
    const [isEnabling, setIsEnabling] = React.useState(false);
    const [isDisabling, setIsDisabling] = React.useState(false);

    const enableTwoFactorHandler = React.useCallback(async (password: string) => {
        setIsEnabling(true);
        try {
            const { data, error } = await enableTwoFactor(password);
            if (error) {
                toast.error(error.message);
                return null;
            }
            if (data?.totpURI && data?.backupCodes) {
                toast.success("Pindai QR code dengan aplikasi autentikator Anda.");
                return { totpURI: data.totpURI, backupCodes: data.backupCodes };
            }
            return null;
        } catch {
            toast.error("Gagal mengaktifkan 2FA. Silakan coba lagi.");
            return null;
        } finally {
            setIsEnabling(false);
        }
    }, []);

    const disableTwoFactorHandler = React.useCallback(async (password: string) => {
        setIsDisabling(true);
        try {
            const { error } = await disableTwoFactor(password);
            if (error) {
                toast.error(error.message);
                return false;
            }
            toast.success("Two-factor authentication telah dinonaktifkan.");
            return true;
        } catch {
            toast.error("Gagal menonaktifkan 2FA. Silakan coba lagi.");
            return false;
        } finally {
            setIsDisabling(false);
        }
    }, []);

    return {
        enableTwoFactor: enableTwoFactorHandler,
        disableTwoFactor: disableTwoFactorHandler,
        isEnabling,
        isDisabling,
    };
}

export interface Passkey {
    id: string;
    name: string;
    createdAt: Date | string;
    deviceType?: string;
    backedUp?: boolean;
}

interface UsePasskeyReturn {
    signInWithPasskey: (options?: { autoFill?: boolean }) => Promise<void>;
    addPasskey: (options?: {
        name?: string;
        authenticatorAttachment?: "platform" | "cross-platform";
    }) => Promise<boolean>;
    listPasskeys: () => Promise<Passkey[] | null>;
    deletePasskey: (id: string) => Promise<boolean>;
    updatePasskey: (id: string, name: string) => Promise<boolean>;
    isSubmitting: boolean;
}

export function usePasskey(options: UseSignInOptions = {}): UsePasskeyReturn {
    const router = useRouter();
    const queryClient = useQueryClient();
    const redirectTo = options.redirectTo ?? "/";
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const signInWithPasskeyHandler = React.useCallback(
        async (passkeyOptions?: { autoFill?: boolean }) => {
            setIsSubmitting(true);
            try {
                const { error } = await signInWithPasskey({ autoFill: passkeyOptions?.autoFill ?? false });
                if (error) {
                    toast.error(error.message || "Gagal masuk dengan passkey. Silakan coba lagi.");
                    return;
                }
                // Invalidate favorites cache after passkey login for fresh data
                queryClient.invalidateQueries({ queryKey: ["favorites"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
                queryClient.invalidateQueries({ queryKey: ["favorites-count"] });
                queryClient.invalidateQueries({ queryKey: ["favorite-categories"] });
                toast.success("Berhasil masuk dengan passkey.");
                router.push(redirectTo);
            } catch {
                toast.error("Gagal masuk dengan passkey. Silakan coba lagi.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [router, redirectTo, queryClient],
    );

    const addPasskeyHandler = React.useCallback(
        async (passkeyOptions?: { name?: string; authenticatorAttachment?: "platform" | "cross-platform" }) => {
            setIsSubmitting(true);
            try {
                const { error } = await addPasskey(passkeyOptions);
                if (error) {
                    toast.error(error.message || "Gagal menambahkan passkey. Silakan coba lagi.");
                    return false;
                }
                toast.success("Passkey berhasil ditambahkan.");
                return true;
            } catch {
                toast.error("Gagal menambahkan passkey. Silakan coba lagi.");
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [],
    );

    const listPasskeysHandler = React.useCallback(async () => {
        setIsSubmitting(true);
        try {
            const { data, error } = await listUserPasskeys();
            if (error) {
                toast.error(error.message || "Gagal mengambil daftar passkey.");
                return null;
            }
            return (data as unknown as Passkey[]) || null;
        } catch {
            toast.error("Gagal mengambil daftar passkey.");
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const deletePasskeyHandler = React.useCallback(async (id: string) => {
        setIsSubmitting(true);
        try {
            const { error } = await deletePasskey(id);
            if (error) {
                toast.error(error.message || "Gagal menghapus passkey.");
                return false;
            }
            toast.success("Passkey berhasil dihapus.");
            return true;
        } catch {
            toast.error("Gagal menghapus passkey.");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const updatePasskeyHandler = React.useCallback(async (id: string, name: string) => {
        setIsSubmitting(true);
        try {
            const { error } = await updatePasskey(id, name);
            if (error) {
                toast.error(error.message || "Gagal memperbarui nama passkey.");
                return false;
            }
            toast.success("Nama passkey berhasil diperbarui.");
            return true;
        } catch {
            toast.error("Gagal memperbarui nama passkey.");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        signInWithPasskey: signInWithPasskeyHandler,
        addPasskey: addPasskeyHandler,
        listPasskeys: listPasskeysHandler,
        deletePasskey: deletePasskeyHandler,
        updatePasskey: updatePasskeyHandler,
        isSubmitting,
    };
}
