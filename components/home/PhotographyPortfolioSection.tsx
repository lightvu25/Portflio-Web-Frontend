"use client";

import { useState } from "react";
import line from "./line.svg";
import line2 from "./line-2.svg";
import line3 from "./line-3.svg";
import line4 from "./line-4.svg";
import line5 from "./line-5.svg";
import line6 from "./line-6.svg";
import vector9 from "./vector-9.svg";
import vector92 from "./vector-9-2.svg";
import vector93 from "./vector-9-3.svg";
import vector94 from "./vector-9-4.svg";
import vector95 from "./vector-9-5.svg";
import vector96 from "./vector-9-6.svg";
import vector97 from "./vector-9-7.svg";
import vector98 from "./vector-9-8.svg";

type FAQItem = {
  question: string;
  answer?: string;
  vector: string;
  vectorClassName: string;
};

const leftFaqs: FAQItem[] = [
  {
    question: "WHAT TYPE OF PHOTOGRAPHY DO YOU SPECIALIZE IN?",
    answer:
      "I specialize in [Portrait, Landscape, Event, etc.] photography, capturing moments that tell unique stories.",
    vector: vector9,
    vectorClassName:
      "absolute w-[77.95%] h-[68.39%] top-[31.61%] left-[22.05%]",
  },
  {
    question: "HOW CAN I BOOK A PHOTOGRAPHY SESSION WITH YOU?",
    vector: vector92,
    vectorClassName:
      "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    question: "WHAT EQUIPMENT DO YOU USE FOR YOUR PHOTOGRAPHY?",
    vector: vector93,
    vectorClassName:
      "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    question: "CAN I REQUEST A SPECIFIC LOCATION FOR A",
    vector: vector94,
    vectorClassName:
      "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
];

const rightFaqs: FAQItem[] = [
  {
    question: "WHAT IS YOUR EDITING PROCESS LIKE?",
    vector: vector95,
    vectorClassName:
      "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    question: "ARE DIGITAL FILES INCLUDED IN YOUR PHOTOGRAPHY PACKAGES?",
    vector: vector96,
    vectorClassName:
      "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    question: "DO YOU OFFER PRINTS OF YOUR PHOTOGRAPHS?",
    answer:
      "Yes, prints are available for purchase. Explore the 'Prints' section for more details on sizes and pricing.",
    vector: vector97,
    vectorClassName:
      "absolute w-[77.95%] h-[68.39%] top-[31.61%] left-[22.05%]",
  },
  {
    question:
      "HOW LONG DOES IT TAKE TO RECEIVE THE EDITED PHOTOS AFTER A SESSION?",
    vector: vector98,
    vectorClassName:
      "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
];

const leftLines = [line, line2, line3];
const rightLines = [line4, line5, line6];

type FAQColumnProps = {
  items: FAQItem[];
  lines: string[];
  initialOpenIndex: number;
  bordered?: boolean;
};

const FAQColumn = ({
  items,
  lines,
  initialOpenIndex,
  bordered = false,
}: FAQColumnProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const _hasAnswer = Boolean(item.answer);

        return (
          <div key={item.question}>
            <div>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}-${item.question
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
                onClick={() =>
                  setOpenIndex((currentIndex) =>
                    currentIndex === index ? null : index,
                  )
                }
              >
                {item.question}
              </button>
              {isOpen && item.answer ? (
                <p
                  id={`faq-answer-${index}-${item.question
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                  className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]"
                >
                  {item.answer}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label={`${isOpen ? "Collapse" : "Expand"}: ${item.question}`}
              aria-expanded={isOpen}
              onClick={() =>
                setOpenIndex((currentIndex) =>
                  currentIndex === index ? null : index,
                )
              }
            >
              <span className="relative w-6 h-6" aria-hidden="true">
                <img
                  className={item.vectorClassName}
                  alt=""
                  src={item.vector}
                />
              </span>
            </button>
          </div>
        );
      })}
      {lines.map((lineAsset, index) => (
        <img
          key={`${lineAsset}-${index}`}
          className="relative self-stretch w-full h-px object-cover"
          alt=""
          aria-hidden="true"
          src={lineAsset}
        />
      ))}
    </div>
  );
};

export const PhotographyPortfolioSection = () => {
  return (
    <section
      aria-labelledby="faq-heading"
      className="flex flex-col w-[1597px] items-start absolute top-[4488px] left-[162px]"
    >
      <header className="flex gap-1 pt-0 pb-[50px] px-0 self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12 flex-col items-start relative">
        <p className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
          FAQ&apos;S
        </p>
        <h2
          id="faq-heading"
          className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
        >
          FREQUENTLY ASKED QUESTIONS
        </h2>
      </header>
      <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
        <FAQColumn
          items={leftFaqs}
          lines={leftLines}
          initialOpenIndex={0}
          bordered
        />
        <FAQColumn items={rightFaqs} lines={rightLines} initialOpenIndex={2} />
      </div>
    </section>
  );
};
