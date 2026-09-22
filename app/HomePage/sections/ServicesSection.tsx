"use client";
import React, { useState } from "react";
const icon14: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238672F3' stroke-width='2'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E" };
const icon15: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238672F3' stroke-width='2'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E" };
const icon16: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238672F3' stroke-width='2'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E" };
const icon17: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238672F3' stroke-width='2'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E" };
const image11: any = { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop" };
const vector431Stroke6: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 19L19 5M19 5H9M19 5v10'/%3E%3C/svg%3E" };

const serviceHighlights = [
    {
        icon: icon14,
        text: "COVERAGE FOR WEDDINGS, PARTIES, CORPORATE FUNCTIONS, AND MORE.",
    },
    {
        icon: icon15,
        text: "SKILLED PHOTOGRAPHERS WHO KNOW HOW TO SEIZE THE MOMENT.",
    },
    {
        icon: icon16,
        text: "A MIX OF CANDID AND POSED SHOTS FOR A COMPREHENSIVE STORY.",
    },
    {
        icon: icon17,
        text: "QUICK TURNAROUND FOR YOU TO RELIVE THE DAY'S HIGHLIGHTS.",
    },
];

export const ServicesSection = () => {
    const [navigationMessage, setNavigationMessage] = useState("");

    const handleNavigation = (direction: "previous" | "next") => {
        setNavigationMessage(
            direction === "previous"
                ? "Previous photography service selected."
                : "Next photography service selected."
        );
    };

    return (
        <section id="services" className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-10 lg:py-[60px] flex flex-col items-start gap-10 lg:gap-[60px] border-b border-dark-12">
            
            {/* Header */}
            <header className="w-full flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-dark-12 pb-6 lg:pb-10">
                <div className="flex flex-col items-start gap-1">
                    <p className="font-semibold text-grey-50 text-sm lg:text-base tracking-[0] uppercase">
                        SERVICES
                    </p>
                    <h2 className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0] uppercase">
                        MY PHOTOGRAPHY SERVICES
                    </h2>
                </div>
                
                {/* Desktop controls */}
                <div className="hidden lg:flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleNavigation("previous")}
                            className="flex items-center justify-center w-[54px] h-[54px] bg-dark-12 rounded-lg border border-dark-20 hover:bg-dark-20 transition-colors text-grey-50 text-xl"
                            aria-label="Previous photography service"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavigation("next")}
                            className="flex items-center justify-center w-[54px] h-[54px] bg-dark-12 rounded-lg border border-dark-20 hover:bg-dark-20 transition-colors text-grey-50 text-xl"
                            aria-label="Next photography service"
                        >
                            →
                        </button>
                    </div>
                    <a
                        href="#all-services"
                        className="inline-flex items-center justify-center h-[54px] px-6 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20"
                    >
                        <span className="whitespace-nowrap">View All Services -&gt;</span>
                    </a>
                </div>

                {/* Mobile View All Button */}
                <a
                    href="#all-services"
                    className="lg:hidden inline-flex items-center justify-center h-[54px] px-6 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20 w-fit"
                >
                    <span className="whitespace-nowrap">View All Services -&gt;</span>
                </a>
            </header>

            <p className="sr-only" aria-live="polite">{navigationMessage}</p>

            {/* Content Area */}
            <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                
                {/* Mobile Image */}
                <img
                    className="lg:hidden w-full h-[300px] object-cover rounded-lg"
                    alt="Event photography service"
                    src={image11.src || image11}
                />

                <article className="flex flex-col items-start gap-10 w-full lg:flex-1">
                    <div className="flex flex-col items-start gap-5 w-full">
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-grey-50 text-[32px] lg:text-[40px] tracking-[0] uppercase">
                                EVENTS
                            </h3>
                            <div className="inline-flex items-center justify-center w-12 h-10 lg:w-[84px] lg:h-[56px] bg-purple-55 rounded-[100px]">
                                <img
                                    className="w-5 h-5 lg:w-6 lg:h-6"
                                    alt=""
                                    aria-hidden="true"
                                    src={vector431Stroke6.src || vector431Stroke6}
                                />
                            </div>
                        </div>
                        <p className="font-normal text-grey-50 text-base lg:text-lg leading-relaxed tracking-[0]">
                            Our event photography service is dedicated to capturing the magic
                            of your special occasions. Whether it&apos;s a wedding, corporate
                            event, or milestone celebration, we&apos;re there to document
                            every heartfelt moment. We blend into the background, ensuring
                            natural and candid shots that reflect the emotions of the day.
                        </p>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-5 w-full">
                        <h4 className="font-medium text-grey-80 text-base lg:text-lg">
                            Service Highlights
                        </h4>
                        <ul className="flex flex-col items-start gap-3 w-full list-none p-0 m-0">
                            {serviceHighlights.map((highlight) => (
                                <li
                                    key={highlight.text}
                                    className="flex items-center gap-4 px-5 py-4 lg:px-6 lg:py-5 w-full rounded-[14px] border border-solid border-dark-12 bg-dark-06 hover:bg-dark-08 transition-colors"
                                >
                                    <img
                                        className="w-6 h-6 lg:w-8 lg:h-8 shrink-0"
                                        alt=""
                                        aria-hidden="true"
                                        src={highlight.icon.src || highlight.icon}
                                    />
                                    <p className="font-normal text-grey-70 text-sm lg:text-base leading-relaxed uppercase">
                                        {highlight.text}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

                {/* Desktop Image */}
                <img
                    className="hidden lg:block w-full lg:flex-1 h-[700px] object-cover rounded-[20px]"
                    alt="Event photography service"
                    src={image11.src || image11}
                />
            </div>

            {/* Mobile bottom controls */}
            <div className="lg:hidden flex items-center justify-center gap-2 w-full mt-4">
                <button
                    type="button"
                    onClick={() => handleNavigation("previous")}
                    className="flex items-center justify-center w-14 h-14 bg-dark-12 rounded-lg border border-dark-20 hover:bg-dark-20 transition-colors text-grey-50 text-xl"
                    aria-label="Previous photography service"
                >
                    ←
                </button>
                <button
                    type="button"
                    onClick={() => handleNavigation("next")}
                    className="flex items-center justify-center w-14 h-14 bg-dark-12 rounded-lg border border-dark-20 hover:bg-dark-20 transition-colors text-grey-50 text-xl"
                    aria-label="Next photography service"
                >
                    →
                </button>
            </div>
            
        </section>
    );
};
