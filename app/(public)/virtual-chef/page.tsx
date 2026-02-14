/**
 * Virtual Chef Page
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { VirtualChefPage } from "@/features/virtual-chef";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Virtual Chef AI",
    description:
        "Tanya resep dan tips memasak kepada Virtual Chef AI. Asisten dapur pintar yang siap membantu Anda memasak hidangan lezat.",
    keywords: ["virtual chef", "ai memasak", "asisten dapur", "chatbot resep", "tips memasak"],
    pathname: "/virtual-chef",
});

export default async function VirtualChefRoute() {
    return <VirtualChefPage />;
}
