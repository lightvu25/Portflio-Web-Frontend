import React from "react";
import { SiteHeader } from "../HomePage/sections/SiteHeader";
import { HeroSection } from "../HomePage/sections/HeroSection";
import { AboutSection } from "../HomePage/sections/AboutSection";
import { ServicesSection } from "../HomePage/sections/ServicesSection";
import { PortfolioSection } from "../HomePage/sections/PortfolioSection";
import { FAQSection } from "../HomePage/sections/FAQSection";
import { TestimonialsSection } from "../HomePage/sections/TestimonialsSection";
import { ContactFooter } from "../HomePage/sections/ContactFooter";

export default function HomePage() {
    return (
        <main className="w-full min-h-screen bg-dark-03 flex flex-col">
            <SiteHeader />
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <PortfolioSection />
            <FAQSection />
            <TestimonialsSection />
            <ContactFooter />
        </main>
    );
}
