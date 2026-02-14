"use client";

import { AlertTriangle, KeyRound, Plus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteAccount, usePasskeyManagement, useSecurity } from "@/features/profile";
import { cn } from "@/lib/utils";

const QRCodeCanvas = dynamic(
    async () => {
        const mod = await import("qrcode");
        return function QRCodeCanvas({ value, className }: { value: string; className?: string }) {
            const [dataUrl, setDataUrl] = useState<string | null>(null);
            useEffect(() => {
                if (!value) return;
                mod.default.toDataURL(value, { width: 200, margin: 2 }).then(setDataUrl);
            }, [value]);
            if (!dataUrl) return null;
            return (
                // biome-ignore lint: QR data URL from qrcode; Next/Image not used for dynamic data URL
                <img
                    src={dataUrl}
                    alt="QR code untuk aplikasi autentikator"
                    className={cn("rounded border border-border", className)}
                />
            );
        };
    },
    { ssr: false },
);

export function SecuritySection({ className }: { className?: string }) {
    const {
        session,
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
        codeInvalid,
        setCodeTouched,
        handleCancelEnable,
    } = useSecurity();

    if (isSessionPending) {
        return (
            <div className={cn("space-y-4 sm:space-y-6", className)}>
                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!session) {
        return (
            <Card className={cn(className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-5" aria-hidden />
                        Keamanan
                    </CardTitle>
                    <CardDescription>Masuk untuk mengatur two-factor authentication.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className={cn("space-y-4 sm:space-y-6", className)}>
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        {twoFactorEnabled ? (
                            <>
                                <ShieldCheck className="size-4 sm:size-5 text-primary" aria-hidden />
                                Two-Factor Authentication
                            </>
                        ) : (
                            <>
                                <ShieldOff className="size-4 sm:size-5" aria-hidden />
                                Two-Factor Authentication
                            </>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {twoFactorEnabled
                            ? "Two-factor authentication aktif. Anda akan diminta kode saat masuk dari perangkat baru."
                            : "Aktifkan two-factor authentication untuk keamanan akun lebih baik."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {twoFactorEnabled ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formDisable.handleSubmit();
                            }}>
                            <FieldGroup>
                                <formDisable.Field
                                    name="password"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor="disable-2fa-password">
                                                Kata sandi (untuk menonaktifkan 2FA)
                                            </FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="disable-2fa-password"
                                                    type="password"
                                                    placeholder="Kata sandi Anda"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={!!field.state.meta.errors?.length}
                                                />
                                            </InputGroup>
                                            {field.state.meta.errors?.length ? (
                                                <FieldError
                                                    errors={field.state.meta.errors.map((e) => ({
                                                        message:
                                                            typeof e === "string"
                                                                ? e
                                                                : (e as { message?: string }).message,
                                                    }))}
                                                />
                                            ) : null}
                                        </Field>
                                    )}
                                />
                                <formDisable.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                                    {([canSubmit, formSubmitting]) => (
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={!canSubmit || formSubmitting || isDisabling}>
                                            {(formSubmitting || isDisabling) && <Spinner />}
                                            Nonaktifkan 2FA
                                        </Button>
                                    )}
                                </formDisable.Subscribe>
                            </FieldGroup>
                        </form>
                    ) : enableStep === "verify" && enableResult ? (
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Pindai QR code dengan aplikasi autentikator (Google Authenticator, Authy, dll.), lalu
                                masukkan kode 6 digit di bawah untuk menyelesaikan aktivasi.
                            </p>
                            <div className="flex flex-col items-center gap-4">
                                <QRCodeCanvas value={enableResult.totpURI} className="size-50" />
                            </div>
                            {enableResult.backupCodes.length > 0 && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                                    <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Simpan kode cadangan (gunakan jika kehilangan akses ke aplikasi):
                                    </p>
                                    <ul className="list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
                                        {enableResult.backupCodes.map((code) => (
                                            <li key={code}>{code}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    formVerifySetup.handleSubmit();
                                }}>
                                <FieldGroup>
                                    <formVerifySetup.Field
                                        name="code"
                                        children={(field) => (
                                            <Field data-invalid={codeInvalid}>
                                                <FieldLabel htmlFor="setup-2fa-code">Kode verifikasi</FieldLabel>
                                                <div className="flex justify-center">
                                                    <InputOTP
                                                        id="setup-2fa-code"
                                                        maxLength={6}
                                                        value={field.state.value}
                                                        onChange={(newValue: string) => {
                                                            field.handleChange(newValue);
                                                            setCodeTouched(true);
                                                        }}
                                                        onBlur={() => setCodeTouched(true)}
                                                        aria-invalid={codeInvalid}
                                                        className={
                                                            codeInvalid ? "aria-invalid:border-destructive" : undefined
                                                        }>
                                                        <InputOTPGroup className="gap-1">
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                        </InputOTPGroup>
                                                        <InputOTPSeparator />
                                                        <InputOTPGroup className="gap-1">
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                                {codeInvalid && (
                                                    <FieldError
                                                        errors={[
                                                            {
                                                                message:
                                                                    codeValue.length === 0
                                                                        ? "Masukkan kode 6 digit."
                                                                        : "Kode harus 6 digit.",
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <formVerifySetup.Subscribe
                                        selector={(state) => [state.canSubmit, state.isSubmitting]}>
                                        {([canSubmit, formSubmitting]) => (
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !canSubmit ||
                                                    codeValue.length !== 6 ||
                                                    formSubmitting ||
                                                    isVerifyingSetup
                                                }>
                                                {(formSubmitting || isVerifyingSetup) && <Spinner />}
                                                Verifikasi dan aktifkan 2FA
                                            </Button>
                                        )}
                                    </formVerifySetup.Subscribe>
                                </FieldGroup>
                            </form>
                            <Button type="button" variant="ghost" onClick={handleCancelEnable}>
                                Batal
                            </Button>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formEnable.handleSubmit();
                            }}>
                            <FieldGroup>
                                <formEnable.Field
                                    name="password"
                                    children={(field) => (
                                        <Field>
                                            <FieldLabel htmlFor="enable-2fa-password">
                                                Kata sandi (untuk mengaktifkan 2FA)
                                            </FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="enable-2fa-password"
                                                    type="password"
                                                    placeholder="Kata sandi Anda"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={!!field.state.meta.errors?.length}
                                                />
                                            </InputGroup>
                                            {field.state.meta.errors?.length ? (
                                                <FieldError
                                                    errors={field.state.meta.errors.map((e) => ({
                                                        message:
                                                            typeof e === "string"
                                                                ? e
                                                                : (e as { message?: string }).message,
                                                    }))}
                                                />
                                            ) : null}
                                        </Field>
                                    )}
                                />
                                <formEnable.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                                    {([canSubmit, formSubmitting]) => (
                                        <Button type="submit" disabled={!canSubmit || formSubmitting || isEnabling}>
                                            {(formSubmitting || isEnabling) && <Spinner />}
                                            Aktifkan two-factor authentication
                                        </Button>
                                    )}
                                </formEnable.Subscribe>
                            </FieldGroup>
                        </form>
                    )}
                </CardContent>
            </Card>
            <PasskeySection className={className} />
            <Card className={cn("border-destructive", className)}>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-destructive">
                        <AlertTriangle className="size-4 sm:size-5" />
                        Zona Berbahaya
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Tindakan ini tidak dapat dibatalkan. Semua data akun Anda akan dihapus secara permanen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteAccountDialog />
                </CardContent>
            </Card>
        </div>
    );
}

function DeleteAccountDialog() {
    const { deleteAccount, isDeleting } = useDeleteAccount();
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteAccount();
            // Dialog will close automatically after redirect
        } catch {
            // Error already handled in hook, keep dialog open
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                        <>
                            <Spinner className="size-4 mr-2" />
                            Menghapus...
                        </>
                    ) : (
                        <>
                            <Trash2 className="size-4 mr-2" />
                            Hapus Akun
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" />
                        Hapus Akun Permanen?
                    </AlertDialogTitle>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun Anda secara permanen dan
                            menghapus semua data yang terkait dengan akun Anda, termasuk:
                        </AlertDialogDescription>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                            <li>Profil dan informasi akun</li>
                            <li>Semua sesi aktif</li>
                            <li>Data autentikasi (2FA, Passkey)</li>
                            <li>Semua data terkait lainnya</li>
                        </ul>
                        <AlertDialogDescription>
                            Setelah penghapusan, Anda akan otomatis logout dan diarahkan ke halaman sign-in.
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting ? (
                            <>
                                <Spinner className="size-4 mr-2" />
                                Menghapus...
                            </>
                        ) : (
                            "Ya, Hapus Akun"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function PasskeySection({ className }: { className?: string }) {
    const {
        session,
        isSessionPending,
        passkeys,
        isLoadingPasskeys,
        isAddingPasskey,
        isSubmitting,
        handleAddPasskey,
        handleDeletePasskey,
    } = usePasskeyManagement();

    if (isSessionPending) {
        return (
            <Card className={cn(className)}>
                <CardHeader className="pb-3 sm:pb-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <KeyRound className="size-4 sm:size-5" aria-hidden />
                    Passkey
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Masuk tanpa kata sandi menggunakan passkey (biometrik, PIN, atau kunci keamanan).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <Button
                    type="button"
                    onClick={handleAddPasskey}
                    disabled={isAddingPasskey || isSubmitting}
                    className="w-full text-sm sm:text-base">
                    {(isAddingPasskey || isSubmitting) && <Spinner />}
                    <Plus className="size-3 sm:size-4" aria-hidden />
                    Tambah passkey
                </Button>

                {isLoadingPasskeys ? (
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="flex items-start sm:items-center gap-2 sm:gap-3 rounded-md border border-border p-2.5 sm:p-3">
                                <Skeleton className="size-4 shrink-0" />
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                                <Skeleton className="size-8 shrink-0 rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : passkeys.length > 0 ? (
                    <div className="space-y-2">
                        {passkeys.map((passkey) => (
                            <div
                                key={passkey.id}
                                className="flex items-start sm:items-center gap-2 sm:gap-3 rounded-md border border-border p-2.5 sm:p-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium wrap-break-word">{passkey.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Ditambahkan{" "}
                                        {new Date(
                                            typeof passkey.createdAt === "string"
                                                ? passkey.createdAt
                                                : passkey.createdAt.toISOString(),
                                        ).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePasskey(passkey.id)}
                                    disabled={isSubmitting}
                                    className="shrink-0">
                                    <Trash2 className="size-3 sm:size-4 text-destructive" aria-hidden />
                                    <span className="sr-only">Hapus passkey</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                        Belum ada passkey yang terdaftar. Klik "Tambah passkey" untuk menambahkan.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
