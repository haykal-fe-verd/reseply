import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const pages = ["", "/about", "/resep", "/syarat-ketentuan", "/kebijakan-privasi", "/tentang", "/virtual-chef"];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return pages.map((path) => ({
        url: `${siteConfig.url}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "monthly" : "yearly",
        priority: path === "" ? 1 : 0.7,
    }));
}
