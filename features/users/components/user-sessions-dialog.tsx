/**
 * User Sessions Dialog Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { Laptop, LogOut, Smartphone } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { type User, type UserSession, useTerminateUserSessions, useUser } from "@/features/users";

interface UserSessionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function UserSessionsDialog({ open, onOpenChange, user }: UserSessionsDialogProps) {
    const terminateMutation = useTerminateUserSessions();

    // Fetch full user data with sessions
    const { data: userData, isLoading } = useUser(user?.id ?? "");
    const sessions: UserSession[] = userData?.data?.sessions ?? [];

    const handleTerminateAll = async () => {
        if (!user) return;

        try {
            await terminateMutation.mutateAsync(user.id);
            onOpenChange(false);
        } catch {
            // Error handled by mutation
        }
    };

    const parseUserAgent = (userAgent: string | null): { device: string; browser: string } => {
        if (!userAgent) return { device: "Unknown", browser: "Unknown" };

        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
        const device = isMobile ? "Mobile" : "Desktop";

        let browser = "Unknown";
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
            browser = "Chrome";
        } else if (userAgent.includes("Firefox")) {
            browser = "Firefox";
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
            browser = "Safari";
        } else if (userAgent.includes("Edg")) {
            browser = "Edge";
        } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
            browser = "Opera";
        }

        return { device, browser };
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Sesi Aktif</DialogTitle>
                    <DialogDescription>
                        Kelola sesi aktif untuk <span className="font-semibold">{user.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-80">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner className="h-6 w-6" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">Tidak ada sesi aktif.</div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session, index) => {
                                const { device, browser } = parseUserAgent(session.userAgent);
                                const expiresAt = new Date(session.expiresAt);
                                const createdAt = new Date(session.createdAt);
                                const isExpired = expiresAt < new Date();

                                return (
                                    <React.Fragment key={session.id}>
                                        {index > 0 && <Separator />}
                                        <div className="flex items-start gap-3 py-2">
                                            <div className="mt-0.5">
                                                {device === "Mobile" ? (
                                                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <Laptop className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{browser}</span>
                                                    <Badge
                                                        variant={isExpired ? "destructive" : "outline"}
                                                        className="text-xs">
                                                        {isExpired ? "Kadaluarsa" : "Aktif"}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {session.ipAddress || "IP tidak diketahui"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Dibuat:{" "}
                                                    {createdAt.toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={terminateMutation.isPending}>
                        Tutup
                    </Button>
                    {sessions.length > 0 && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleTerminateAll}
                            disabled={terminateMutation.isPending}>
                            {terminateMutation.isPending && <Spinner className="mr-2" />}
                            <LogOut className="mr-2 h-4 w-4" />
                            Akhiri Semua Sesi
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
