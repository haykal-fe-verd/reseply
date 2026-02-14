"use client";

import { Monitor, Shield, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSection, SecuritySection, SessionsSection } from "@/features/profile";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_TAB = "account";
const VALID_TABS = ["account", "security", "sessions"] as const;
type TabValue = (typeof VALID_TABS)[number];

function isValidTab(tab: string | null): tab is TabValue {
    return tab !== null && VALID_TABS.includes(tab as TabValue);
}

export function ProfilePage() {
    const isMobile = useIsMobile();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabValue>(DEFAULT_TAB);

    // Initialize tab from URL query parameter
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (isValidTab(tabParam)) {
            setActiveTab(tabParam);
        } else {
            setActiveTab(DEFAULT_TAB);
            // Clean up invalid tab param from URL
            if (tabParam !== null) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("tab");
                const newUrl = params.toString() ? `?${params.toString()}` : "";
                router.replace(`/profile${newUrl}`, { scroll: false });
            }
        }
    }, [searchParams, router]);

    const handleTabChange = (value: string) => {
        const newTab = value as TabValue;
        setActiveTab(newTab);

        // Update URL without page reload
        const params = new URLSearchParams(searchParams.toString());

        if (newTab === DEFAULT_TAB) {
            // Remove tab param if it's default
            params.delete("tab");
        } else {
            // Set tab param if it's not default
            params.set("tab", newTab);
        }

        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/profile${newUrl}`, { scroll: false });
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <div className="mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-2xl font-bold sm:text-3xl">Pengaturan</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">Kelola akun dan preferensi Anda</p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                orientation={isMobile ? "horizontal" : "vertical"}
                className={isMobile ? "space-y-4" : "flex gap-4 md:gap-8"}>
                <TabsList
                    variant="line"
                    className={isMobile ? "w-full grid grid-cols-3" : "w-full md:w-64 shrink-0 flex-col"}>
                    <TabsTrigger
                        value="account"
                        className={isMobile ? "justify-center gap-1.5" : "w-full justify-start gap-2"}>
                        <User className="size-4" />
                        <span className={isMobile ? "hidden sm:inline" : ""}>Akun</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className={isMobile ? "justify-center gap-1.5" : "w-full justify-start gap-2"}>
                        <Shield className="size-4" />
                        <span className={isMobile ? "hidden sm:inline" : ""}>Keamanan</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="sessions"
                        className={isMobile ? "justify-center gap-1.5" : "w-full justify-start gap-2"}>
                        <Monitor className="size-4" />
                        <span className={isMobile ? "hidden sm:inline" : ""}>Sesi</span>
                    </TabsTrigger>
                </TabsList>

                <div className={isMobile ? "w-full" : "flex-1 min-w-0"}>
                    <TabsContent value="account" className={isMobile ? "mt-4" : "mt-0"}>
                        <AccountSection />
                    </TabsContent>
                    <TabsContent value="security" className={isMobile ? "mt-4" : "mt-0"}>
                        <SecuritySection />
                    </TabsContent>
                    <TabsContent value="sessions" className={isMobile ? "mt-4" : "mt-0"}>
                        <SessionsSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
