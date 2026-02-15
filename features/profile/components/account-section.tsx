/**
 * Account Section Component
 * @date February 15, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import {
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Mail,
    Pencil,
    Ruler,
    Save,
    Scale,
    Send,
    Shield,
    ShieldCheck,
    Sparkles,
    User,
    Users,
    X,
    XCircle,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
    type Gender,
    ProfileStats,
    updateProfileSchema,
    useAccount,
    useAvatarUpload,
    useEmailVerification,
    useUpdateProfile,
} from "@/features/profile";
import { cn } from "@/lib/utils";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
} as const;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: "MALE", label: "Laki-laki" },
    { value: "FEMALE", label: "Perempuan" },
];

function AccountSectionSkeleton() {
    return (
        <div className="space-y-6">
            {/* Profile Header Card Skeleton */}
            <Card className="overflow-hidden mt-0 pt-0">
                {/* Gradient Banner */}
                <div className="relative h-32 sm:h-40">
                    <Skeleton className="h-full w-full rounded-none" />
                    {/* Edit Button Skeleton */}
                    <div className="absolute top-4 right-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </div>

                <CardContent className="relative pb-6">
                    {/* Avatar */}
                    <div className="absolute -top-14 sm:-top-16 left-6">
                        <Skeleton className="size-28 sm:size-32 rounded-full border-4 border-background" />
                    </div>

                    {/* Main Content */}
                    <div className="pt-16 sm:pt-20">
                        {/* User Info Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-5 w-64" />
                                <div className="flex items-center gap-4 pt-1">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                    <Skeleton className="size-10 rounded-lg shrink-0" />
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-18 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Form Card Skeleton */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-5" />
                        Detail Profil
                    </CardTitle>
                    <CardDescription>
                        Lengkapi informasi profil Anda untuk pengalaman yang lebih personal
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Name Field - Full Width */}
                        <div className="space-y-2 sm:col-span-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        {/* Other Fields */}
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                                {i >= 2 && <Skeleton className="h-3 w-32" />}
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-4" />
                        <Skeleton className="h-4 w-48" />
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
    const { updateProfile, isUpdating } = useUpdateProfile();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [calendarOpen, setCalendarOpen] = React.useState<boolean>(false);

    const form = useForm({
        defaultValues: {
            name: user?.name ?? "",
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
            gender: (user?.gender ?? null) as Gender | null,
            weight: user?.weight ?? null,
            height: user?.height ?? null,
        },
        validators: {
            onSubmit: updateProfileSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateProfile({
                    name: value.name,
                    dateOfBirth: value.dateOfBirth || null,
                    gender: value.gender || null,
                    weight: value.weight || null,
                    height: value.height || null,
                });
                setIsEditing(false);
            } catch {
                // Error handled in hook
            }
        },
    });

    // Reset form when user data changes or when editing starts
    React.useEffect(() => {
        if (user) {
            form.reset();
            form.setFieldValue("name", user.name ?? "");
            form.setFieldValue("dateOfBirth", user.dateOfBirth ? new Date(user.dateOfBirth) : null);
            form.setFieldValue("gender", (user.gender ?? null) as Gender | null);
            form.setFieldValue("weight", user.weight ?? null);
            form.setFieldValue("height", user.height ?? null);
        }
    }, [user, form]);

    const resetForm = () => {
        form.reset();
        form.setFieldValue("name", user?.name ?? "");
        form.setFieldValue("dateOfBirth", user?.dateOfBirth ? new Date(user.dateOfBirth) : null);
        form.setFieldValue("gender", (user?.gender ?? null) as Gender | null);
        form.setFieldValue("weight", user?.weight ?? null);
        form.setFieldValue("height", user?.height ?? null);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar.");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleCancelEdit = () => {
        resetForm();
        setIsEditing(false);
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
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            {/* Profile Header Card */}
            <motion.div variants={itemVariants}>
                <Card className="overflow-hidden mt-0 pt-0">
                    {/* Gradient Banner with Pattern */}
                    <div className="relative h-32 sm:h-40 bg-linear-to-br from-primary via-primary/80 to-primary/60 overflow-hidden">
                        {/* Decorative Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                            <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white rounded-full" />
                        </div>
                        {/* Sparkle decorations */}
                        <Sparkles className="absolute top-4 left-8 size-5 text-white/30" />
                        <Sparkles className="absolute bottom-6 right-1/4 size-4 text-white/20" />
                        <Sparkles className="absolute top-1/3 right-1/3 size-3 text-white/25" />

                        {/* Edit Profile Button - Floating */}
                        <motion.div
                            className="absolute top-4 right-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            {!isEditing ? (
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={() => {
                                        resetForm();
                                        setIsEditing(true);
                                    }}
                                    className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm hover:bg-background">
                                    <Pencil className="size-4" />
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={handleCancelEdit}
                                        disabled={isUpdating}
                                        className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm hover:bg-background">
                                        <X className="size-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        onClick={() => form.handleSubmit()}
                                        disabled={isUpdating}
                                        className="rounded-full shadow-lg">
                                        {isUpdating ? <Spinner className="size-4" /> : <Save className="size-4" />}
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    <CardContent className="relative pb-6">
                        {/* Avatar with Edit Badge */}
                        <div className="absolute -top-14 sm:-top-16 left-6">
                            <div className="relative group">
                                <Avatar className="size-28 sm:size-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
                                    <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                                    <AvatarFallback className="text-2xl sm:text-3xl bg-linear-to-br from-primary/20 to-primary/10 font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Camera Badge */}
                                <motion.button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    disabled={isUploading}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        "absolute -bottom-1 -right-1 p-2 rounded-full",
                                        "bg-primary text-primary-foreground shadow-lg",
                                        "transition-all hover:bg-primary/90",
                                        "disabled:cursor-not-allowed disabled:opacity-50",
                                    )}
                                    aria-label="Ubah foto profil">
                                    {isUploading ? <Spinner className="size-4" /> : <Camera className="size-4" />}
                                </motion.button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    aria-label="Upload foto profil"
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="pt-16 sm:pt-20">
                            {/* User Info Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name}</h2>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                            <Sparkles className="size-3 mr-1" />
                                            Member
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            <span>Bergabung {formattedJoinDate}</span>
                                        </div>
                                        {user.gender && (
                                            <div className="flex items-center gap-1.5">
                                                <Users className="size-3.5" />
                                                <span>{user.gender === "MALE" ? "Laki-laki" : "Perempuan"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t">
                                {/* Email Status */}
                                <div
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                        user.emailVerified
                                            ? "bg-green-500/10 border border-green-500/20"
                                            : "bg-yellow-500/10 border border-yellow-500/20",
                                    )}>
                                    <div
                                        className={cn(
                                            "p-2 rounded-lg",
                                            user.emailVerified ? "bg-green-500/20" : "bg-yellow-500/20",
                                        )}>
                                        {user.emailVerified ? (
                                            <CheckCircle2 className="size-5 text-green-600" />
                                        ) : (
                                            <XCircle className="size-5 text-yellow-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p
                                            className={cn(
                                                "text-sm font-medium",
                                                user.emailVerified ? "text-green-600" : "text-yellow-600",
                                            )}>
                                            {user.emailVerified ? "Terverifikasi" : "Belum verifikasi"}
                                        </p>
                                    </div>
                                </div>

                                {/* 2FA Status */}
                                <div
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                        user.twoFactorEnabled
                                            ? "bg-green-500/10 border border-green-500/20"
                                            : "bg-muted/50 border border-border/50",
                                    )}>
                                    <div
                                        className={cn(
                                            "p-2 rounded-lg",
                                            user.twoFactorEnabled ? "bg-green-500/20" : "bg-muted",
                                        )}>
                                        {user.twoFactorEnabled ? (
                                            <ShieldCheck className="size-5 text-green-600" />
                                        ) : (
                                            <Shield className="size-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Keamanan 2FA</p>
                                        <p
                                            className={cn(
                                                "text-sm font-medium",
                                                user.twoFactorEnabled ? "text-green-600" : "text-muted-foreground",
                                            )}>
                                            {user.twoFactorEnabled ? "Aktif" : "Tidak aktif"}
                                        </p>
                                    </div>
                                </div>

                                {/* Profile Completion */}
                                {(() => {
                                    const fields = [user.name, user.dateOfBirth, user.gender, user.weight, user.height];
                                    const filled = fields.filter(Boolean).length;
                                    const percentage = Math.round((filled / fields.length) * 100);
                                    const isComplete = percentage === 100;
                                    return (
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                                isComplete
                                                    ? "bg-green-500/10 border border-green-500/20"
                                                    : "bg-muted/50 border border-border/50",
                                            )}>
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg",
                                                    isComplete ? "bg-green-500/20" : "bg-muted",
                                                )}>
                                                <User
                                                    className={cn(
                                                        "size-5",
                                                        isComplete ? "text-green-600" : "text-muted-foreground",
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Kelengkapan</p>
                                                <p
                                                    className={cn(
                                                        "text-sm font-medium",
                                                        isComplete ? "text-green-600" : "text-muted-foreground",
                                                    )}>
                                                    {percentage}% lengkap
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Member Since Duration */}
                                {(() => {
                                    const joinDate = user.createdAt ? new Date(user.createdAt) : null;
                                    const now = new Date();
                                    let duration = "Baru bergabung";
                                    if (joinDate) {
                                        const diffMonths =
                                            (now.getFullYear() - joinDate.getFullYear()) * 12 +
                                            (now.getMonth() - joinDate.getMonth());
                                        if (diffMonths >= 12) {
                                            const years = Math.floor(diffMonths / 12);
                                            duration = `${years} tahun`;
                                        } else if (diffMonths >= 1) {
                                            duration = `${diffMonths} bulan`;
                                        } else {
                                            const diffDays = Math.floor(
                                                (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
                                            );
                                            duration = diffDays > 0 ? `${diffDays} hari` : "Hari ini";
                                        }
                                    }
                                    return (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Calendar className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Durasi Member</p>
                                                <p className="text-sm font-medium text-primary">{duration}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Stats */}
                            <ProfileStats weight={user.weight} height={user.height} dateOfBirth={user.dateOfBirth} />

                            {/* Verification Button */}
                            {!user.emailVerified && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <Mail className="size-5 text-yellow-600 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">Verifikasi email Anda</p>
                                        <p className="text-xs text-muted-foreground">Untuk mengakses semua fitur</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={sendVerificationEmail}
                                        disabled={!canSend}
                                        className="shrink-0">
                                        {isSending ? (
                                            <Spinner className="size-4" />
                                        ) : cooldownSeconds > 0 ? (
                                            `${cooldownSeconds}s`
                                        ) : (
                                            <>
                                                <Send className="size-4 mr-2" />
                                                Kirim
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Profile Form Card */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="size-5" />
                            Detail Profil
                        </CardTitle>
                        <CardDescription>
                            Lengkapi informasi profil Anda untuk pengalaman yang lebih personal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit();
                            }}
                            className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Name Field */}
                                <form.Field
                                    name="name"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid} className="sm:col-span-2">
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <User className="size-4 text-muted-foreground" />
                                                    Nama Lengkap
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="Masukkan nama lengkap"
                                                    disabled={!isEditing || isUpdating}
                                                    className={cn(!isEditing && "bg-muted/50 cursor-default")}
                                                    aria-invalid={isInvalid}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />

                                {/* Date of Birth Field */}
                                <form.Field
                                    name="dateOfBirth"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid} className="flex flex-col">
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <Calendar className="size-4 text-muted-foreground" />
                                                    Tanggal Lahir
                                                </FieldLabel>
                                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id={field.name}
                                                            variant="outline"
                                                            disabled={!isEditing || isUpdating}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.state.value && "text-muted-foreground",
                                                                !isEditing && "bg-muted/50 cursor-default",
                                                            )}>
                                                            {field.state.value ? (
                                                                format(field.state.value, "d MMMM yyyy", {
                                                                    locale: id,
                                                                })
                                                            ) : (
                                                                <span>Pilih tanggal</span>
                                                            )}
                                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.state.value || undefined}
                                                            onSelect={(date) => {
                                                                field.handleChange(date || null);
                                                                setCalendarOpen(false);
                                                            }}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            captionLayout="dropdown"
                                                            fromYear={1900}
                                                            toYear={new Date().getFullYear()}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FieldDescription>Digunakan untuk menghitung usia</FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />

                                {/* Gender Field */}
                                <form.Field
                                    name="gender"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <Users className="size-4 text-muted-foreground" />
                                                    Jenis Kelamin
                                                </FieldLabel>
                                                <Select
                                                    value={field.state.value || ""}
                                                    onValueChange={(value: Gender) => field.handleChange(value || null)}
                                                    disabled={!isEditing || isUpdating}>
                                                    <SelectTrigger
                                                        id={field.name}
                                                        className={cn(!isEditing && "bg-muted/50 cursor-default")}>
                                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {GENDER_OPTIONS.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />

                                {/* Weight Field */}
                                <form.Field
                                    name="weight"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <Scale className="size-4 text-muted-foreground" />
                                                    Berat Badan (kg)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    step="0.1"
                                                    min="1"
                                                    max="500"
                                                    value={field.state.value ?? ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.handleChange(val === "" ? null : Number(val));
                                                    }}
                                                    placeholder="Contoh: 65"
                                                    disabled={!isEditing || isUpdating}
                                                    className={cn(!isEditing && "bg-muted/50 cursor-default")}
                                                    aria-invalid={isInvalid}
                                                />
                                                <FieldDescription>Untuk kalkulasi BMI</FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />

                                {/* Height Field */}
                                <form.Field
                                    name="height"
                                    children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <Ruler className="size-4 text-muted-foreground" />
                                                    Tinggi Badan (cm)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    step="0.1"
                                                    min="30"
                                                    max="300"
                                                    value={field.state.value ?? ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.handleChange(val === "" ? null : Number(val));
                                                    }}
                                                    placeholder="Contoh: 170"
                                                    disabled={!isEditing || isUpdating}
                                                    className={cn(!isEditing && "bg-muted/50 cursor-default")}
                                                    aria-invalid={isInvalid}
                                                />
                                                <FieldDescription>Untuk kalkulasi BMI</FieldDescription>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
