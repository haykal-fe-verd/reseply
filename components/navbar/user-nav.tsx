"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_NAV_ITEMS, USER_NAV_ITEMS } from "@/components/navbar/nav-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/config/auth/auth-client";
import { getInitials } from "@/lib/utils";

export interface UserNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    role?: string | null;
}

export function UserNav({ user, role }: UserNavProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isAdmin = role === "admin";

    const handleSignOut = async () => {
        await authClient.signOut();
        // Clear favorites cache on logout for better UX
        queryClient.removeQueries({ queryKey: ["favorites"] });
        queryClient.removeQueries({ queryKey: ["favorite-ids"] });
        queryClient.removeQueries({ queryKey: ["favorites-count"] });
        queryClient.removeQueries({ queryKey: ["favorite-categories"] });
        router.push("/sign-in");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="lg"
                    aria-label="Menu akun"
                    className="flex max-w-55 items-center gap-2 px-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
                        <AvatarFallback className="rounded-lg">{getInitials(user.name ?? "Pengguna")}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-30 truncate text-left font-medium">{user.name ?? "Pengguna"}</span>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
                            <AvatarFallback className="rounded-lg">
                                {getInitials(user.name ?? "Pengguna")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name ?? "Pengguna"}</span>
                            {user.email && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {USER_NAV_ITEMS.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href}>
                                <item.icon className="size-4" aria-hidden />
                                {item.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                {isAdmin && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Admin</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            {ADMIN_NAV_ITEMS.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href}>
                                        <item.icon className="size-4" aria-hidden />
                                        {item.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-4" aria-hidden />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
