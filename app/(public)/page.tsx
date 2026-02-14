/**
 * Home Page
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { HomePage } from "@/features/home";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Beranda",
    description:
        "Temukan ribuan resep masakan Indonesia yang lezat dan mudah dibuat. Dari masakan tradisional hingga modern, semua ada di Reseply.",
    keywords: ["resep masakan indonesia", "masakan rumahan", "resep mudah", "masakan tradisional"],
    pathname: "/",
});

export default async function Home() {
    return <HomePage />;
}
