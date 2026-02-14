/**
 * Home Page Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import { CTASection, FeaturesSection, HeroSection, RecipeShowcase, TestimonialsSection } from "@/features/home";

export function HomePage() {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <RecipeShowcase />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
        </div>
    );
}
