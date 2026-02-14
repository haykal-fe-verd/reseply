/**
 * Emails Utility
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://reseply.kidzeroll.space";

const YEAR = new Date().getFullYear();

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function readTemplate(filename: string): Promise<string> {
    const path = join(process.cwd(), "emails", filename);
    return readFile(path, "utf-8");
}

/**
 * Membaca template verification-email.html dan mengisi placeholder.
 */
export async function getVerificationEmailHtml(props: {
    user: { name?: string | null; email: string };
    url: string;
}): Promise<string> {
    const { user, url } = props;
    const raw = await readTemplate("verification-email.html");
    const userName = escapeHtml(user.name ?? "Pengguna");
    return raw
        .replace(/\{\{appUrl\}\}/g, APP_URL)
        .replace(/\{\{userName\}\}/g, userName)
        .replace(/\{\{url\}\}/g, url)
        .replace(/\{\{year\}\}/g, String(YEAR));
}

/**
 * Membaca template forgot-password.html dan mengisi placeholder.
 */
export async function getForgotPasswordEmailHtml(props: {
    user: { name?: string | null; email: string };
    url: string;
}): Promise<string> {
    const { user, url } = props;
    const raw = await readTemplate("forgot-password.html");
    const userName = escapeHtml(user.name ?? "Pengguna");
    return raw
        .replace(/\{\{appUrl\}\}/g, APP_URL)
        .replace(/\{\{userName\}\}/g, userName)
        .replace(/\{\{url\}\}/g, url)
        .replace(/\{\{year\}\}/g, String(YEAR));
}

/**
 * Membaca template two-factor.html dan mengisi placeholder.
 */
export async function getTwoFactorEmailHtml(props: {
    user: { name?: string | null; email: string };
    code: string;
}): Promise<string> {
    const { user, code } = props;
    const raw = await readTemplate("two-factor.html");
    const userName = escapeHtml(user.name ?? "Pengguna");
    const codeSafe = escapeHtml(code);
    return raw
        .replace(/\{\{appUrl\}\}/g, APP_URL)
        .replace(/\{\{userName\}\}/g, userName)
        .replace(/\{\{code\}\}/g, codeSafe)
        .replace(/\{\{year\}\}/g, String(YEAR));
}
