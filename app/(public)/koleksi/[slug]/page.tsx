import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { CollectionDetailPage } from "@/features/favorites";
import { getCollectionBySlug } from "@/features/favorites/collections.action";

interface KoleksiPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: KoleksiPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getCollectionBySlug(slug);

    if (!result.success || !result.data) {
        return {
            title: "Koleksi Tidak Ditemukan",
            description: "Koleksi resep yang Anda cari tidak ditemukan.",
        };
    }

    const collection = result.data;
    const title = collection.name;
    const description = `Koleksi resep: ${collection.name}. ${collection.recipeCount} resep.${collection.ownerName ? ` Oleh ${collection.ownerName}.` : ""}`;
    const url = `${siteConfig.url}/koleksi/${collection.slug}`;

    return {
        title: `${title} | Koleksi Resep`,
        description,
        keywords: [title.toLowerCase(), "koleksi resep", "resep", "reseply"],
        openGraph: {
            locale: siteConfig.locale,
            url,
            title: `${title} | ${siteConfig.name}`,
            description,
            siteName: siteConfig.name,
        },
        alternates: {
            canonical: url,
        },
    };
}

export default async function KoleksiPage({ params }: KoleksiPageProps) {
    const { slug } = await params;
    if (!slug) notFound();

    return <CollectionDetailPage slug={slug} />;
}
