"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { DiscordIcon, GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { signinSchema, usePasskey, useSignIn } from "@/features/auth";
import { cn } from "@/lib/utils";

export interface FormSignInProps {
    className?: string;
}

export function FormSignIn({ className, ...props }: FormSignInProps) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const { signIn, signInWithGoogle, signInWithDiscord } = useSignIn({ redirectTo: callbackUrl });
    const { signInWithPasskey, isSubmitting: isPasskeySubmitting } = usePasskey({ redirectTo: callbackUrl });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onSubmit: signinSchema,
        },
        onSubmit: async ({ value }) => {
            await signIn(value);
        },
    });

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Selamat Datang Kembali</CardTitle>
                    <CardDescription>Masuk dengan akun Github atau Google</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="signin-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}>
                        <FieldGroup>
                            <Field>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => signInWithPasskey({ autoFill: false })}
                                    disabled={isPasskeySubmitting}
                                    className="w-full">
                                    {isPasskeySubmitting && <Spinner />}
                                    <KeyRound className="size-4" aria-hidden />
                                    Masuk dengan Passkey
                                </Button>
                                <Button variant="outline" type="button" onClick={signInWithGoogle}>
                                    <GoogleIcon />
                                    Masuk dengan Google
                                </Button>
                                <Button variant="outline" type="button" onClick={signInWithDiscord}>
                                    <DiscordIcon />
                                    Masuk dengan Discord
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Atau lanjutkan dengan
                            </FieldSeparator>

                            {/* email */}
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
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />

                            {/* password */}
                            <form.Field
                                name="password"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <div className="flex items-center">
                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                <Link
                                                    href="/forgot-password"
                                                    className="ml-auto text-sm underline-offset-4 hover:underline">
                                                    Lupa password?
                                                </Link>
                                            </div>
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
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        aria-label="Show password"
                                                        title="Show password"
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

                            {/* submit */}
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Field>
                                        <Button type="submit" form="signin-form" disabled={!canSubmit}>
                                            {isSubmitting && <Spinner />}
                                            Masuk
                                        </Button>
                                        <FieldDescription className="text-center">
                                            Belum punya akun?{" "}
                                            <Link
                                                href={
                                                    callbackUrl !== "/"
                                                        ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
                                                        : "/sign-up"
                                                }>
                                                Daftar
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
