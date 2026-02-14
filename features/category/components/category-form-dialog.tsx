/**
 * Category Form Dialog Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
    type Category,
    type CategoryType,
    createCategorySchema,
    useCreateCategory,
    useUpdateCategory,
} from "@/features/category";

const CATEGORY_TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
    { value: "DISH", label: "Jenis Hidangan" },
    { value: "CUISINE", label: "Masakan" },
    { value: "DIET", label: "Diet" },
];

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
    const isEditing = !!category;

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const form = useForm({
        defaultValues: {
            name: category?.name ?? "",
            type: (category?.type ?? "DISH") as CategoryType,
        },
        validators: {
            onSubmit: createCategorySchema,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEditing && category) {
                    await updateMutation.mutateAsync({ id: category.id, values: value });
                } else {
                    await createMutation.mutateAsync(value);
                }
                onOpenChange(false);
                form.reset();
            } catch {
                // Error handled by mutation
            }
        },
    });

    // Reset form when dialog opens/closes or category changes
    React.useEffect(() => {
        if (open) {
            form.reset();
            form.setFieldValue("name", category?.name ?? "");
            form.setFieldValue("type", (category?.type ?? "DISH") as CategoryType);
        }
    }, [open, category, form]);

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Ubah informasi kategori di bawah ini."
                            : "Isi form di bawah ini untuk menambahkan kategori baru."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-4">
                    <form.Field
                        name="name"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Nama Kategori</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Masukkan nama kategori"
                                        aria-invalid={isInvalid}
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />

                    <form.Field
                        name="type"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Tipe Kategori</FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value: CategoryType) => field.handleChange(value)}>
                                        <SelectTrigger id={field.name} className="w-full">
                                            <SelectValue placeholder="Pilih tipe kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORY_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />

                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isPending || isSubmitting}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={!canSubmit || isPending || isSubmitting}>
                                    {(isPending || isSubmitting) && <Spinner className="mr-2" />}
                                    {isEditing ? "Simpan" : "Tambah"}
                                </Button>
                            </DialogFooter>
                        )}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
