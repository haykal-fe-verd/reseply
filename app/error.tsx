/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: <Error global> */

"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCw, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
            {/* Background decoration */}
            <motion.div
                className="pointer-events-none fixed inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}>
                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/5 blur-3xl" />
            </motion.div>

            {/* Icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="relative mb-6">
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-destructive/20 blur-xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                <div className="relative flex size-20 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="size-10 text-destructive" />
                </div>
            </motion.div>

            {/* Error Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md">
                <Card className="border-destructive/20 shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Terjadi Kesalahan</CardTitle>
                        <CardDescription>Maaf, terjadi kesalahan saat memuat halaman ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Error details */}
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm font-medium text-muted-foreground">Detail Error:</p>
                            <p className="mt-1 break-all text-sm text-foreground">{error.message || "Unknown error"}</p>
                            {error.digest && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Error ID: <code className="rounded bg-muted px-1 py-0.5">{error.digest}</code>
                                </p>
                            )}
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-medium">Yang bisa Anda lakukan:</p>
                            <ul className="list-inside list-disc space-y-1 pl-2">
                                <li>Muat ulang halaman ini</li>
                                <li>Kembali ke halaman sebelumnya</li>
                                <li>Pergi ke beranda</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={() => reset()} className="w-full gap-2 sm:w-auto">
                            <RefreshCw className="size-4" />
                            Coba Lagi
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="w-full gap-2 sm:w-auto">
                            <RotateCcw className="size-4" />
                            Muat Ulang
                        </Button>
                        <Button variant="secondary" asChild className="w-full gap-2 sm:w-auto">
                            <Link href="/">
                                <Home className="size-4" />
                                Beranda
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Additional help */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 text-center text-sm text-muted-foreground">
                Jika masalah terus berlanjut, silakan hubungi{" "}
                <Link href="/tentang" className="text-primary underline-offset-4 hover:underline">
                    tim support
                </Link>
                .
            </motion.p>
        </div>
    );
}
