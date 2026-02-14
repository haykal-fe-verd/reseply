"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
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
import { signUpSchema, useSignUp } from "@/features/auth";
import { cn } from "@/lib/utils";

export interface FormSignUpProps {
    className?: string;
}

export function FormSignUp({ className, ...props }: FormSignUpProps) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
    const { signUp, signUpWithGoogle, signUpWithDiscord } = useSignUp({ redirectTo: callbackUrl });

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validators: {
            onSubmit: signUpSchema,
        },
        onSubmit: async ({ value }) => {
            await signUp(value);
        },
    });

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Buat Akun</CardTitle>
                    <CardDescription>Daftar dengan Google atau Discord</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="signup-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}>
                        <FieldGroup>
                            <Field>
                                <Button variant="outline" type="button" onClick={signUpWithGoogle}>
                                    <GoogleIcon />
                                    Daftar dengan Google
                                </Button>
                                <Button variant="outline" type="button" onClick={signUpWithDiscord}>
                                    <DiscordIcon />
                                    Daftar dengan Discord
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Atau daftar dengan email
                            </FieldSeparator>

                            {/* name */}
                            <form.Field
                                name="name"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                type="text"
                                                placeholder="John Doe"
                                                autoComplete="name"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    );
                                }}
                            />

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
                                                autoComplete="email"
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
                                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                                                        aria-label="Tampilkan password"
                                                        title="Tampilkan password"
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

                            {/* confirmPassword */}
                            <form.Field
                                name="confirmPassword"
                                children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Konfirmasi Password</FieldLabel>
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
                                                        aria-label="Tampilkan konfirmasi password"
                                                        title="Tampilkan konfirmasi password"
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

                            {/* submit */}
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Field>
                                        <Button type="submit" form="signup-form" disabled={!canSubmit}>
                                            {isSubmitting && <Spinner />}
                                            Daftar
                                        </Button>
                                        <FieldDescription className="text-center">
                                            Sudah punya akun?{" "}
                                            <Link href={callbackUrl !== "/" ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}>
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
