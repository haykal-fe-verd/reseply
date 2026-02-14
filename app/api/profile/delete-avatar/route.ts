import { del } from "@vercel/blob";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/config/auth/auth";

export async function DELETE(request: NextRequest) {
    try {
        // Verify session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { imageUrl } = await request.json();

        if (!imageUrl || typeof imageUrl !== "string") {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        // Only delete if it's a Vercel Blob URL
        if (imageUrl.includes("/avatars/") && imageUrl.includes("vercel-storage")) {
            try {
                await del(imageUrl);
                return NextResponse.json({ success: true });
            } catch (error) {
                console.error("Failed to delete avatar from Vercel Blob:", error);
                return NextResponse.json(
                    {
                        error: error instanceof Error ? error.message : "Failed to delete avatar",
                    },
                    { status: 500 },
                );
            }
        }

        // If not a Vercel Blob URL, return success (might be external URL)
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting avatar:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to delete avatar",
            },
            { status: 500 },
        );
    }
}
