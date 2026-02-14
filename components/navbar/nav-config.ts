import { BookOpen, FolderOpen, Heart, type LucideIcon, UserIcon, Users } from "lucide-react";

export const SCROLL_THRESHOLD = 8;

export const NAV_ITEMS: { label: string; href: string }[] = [
    { label: "Beranda", href: "/" },
    { label: "Resep", href: "/resep" },
    { label: "Virtual Chef", href: "/virtual-chef" },
    { label: "Tentang Kami", href: "/tentang" },
];

export const USER_NAV_ITEMS: {
    label: string;
    href: string;
    icon: LucideIcon;
}[] = [
    { label: "Profile", href: "/profile", icon: UserIcon },
    { label: "Favorit", href: "/favorites", icon: Heart },
];

export const ADMIN_NAV_ITEMS: {
    label: string;
    href: string;
    icon: LucideIcon;
}[] = [
    { label: "Kategori", href: "/categories", icon: FolderOpen },
    { label: "Resep", href: "/recipes", icon: BookOpen },
    { label: "Pengguna", href: "/users", icon: Users },
];

export function isActivePath(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export type NavItem = (typeof NAV_ITEMS)[number];
export type UserNavItem = (typeof USER_NAV_ITEMS)[number];
export type AdminNavItem = (typeof ADMIN_NAV_ITEMS)[number];
