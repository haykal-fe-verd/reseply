"use client";

import {
    DndContext,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { type CollectionItem, CollectionCard } from "@/features/favorites";
import { cn } from "@/lib/utils";

interface SortableCollectionCardProps {
    collection: CollectionItem;
    index: number;
}

function SortableCollectionCardItem({ collection, index }: SortableCollectionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: collection.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="min-w-0">
            {isDragging ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-[7.5rem] flex-col rounded-xl border-2 border-dashed border-primary/30 bg-muted/30 p-5"
                >
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        Lepaskan di sini
                    </div>
                </motion.div>
            ) : (
                <CollectionCard
                    collection={collection}
                    index={index}
                    dragHandle={{
                        attributes: attributes as unknown as Record<string, unknown>,
                        listeners: listeners as unknown as Record<string, unknown>,
                    }}
                />
            )}
        </div>
    );
}

function DragOverlayCard({ collection }: { collection: CollectionItem }) {
    return (
        <motion.div
            initial={{ scale: 0.96, opacity: 0.9 }}
            animate={{ scale: 1.02, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className={cn(
                "flex flex-col rounded-xl border-2 border-primary/40 bg-card p-5 shadow-2xl shadow-primary/10",
                "ring-2 ring-primary/20",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-foreground">
                        {collection.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {collection.recipeCount}{" "}
                        {collection.recipeCount === 1 ? "resep" : "resep"}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Share2 className="size-3.5" />
                <span>Bagikan via link</span>
            </div>
        </motion.div>
    );
}

interface SortableCollectionsGridProps {
    collections: CollectionItem[];
    onReorder: (collectionIds: string[]) => void;
    children: React.ReactNode;
}

export function SortableCollectionsGrid({
    collections,
    onReorder,
    children,
}: SortableCollectionsGridProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const activeCollection = useMemo(
        () => (activeId ? collections.find((c) => c.id === activeId) : null),
        [activeId, collections],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const oldIndex = collections.findIndex((c) => c.id === active.id);
        const newIndex = collections.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...collections];
        const [removed] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, removed);
        onReorder(reordered.map((c) => c.id));
    };

    return (
        <DndContext
            sensors={sensors}
            modifiers={[restrictToParentElement]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={collections.map((c) => c.id)} strategy={rectSortingStrategy}>
                {children}
            </SortableContext>
            <DragOverlay dropAnimation={null}>
                {activeCollection ? (
                    <div className="cursor-grabbing opacity-95">
                        <DragOverlayCard collection={activeCollection} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export { SortableCollectionCardItem };
