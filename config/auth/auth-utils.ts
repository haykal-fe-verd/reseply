/**
 * Auth Utils Configuration
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/config/auth/auth";

/**
 * Get Better Auth Session
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */
export const getSession = cache(async () => {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        return session;
    } catch {
        return null;
    }
});

/**
 * Get Auth Session
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */
export const authSession = async () => {
    const session = await getSession();

    if (!session) {
        throw new Error("Sesi tidak valid.");
    }

    return session;
};

/**
 * Get Auth Session and Require Authentication
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */
export const authIsRequired = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    return session;
};

/**
 * Get Auth Session and Require No Authentication
 * @date February 12, 2026 3:30 PM
 * @author Muhammad Haykal
 */
export const authIsNotRequired = async () => {
    const session = await getSession();

    if (session) {
        redirect("/");
    }
};

/**
 * Get Auth Session and Require Admin Role
 * @date February 12, 2026 3:30 PM
 * @author Muhammad Haykal
 */
export const requireAdmin = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "admin") {
        redirect("/");
    }

    return session;
};

/**
 * Get Session Role
 * @date February 12, 2026 3:30 PM
 * @author Muhammad Haykal
 */
export const getSessionRole = cache(async () => {
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    return { session, role };
});

/**
 * Get User Accounts
 * @date February 12, 2026 3:30 PM
 * @author Muhammad Haykal
 */
export const getUserAccounts = cache(async () => {
    try {
        const accounts = await auth.api.listUserAccounts({
            headers: await headers(),
        });
        return accounts;
    } catch {
        return [];
    }
});

/**
 * Check if User is Email User
 * @date February 12, 2026 3:30 PM
 * @author Muhammad Haykal
 */
export const isEmailUser = async () => {
    const accounts = await getUserAccounts();
    return accounts.some((account) => account.providerId === "credential");
};
