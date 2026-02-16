/**
 * Virtual Chef Chat Server Actions
 * @date February 16, 2026
 * @author Muhammad Haykal
 */

"use server";

import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
// Types
export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: ChatMessage[];
}

export interface ConversationListItem {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    preview: string | null;
}

// Response Types
export interface SaveConversationResponse {
    success: boolean;
    conversationId?: string;
    message?: string;
}

export interface GetConversationsResponse {
    success: boolean;
    data: ConversationListItem[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface GetConversationResponse {
    success: boolean;
    data?: Conversation;
    message?: string;
}

export interface DeleteConversationResponse {
    success: boolean;
    message: string;
}

/**
 * Save a new conversation
 */
export async function saveConversation(params: {
    title: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<SaveConversationResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Anda harus masuk terlebih dahulu untuk menyimpan percakapan.",
            };
        }

        const { title, messages } = params;

        if (!title.trim()) {
            return {
                success: false,
                message: "Judul percakapan tidak boleh kosong.",
            };
        }

        if (!messages || messages.length === 0) {
            return {
                success: false,
                message: "Tidak ada pesan untuk disimpan.",
            };
        }

        // Create conversation with messages
        const conversation = await prisma.virtualChefConversation.create({
            data: {
                title: title.trim(),
                userId: session.user.id,
                messages: {
                    create: messages.map((msg) => ({
                        role: msg.role === "user" ? "USER" : "ASSISTANT",
                        content: msg.content,
                    })),
                },
            },
        });

        return {
            success: true,
            conversationId: conversation.id,
            message: "Percakapan berhasil disimpan.",
        };
    } catch (error) {
        console.error("Error saving conversation:", error);
        return {
            success: false,
            message: "Gagal menyimpan percakapan.",
        };
    }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(
    params: {
        page?: number;
        limit?: number;
        search?: string;
    } = {},
): Promise<GetConversationsResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                data: [],
            };
        }

        const { page = 1, limit = 10, search } = params;
        const skip = (page - 1) * limit;

        // Build where clause
        const where = {
            userId: session.user.id,
            ...(search && {
                title: { contains: search, mode: "insensitive" as const },
            }),
        };

        // Get total count
        const total = await prisma.virtualChefConversation.count({ where });

        // Get conversations with message count and preview
        const conversations = await prisma.virtualChefConversation.findMany({
            where,
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    take: 1,
                },
                _count: {
                    select: { messages: true },
                },
            },
        });

        const data: ConversationListItem[] = conversations.map((conv) => ({
            id: conv.id,
            title: conv.title,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv._count.messages,
            preview: conv.messages[0]?.content?.slice(0, 100) ?? null,
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error("Error getting conversations:", error);
        return {
            success: false,
            data: [],
        };
    }
}

/**
 * Get a single conversation with all messages
 */
export async function getConversation(conversationId: string): Promise<GetConversationResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Anda harus masuk terlebih dahulu.",
            };
        }

        const conversation = await prisma.virtualChefConversation.findFirst({
            where: {
                id: conversationId,
                userId: session.user.id,
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!conversation) {
            return {
                success: false,
                message: "Percakapan tidak ditemukan.",
            };
        }

        const data: Conversation = {
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            messages: conversation.messages.map((msg) => ({
                id: msg.id,
                role: msg.role === "USER" ? "user" : "assistant",
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        };

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error getting conversation:", error);
        return {
            success: false,
            message: "Gagal mengambil percakapan.",
        };
    }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<DeleteConversationResponse> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Anda harus masuk terlebih dahulu.",
            };
        }

        // Check if conversation belongs to user
        const conversation = await prisma.virtualChefConversation.findFirst({
            where: {
                id: conversationId,
                userId: session.user.id,
            },
        });

        if (!conversation) {
            return {
                success: false,
                message: "Percakapan tidak ditemukan.",
            };
        }

        // Delete conversation (messages will be deleted via cascade)
        await prisma.virtualChefConversation.delete({
            where: { id: conversationId },
        });

        return {
            success: true,
            message: "Percakapan berhasil dihapus.",
        };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return {
            success: false,
            message: "Gagal menghapus percakapan.",
        };
    }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
    conversationId: string,
    title: string,
): Promise<{ success: boolean; message: string }> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Anda harus masuk terlebih dahulu.",
            };
        }

        if (!title.trim()) {
            return {
                success: false,
                message: "Judul tidak boleh kosong.",
            };
        }

        // Check if conversation belongs to user
        const conversation = await prisma.virtualChefConversation.findFirst({
            where: {
                id: conversationId,
                userId: session.user.id,
            },
        });

        if (!conversation) {
            return {
                success: false,
                message: "Percakapan tidak ditemukan.",
            };
        }

        await prisma.virtualChefConversation.update({
            where: { id: conversationId },
            data: { title: title.trim() },
        });

        return {
            success: true,
            message: "Judul percakapan berhasil diperbarui.",
        };
    } catch (error) {
        console.error("Error updating conversation title:", error);
        return {
            success: false,
            message: "Gagal memperbarui judul percakapan.",
        };
    }
}

/**
 * Get conversations count for current user
 */
export async function getConversationsCount(): Promise<{ success: boolean; count: number }> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: true,
                count: 0,
            };
        }

        const count = await prisma.virtualChefConversation.count({
            where: { userId: session.user.id },
        });

        return {
            success: true,
            count,
        };
    } catch (error) {
        console.error("Error getting conversations count:", error);
        return {
            success: false,
            count: 0,
        };
    }
}
