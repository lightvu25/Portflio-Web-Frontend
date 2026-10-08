"use client";

import { useState } from "react";
import image from "./image.svg";
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

type FaqItem = {
  id: string;
  question: string;
  answer?: string;
  icon: string;
  divider?: string;
  initiallyOpen?: boolean;
};

const leftFaqs: FaqItem[] = [
  {
    id: "photography-specialization",
    question: "WHAT TYPE OF PHOTOGRAPHY DO YOU SPECIALIZE IN?",
    answer:
      "I specialize in [Portrait, Landscape, Event, etc.] photography, capturing moments that tell unique stories.",
    icon: vector94,
    divider: line4,
    initiallyOpen: true,
  },
  {
    id: "book-session",
    question: "HOW CAN I BOOK A PHOTOGRAPHY SESSION WITH YOU?",
    icon: vector95,
    divider: line5,
  },
  {
    id: "equipment",
    question: "WHAT EQUIPMENT DO YOU USE FOR YOUR PHOTOGRAPHY?",
    icon: vector96,
    divider: line6,
  },
  {
    id: "specific-location",
    question: "CAN I REQUEST A SPECIFIC LOCATION FOR A",
    icon: vector97,
  },
];

const rightFaqs: FaqItem[] = [
  {
    id: "editing-process",
    question: "WHAT IS YOUR EDITING PROCESS LIKE?",
    icon: vector9,
    divider: line,
  },
  {
    id: "digital-files",
    question: "ARE DIGITAL FILES INCLUDED IN YOUR PHOTOGRAPHY PACKAGES?",
    icon: image,
    divider: line2,
  },
  {
    id: "prints",
    question: "DO YOU OFFER PRINTS OF YOUR PHOTOGRAPHS?",
    answer:
      "Yes, prints are available for purchase. Explore the 'Prints' section for more details on sizes and pricing.",
    icon: vector92,
    divider: line3,
    initiallyOpen: true,
  },
  {
    id: "edited-photos",
    question:
      "HOW LONG DOES IT TAKE TO RECEIVE THE EDITED PHOTOS AFTER A SESSION?",
    icon: vector93,
  },
];

export const FrequentlyAskedQuestionsSection = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(
      [...leftFaqs, ...rightFaqs]
        .filter((item) => item.initiallyOpen)
        .map((item) => item.id),
    ),
  );

  const toggleItem = (id: string) => {
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

  const renderFaqItem = (item: FaqItem) => {
    const isOpen = openItems.has(item.id);
    const answerId = `${item.id}-answer`;

    return (
      <div key={item.id} className="relative self-stretch w-full">
        <article
          className={`relative flex self-stretch w-full gap-10 px-[50px] py-[30px] ${
            isOpen ? "items-start" : "items-center"
          }`}
        >
          <div className="relative flex flex-1 grow flex-col items-start gap-[30px]">
            <h3 className="relative self-stretch mt-[-1.00px] font-semibold text-xl font-semibold leading-[normal] tracking-[0] text-grey-70">
              {item.question}
            </h3>
            {isOpen && item.answer ? (
              <p
                id={answerId}
                className="relative self-stretch text-lg font-normal leading-[27px] tracking-[0] text-grey-50"
              >
                {item.answer}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            aria-expanded={isOpen}
            aria-controls={item.answer ? answerId : undefined}
            aria-label={`${isOpen ? "Collapse" : "Expand"}: ${item.question}`}
            className={`relative inline-flex flex-[0_0_auto] items-center gap-2.5 overflow-hidden rounded-[100px] border border-solid border-dark-12 p-3.5 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-50 ${
              isOpen
                ? "mt-[-1.00px] mr-[-1.00px]"
                : "mt-[-1.00px] mb-[-1.00px] mr-[-1.00px]"
            }`}
          >
            <span className="relative h-6 w-6" aria-hidden="true">
              <img
                className={`absolute left-[22.05%] w-[77.95%] transition-transform duration-200 ${
                  isOpen
                    ? "top-[31.61%] h-[68.39%] rotate-180"
                    : "top-[34.55%] h-[65.45%]"
                }`}
                alt=""
                src={item.icon}
              />
            </span>
          </button>
        </article>
        {item.divider ? (
          <img
            className="relative h-px w-full object-cover"
            alt=""
            aria-hidden="true"
            src={item.divider}
          />
        ) : null}
      </div>
    );
  };

  return (
    <section
      className="absolute left-[calc(50.00%_-_798px)] top-[6551px] flex w-[1597px] flex-col items-start max-[1650px]:left-0 max-[1650px]:w-full"
      aria-labelledby="frequently-asked-questions-heading"
    >
      <header className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-1 border-b [border-bottom-style:solid] border-dark-12 px-0 pb-[50px] pt-0">
        <p className="relative mt-[-1.00px] self-stretch font-semibold text-xl font-semibold leading-[normal] tracking-[0] text-grey-50">
          FAQ&apos;S
        </p>
        <h2
          id="frequently-asked-questions-heading"
          className="relative self-stretch font-semibold text-[58px] font-semibold leading-[normal] tracking-[0] text-absolutewhite"
        >
          FREQUENTLY ASKED QUESTIONS
        </h2>
      </header>
      <div className="relative flex w-full flex-[0_0_auto] items-start max-[900px]:flex-col">
        <div className="relative flex flex-1 grow flex-col items-start gap-2.5 border-r [border-right-style:solid] border-dark-12 px-0 py-[30px] max-[900px]:border-r-0">
          {leftFaqs.map(renderFaqItem)}
        </div>
        <div className="relative flex flex-1 grow flex-col items-start gap-2.5 px-0 py-[30px]">
          {rightFaqs.map(renderFaqItem)}
        </div>
      </div>
    </section>
  );
};
