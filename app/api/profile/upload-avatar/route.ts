import { del, put } from "@vercel/blob";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/config/auth/auth";

export async function POST(request: NextRequest) {
    try {
        // Verify session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
        }

        // Generate unique filename for new avatar
        const filename = `avatars/${session.user.id}-${Date.now()}-${file.name}`;

        // Upload new avatar to Vercel Blob
        const blob = await put(filename, file, {
            access: "public",
            contentType: file.type,
        });

        // Delete previous avatar if it was stored in Vercel Blob
        const currentImage = session.user.image;
        if (
            typeof currentImage === "string" &&
            currentImage.includes("/avatars/") &&
            currentImage.includes("vercel-storage")
        ) {
            try {
                await del(currentImage);
            } catch (error) {
                // Jangan gagalkan upload hanya karena gagal menghapus avatar lama
                console.error("Failed to delete previous avatar from Vercel Blob:", error);
            }
        }

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to upload avatar",
            },
            { status: 500 },
        );
    }
}
