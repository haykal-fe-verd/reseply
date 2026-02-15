"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/config/auth/auth-client";
import {
    type EnableTwoFactorResult,
    type Passkey,
    twoFactorPasswordSchema,
    twoFactorSchema,
    usePasskey,
    useTwoFactorSettings,
    verifyTwoFactorTotp,
} from "@/features/auth";
import {
    deleteAvatar as deleteAvatarService,
    deleteUser as deleteUserService,
    type Gender,
    listSessions,
    revokeOtherSessions,
    revokeSession,
    type Session,
    sendVerificationEmail as sendVerificationEmailService,
    updateProfile as updateProfileService,
    updateUserImage,
    uploadAvatar,
} from "@/features/profile";
import { formatDate, getInitials } from "@/lib/utils";

// ============================================================================
// Account Hook
// ============================================================================

export interface SessionUser {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    twoFactorEnabled?: boolean;
    emailVerified?: boolean;
    createdAt?: Date | string;
    dateOfBirth?: Date | string | null;
    gender?: Gender | null;
    weight?: number | null;
    height?: number | null;
}

export function useAccount() {
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user as SessionUser | undefined;

    return {
        user,
        isPending,
        initials: getInitials(user?.name || "Pengguna"),
        formattedJoinDate: formatDate(user?.createdAt),
    };
}

