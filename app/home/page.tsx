import React from "react";
import { SiteHeader } from "../HomePage/SiteHeader";
import { HeroSection } from "../HomePage/HeroSection";
import { AboutSection } from "../HomePage/AboutSection";
import { ServicesSection } from "../HomePage/ServicesSection";
import { PortfolioSection } from "../HomePage/PortfolioSection";
import { FAQSection } from "../HomePage/FAQSection";
import { TestimonialsSection } from "../HomePage/TestimonialsSection";
import { ContactFooter } from "../HomePage/ContactFooter";

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
