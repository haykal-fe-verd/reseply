/**
 * User Ban Dialog Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useBanUser } from "../users.hook";
import type { User } from "../users.service";

interface UserBanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function UserBanDialog({ open, onOpenChange, user }: UserBanDialogProps) {
    const banMutation = useBanUser();

    const form = useForm({
        defaultValues: {
            reason: "",
            expiresAt: "",
        },
        onSubmit: async ({ value }) => {
            if (!user) return;

            // Validate reason
            if (!value.reason.trim()) {
                return;
            }

            try {
                await banMutation.mutateAsync({
                    id: user.id,
                    values: {
                        reason: value.reason,
                        expiresAt: value.expiresAt ? new Date(value.expiresAt).toISOString() : null,
                    },
                });
                onOpenChange(false);
                form.reset();
            } catch {
                // Error handled by mutation
            }
        },
    });

    // Reset form when dialog opens/closes
    React.useEffect(() => {
        if (open) {
            form.reset();
            form.setFieldValue("reason", "");
            form.setFieldValue("expiresAt", "");
        }
    }, [open, form]);

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Blokir Pengguna</DialogTitle>
                    <DialogDescription>
                        Blokir pengguna <span className="font-semibold">{user.name}</span> ({user.email}). Semua sesi
                        aktif akan diakhiri.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-4">
                    <form.Field name="reason">
                        {(field) => (
                            <Field>
                                <FieldLabel htmlFor="reason">
                                    Alasan Blokir <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="reason"
                                    placeholder="Masukkan alasan pemblokiran..."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    rows={3}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    </form.Field>

                    <form.Field name="expiresAt">
                        {(field) => (
                            <Field>
                                <FieldLabel htmlFor="expiresAt">Berakhir Pada (Opsional)</FieldLabel>
                                <Input
                                    id="expiresAt"
                                    type="datetime-local"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <p className="text-xs text-muted-foreground">Kosongkan untuk blokir permanen.</p>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    </form.Field>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={banMutation.isPending}>
                            Batal
                        </Button>
                        <Button type="submit" variant="destructive" disabled={banMutation.isPending}>
                            {banMutation.isPending && <Spinner className="mr-2" />}
                            Blokir Pengguna
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
