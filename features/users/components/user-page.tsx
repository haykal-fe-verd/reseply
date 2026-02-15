/**
 * User Page Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { Users } from "lucide-react";
import { UserTable } from "./user-table";

export function UserPage() {
    return (
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
                <Users className="h-8 w-8" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground">Kelola pengguna, sesi, dan akses aplikasi.</p>
                </div>
            </div>
            <UserTable />
        </div>
    );
}
