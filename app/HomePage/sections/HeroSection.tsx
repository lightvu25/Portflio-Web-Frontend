"use client";
import React from "react";

const abstractDesign: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath fill='none' stroke='%23333' stroke-width='2' d='M100,0 A100,100 0 0,0 100,200 A100,100 0 0,0 100,0 M100,20 A80,80 0 0,0 100,180 A80,80 0 0,0 100,20 M100,40 A60,60 0 0,0 100,160 A60,60 0 0,0 100,40 M100,60 A40,40 0 0,0 100,140 A40,40 0 0,0 100,60'/%3E%3C/svg%3E" };
const icon: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238672F3' stroke-width='2'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E" };
const image: any = { src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop" };
const image2: any = { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop" };
const image3: any = { src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop" };
const image4: any = { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop" };
const image5: any = { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop" };
const image6: any = { src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop" };
const vector431Stroke: any = { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 19L19 5M19 5H9M19 5v10'/%3E%3C/svg%3E" };

const photographyServices = [
    { icon, label: "EVENT PHOTOGRAPHY" },
    { icon, label: "COMERCIAL PHOTOGRAPHY" },
    { icon, label: "PRODUCT PHOTOGRAPHY" },
    { icon, label: "WEDDING PHOTOGRAPHY" },
    { icon, label: "LANDSCAPE PHOTOGRAPHY" },
    { icon, label: "BRANDING PHOTOGRAPHY" },
    { icon, label: "PORTRAIT PHOTOGRAPHY" },
];

const galleryImages = [
    { src: image, alt: "Photography portfolio image", className: "absolute w-full h-full top-0 left-0 object-cover" },
    { src: image2, alt: "Photography portfolio image", className: "absolute w-[66.17%] h-full top-0 left-[33.83%] object-cover" },
    { src: image3, alt: "Photography portfolio image", className: "absolute w-[88.41%] h-[69.14%] top-[30.86%] left-[11.59%] object-cover" },
    { src: image4, alt: "Photography portfolio image", className: "absolute w-[24.44%] h-full top-0 left-[75.56%] object-cover" },
    { src: image5, alt: "Photography portfolio image", className: "absolute w-[24.44%] h-[40.04%] top-[59.96%] left-[75.56%] object-cover" },
    { src: image6, alt: "Photography portfolio image", className: "absolute w-[99.94%] h-[27.93%] top-[72.07%] left-0 object-cover" },
];

export const HeroSection = () => {
    const handleContactClick = () => {
        const contactSection = document.getElementById("contact");
        contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section className="w-full flex flex-col items-center border-b border-dark-12 overflow-hidden">
            {/* Header Area */}
            <header className="relative w-full max-w-[1440px] flex flex-col md:flex-row items-center justify-between px-6 lg:px-[62px] py-10 lg:py-20 border-b border-dark-12 gap-8 md:gap-0">
                {/* Abstract Design - Hidden on Mobile */}
                <img
                    className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none opacity-20"
                    alt=""
                    aria-hidden="true"
                    src={abstractDesign.src || abstractDesign}
                />
                
                {/* Title */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 w-full md:w-auto">
                    <p className="font-medium text-grey-40 text-sm lg:text-lg tracking-[0]">
                        STUNNING PHOTOGRAPHY BY
                    </p>
                    <h1 className="font-semibold text-grey-90 text-[40px] lg:text-[70px] leading-tight tracking-[0] mt-1 lg:mt-0">
                        DAMIEN BRAUN
                    </h1>
                </div>

                {/* Call to action */}
                <button
                    type="button"
                    onClick={handleContactClick}
                    className="flex flex-col items-center md:items-start gap-1 relative z-10 appearance-none border-0 bg-transparent p-0 text-left cursor-pointer group"
                    aria-label="Let's work together"
                >
                    <span className="inline-flex items-center gap-4">
                        <span className="font-semibold text-absolutewhite text-[28px] lg:text-[50px] tracking-[0]">
                            LET&apos;S
                        </span>
                        <span className="inline-flex items-center justify-center w-12 h-12 lg:w-[60px] lg:h-[60px] bg-purple-55 rounded-full shadow-[inset_4px_4px_17.4px_#ffffff47] group-hover:bg-purple-60 transition-colors">
                            <img
                                className="w-[40%] h-[40%]"
                                alt=""
                                aria-hidden="true"
                                src={vector431Stroke.src || vector431Stroke}
                            />
                        </span>
                    </span>
                    <span className="font-semibold text-absolutewhite text-[28px] lg:text-[50px] tracking-[0]">
                        WORK TOGETHER
                    </span>
                </button>
            </header>

            {/* Services Marquee */}
            <div className="w-full border-b border-dark-12 bg-dark-06 overflow-hidden">
                <div className="flex items-center justify-start md:justify-center gap-10 lg:gap-14 px-4 py-5 whitespace-nowrap overflow-x-auto no-scrollbar">
                    {photographyServices.map((service, i) => (
                        <div
                            key={i}
                            className="inline-flex items-center gap-3 shrink-0"
                        >
                            <img
                                className="w-5 h-5 lg:w-6 lg:h-6"
                                alt=""
                                aria-hidden="true"
                                src={service.icon.src || service.icon}
                            />
                            <span className="font-normal text-grey-70 hover:text-purple-90 transition-colors text-xs lg:text-sm tracking-widest whitespace-nowrap uppercase">
                                {service.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gallery Image Group */}
            <div className="w-full max-w-[1440px] px-0 md:px-6 lg:px-20 py-0 lg:py-10">
                <div className="relative w-full h-[223px] sm:h-[300px] md:h-[450px] lg:h-[500px]">
                    {galleryImages.map((galleryImage, index) => (
                        <img
                            key={index}
                            className={galleryImage.className + " border-[4px] border-dark-03 rounded-lg object-cover"}
                            alt={galleryImage.alt}
                            src={galleryImage.src?.src || galleryImage.src}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
