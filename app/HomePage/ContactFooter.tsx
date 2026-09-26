"use client";
import React from "react";
const abstractDesign2: any = { src: "/placeholder.svg" };
const abstractDesign3: any = { src: "/placeholder.svg" };
const container: any = { src: "/placeholder.svg" };
const icon7: any = { src: "/placeholder.svg" };
const icon8: any = { src: "/placeholder.svg" };
const icon9: any = { src: "/placeholder.svg" };
const icon10: any = { src: "/placeholder.svg" };
const icon11: any = { src: "/placeholder.svg" };
const icon12: any = { src: "/placeholder.svg" };
const icon13: any = { src: "/placeholder.svg" };
const vector431Stroke5: any = { src: "/placeholder.svg" };

const serviceHighlights = [
    { icon: icon7, label: "EVENT PHOTOGRAPHY" },
    { icon: icon8, label: "COMERCIAL PHOTOGRAPHY" },
    { icon: icon9, label: "PRODUCT PHOTOGRAPHY" },
    { icon: icon10, label: "WEDDING PHOTOGRAPHY" },
    { icon: icon11, label: "LANDSCAPE PHOTOGRAPHY" },
    { icon: icon12, label: "BRANDING PHOTOGRAPHY" },
    { icon: icon13, label: "PORTRAIT PHOTOGRAPHY" },
];

const footerNavigation = [
    {
        title: "HOME",
        links: [
            { label: "ABOUT ME", href: "#about-me" },
            { label: "MY WORKS", href: "#portfolio" },
            { label: "TESTIMONIALS", href: "#testimonials" },
        ],
    },
    {
        title: "CLIENTS",
        links: [
            { label: "KLOVESTO", href: "#klovesto" },
            { label: "NUKEWAY", href: "#nukeway" },
            { label: "CLOVEN'S", href: "#clovens" },
            { label: "MENVOL", href: "#menvol" },
        ],
    },
    {
        title: "PORTFOLIO",
        links: [
            { label: "EVENTS", href: "#events" },
            { label: "PORTRAIT", href: "#portrait" },
            { label: "BRANDING", href: "#branding" },
            { label: "COMMERCIALE", href: "#commerciale" },
            { label: "WEDDING", href: "#wedding" },
        ],
    },
    {
        title: "SERVICES",
        links: [
            { label: "PORTRAITS", href: "#portraits" },
            { label: "EVENTS", href: "#events" },
            { label: "COMMERCIAL", href: "#commercial" },
        ],
    },
];

const socialLinks = [
    {
        label: "Facebook",
        href: "https://www.facebook.com/",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M13.5 20v-7h2.35l.35-2.73H13.5V8.53c0-.79.22-1.33 1.36-1.33h1.45V4.76c-.25-.03-1.11-.11-2.11-.11-2.09 0-3.52 1.27-3.52 3.61v2.01H8.32V13h2.36v7h2.82Z" />
            </svg>
        ),
    },
    {
        label: "Twitter",
        href: "https://twitter.com/",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.3 4.3 0 0 0 1.8-2.3 8.5 8.5 0 0 1-2.7 1A4.2 4.2 0 0 0 11.4 8.7a12 12 0 0 1-8.7-4.4 4.2 4.2 0 0 0 1.3 5.7 4.2 4.2 0 0 1-1.9-.5v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 4 2.9 8.5 8.5 0 0 1-6.3 1.8 12 12 0 0 0 6.5 1.9c7.8 0 12-6.5 12-12v-.5a8.6 8.6 0 0 0 2.1-2.2Z" />
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M6.5 8.5A1.75 1.75 0 1 0 6.5 5a1.75 1.75 0 0 0 0 3.5ZM5 10h3v9H5v-9Zm5 0h2.88v1.23h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V19h-3v-4.18c0-1 0-2.28-1.39-2.28-1.4 0-1.61 1.08-1.61 2.2V19h-3v-9Z" />
            </svg>
        ),
    },
];

