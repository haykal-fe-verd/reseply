/**
 * Auth Configuration
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "@/config/prisma";
import { APP_NAME } from "@/lib/constants";
import { getForgotPasswordEmailHtml, getTwoFactorEmailHtml, getVerificationEmailHtml } from "@/lib/emails";

const resendApiKey = process.env.RESEND_API_KEY;
const resendMailFrom = process.env.RESEND_MAIL_FROM;
const resend = resendApiKey && resendMailFrom ? new Resend(resendApiKey) : null;

export const auth = betterAuth({
    appName: APP_NAME,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        deleteUser: {
            enabled: true,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: resend
            ? async ({ user, url }) => {
                  const html = await getForgotPasswordEmailHtml({ user, url });
                  void resend.emails.send({
                      from: resendMailFrom as string,
                      to: user.email,
                      subject: "Atur ulang kata sandi - Reseply",
                      html,
                  });
              }
            : undefined,
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: resend
            ? async ({ user, url }) => {
                  const html = await getVerificationEmailHtml({ user, url });
                  void resend.emails.send({
                      from: resendMailFrom as string,
                      to: user.email,
                      subject: "Verifikasi email Anda - Reseply",
                      html,
                  });
              }
            : undefined,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        },
    },
    plugins: [
        nextCookies(),
        admin({
            defaultRole: "user",
            adminRoles: ["admin"],
        }),
        twoFactor({
            issuer: APP_NAME,
            otpOptions: resend
                ? {
                      sendOTP: async ({ user, otp }) => {
                          const html = await getTwoFactorEmailHtml({ user, code: otp });
                          void resend.emails.send({
                              from: resendMailFrom as string,
                              to: user.email,
                              subject: "Kode verifikasi dua faktor - Reseply",
                              html,
                          });
                      },
                  }
                : undefined,
        }),
        passkey({
            rpID:
                process.env.BETTER_AUTH_URL?.replace(/^https?:\/\//, "")
                    .replace(/:\d+$/, "")
                    .split("/")[0] || "localhost",
            rpName: APP_NAME,
            origin: process.env.BETTER_AUTH_URL?.replace(/\/$/, "") || "http://localhost:3000",
        }),
    ],
});
