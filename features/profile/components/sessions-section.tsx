"use client";

import { Computer, Globe, LogOut, Monitor, Smartphone, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSessions } from "@/features/profile";
import { formatSessionDate, formatSessionRelativeDate, parseUserAgent } from "@/lib/utils";

function getDeviceIcon(userAgent?: string | null) {
    if (!userAgent) return <Globe className="size-4" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        return <Smartphone className="size-4" />;
    }
    return <Computer className="size-4" />;
}

export function SessionsSection() {
    const {
        isLoading,
        currentSessionData,
        otherSessions,
        revokingIds,
        handleRevokeSession,
        handleRevokeOtherSessions,
    } = useSessions();

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Monitor className="size-4 sm:size-5" />
                        Sesi Aktif
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Kelola perangkat yang telah masuk ke akun Anda. Anda dapat mengakhiri sesi dari perangkat lain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    {isLoading ? (
                        <>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <div className="rounded-lg border border-border bg-muted/50 p-3 sm:p-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Skeleton className="size-4 shrink-0" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-3 w-40" />
                                            <Skeleton className="h-3 w-36" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-8 w-32 sm:w-48" />
                                </div>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2 sm:gap-3 rounded-lg border border-border p-3 sm:p-4">
                                        <Skeleton className="size-4 shrink-0" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-3 w-40" />
                                            <Skeleton className="h-3 w-36" />
                                        </div>
                                        <Skeleton className="size-8 shrink-0 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {currentSessionData && (
                                <div className="space-y-2">
                                    <h3 className="text-xs sm:text-sm font-medium">Sesi Saat Ini</h3>
                                    <div className="rounded-lg border border-border bg-muted/50 p-3 sm:p-4">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="shrink-0 mt-0.5">
                                                {getDeviceIcon(currentSessionData.userAgent)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <p className="font-medium text-sm sm:text-base wrap-break-word">
                                                        {parseUserAgent(currentSessionData.userAgent)}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs">
                                                        Saat ini
                                                    </Badge>
                                                </div>
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all">
                                                    {currentSessionData.ipAddress || "IP tidak tersedia"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Dibuat {formatSessionRelativeDate(currentSessionData.createdAt)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Berakhir {formatSessionDate(currentSessionData.expiresAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {otherSessions.length > 0 && (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                        <h3 className="text-xs sm:text-sm font-medium">Sesi Lainnya</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRevokeOtherSessions}
                                            className="text-destructive hover:text-destructive w-full sm:w-auto text-xs sm:text-sm">
                                            <LogOut className="size-3 sm:size-4 mr-1.5 sm:mr-2" />
                                            <span className="sm:hidden">Hapus Semua</span>
                                            <span className="hidden sm:inline">Hapus Semua Sesi Lainnya</span>
                                        </Button>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        {otherSessions.map((session) => {
                                            const isRevoking = revokingIds.has(session.id);
                                            return (
                                                <div
                                                    key={session.id}
                                                    className="flex items-start gap-2 sm:gap-3 rounded-lg border border-border p-3 sm:p-4">
                                                    <div className="shrink-0 mt-0.5">
                                                        {getDeviceIcon(session.userAgent)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm sm:text-base wrap-break-word">
                                                            {parseUserAgent(session.userAgent)}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all">
                                                            {session.ipAddress || "IP tidak tersedia"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Dibuat {formatSessionRelativeDate(session.createdAt)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Berakhir {formatSessionDate(session.expiresAt)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevokeSession(session.token, session.id)}
                                                        disabled={isRevoking}
                                                        className="text-destructive hover:text-destructive shrink-0">
                                                        {isRevoking ? <Spinner /> : <Trash2 className="size-4" />}
                                                        <span className="sr-only">Hapus sesi</span>
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {otherSessions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Tidak ada sesi aktif lainnya.
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
