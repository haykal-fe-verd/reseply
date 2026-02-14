"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { forgotPasswordSchema, useForgotPassword } from "@/features/auth";
import { cn } from "@/lib/utils";

export interface FormForgotPasswordProps {
    className?: string;
}

export function FormForgotPassword({ className, ...props }: FormForgotPasswordProps) {
    const { requestReset, resend, isSubmitting, lastEmail, resendCooldownSeconds, canResend } = useForgotPassword();

    const form = useForm({
        defaultValues: {
            email: "",
        },
        validators: {
            onSubmit: forgotPasswordSchema,
        },
        onSubmit: async ({ value }) => {
            await requestReset(value);
        },
    });

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Lupa kata sandi?</CardTitle>
                    <CardDescription>
                        Masukkan email Anda. Kami akan mengirim link untuk mengatur ulang kata sandi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="forgot-password-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}>
                        <FieldGroup>
                            <form.Field
                                name="email"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                type="email"
                                                placeholder="m@example.com"
                                                autoComplete="email"
                                            />
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
                                            form="forgot-password-form"
                                            disabled={!canSubmit || formSubmitting || isSubmitting}
                                            className="w-full">
                                            {(formSubmitting || isSubmitting) && <Spinner />}
                                            Kirim link reset
                                        </Button>
                                        {lastEmail !== null && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={resend}
                                                disabled={!canResend || isSubmitting}
                                                className="w-full text-muted-foreground">
                                                {canResend
                                                    ? "Kirim ulang email"
                                                    : `Kirim ulang (${resendCooldownSeconds}s)`}
                                            </Button>
                                        )}
                                        <FieldDescription className="text-center">
                                            Ingat kata sandi?{" "}
                                            <Link href="/sign-in" className="underline-offset-4 hover:underline">
                                                Masuk
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
