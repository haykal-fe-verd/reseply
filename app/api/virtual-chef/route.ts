/**
 * Virtual Chef API Route
 * Chat dengan AI model via Open Router (streaming).
 * @date February 15, 2026
 * @author Muhammad Haykal
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText } from "ai";

const OPEN_ROUTER_MODEL = "google/gemini-2.0-flash-001";

function getOpenRouter() {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey?.trim()) {
        return null;
    }
    return createOpenRouter({ apiKey });
}

const SYSTEM_PROMPT = `Kamu adalah Virtual Chef AI, asisten kuliner pintar dari Reseply yang ahli dalam masakan Indonesia dan nusantara.

Karakteristik kamu:
- Ramah, hangat, dan antusias tentang kuliner Indonesia
- Memiliki pengetahuan mendalam tentang resep tradisional dan modern Indonesia
- Bisa berbicara dalam Bahasa Indonesia yang natural dan santai
- Suka berbagi tips dan trik memasak
- Selalu memberikan jawaban yang informatif dan mudah dipahami

Kemampuan kamu:
1. Memberikan rekomendasi resep berdasarkan bahan yang tersedia
2. Menjelaskan langkah-langkah memasak dengan detail
3. Memberikan tips dan trik memasak profesional
4. Menyarankan substitusi bahan jika ada yang tidak tersedia
5. Membantu perencanaan menu harian/mingguan
6. Menjawab pertanyaan seputar nutrisi dan kesehatan makanan
7. Berbagi sejarah dan cerita di balik masakan tradisional

Panduan respons:
- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup 🍳👨‍🍳
- Jika ditanya resep, berikan langkah-langkah yang jelas dan terstruktur
- Selalu tanyakan jika ada yang kurang jelas dari pertanyaan pengguna
- Jangan ragu untuk menyarankan variasi atau modifikasi resep
- Berikan estimasi waktu memasak jika relevan

BATASAN PENTING:
Kamu HANYA boleh menjawab pertanyaan yang berkaitan dengan:
- Resep masakan dan cara memasak
- Bahan-bahan makanan dan substitusinya
- Tips dan trik memasak
- Nutrisi dan kesehatan makanan
- Peralatan dapur dan cara penggunaannya
- Sejarah dan budaya kuliner
- Perencanaan menu

Jika pengguna bertanya tentang topik di luar kuliner/masakan/makanan (seperti politik, teknologi, matematika, sejarah non-kuliner, dll), tolak dengan sopan dan arahkan kembali ke topik kuliner. Contoh respons penolakan:
"Maaf, saya adalah Virtual Chef yang fokus membantu seputar masakan dan kuliner. Saya tidak bisa menjawab pertanyaan itu. Tapi kalau kamu mau tanya tentang resep, tips memasak, atau apapun seputar makanan, saya siap membantu! 🍳"

Ingat: Kamu adalah chef virtual yang ramah dan helpful. Tujuanmu adalah membantu pengguna menikmati pengalaman memasak yang menyenangkan!`;

export async function POST(request: Request) {
    const openrouter = getOpenRouter();
    if (!openrouter) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Layanan Virtual Chef belum dikonfigurasi (OPEN_ROUTER_API_KEY)",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } },
        );
    }

    let body: { messages?: unknown };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ success: false, message: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Messages are required",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    try {
        const modelMessages = await convertToModelMessages(messages);
        const chatModel = openrouter.chat(OPEN_ROUTER_MODEL);

        const result = streamText({
            model: chatModel,
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            temperature: 0.7,
            maxOutputTokens: 2048,
            abortSignal: request.signal,
        });

        const streamResponse = result.toTextStreamResponse();

        // Wrap stream agar error saat client putus (ECONNRESET/abort) tidak jadi 500
        const body = streamResponse.body;
        if (!body) {
            return streamResponse;
        }

        const wrappedStream = new ReadableStream({
            async start(controller) {
                const reader = body.getReader();
                try {
                    // eslint-disable-next-line no-constant-condition
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        controller.enqueue(value);
                    }
                    controller.close();
                } catch (err) {
                    const code = err instanceof Error && "code" in err ? (err as NodeJS.ErrnoException).code : null;
                    if (
                        code === "ECONNRESET" ||
                        code === "EPIPE" ||
                        code === "ECONNREFUSED" ||
                        request.signal?.aborted ||
                        (err instanceof Error && (err.name === "AbortError" || err.message?.includes("terminated")))
                    ) {
                        // Client putus, request di-abort, atau upstream putus — tutup stream dengan bersih
                        try {
                            controller.close();
                        } catch {
                            // ignore
                        }
                        return;
                    }
                    console.error("Virtual Chef stream error:", err);
                    try {
                        controller.error(err);
                    } catch {
                        controller.close();
                    }
                }
            },
            cancel() {
                // Saat client cancel (navigasi/refresh), stream di-cancel — tidak perlu throw
            },
        });

        return new Response(wrappedStream, {
            status: streamResponse.status,
            headers: streamResponse.headers,
        });
    } catch (error) {
        if (request.signal?.aborted) {
            return new Response(null, { status: 499 });
        }
        console.error("Virtual Chef API Error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Terjadi kesalahan saat memproses permintaan Anda",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}
