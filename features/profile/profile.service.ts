import { authClient } from "@/config/auth/auth-client";

export interface Session {
    id: string;
    token: string;
    expiresAt: Date | string;
    createdAt: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
}

export async function listSessions() {
    const { data, error } = await authClient.listSessions();
    if (error) {
        throw new Error(error.message || "Gagal memuat daftar sesi.");
    }
    return (data as unknown as Session[]) || [];
}

export async function revokeSession(token: string) {
    const { error } = await authClient.revokeSession({ token });
    if (error) {
        throw new Error(error.message || "Gagal menghapus sesi.");
    }
}

export async function revokeOtherSessions() {
    const { error } = await authClient.revokeOtherSessions();
    if (error) {
        throw new Error(error.message || "Gagal menghapus sesi lainnya.");
    }
}

export async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengunggah foto profil.");
    }

    const data = await response.json();
    return data.url;
}

export async function updateUserImage(imageUrl: string) {
    const { error } = await authClient.updateUser({
        image: imageUrl,
    });

    if (error) {
        throw new Error(error.message || "Gagal memperbarui foto profil.");
    }
}

export async function sendVerificationEmail(email: string) {
    const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/profile?tab=account",
    });

    if (error) {
        throw new Error(error.message || "Gagal mengirim email verifikasi.");
    }
}

export async function deleteAvatar(imageUrl: string) {
    const response = await fetch("/api/profile/delete-avatar", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus foto profil.");
    }
}

export async function deleteUser() {
    const { error } = await authClient.deleteUser({
        callbackURL: "/sign-in",
    });

    if (error) {
        throw new Error(error.message || "Gagal menghapus akun.");
    }
}
