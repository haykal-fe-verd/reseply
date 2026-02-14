/**
 * Tentang Kami Page
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { AboutPage } from "@/features/about";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Tentang Kami",
    description:
        "Pelajari lebih lanjut tentang Reseply, platform resep masakan Indonesia terlengkap. Misi kami melestarikan kuliner nusantara.",
    keywords: ["tentang reseply", "platform resep", "kuliner indonesia"],
    pathname: "/tentang",
});

export default function TentangPage() {
    return <AboutPage />;
}
