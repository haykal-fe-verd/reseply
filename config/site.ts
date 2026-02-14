/**
 * Site Configuration
 * Centralized SEO and site metadata configuration
 * @date February 15, 2026
 * @author Muhammad Haykal
 */

export const siteConfig = {
    name: "Reseply",
    title: "Reseply - Jelajahi Cita Rasa Kuliner Indonesia",
    description:
        "Temukan ribuan resep masakan nusantara yang autentik. Dari hidangan tradisional hingga kreasi modern, setiap resep dirancang untuk memanjakan lidah Anda.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://reseply.kidzeroll.space",
    ogImage: "/og-image.png",
    author: {
        name: "Kidzeroll",
        url: "https://kidzeroll.space",
    },
    keywords: [
        "resep masakan indonesia",
        "resep nusantara",
        "kuliner indonesia",
        "resep tradisional",
        "masakan rumahan",
        "tips memasak",
        "resep ayam",
        "resep rendang",
        "resep soto",
        "resep sambal",
        "makanan indonesia",
        "cara memasak",
        "bahan masakan",
        "bumbu dapur",
        "virtual chef",
        "ai kuliner",
    ],
    links: {
        github: "https://github.com/kidzeroll/reseply",
    },
    creator: "@kidzeroll",
    locale: "id_ID",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
} as const;

export type SiteConfig = typeof siteConfig;
