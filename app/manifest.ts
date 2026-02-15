import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: siteConfig.name,
        description: siteConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        orientation: "portrait",
        lang: siteConfig.locale || "id",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/logo-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/logo-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        scope: "/",
        id: "/manifest.webmanifest",
        prefer_related_applications: false,
    };
}
