"use client";

import { Calendar, Camera, CheckCircle2, Mail, Send, User, XCircle } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAccount, useAvatarUpload, useEmailVerification } from "@/features/profile";
import { cn } from "@/lib/utils";

function AccountSectionSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-5" />
                        Informasi Akun
                    </CardTitle>
                    <CardDescription>Informasi dasar akun Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <Skeleton className="size-16 sm:size-20 shrink-0 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-5 w-32 sm:w-48" />
                            <Skeleton className="h-4 w-48 sm:w-64" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function AccountSection() {
    const { user, isPending, initials, formattedJoinDate } = useAccount();
    const { uploadAndUpdateAvatar, isUploading } = useAvatarUpload();
    const { sendVerificationEmail, isSending, cooldownSeconds, canSend } = useEmailVerification();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar.");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Validate file size (max 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran file maksimal 5MB.");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        try {
            await uploadAndUpdateAvatar(file);
        } catch {
            // Error already handled in hook
        } finally {
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (isPending) {
        return <AccountSectionSkeleton />;
    }

    if (!user) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Tidak dapat memuat informasi akun.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-5" />
                        Informasi Akun
                    </CardTitle>
                    <CardDescription>Informasi dasar akun Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="relative group shrink-0">
                            <Avatar className="size-16 sm:size-20 border-2 border-border">
                                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                                <AvatarFallback className="text-base sm:text-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                className={cn(
                                    "absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity",
                                    "group-hover:opacity-100 focus-visible:opacity-100",
                                    "disabled:cursor-not-allowed disabled:opacity-50",
                                )}
                                aria-label="Ubah foto profil">
                                {isUploading ? (
                                    <Spinner className="text-white" />
                                ) : (
                                    <Camera className="size-5 text-white" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                aria-label="Upload foto profil"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold wrap-break-word">{user.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground break-all">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="size-4" />
                                Email
                            </div>
                            <p className="font-medium">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {user.emailVerified ? (
                                    <Badge variant="outline">
                                        <CheckCircle2 className="size-3 mr-1" />
                                        Terverifikasi
                                    </Badge>
                                ) : (
                                    <>
                                        <Badge variant="outline">
                                            <XCircle className="size-3 mr-1" />
                                            Belum terverifikasi
                                        </Badge>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={sendVerificationEmail}
                                            disabled={!canSend}
                                            className="h-7 text-xs">
                                            {isSending ? (
                                                <>
                                                    <Spinner className="size-3 mr-1.5" />
                                                    Mengirim...
                                                </>
                                            ) : cooldownSeconds > 0 ? (
                                                `Kirim lagi (${cooldownSeconds}s)`
                                            ) : (
                                                <>
                                                    <Send className="size-3 mr-1.5" />
                                                    Kirim Email Verifikasi
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="size-4" />
                                Bergabung
                            </div>
                            <p className="font-medium">{formattedJoinDate}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
