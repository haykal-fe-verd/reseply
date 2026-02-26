"use client";

import { motion } from "framer-motion";
import { FolderPlus, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
    CreateCollectionDialog,
    SortableCollectionCardItem,
    SortableCollectionsGrid,
    useMyCollections,
    useUpdateCollectionsOrder,
} from "@/features/favorites";

export function CollectionsList() {
    const router = useRouter();
    const [createOpen, setCreateOpen] = useState(false);
    const { data, isLoading } = useMyCollections();
    const { mutate: updateOrder } = useUpdateCollectionsOrder();

    const collections = data?.data ?? [];

    const handleReorder = useCallback(
        (collectionIds: string[]) => {
            updateOrder(collectionIds);
        },
        [updateOrder],
    );

    const handleCreateSuccess = useCallback(
        (slug: string) => {
            router.push(`/koleksi/${slug}`);
        },
        [router],
    );

    if (isLoading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="min-h-[8.5rem] animate-pulse rounded-xl border border-border/60 bg-muted/50"
                    />
                ))}
            </div>
        );
    }

    if (collections.length === 0) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Empty className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Library className="size-8 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>Belum ada koleksi</EmptyTitle>
                            <EmptyDescription>
                                Buat daftar resep kustom (mis. &quot;Sarapan sehat&quot;, &quot;Untuk
                                arisan&quot;), isi resep dari favorit, lalu bagikan link koleksi.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                size="lg"
                                className="gap-2"
                                onClick={() => setCreateOpen(true)}
                                aria-label="Buat koleksi pertama"
                            >
                                <FolderPlus className="size-5" />
                                Buat Koleksi Pertama
                            </Button>
                        </EmptyContent>
                    </Empty>
                </motion.div>
                <CreateCollectionDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    onSuccess={handleCreateSuccess}
                />
            </>
        );
    }

    return (
        <>
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {collections.length} {collections.length === 1 ? "koleksi" : "koleksi"}
                    </p>
                    {collections.length > 1 && (
                        <p className="text-xs text-muted-foreground/80">
                            Tahan ikon grip lalu tarik untuk mengubah urutan
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setCreateOpen(true)}
                    aria-label="Buat koleksi baru"
                >
                    <FolderPlus className="size-4" />
                    Buat Koleksi
                </Button>
            </div>
            <SortableCollectionsGrid collections={collections} onReorder={handleReorder}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {collections.map((collection, index) => (
                        <SortableCollectionCardItem
                            key={collection.id}
                            collection={collection}
                            index={index}
                        />
                    ))}
                </div>
            </SortableCollectionsGrid>
            <CreateCollectionDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
}
