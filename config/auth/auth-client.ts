/**
 * Auth Client Configuration
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL as string,
    plugins: [
        adminClient(),
        twoFactorClient({
            onTwoFactorRedirect: () => {
                window.location.href = "/two-factor";
            },
        }),
        passkeyClient(),
    ],
});
