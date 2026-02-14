import { authClient } from "@/config/auth/auth-client";
import type {
    ForgotPasswordSchema,
    ResetPasswordSchema,
    SigninSchema,
    SignUpSchema,
    TwoFactorSchema,
} from "@/features/auth";

export async function signInWithEmail(values: SigninSchema) {
    return authClient.signIn.email({
        email: values.email,
        password: values.password,
    });
}

export async function verifyTwoFactorTotp(values: TwoFactorSchema) {
    return authClient.twoFactor.verifyTotp({
        code: values.code,
        trustDevice: values.trustDevice ?? true,
    });
}

export async function verifyTwoFactorOtp(values: TwoFactorSchema) {
    return authClient.twoFactor.verifyOtp({
        code: values.code,
        trustDevice: values.trustDevice ?? true,
    });
}

export async function sendTwoFactorOtp(options?: { trustDevice?: boolean }) {
    return authClient.twoFactor.sendOtp({
        fetchOptions: {
            body: { trustDevice: options?.trustDevice ?? true },
        },
    });
}

const TWO_FACTOR_ISSUER = "Resep.ly";

export async function enableTwoFactor(password: string) {
    return authClient.twoFactor.enable({
        password,
        issuer: TWO_FACTOR_ISSUER,
    });
}

export async function disableTwoFactor(password: string) {
    return authClient.twoFactor.disable({
        password,
    });
}

export async function signUpWithEmail(values: SignUpSchema) {
    return authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
    });
}

type OAuthProvider = "google" | "discord";

export async function signInWithOAuth(provider: OAuthProvider, callbackURL?: string) {
    return authClient.signIn.social({
        provider,
        callbackURL: callbackURL ?? "/",
    });
}

export async function requestPasswordReset(values: ForgotPasswordSchema, options?: { redirectTo?: string }) {
    return authClient.requestPasswordReset({
        email: values.email,
        redirectTo: options?.redirectTo,
    });
}

export async function resetPassword(values: ResetPasswordSchema, token: string) {
    return authClient.resetPassword({
        newPassword: values.password,
        token,
    });
}

// Passkey functions
export async function signInWithPasskey(options?: { autoFill?: boolean }) {
    return authClient.signIn.passkey({
        autoFill: options?.autoFill ?? false,
    });
}

export async function addPasskey(options?: { name?: string; authenticatorAttachment?: "platform" | "cross-platform" }) {
    return authClient.passkey.addPasskey({
        name: options?.name,
        authenticatorAttachment: options?.authenticatorAttachment,
    });
}

export async function listUserPasskeys() {
    return authClient.passkey.listUserPasskeys({});
}

export async function deletePasskey(id: string) {
    return authClient.passkey.deletePasskey({
        id,
    });
}

export async function updatePasskey(id: string, name: string) {
    return authClient.passkey.updatePasskey({
        id,
        name,
    });
}
