/**
 * Tanstack Query Configuration
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});
