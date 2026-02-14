export function TailwindIndicator() {
    if (process.env.NODE_ENV !== "development") return null;

    return (
        <div className="fixed top-4 right-4 bg-muted text-muted-foreground border px-3 py-1 rounded text-sm z-50 shadow-md">
            <span className="sm:hidden">default</span>
            <span className="hidden sm:inline md:hidden">sm</span>
            <span className="hidden md:inline lg:hidden">md</span>
            <span className="hidden lg:inline xl:hidden">lg</span>
            <span className="hidden xl:inline">xl</span>
        </div>
    );
}
