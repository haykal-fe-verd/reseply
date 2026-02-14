import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/resep", "/tentang", "/virtual-chef"],
                disallow: [
                    "/api/",
                    "/sign-in",
                    "/sign-up",
                    "/forgot-password",
                    "/reset-password",
                    "/two-factor",
                    "/profile",
                    "/favorites",
                    "/categories",
                    "/recipes",
                    "/users",
                ],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
