/**
 * Recipe Form Dialog Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { GripVertical, Plus, Trash2 } from "lucide-react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/features/category";
import {
    type IngredientSchema,
    type InstructionSchema,
    type Recipe,
    useCreateRecipe,
    useRecipe,
    useUpdateRecipe,
} from "@/features/recipes";

interface RecipeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe?: Recipe | null;
}

export function RecipeFormDialog({ open, onOpenChange, recipe }: RecipeFormDialogProps) {
    const isEditing = !!recipe;

    const createMutation = useCreateRecipe();
    const updateMutation = useUpdateRecipe();
    const { data: categoriesData } = useCategories({ limit: 100 });

    // Fetch full recipe data when editing
    const { data: fullRecipeData, isLoading: isLoadingRecipe } = useRecipe(recipe?.id ?? "");
    const fullRecipe = isEditing ? fullRecipeData?.data : null;

    // Track unique keys for dynamic list items
    const ingredientKeyRef = React.useRef(0);
    const instructionKeyRef = React.useRef(0);
    const [ingredientKeys, setIngredientKeys] = React.useState<string[]>([]);
    const [instructionKeys, setInstructionKeys] = React.useState<string[]>([]);

    const form = useForm({
        defaultValues: {
            title: recipe?.title ?? "",
            description: recipe?.description ?? "",
            imageUrl: recipe?.imageUrl ?? "",
            prepMinutes: recipe?.prepMinutes ?? (null as number | null),
            cookMinutes: recipe?.cookMinutes ?? (null as number | null),
            servings: recipe?.servings ?? (null as number | null),
            ingredients: (recipe?.ingredients?.map((ing) => ({
                name: ing.name,
                amount: ing.amount ?? "",
                unit: ing.unit ?? "",
                order: ing.order,
            })) ?? []) as IngredientSchema[],
            instructions: (recipe?.instructions?.map((inst) => ({
                stepNumber: inst.stepNumber,
                content: inst.content,
            })) ?? []) as InstructionSchema[],
            categoryIds: (recipe?.categories?.map((c) => c.categoryId) ?? []) as string[],
        },
        onSubmit: async ({ value }) => {
            try {
                const submitData = {
                    ...value,
                    description: value.description || null,
                    imageUrl: value.imageUrl || null,
                    prepMinutes: value.prepMinutes || null,
                    cookMinutes: value.cookMinutes || null,
                    servings: value.servings || null,
                    ingredients: value.ingredients.length > 0 ? value.ingredients : undefined,
                    instructions: value.instructions.length > 0 ? value.instructions : undefined,
                    categoryIds: value.categoryIds.length > 0 ? value.categoryIds : undefined,
                };

                if (isEditing && recipe) {
                    await updateMutation.mutateAsync({
                        id: recipe.id,
                        values: submitData,
                    });
                } else {
                    await createMutation.mutateAsync(submitData);
                }
                onOpenChange(false);
                form.reset();
            } catch {
                // Error handled by mutation
            }
        },
    });

    // Reset form when dialog opens/closes or recipe changes
    React.useEffect(() => {
        if (open) {
            // For editing, wait until full recipe data is loaded
            if (isEditing && !fullRecipe) return;

            const recipeData = fullRecipe ?? recipe;

            form.reset();
            form.setFieldValue("title", recipeData?.title ?? "");
            form.setFieldValue("description", recipeData?.description ?? "");
            form.setFieldValue("imageUrl", recipeData?.imageUrl ?? "");
            form.setFieldValue("prepMinutes", recipeData?.prepMinutes ?? null);
            form.setFieldValue("cookMinutes", recipeData?.cookMinutes ?? null);
            form.setFieldValue("servings", recipeData?.servings ?? null);

            const ingredients =
                recipeData?.ingredients?.map((ing) => ({
                    name: ing.name,
                    amount: ing.amount ?? "",
                    unit: ing.unit ?? "",
                    order: ing.order,
                })) ?? [];
            form.setFieldValue("ingredients", ingredients);

            const instructions =
                recipeData?.instructions?.map((inst) => ({
                    stepNumber: inst.stepNumber,
                    content: inst.content,
                })) ?? [];
            form.setFieldValue("instructions", instructions);

            form.setFieldValue("categoryIds", recipeData?.categories?.map((c) => c.categoryId) ?? []);

            // Reset keys
            ingredientKeyRef.current = ingredients.length;
            instructionKeyRef.current = instructions.length;
            setIngredientKeys(ingredients.map((_, i) => `ing-init-${i}`));
            setInstructionKeys(instructions.map((_, i) => `inst-init-${i}`));
        }
    }, [open, recipe, fullRecipe, isEditing, form]);

    const isPending = createMutation.isPending || updateMutation.isPending;

    const addIngredient = () => {
        const currentIngredients = form.getFieldValue("ingredients");
        form.setFieldValue("ingredients", [
            ...currentIngredients,
            { name: "", amount: "", unit: "", order: currentIngredients.length },
        ]);
        setIngredientKeys((prev) => [...prev, `ing-${ingredientKeyRef.current++}`]);
    };

    const removeIngredient = (index: number) => {
        const currentIngredients = form.getFieldValue("ingredients");
        form.setFieldValue(
            "ingredients",
            currentIngredients.filter((_, i) => i !== index).map((ing, i) => ({ ...ing, order: i })),
        );
        setIngredientKeys((prev) => prev.filter((_, i) => i !== index));
    };

    const addInstruction = () => {
        const currentInstructions = form.getFieldValue("instructions");
        form.setFieldValue("instructions", [
            ...currentInstructions,
            { stepNumber: currentInstructions.length + 1, content: "" },
        ]);
        setInstructionKeys((prev) => [...prev, `inst-${instructionKeyRef.current++}`]);
    };

    const removeInstruction = (index: number) => {
        const currentInstructions = form.getFieldValue("instructions");
        form.setFieldValue(
            "instructions",
            currentInstructions.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, stepNumber: i + 1 })),
        );
        setInstructionKeys((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleCategory = (categoryId: string) => {
        const currentCategories = form.getFieldValue("categoryIds");
        if (currentCategories.includes(categoryId)) {
            form.setFieldValue(
                "categoryIds",
                currentCategories.filter((id) => id !== categoryId),
            );
        } else {
            form.setFieldValue("categoryIds", [...currentCategories, categoryId]);
        }
    };

    // Show loading state when fetching recipe data for editing
    const isFormLoading = isEditing && isLoadingRecipe;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] md:max-w-5xl overflow-hidden p-0">
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Resep" : "Tambah Resep"}</DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Ubah informasi resep di bawah ini."
                                    : "Isi form di bawah ini untuk menambahkan resep baru."}
                            </DialogDescription>
                        </DialogHeader>

                        {isFormLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Spinner className="h-8 w-8" />
                                <span className="ml-2 text-muted-foreground">Memuat data resep...</span>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit();
                                }}
                                className="mt-4 space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Informasi Dasar</h3>

                                    <form.Field
                                        name="title"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>
                                                        Judul Resep <span className="text-destructive">*</span>
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        placeholder="Masukkan judul resep"
                                                        aria-invalid={isInvalid}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />

                                    <form.Field
                                        name="description"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>
                                                    <Textarea
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value ?? ""}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        placeholder="Deskripsi singkat tentang resep"
                                                        rows={3}
                                                        aria-invalid={isInvalid}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />

                                    <form.Field
                                        name="imageUrl"
                                        children={(field) => {
                                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>URL Gambar</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value ?? ""}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        aria-invalid={isInvalid}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            );
                                        }}
                                    />

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <form.Field
                                            name="prepMinutes"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>
                                                            Waktu Persiapan (menit)
                                                        </FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            type="number"
                                                            min={0}
                                                            value={field.state.value ?? ""}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target.value ? Number(e.target.value) : null,
                                                                )
                                                            }
                                                            placeholder="0"
                                                            aria-invalid={isInvalid}
                                                        />
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />

                                        <form.Field
                                            name="cookMinutes"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>
                                                            Waktu Masak (menit)
                                                        </FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            type="number"
                                                            min={0}
                                                            value={field.state.value ?? ""}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target.value ? Number(e.target.value) : null,
                                                                )
                                                            }
                                                            placeholder="0"
                                                            aria-invalid={isInvalid}
                                                        />
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />

                                        <form.Field
                                            name="servings"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                    <Field data-invalid={isInvalid}>
                                                        <FieldLabel htmlFor={field.name}>Jumlah Porsi</FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            type="number"
                                                            min={1}
                                                            value={field.state.value ?? ""}
                                                            onBlur={field.handleBlur}
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target.value ? Number(e.target.value) : null,
                                                                )
                                                            }
                                                            placeholder="1"
                                                            aria-invalid={isInvalid}
                                                        />
                                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Categories */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Kategori</h3>
                                    <form.Field
                                        name="categoryIds"
                                        children={(field) => (
                                            <div className="flex flex-wrap gap-2">
                                                {categoriesData?.data.map((category) => {
                                                    const isSelected = field.state.value.includes(category.id);
                                                    return (
                                                        <Badge
                                                            key={category.id}
                                                            variant={isSelected ? "default" : "outline"}
                                                            className="cursor-pointer"
                                                            onClick={() => toggleCategory(category.id)}>
                                                            {category.name}
                                                        </Badge>
                                                    );
                                                })}
                                                {(!categoriesData?.data || categoriesData.data.length === 0) && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Belum ada kategori. Silakan buat kategori terlebih dahulu.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                <Separator />

                                {/* Ingredients */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Bahan-bahan</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Bahan
                                        </Button>
                                    </div>

                                    <form.Field
                                        name="ingredients"
                                        mode="array"
                                        children={(field) => (
                                            <div className="space-y-3">
                                                {field.state.value.length === 0 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Belum ada bahan. Klik tombol &quot;Tambah Bahan&quot; untuk
                                                        menambahkan.
                                                    </p>
                                                )}
                                                {field.state.value.map((_, index) => (
                                                    <div
                                                        key={ingredientKeys[index] || `ing-fallback-${index}`}
                                                        className="flex items-start gap-2">
                                                        <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-6">
                                                            <form.Field
                                                                name={`ingredients[${index}].name`}
                                                                children={(subField) => (
                                                                    <Input
                                                                        className="sm:col-span-3"
                                                                        value={subField.state.value}
                                                                        onChange={(e) =>
                                                                            subField.handleChange(e.target.value)
                                                                        }
                                                                        placeholder="Nama bahan"
                                                                    />
                                                                )}
                                                            />
                                                            <form.Field
                                                                name={`ingredients[${index}].amount`}
                                                                children={(subField) => (
                                                                    <Input
                                                                        className="sm:col-span-1"
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) =>
                                                                            subField.handleChange(e.target.value)
                                                                        }
                                                                        placeholder="Jumlah"
                                                                    />
                                                                )}
                                                            />
                                                            <form.Field
                                                                name={`ingredients[${index}].unit`}
                                                                children={(subField) => (
                                                                    <Input
                                                                        className="sm:col-span-2"
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) =>
                                                                            subField.handleChange(e.target.value)
                                                                        }
                                                                        placeholder="Satuan"
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => removeIngredient(index)}
                                                            className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </div>

                                <Separator />

                                {/* Instructions */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Langkah-langkah</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Langkah
                                        </Button>
                                    </div>

                                    <form.Field
                                        name="instructions"
                                        mode="array"
                                        children={(field) => (
                                            <div className="space-y-3">
                                                {field.state.value.length === 0 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Belum ada langkah. Klik tombol &quot;Tambah Langkah&quot; untuk
                                                        menambahkan.
                                                    </p>
                                                )}
                                                {field.state.value.map((_, index) => (
                                                    <div
                                                        key={instructionKeys[index] || `inst-fallback-${index}`}
                                                        className="flex items-start gap-2">
                                                        <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                                            {index + 1}
                                                        </span>
                                                        <form.Field
                                                            name={`instructions[${index}].content`}
                                                            children={(subField) => (
                                                                <Textarea
                                                                    className="flex-1"
                                                                    value={subField.state.value}
                                                                    onChange={(e) =>
                                                                        subField.handleChange(e.target.value)
                                                                    }
                                                                    placeholder="Jelaskan langkah ini..."
                                                                    rows={2}
                                                                />
                                                            )}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => removeInstruction(index)}
                                                            className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        disabled={isPending}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending && <Spinner className="mr-2" />}
                                        {isEditing ? "Simpan Perubahan" : "Tambah Resep"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
