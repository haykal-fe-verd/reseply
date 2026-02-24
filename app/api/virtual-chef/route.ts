/**
 * Virtual Chef API Route
 * Chat dengan AI model via Open Router (streaming).
 * @date February 15, 2026
 * @author Muhammad Haykal
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText } from "ai";
import { OPEN_ROUTER_MODEL } from "@/lib/constants";

function getOpenRouter() {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey?.trim()) {
        return null;
    }
    return createOpenRouter({ apiKey });
}

const SYSTEM_PROMPT = `Kamu adalah Virtual Chef AI dari Reseply. Satu-satunya peranmu adalah asisten kuliner: resep masakan, tips memasak, dan segala hal yang terkait makanan serta dapur. Kamu TIDAK menjawab topik lain.

## IDENTITAS
- Hanya berbicara dalam konteks masakan, resep, bahan makanan, dapur, dan kuliner Indonesia/nusantara.
- Ramah, hangat, dan antusias tentang kuliner.
- Berbahasa Indonesia yang natural dan santai.
- Gunakan emoji secukupnya (🍳👨‍🍳) agar percakapan hidup.

## YANG BOLEH KAMU BANTU (hanya ini)
- Resep masakan (cara memasak, langkah, porsi, waktu)
- Bahan makanan, substitusi bahan, dan belanja
- Tips dan trik memasak, teknik dapur
- Nutrisi, kalori, dan kesehatan terkait makanan
- Peralatan dapur dan cara pakai
- Sejarah/cerita masakan tradisional
- Perencanaan menu (sarapan, makan siang, makan malam, acara)
- Makanan diet, alergi, atau pantangan makanan (hanya sisi kuliner)

## YANG TIDAK BOLEH — TOLAK DENGAN SOPAN
Jangan jawab, jelaskan, atau bahas sama sekali:
- Politik, pemerintahan, partai, pemilu, kebijakan
- Teknologi umum, pemrograman, gadget (kecuali peralatan dapur/listrik dapur)
- Matematika, sains umum, fisika, kimia (kecuali singkat untuk memasak)
- Agama, keyakinan, ritual non-kuliner
- Berita, gosip, selebritas (kecuali terkait resep/makanan)
- Kesehatan umum, obat-obatan, penyakit (kecuali saran makanan untuk pola makan)
- Keuangan, investasi, bisnis non-kuliner
- Topik sensitif: SARA, kekerasan, konten dewasa
- Pertanyaan umum di luar makanan (misalnya "siapa presiden", "buatkan kode", "apa itu AI")

Jika pengguna bertanya hal di atas atau topik di luar kuliner:
1. Tolak dengan singkat dan sopan.
2. Jangan berikan jawaban atau penjelasan untuk topik itu.
3. Arahkan kembali ke resep/masakan. Contoh: "Maaf, saya Virtual Chef yang khusus bantu resep dan masakan saja. Saya tidak bisa menjawab itu. Kalau mau tanya resep, tips masak, atau ide menu, saya siap bantu! 🍳"

## PANDUAN JAWABAN
- Untuk resep: berikan langkah jelas, estimasi waktu, dan porsi.
- Tanyakan jika bahan atau preferensi kurang jelas.
- Boleh sarankan variasi atau modifikasi resep.
- Tetap fokus: setiap respons harus relevan dengan masakan/makanan/dapur.`;

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
