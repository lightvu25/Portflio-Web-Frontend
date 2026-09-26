"use client";
import React, { useState } from "react";
const shape: any = { src: "/placeholder.svg" };
const shape2: any = { src: "/placeholder.svg" };
const shape3: any = { src: "/placeholder.svg" };
const shape4: any = { src: "/placeholder.svg" };
const shape5: any = { src: "/placeholder.svg" };
const shape6: any = { src: "/placeholder.svg" };
const shape7: any = { src: "/placeholder.svg" };
const shape8: any = { src: "/placeholder.svg" };
const shape9: any = { src: "/placeholder.svg" };
const shape10: any = { src: "/placeholder.svg" };
const shape11: any = { src: "/placeholder.svg" };
const shape12: any = { src: "/placeholder.svg" };
const shape13: any = { src: "/placeholder.svg" };
const shape14: any = { src: "/placeholder.svg" };
const shape15: any = { src: "/placeholder.svg" };

const testimonials = [
    {
        name: "Emily Johnson",
        location: "USA, California",
        review: "Damien's photography doesn't just capture moments; it captures emotions. His work is simply mesmerizing.",
        stars: [shape, shape2, shape3, shape4, shape5],
    },
    {
        name: "John Smith",
        location: "USA, California",
        review: "Damien has an incredible talent for making every event feel effortless, and the results speak for themselves.",
        stars: [shape6, shape7, shape8, shape9, shape10],
    },
    {
        name: "Samantha Davis",
        location: "USA, California",
        review: "I was blown away by Damien's ability to capture the essence of our wedding day. His photographs are our memories.",
        stars: [shape11, shape12, shape13, shape14, shape15],
    },
];

export const TestimonialsSection = () => {
    const [activePage, setActivePage] = useState(0);

    const handlePrevious = () => {
        setActivePage((page) => (page === 0 ? testimonials.length - 1 : page - 1));
    };

    const handleNext = () => {
        setActivePage((page) => (page === testimonials.length - 1 ? 0 : page + 1));
    };

    const activeTestimonial = testimonials[activePage];

    return (
        <section id="testimonials" className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-10 lg:py-[60px] flex flex-col items-start gap-10 lg:gap-[60px] border-b border-dark-12">
            
            {/* Header */}
            <header className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-dark-12 pb-6 lg:pb-10">
                <div className="flex flex-col lg:flex-row gap-5 lg:gap-[60px] flex-1">
                    <div className="flex flex-col items-start gap-1">
                        <p className="font-semibold text-grey-50 text-sm lg:text-base tracking-[0] uppercase">
                            TESTIMONIALS
                        </p>
                        <h2 className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0] uppercase">
                            WHAT MY CLIENTS SAY
                        </h2>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <p className="font-normal text-grey-40 text-sm lg:text-base">
                            Total Reviews
                        </p>
                        <p className="font-medium text-grey-80 text-xl lg:text-2xl">
                            323
                        </p>
                    </div>
                </div>
                
                {/* Desktop controls */}
                <div className="hidden lg:flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="flex items-center justify-center w-12 h-12 bg-dark-12 rounded-lg border border-dark-12 hover:border-dark-20 transition-colors text-grey-80"
                            aria-label="Previous testimonials"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center justify-center w-12 h-12 bg-dark-12 rounded-lg border border-dark-12 hover:border-dark-20 transition-colors text-grey-80"
                            aria-label="Next testimonials"
                        >
                            →
                        </button>
                    </div>
                    <a
                        href="#all-testimonials"
                        className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20"
                    >
                        <span className="whitespace-nowrap">View All Testimonials -&gt;</span>
                    </a>
                </div>

                {/* Mobile View All Button */}
                <a
                    href="#all-testimonials"
                    className="lg:hidden inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20 w-fit"
                >
                    <span className="whitespace-nowrap">View All Testimonials -&gt;</span>
                </a>
            </header>

            {/* Desktop Grid (Hidden on Mobile) */}
            <div className="hidden lg:flex items-start gap-5 w-full">
                {testimonials.map((testimonial) => (
                    <article
                        key={testimonial.name}
                        className="flex flex-col items-start gap-6 p-[30px] flex-1 bg-dark-06 rounded-[10px] border border-dark-12"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start">
                                <h3 className="font-medium text-grey-90 text-lg">
                                    {testimonial.name}
                                </h3>
                                <p className="font-normal text-grey-40 text-base">
                                    {testimonial.location}
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-dark-12 border border-dark-12 text-grey-80 text-xl">
                                ↗
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {testimonial.stars.map((star, index) => (
                                <img key={index} className="w-4 h-4" alt="" src={star.src || star} />
                            ))}
                        </div>
                        <p className="font-medium text-grey-90 text-lg leading-[27px]">
                            {testimonial.review}
                        </p>
                    </article>
                ))}
            </div>

            {/* Mobile Carousel (Hidden on Desktop) */}
            <div className="flex lg:hidden flex-col items-center gap-8 w-full">
                <article className="flex flex-col items-start gap-5 p-6 w-full bg-dark-06 rounded-[10px] border border-dark-12">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                            <h3 className="font-medium text-grey-90 text-base">
                                {activeTestimonial.name}
                            </h3>
                            <p className="font-normal text-grey-40 text-sm">
                                {activeTestimonial.location}
                            </p>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-12 border border-dark-12 text-absolutewhite text-lg">
                            →
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {activeTestimonial.stars.map((star, index) => (
                            <img key={index} className="w-4 h-4" alt="" src={star.src || star} />
                        ))}
                    </div>
                    <p className="font-medium text-grey-90 text-base leading-6">
                        {activeTestimonial.review}
                    </p>
                </article>

                <nav className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex w-12 h-12 items-center justify-center rounded-lg bg-dark-12 border border-dark-12 text-absolutewhite text-xl"
                        aria-label="Show previous testimonial"
                    >
                        ←
                    </button>
                    <span className="font-medium text-grey-50 text-sm">
                        {activePage + 1} / {testimonials.length}
                    </span>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex w-12 h-12 items-center justify-center rounded-lg bg-dark-12 border border-dark-12 text-absolutewhite text-xl"
                        aria-label="Show next testimonial"
                    >
                        →
                    </button>
                </nav>
            </div>

        </section>
    );
};
