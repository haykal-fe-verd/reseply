/**
 * Recipe Bulk Import Dialog
 * Upload Excel file to import recipes in bulk.
 * @date February 16, 2026
 */

"use client";

import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
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
import { useBulkImportRecipes } from "@/features/recipes";

interface RecipeBulkImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RecipeBulkImportDialog({ open, onOpenChange }: RecipeBulkImportDialogProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [file, setFile] = React.useState<File | null>(null);
    const [result, setResult] = React.useState<{
        created: number;
        errors: number;
        details?: { created: string[]; errors: { row: number; message: string }[] };
    } | null>(null);

    const bulkImport = useBulkImportRecipes();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            const ext = selected.name.split(".").pop()?.toLowerCase();
            if (ext !== "xlsx" && ext !== "xls") {
                setFile(null);
                return;
            }
            setFile(selected);
            setResult(null);
        } else {
            setFile(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setResult(null);
        try {
            const data = await bulkImport.mutateAsync(file);
            setResult({
                created: data.created,
                errors: data.errors,
                details: data.details,
            });
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch {
            // Error handled by mutation toast
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setFile(null);
            setResult(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import Resep dari Excel
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Unggah file Excel (.xlsx) dengan kolom: <strong>title</strong>/Judul (wajib), description,
                        imageUrl, prepMinutes, cookMinutes, servings, <strong>categorySlugs</strong> (slug kategori
                        dipisah koma), <strong>ingredients</strong> (per baris: nama;jumlah;satuan),{" "}
                        <strong>instructions</strong> (satu langkah per baris). Unduh template untuk format lengkap.
                        untuk baris baru menggunakan Alt+Enter (Windows) atau Option+Enter (Mac).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:transition-colors hover:file:bg-primary/90"
                        aria-label="Pilih file Excel"
                    />
                    {file && (
                        <p className="text-sm text-muted-foreground">
                            File dipilih: <span className="font-medium text-foreground">{file.name}</span>
                        </p>
                    )}

                    {result && (
                        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                            <p className="font-medium">Hasil import</p>
                            <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                                <li>{result.created} resep dibuat</li>
                                <li>{result.errors} error</li>
                            </ul>
                            {result.details?.errors && result.details.errors.length > 0 && (
                                <div className="mt-2 max-h-32 overflow-y-auto rounded border border-destructive/20 bg-destructive/5 p-2 text-xs">
                                    <p className="font-medium text-destructive">Detail error:</p>
                                    <ul className="mt-1 list-inside space-y-0.5">
                                        {result.details.errors.map((e, i) => (
                                            <li key={i}>
                                                Baris {e.row}: {e.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Tutup
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file || bulkImport.isPending}>
                        {bulkImport.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengimpor...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