export const ContactFooter = () => {
    return (
        <section id="contact" className="w-full bg-dark-03" aria-label="Contact and footer">
            {/* Top Banner (Container Image & Marquee) */}
            <div className="w-full flex flex-col items-center">
                {/* Decorative image above marquee */}
                <div className="w-full max-w-[1440px] px-0 lg:px-20 pt-10">
                   <img className="w-full object-cover lg:h-auto h-20" alt="" aria-hidden="true" src={container.src || container} />
                </div>
                
                {/* Services Marquee */}
                <div className="w-full border-t border-b border-dark-12 bg-dark-06 overflow-hidden">
                    <div className="flex items-center justify-start lg:justify-center gap-6 px-4 py-4 whitespace-nowrap overflow-x-auto no-scrollbar">
                        {serviceHighlights.map((service) => (
                            <div key={service.label} className="inline-flex items-center gap-1.5 shrink-0">
                                <img
                                    className="w-6 h-6 lg:w-[30px] lg:h-[30px]"
                                    alt=""
                                    aria-hidden="true"
                                    src={service.icon.src || service.icon}
                                />
                                <span className="font-normal text-purple-90 text-sm tracking-[0] whitespace-nowrap uppercase">
                                    {service.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Main Content */}
            <footer className="w-full max-w-[1440px] mx-auto">
                <div className="w-full flex flex-col lg:flex-row relative">
                    
                    {/* Left Abstract Design (Desktop Only) */}
                    <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-20">
                        <img className="w-full" alt="" aria-hidden="true" src={abstractDesign2.src || abstractDesign2} />
                    </div>

                    {/* Contact CTA */}
                    <div className="w-full lg:w-2/5 flex flex-col items-start gap-10 px-6 lg:px-[60px] py-10 lg:py-20 lg:border-l lg:border-r border-b lg:border-b-0 border-dark-12 lg:ml-20">
                        <p className="font-semibold text-grey-50 text-sm lg:text-base tracking-[0] uppercase">
                            A MORE MEANINGFUL HOME FOR PHOTOGRAPHY
                        </p>
                        <a
                            href="#contact"
                            className="flex flex-col items-start gap-1 group"
                            aria-label="Let's work together"
                        >
                            <div className="inline-flex items-center gap-2.5">
                                <span className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0]">
                                    LET&apos;S
                                </span>
                                <span className="inline-flex items-center justify-center w-12 h-12 lg:w-20 lg:h-20 bg-purple-55 group-hover:bg-purple-60 transition-colors rounded-full shadow-[inset_4px_4px_17.4px_#ffffff47]">
                                    <img
                                        className="w-5 h-5 lg:w-8 lg:h-8"
                                        alt=""
                                        aria-hidden="true"
                                        src={vector431Stroke5.src || vector431Stroke5}
                                    />
                                </span>
                            </div>
                            <span className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0]">
                                WORK TOGETHER
                            </span>
                        </a>
                    </div>

                    {/* Navigation Columns */}
                    <nav
                        className="w-full lg:w-3/5 grid grid-cols-2 md:grid-cols-4 gap-8 px-6 lg:px-[50px] py-10 lg:py-20 lg:border-r lg:border-l border-dark-12 lg:mr-20"
                        aria-label="Footer navigation"
                    >
                        {footerNavigation.map((group) => (
                            <div key={group.title} className="flex flex-col items-start gap-4">
                                <h2 className="font-semibold text-grey-50 text-sm uppercase">
                                    {group.title}
                                </h2>
                                <div className="flex flex-col items-start gap-1 w-full">
                                    {group.links.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            className="w-full py-1.5 border-b border-dark-20 font-medium text-grey-95 text-sm hover:text-purple-55 transition-colors uppercase"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Right Abstract Design (Desktop Only) */}
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-20">
                        <img className="w-full" alt="" aria-hidden="true" src={abstractDesign3.src || abstractDesign3} />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-6 lg:px-20 py-8 lg:py-[34px] border-t border-dark-12">
                    <div className="flex items-center gap-2">
                        <a href="#terms" className="font-normal text-grey-50 text-sm hover:text-purple-55 transition-colors">
                            Terms &amp; Conditions
                        </a>
                        <span className="text-dark-20">|</span>
                        <a href="#privacy" className="font-normal text-grey-50 text-sm hover:text-purple-55 transition-colors">
                            Privacy Policy
                        </a>
                    </div>
                    <p className="font-normal text-grey-50 text-sm text-center">
                        © 2024 Damien Braun Photography. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Visit Damien Braun Photography on ${social.label}`}
                                className="flex items-center justify-center w-10 h-10 rounded-full border border-dark-20 text-grey-50 hover:text-absolutewhite hover:border-purple-55 transition-colors"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </section>
    );
};
