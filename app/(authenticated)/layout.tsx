import { Navbar } from "@/components/navbar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <main className="pt-14">{children}</main>
        </div>
    );
}
