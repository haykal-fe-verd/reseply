import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="pt-14 flex-1">{children}</main>
            <Footer />
        </div>
    );
}
