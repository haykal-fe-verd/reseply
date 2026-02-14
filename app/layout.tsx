import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EnvironmentLabel } from "@/components/environment-label";
import { QueryProvider } from "@/components/query-provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/seo";

import "@/styles/globals.css";
import "@/styles/environment-label.css";

const fontSans = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
});

const fontMono = Geist_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.creator,
    publisher: siteConfig.name,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: siteConfig.url,
        title: siteConfig.title,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.title,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: siteConfig.creator,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    alternates: {
        canonical: siteConfig.url,
    },
    category: "food",
};

export const viewport: Viewport = {
    themeColor: [...siteConfig.themeColor],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteJsonLd()) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationJsonLd()) }}
                />
            </head>
            <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
                <QueryProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <TooltipProvider>{children}</TooltipProvider>
                        <Toaster position="top-right" expand={true} toastOptions={{}} richColors />
                        <TailwindIndicator />
                        <EnvironmentLabel />
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
