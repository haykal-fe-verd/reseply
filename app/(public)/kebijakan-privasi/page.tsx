import type { Metadata } from "next";
import { KebijakanPrivasiPage } from "@/features/kebijakan-privasi";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Kebijakan Privasi",
    description:
        "Kebijakan privasi Reseply menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
    keywords: ["kebijakan privasi", "privasi data", "perlindungan data"],
    pathname: "/kebijakan-privasi",
});

export default function KebijakanPrivasiRoute() {
    return <KebijakanPrivasiPage />;
}
