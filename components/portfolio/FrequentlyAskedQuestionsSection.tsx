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

type FAQItem = {
  id: string;
  question: string;
  answer?: string;
  icon: string;
  iconClassName: string;
  questionClassName?: string;
};

const leftFaqs: FAQItem[] = [
  {
    id: "specialize",
    question: "WHAT TYPE OF PHOTOGRAPHY DO YOU SPECIALIZE IN?",
    answer:
      "I specialize in [Portrait, Landscape, Event, etc.] photography, capturing moments that tell unique stories.",
    icon: vector9,
    iconClassName: "absolute w-[77.95%] h-[68.39%] top-[31.61%] left-[22.05%]",
    questionClassName: "mt-[-1.00px]",
  },
  {
    id: "booking",
    question: "HOW CAN I BOOK A PHOTOGRAPHY SESSION WITH YOU?",
    icon: image,
    iconClassName: "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    id: "equipment",
    question: "WHAT EQUIPMENT DO YOU USE FOR YOUR PHOTOGRAPHY?",
    icon: vector92,
    iconClassName: "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    id: "location",
    question: "CAN I REQUEST A SPECIFIC LOCATION FOR A",
    icon: vector93,
    iconClassName: "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
];

const rightFaqs: FAQItem[] = [
  {
    id: "editing",
    question: "WHAT IS YOUR EDITING PROCESS LIKE?",
    icon: vector94,
    iconClassName: "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    id: "digital-files",
    question: "ARE DIGITAL FILES INCLUDED IN YOUR PHOTOGRAPHY PACKAGES?",
    icon: vector95,
    iconClassName: "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
  },
  {
    id: "prints",
    question: "DO YOU OFFER PRINTS OF YOUR PHOTOGRAPHS?",
    answer:
      "Yes, prints are available for purchase. Explore the 'Prints' section for more details on sizes and pricing.",
    icon: vector96,
    iconClassName: "absolute w-[77.95%] h-[68.39%] top-[31.61%] left-[22.05%]",
    questionClassName: "mt-[-1.00px]",
  },
  {
    id: "delivery",
    question:
      "HOW LONG DOES IT TAKE TO RECEIVE THE EDITED PHOTOS AFTER A SESSION?",
    icon: vector97,
    iconClassName: "absolute w-[77.95%] h-[65.45%] top-[34.55%] left-[22.05%]",
    questionClassName: "mt-[-1.00px]",
  },
];

const leftLines = [line, line2, line3];
const rightLines = [line4, line5, line6];

const FAQButton = ({
  item,
  expanded,
  onToggle,
}: {
  item: FAQItem;
  expanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={`faq-answer-${item.id}`}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${item.question}`}
      onClick={onToggle}
      className="items-center p-3.5 mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] rounded-[100px] overflow-hidden border border-solid border-dark-12 inline-flex gap-2.5 relative flex-[0_0_auto] cursor-pointer"
    >
      <span className="relative w-6 h-6" aria-hidden="true">
        <img className={item.iconClassName} alt="" src={item.icon} />
      </span>
    </button>
  );
};

const FAQRow = ({
  item,
  expanded,
  onToggle,
}: {
  item: FAQItem;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const hasAnswer = Boolean(item.answer);

  return (
    <div
      className={
        hasAnswer
          ? "flex items-start gap-10 px-[50px] py-[30px] relative self-stretch w-full flex-[0_0_auto]"
          : "items-center gap-10 px-[50px] py-[30px] self-stretch w-full flex-[0_0_auto] flex relative"
      }
    >
      <div
        className={
          hasAnswer
            ? "gap-[30px] flex-1 grow flex flex-col items-start relative"
            : "flex-1 grow relative"
        }
      >
        <p
          className={`self-stretch font-semibold font-semibold text-grey-70 text-xl relative tracking-[0] leading-[normal] ${
            item.questionClassName ?? ""
          }`}
        >
          {item.question}
        </p>
        {item.answer && expanded ? (
          <p
            id={`faq-answer-${item.id}`}
            className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]"
          >
            {item.answer}
          </p>
        ) : null}
      </div>
      <FAQButton item={item} expanded={expanded} onToggle={onToggle} />
    </div>
  );
};

export const FrequentlyAskedQuestionsSection = () => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    specialize: true,
    prints: true,
  });

  const toggleFAQ = (id: string): void => {
    setExpandedItems((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="flex flex-col w-[1597px] items-start absolute top-[4241px] left-[162px]"
    >
      <header className="gap-1 pt-0 pb-[50px] px-0 self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12 flex flex-col items-start relative">
        <div className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
          FAQ&apos;S
        </div>
        <h2
          id="faq-heading"
          className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
        >
          FREQUENTLY ASKED QUESTIONS
        </h2>
      </header>
      <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex-col items-start gap-2.5 px-0 py-[30px] flex-1 grow border-r [border-right-style:solid] border-dark-12 flex relative">
          {leftFaqs.map((item, index) => (
            <div key={item.id} className="contents">
              <FAQRow
                item={item}
                expanded={Boolean(expandedItems[item.id])}
                onToggle={() => toggleFAQ(item.id)}
              />
              {index < leftLines.length ? (
                <img
                  className="relative self-stretch w-full h-px object-cover"
                  alt=""
                  src={leftLines[index]}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-start gap-2.5 px-0 py-[30px] relative flex-1 grow">
          {rightFaqs.map((item, index) => (
            <div key={item.id} className="contents">
              <FAQRow
                item={item}
                expanded={Boolean(expandedItems[item.id])}
                onToggle={() => toggleFAQ(item.id)}
              />
              {index < rightLines.length ? (
                <img
                  className="relative self-stretch w-full h-px object-cover"
                  alt=""
                  src={rightLines[index]}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