export function useEmailVerification() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const userEmail = session?.user?.email;
    const [isSending, setIsSending] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current);
            }
        };
    }, []);

    // Start cooldown timer
    const startCooldown = useCallback(() => {
        setCooldownSeconds(60); // 1 minute cooldown
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
        }
        cooldownRef.current = setInterval(() => {
            setCooldownSeconds((prev) => {
                if (prev <= 1) {
                    if (cooldownRef.current) {
                        clearInterval(cooldownRef.current);
                        cooldownRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const sendVerificationEmail = useCallback(async () => {
        if (cooldownSeconds > 0 || isSending || !userEmail) return;

        setIsSending(true);
        try {
            await sendVerificationEmailService(userEmail);
            toast.success("Email verifikasi telah dikirim. Silakan cek inbox Anda.");
            startCooldown();
            router.refresh(); // Refresh to update email verification status
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengirim email verifikasi.");
        } finally {
            setIsSending(false);
        }
    }, [cooldownSeconds, isSending, userEmail, router, startCooldown]);

    return {
        sendVerificationEmail,
        isSending,
        cooldownSeconds,
        canSend: cooldownSeconds === 0 && !isSending && !!userEmail,
    };
}

export function useDeleteAccount() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const userImage = session?.user?.image;
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAccount = useCallback(async () => {
        setIsDeleting(true);
        try {
            if (userImage && typeof userImage === "string") {
                try {
                    await deleteAvatarService(userImage);
                } catch (error) {
                    console.error("Failed to delete avatar:", error);
                }
            }

            await deleteUserService();

            await authClient.signOut();

            // Clear favorites cache on account deletion
            queryClient.removeQueries({ queryKey: ["favorites"] });
            queryClient.removeQueries({ queryKey: ["favorite-ids"] });
            queryClient.removeQueries({ queryKey: ["favorites-count"] });
            queryClient.removeQueries({ queryKey: ["favorite-categories"] });

            router.push("/sign-in");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus akun.");
            setIsDeleting(false);
            throw error;
        }
    }, [router, userImage, queryClient]);

    return {
        deleteAccount,
        isDeleting,
    };
}

export function useAvatarUpload() {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);

    const uploadAndUpdateAvatar = useCallback(
        async (file: File) => {
            setIsUploading(true);
            try {
                const imageUrl = await uploadAvatar(file);

                await updateUserImage(imageUrl);

                // Force refresh the session cache by disabling cookie cache
                await authClient.getSession({
                    query: {
                        disableCookieCache: true,
                    },
                });
                router.refresh();

                toast.success("Foto profil berhasil diperbarui.");
                return imageUrl;
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Gagal mengunggah foto profil.");
                throw error;
            } finally {
                setIsUploading(false);
            }
        },
        [router],
    );

    return {
        uploadAndUpdateAvatar,
        isUploading,
    };
}

export function useUpdateProfile() {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const updateProfile = useCallback(
        async (data: {
            name: string;
            dateOfBirth?: Date | null;
            gender?: Gender | null;
            weight?: number | null;
            height?: number | null;
        }) => {
            setIsUpdating(true);
            try {
                await updateProfileService({
                    name: data.name,
                    dateOfBirth: data.dateOfBirth ?? null,
                    gender: data.gender ?? null,
                    weight: data.weight ?? null,
                    height: data.height ?? null,
                });
                // Force refresh the session cache by disabling cookie cache
                await authClient.getSession({
                    query: {
                        disableCookieCache: true,
                    },
                });
                router.refresh();
                toast.success("Profil berhasil diperbarui.");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Gagal memperbarui profil.");
                throw error;
            } finally {
                setIsUpdating(false);
            }
        },
        [router],
    );

    return {
        updateProfile,
        isUpdating,
    };
}

// ============================================================================
// Security Hook (2FA + Passkey)
// ============================================================================

export type TwoFactorEnableStep = "password" | "verify";

export function useSecurity() {
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const user = session?.user as SessionUser | undefined;
    const twoFactorEnabled = user?.twoFactorEnabled === true;

    const { enableTwoFactor, disableTwoFactor, isEnabling, isDisabling } = useTwoFactorSettings();

    const [enableStep, setEnableStep] = useState<TwoFactorEnableStep>("password");
    const [enableResult, setEnableResult] = useState<EnableTwoFactorResult | null>(null);
    const [isVerifyingSetup, setIsVerifyingSetup] = useState(false);
    const router = useRouter();

    const formEnable = useForm({
        defaultValues: { password: "" },
        validators: { onSubmit: twoFactorPasswordSchema },
        onSubmit: async ({ value }) => {
            const result = await enableTwoFactor(value.password);
            if (result) {
                setEnableResult(result);
                setEnableStep("verify");
            }
        },
    });

    const formVerifySetup = useForm({
        defaultValues: { code: "", trustDevice: true },
        validators: { onSubmit: twoFactorSchema },
        onSubmit: async ({ value }) => {
            setIsVerifyingSetup(true);
            try {
                const { error } = await verifyTwoFactorTotp(value);
                if (error) {
                    toast.error(error.message);
                    return;
                }
                toast.success("Two-factor authentication berhasil diaktifkan.");
                setEnableResult(null);
                setEnableStep("password");
                router.refresh();
            } catch {
                toast.error("Kode tidak valid. Silakan coba lagi.");
            } finally {
                setIsVerifyingSetup(false);
            }
        },
    });

    const formDisable = useForm({
        defaultValues: { password: "" },
        validators: { onSubmit: twoFactorPasswordSchema },
        onSubmit: async ({ value }) => {
            const ok = await disableTwoFactor(value.password);
            if (ok) {
                router.refresh();
            }
        },
    });

    const codeValue = useStore(formVerifySetup.store, (state) => state.values.code) as string;
    const [codeTouched, setCodeTouched] = useState(false);
    const codeInvalid = codeTouched && codeValue.length > 0 && codeValue.length < 6;

    const handleCancelEnable = () => {
        setEnableResult(null);
        setEnableStep("password");
    };

    return {
        session,
        user,
        isSessionPending,
        twoFactorEnabled,
        enableStep,
        enableResult,
        isVerifyingSetup,
        isEnabling,
        isDisabling,
        formEnable,
        formVerifySetup,
        formDisable,
        codeValue,
        codeTouched,
        codeInvalid,
        setCodeTouched,
        handleCancelEnable,
    };
}

export function usePasskeyManagement() {
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const { addPasskey, listPasskeys, deletePasskey, isSubmitting } = usePasskey();
    const [passkeys, setPasskeys] = useState<Passkey[]>([]);
    const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
    const [isAddingPasskey, setIsAddingPasskey] = useState(false);

    const loadPasskeys = useCallback(async () => {
        const result = await listPasskeys();
        if (result) {
            setPasskeys(result);
        }
    }, [listPasskeys]);

    useEffect(() => {
        if (!session) return;
        let cancelled = false;
        setIsLoadingPasskeys(true);
        void (async () => {
            await loadPasskeys();
            if (!cancelled) {
                setIsLoadingPasskeys(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [session, loadPasskeys]);

    const handleAddPasskey = useCallback(async () => {
        setIsAddingPasskey(true);
        const success = await addPasskey({
            name: `Passkey ${new Date().toLocaleDateString("id-ID")}`,
        });
        if (success) {
            await loadPasskeys();
        }
        setIsAddingPasskey(false);
    }, [addPasskey, loadPasskeys]);

    const handleDeletePasskey = useCallback(
        async (id: string) => {
            const success = await deletePasskey(id);
            if (success) {
                await loadPasskeys();
            }
        },
        [deletePasskey, loadPasskeys],
    );

    return {
        session,
        isSessionPending,
        passkeys,
        isLoadingPasskeys,
        isAddingPasskey,
        isSubmitting,
        handleAddPasskey,
        handleDeletePasskey,
    };
}

// ============================================================================
// Sessions Hook
// ============================================================================

export function useSessions() {
    const { data: currentSession } = authClient.useSession();
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());

    const loadSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const sessionsData = await listSessions();
            setSessions(sessionsData);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal memuat daftar sesi.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSessions();
    }, [loadSessions]);

    const handleRevokeSession = useCallback(
        async (token: string, sessionId: string) => {
            setRevokingIds((prev) => new Set(prev).add(sessionId));
            try {
                await revokeSession(token);
                toast.success("Sesi berhasil dihapus.");
                await loadSessions();
                // If current session was revoked, redirect to sign in
                if (currentSession?.session?.token === token) {
                    router.push("/sign-in");
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Gagal menghapus sesi.");
            } finally {
                setRevokingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(sessionId);
                    return next;
                });
            }
        },
        [currentSession, loadSessions, router],
    );

    const handleRevokeOtherSessions = useCallback(async () => {
        try {
            await revokeOtherSessions();
            toast.success("Semua sesi lainnya berhasil dihapus.");
            await loadSessions();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus sesi lainnya.");
        }
    }, [loadSessions]);

    const currentToken = currentSession?.session?.token;
    const otherSessions = sessions.filter((s) => s.token !== currentToken);
    const currentSessionData = sessions.find((s) => s.token === currentToken);

    return {
        sessions,
        isLoading,
        currentSessionData,
        otherSessions,
        revokingIds,
        handleRevokeSession,
        handleRevokeOtherSessions,
    };
}
