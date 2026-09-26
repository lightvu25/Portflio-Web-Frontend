"use client";
import React, { useState } from "react";
const vector9: any = { src: "/placeholder.svg" };
const vector92: any = { src: "/placeholder.svg" };
const vector93: any = { src: "/placeholder.svg" };
const vector94: any = { src: "/placeholder.svg" };
const vector95: any = { src: "/placeholder.svg" };
const vector96: any = { src: "/placeholder.svg" };
const vector97: any = { src: "/placeholder.svg" };
const vector98: any = { src: "/placeholder.svg" };

type FaqItem = {
    id: string;
    question: string;
    answer?: string;
    icon: any;
};

const leftFaqs: FaqItem[] = [
    {
        id: "photography-specialty",
        question: "WHAT TYPE OF PHOTOGRAPHY DO YOU SPECIALIZE IN?",
        answer: "I specialize in Portrait, Landscape, Event, and Branding photography, capturing moments that tell unique stories.",
        icon: vector9,
    },
    {
        id: "booking-session",
        question: "HOW CAN I BOOK A PHOTOGRAPHY SESSION WITH YOU?",
        answer: "You can book a photography session by getting in touch through the contact form or by reaching out directly via email.",
        icon: vector93,
    },
    {
        id: "photography-equipment",
        question: "WHAT EQUIPMENT DO YOU USE FOR YOUR PHOTOGRAPHY?",
        answer: "I use professional cameras, lenses, lighting, and supporting equipment selected for each specific photography project.",
        icon: vector95,
    },
    {
        id: "specific-location",
        question: "CAN I REQUEST A SPECIFIC LOCATION FOR A SHOOT?",
        answer: "Yes, you can request a preferred location and we can plan the photography session around your vision.",
        icon: vector97,
    },
];

const rightFaqs: FaqItem[] = [
    {
        id: "editing-process",
        question: "WHAT IS YOUR EDITING PROCESS LIKE?",
        answer: "My editing process focuses on enhancing the natural beauty of the photos while maintaining an authentic feel.",
        icon: vector96,
    },
    {
        id: "digital-files",
        question: "ARE DIGITAL FILES INCLUDED IN YOUR PHOTOGRAPHY PACKAGES?",
        answer: "Yes, high-resolution digital files are included in most of our photography packages.",
        icon: vector94,
    },
    {
        id: "prints",
        question: "DO YOU OFFER PRINTS OF YOUR PHOTOGRAPHS?",
        answer: "Yes, prints are available for purchase. Explore the 'Prints' section for more details on sizes and pricing.",
        icon: vector92,
    },
    {
        id: "edited-photos",
        question: "HOW LONG DOES IT TAKE TO RECEIVE THE EDITED PHOTOS AFTER A SESSION?",
        answer: "Typically, it takes about 2-3 weeks to receive the fully edited gallery, depending on the scope of the project.",
        icon: vector98,
    },
];

const FaqColumn = ({
    items,
    openItems,
    onToggle,
    isLeft
}: {
    items: FaqItem[];
    openItems: Set<string>;
    onToggle: (id: string) => void;
    isLeft?: boolean;
}) => (
    <div className={`flex flex-col flex-1 w-full gap-2 lg:py-[30px] ${isLeft ? "lg:border-r border-dark-12 lg:pr-[30px]" : "lg:pl-[30px]"}`}>
        {items.map((item, index) => {
            const isOpen = openItems.has(item.id);
            const answerId = `${item.id}-answer`;
            const isLast = index === items.length - 1;

            return (
                <div key={item.id} className="w-full">
                    <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={item.answer ? answerId : undefined}
                        onClick={() => onToggle(item.id)}
                        className={`flex w-full text-left gap-4 lg:gap-[30px] px-6 lg:px-10 py-5 lg:py-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-55 ${isOpen ? "items-start" : "items-center"}`}
                    >
                        <div className={`flex flex-1 flex-col gap-4 lg:gap-5`}>
                            <span className="font-semibold text-grey-70 text-base lg:text-lg uppercase">
                                {item.question}
                            </span>
                            {isOpen && item.answer && (
                                <span
                                    id={answerId}
                                    className="font-normal text-grey-50 text-sm lg:text-base leading-6"
                                >
                                    {item.answer}
                                </span>
                            )}
                        </div>
                        <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 lg:w-[48px] lg:h-[48px] rounded-full border border-dark-12 bg-dark-06">
                            <img
                                className="w-4 h-4 lg:w-5 lg:h-5"
                                alt=""
                                src={item.icon.src || item.icon}
                            />
                        </div>
                    </button>
                    {!isLast && <div className="w-full h-px bg-dark-12" />}
                </div>
            );
        })}
    </div>
);

export const FAQSection = () => {
    const [openItems, setOpenItems] = useState<Set<string>>(
        new Set(["photography-specialty", "prints"])
    );

    const toggleFaq = (id: string): void => {
        setOpenItems((currentItems) => {
            const nextItems = new Set(currentItems);
            if (nextItems.has(id)) {
                nextItems.delete(id);
            } else {
                nextItems.add(id);
            }
            return nextItems;
        });
    };

    return (
        <section id="faq" className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-10 lg:py-[60px] flex flex-col items-start border-b border-dark-12">
            
            <header className="w-full flex flex-col items-start gap-1 pb-6 lg:pb-10 border-b border-dark-12">
                <p className="font-semibold text-grey-50 text-sm lg:text-base tracking-[0] uppercase">
                    FAQ&apos;S
                </p>
                <h2 className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0] uppercase">
                    FREQUENTLY ASKED QUESTIONS
                </h2>
            </header>

            {/* Content layout: Stack on mobile, side-by-side on desktop */}
            <div className="flex flex-col lg:flex-row items-start w-full gap-6 lg:gap-0 pt-6 lg:pt-0">
                <FaqColumn items={leftFaqs} openItems={openItems} onToggle={toggleFaq} isLeft={true} />
                <div className="lg:hidden w-full h-px bg-dark-12" /> {/* Mobile divider between left/right lists */}
                <FaqColumn items={rightFaqs} openItems={openItems} onToggle={toggleFaq} isLeft={false} />
            </div>

        </section>
    );
};
