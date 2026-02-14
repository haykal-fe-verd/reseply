"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { resetPasswordSchema, useResetPassword } from "@/features/auth";
import { cn } from "@/lib/utils";

export interface FormResetPasswordProps {
    className?: string;
}

export function FormResetPassword({ className, ...props }: FormResetPasswordProps) {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { resetPassword, isSubmitting } = useResetPassword(token);

    const form = useForm({
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        validators: {
            onSubmit: resetPasswordSchema,
        },
        onSubmit: async ({ value }) => {
            await resetPassword(value);
        },
    });

    if (!token) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Link tidak valid</CardTitle>
                        <CardDescription>
                            Link reset kata sandi tidak ditemukan atau sudah kedaluwarsa. Silakan minta link baru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Minta link reset baru</Link>
                        </Button>
                        <FieldDescription className="mt-4 text-center">
                            <Link href="/sign-in" className="underline-offset-4 hover:underline">
                                Kembali ke masuk
                            </Link>
                        </FieldDescription>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Atur ulang kata sandi</CardTitle>
                    <CardDescription>Masukkan kata sandi baru untuk akun Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="reset-password-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}>
                        <FieldGroup>
                            <form.Field
                                name="password"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Kata sandi baru</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="••••••••"
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        type="button"
                                                        aria-label="Tampilkan kata sandi"
                                                        title="Tampilkan kata sandi"
                                                        size="icon-xs"
                                                        onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <Eye /> : <EyeClosed />}
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="confirmPassword"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Konfirmasi kata sandi</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="••••••••"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        type="button"
                                                        aria-label="Tampilkan konfirmasi kata sandi"
                                                        title="Tampilkan konfirmasi kata sandi"
                                                        size="icon-xs"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                        {showConfirmPassword ? <Eye /> : <EyeClosed />}
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, formSubmitting]) => (
                                    <Field>
                                        <Button
                                            type="submit"
                                            form="reset-password-form"
                                            disabled={!canSubmit || formSubmitting || isSubmitting}
                                            className="w-full">
                                            {(formSubmitting || isSubmitting) && <Spinner />}
                                            Simpan kata sandi
                                        </Button>
                                        <FieldDescription className="text-center">
                                            <Link href="/sign-in" className="underline-offset-4 hover:underline">
                                                Kembali ke masuk
                                            </Link>
                                        </FieldDescription>
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
