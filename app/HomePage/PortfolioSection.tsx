"use client";
import React, { useRef, useState } from "react";

const image8: any = { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" };
const image9: any = { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" };
const image10: any = { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop" };
const vector431Stroke2: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f2f2f3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 19L19 5M19 5H9M19 5v10'/%3E%3C/svg%3E" };
const vector431Stroke3: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f2f2f3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 19L19 5M19 5H9M19 5v10'/%3E%3C/svg%3E" };
const vector431Stroke4: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f2f2f3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 19L19 5M19 5H9M19 5v10'/%3E%3C/svg%3E" };

const portfolioProjects = [
    {
        title: "Faces of Resilience",
        date: "March 2022",
        image: image8,
        arrow: vector431Stroke4,
        href: "#faces-of-resilience",
    },
    {
        title: "A Wedding Tale",
        date: "January 2020",
        image: image9,
        arrow: vector431Stroke2,
        href: "#a-wedding-tale",
    },
    {
        title: "Product Elegance",
        date: "January 2020",
        image: image10,
        arrow: vector431Stroke3,
        href: "#product-elegance",
    },
];

export const PortfolioSection = () => {
    const projectsContainerRef = useRef<HTMLDivElement>(null);
    const [activeProject, setActiveProject] = useState(0);

    const scrollProjects = (direction: "previous" | "next") => {
        const container = projectsContainerRef.current;
        if (container) {
            container.scrollBy({
                left: direction === "next" ? 430 : -430,
                behavior: "smooth",
            });
        }
    };

    const showPreviousProject = (): void => {
        setActiveProject((currentProject) =>
            currentProject === 0 ? portfolioProjects.length - 1 : currentProject - 1
        );
    };

    const showNextProject = (): void => {
        setActiveProject((currentProject) =>
            currentProject === portfolioProjects.length - 1 ? 0 : currentProject + 1
        );
    };

    const project = portfolioProjects[activeProject];

    return (
        <section id="portfolio" className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-10 lg:py-[60px] flex flex-col items-start gap-10 lg:gap-[60px] border-b border-dark-12">
            
            {/* Header */}
            <header className="w-full flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-dark-12 pb-6 lg:pb-10">
                <div className="flex flex-col items-start gap-1">
                    <p className="font-semibold text-grey-50 text-sm lg:text-base tracking-[0] uppercase">
                        PORTFOLIO
                    </p>
                    <h2 className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0] uppercase">
                        EXPLORE MY PHOTOGRAPHY WORK.
                    </h2>
                </div>
                
                {/* Desktop controls */}
                <div className="hidden lg:flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollProjects("previous")}
                            className="flex items-center justify-center w-[54px] h-[54px] bg-dark-12 rounded-lg border border-dark-20 hover:bg-dark-20 transition-colors text-grey-80"
                            aria-label="View previous projects"
                        >
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                <path d="M15.8333 10H4.16663M4.16663 10L9.99996 15.8333M4.16663 10L9.99996 4.16667" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollProjects("next")}
                            className="flex items-center justify-center w-[54px] h-[54px] bg-dark-12 rounded-lg border border-dark-20 hover:bg-dark-20 transition-colors text-grey-80"
                            aria-label="View next projects"
                        >
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                <path d="M4.16663 10H15.8333M15.8333 10L9.99996 4.16667M15.8333 10L9.99996 15.8333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <a
                        href="#all-photography-works"
                        className="inline-flex items-center justify-center h-[54px] px-6 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20"
                    >
                        <span className="whitespace-nowrap">View All Works -&gt;</span>
                    </a>
                </div>

                {/* Mobile View All Button */}
                <a
                    href="#all-photography-works"
                    className="lg:hidden inline-flex items-center justify-center h-[54px] px-6 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20 w-fit"
                >
                    <span className="whitespace-nowrap">View All Works -&gt;</span>
                </a>
            </header>

            {/* Content - Desktop (Horizontal Scroll) */}
            <div
                ref={projectsContainerRef}
                className="hidden lg:flex items-start gap-[40px] w-full overflow-x-auto scroll-smooth no-scrollbar"
                aria-label="Photography projects desktop view"
            >
                {portfolioProjects.map((p) => (
                    <article
                        key={p.title}
                        className="flex flex-col items-start gap-6 min-w-[450px] flex-1"
                    >
                        <img
                            className="w-full h-[500px] object-cover rounded-[20px]"
                            alt={p.title}
                            src={p.image.src || p.image}
                        />
                        <div className="flex items-start justify-between w-full gap-4">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <h3 className="font-semibold text-grey-90 text-xl leading-[normal]">
                                    {p.title}
                                </h3>
                                <p className="font-normal text-grey-50 text-base leading-[normal]">
                                    {p.date}
                                </p>
                            </div>
                            <a
                                href={p.href}
                                className="inline-flex items-center gap-2 py-1.5 border-b-2 border-dark-20 hover:border-grey-95 transition-colors group"
                            >
                                <span className="font-medium text-grey-95 text-sm uppercase">
                                    View Project
                                </span>
                                <img
                                    className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                    alt=""
                                    src={p.arrow.src || p.arrow}
                                />
                            </a>
                        </div>
                    </article>
                ))}
            </div>

            {/* Content - Mobile (Single Item with prev/next) */}
            <div className="flex lg:hidden flex-col items-center gap-10 w-full">
                <article className="flex flex-col gap-6 w-full">
                    <img
                        className="w-full h-[400px] object-cover rounded-[16px]"
                        alt={`${project.title}, photographed in ${project.date}`}
                        src={project.image.src || project.image}
                    />
                    <div className="flex items-start justify-between w-full gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <h3 className="font-semibold text-grey-90 text-lg leading-[normal]">
                                {project.title}
                            </h3>
                            <p className="font-normal text-grey-50 text-sm leading-[normal]">
                                {project.date}
                            </p>
                        </div>
                        <a
                            href={project.href}
                            className="inline-flex items-center gap-1.5 py-1 border-b border-dark-20 hover:border-grey-95 transition-colors"
                        >
                            <span className="font-medium text-grey-95 text-sm uppercase">
                                View Project
                            </span>
                            <img
                                className="w-5 h-5"
                                alt=""
                                src={project.arrow.src || project.arrow}
                            />
                        </a>
                    </div>
                </article>
                <nav className="flex items-center gap-4 w-full justify-center">
                    <button
                        type="button"
                        onClick={showPreviousProject}
                        className="flex items-center justify-center w-14 h-14 bg-dark-12 rounded-lg border border-dark-20 text-grey-95 text-xl hover:bg-dark-20 transition-colors"
                        aria-label="Previous project"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={showNextProject}
                        className="flex items-center justify-center w-14 h-14 bg-dark-12 rounded-lg border border-dark-20 text-grey-95 text-xl hover:bg-dark-20 transition-colors"
                        aria-label="Next project"
                    >
                        →
                    </button>
                </nav>
            </div>

        </section>
    );
};
