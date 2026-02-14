import type { Metadata } from "next";
import { SyaratKetentuanPage } from "@/features/syarat-ketentuan";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Syarat dan Ketentuan",
    description:
        "Syarat dan ketentuan penggunaan platform Reseply. Baca dengan seksama sebelum menggunakan layanan kami.",
    keywords: ["syarat ketentuan", "terms of service", "ketentuan layanan"],
    pathname: "/syarat-ketentuan",
});

export default function SyaratKetentuanRoute() {
    return <SyaratKetentuanPage />;
}
