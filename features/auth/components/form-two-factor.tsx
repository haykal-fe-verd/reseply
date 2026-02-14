"use client";

import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { twoFactorSchema, useTwoFactor } from "@/features/auth";
import { cn } from "@/lib/utils";

export interface FormTwoFactorProps {
    className?: string;
}

export function FormTwoFactor({ className, ...props }: FormTwoFactorProps) {
    const { verifyCode, sendEmailCode, isSubmitting, sendEmailCooldownSeconds, canSendEmail } = useTwoFactor();
    const [codeTouched, setCodeTouched] = useState(false);

    const form = useForm({
        defaultValues: {
            code: "",
            trustDevice: true,
        },
        validators: {
            onSubmit: twoFactorSchema,
        },
        onSubmit: async ({ value }) => {
            await verifyCode(value);
        },
    });

    const codeValue = useStore(form.store, (state) => state.values.code) as string;
    const codeInvalid = codeTouched && codeValue.length > 0 && codeValue.length < 6;

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="size-6 text-primary" aria-hidden />
                    </div>
                    <CardTitle className="text-xl">Verifikasi dua faktor</CardTitle>
                    <CardDescription>
                        Masukkan kode 6 digit dari aplikasi autentikator Anda, atau minta kode lewat email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="two-factor-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}>
                        <FieldGroup>
                            <form.Field
                                name="code"
                                children={(field) => (
                                    <Field data-invalid={codeInvalid}>
                                        <FieldLabel htmlFor="two-factor-code">Kode verifikasi</FieldLabel>
                                        <div className="flex justify-center">
                                            <InputOTP
                                                id="two-factor-code"
                                                maxLength={6}
                                                value={field.state.value}
                                                onChange={(newValue: string) => {
                                                    field.handleChange(newValue);
                                                    setCodeTouched(true);
                                                }}
                                                onBlur={() => setCodeTouched(true)}
                                                aria-invalid={codeInvalid}
                                                className={codeInvalid ? "aria-invalid:border-destructive" : undefined}>
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

                            <form.Field
                                name="trustDevice"
                                children={(field) => (
                                    <Field>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="trust-device"
                                                checked={field.state.value}
                                                onCheckedChange={(checked) => field.handleChange(checked === true)}
                                                aria-describedby="trust-device-description"
                                            />
                                            <label
                                                htmlFor="trust-device"
                                                id="trust-device-description"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Percayai perangkat ini selama 30 hari
                                            </label>
                                        </div>
                                    </Field>
                                )}
                            />

                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, formSubmitting]) => (
                                    <Field>
                                        <Button
                                            type="submit"
                                            form="two-factor-form"
                                            disabled={
                                                !canSubmit || codeValue.length !== 6 || formSubmitting || isSubmitting
                                            }
                                            className="w-full">
                                            {(formSubmitting || isSubmitting) && <Spinner />}
                                            Verifikasi
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={sendEmailCode}
                                            disabled={!canSendEmail || isSubmitting}
                                            className="w-full text-muted-foreground">
                                            {canSendEmail
                                                ? "Kirim kode ke email"
                                                : `Kirim kode ke email (${sendEmailCooldownSeconds}s)`}
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
