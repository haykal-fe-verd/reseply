import { GithubIcon, InstagramIcon, type LucideIcon, YoutubeIcon } from "lucide-react";

export const NAVIGATION_LINKS: { label: string; href: string }[] = [
    { label: "Beranda", href: "/" },
    { label: "Resep", href: "/resep" },
    { label: "Virtual Chef", href: "/virtual-chef" },
    { label: "Tentang Kami", href: "/tentang" },
];

export const HELP_LINKS: { label: string; href: string }[] = [
    { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
];

export const SOCIAL_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "GitHub", href: "https://github.com/haykal-fe-verd/", icon: GithubIcon },
    { label: "Instagram", href: "https://www.instagram.com/kidz.eroll", icon: InstagramIcon },
    { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
];
