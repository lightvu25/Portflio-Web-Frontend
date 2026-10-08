"use client";

import { useState } from "react";
import icon from "./icon.svg";
import icon2 from "./icon-2.svg";
import icon3 from "./icon-3.svg";
import icon4 from "./icon-4.svg";
import image11 from "./image-11.png";
import vector431Stroke3 from "./vector-431-stroke-3.svg";

const serviceHighlights = [
  {
    icon: icon,
    text: "COVERAGE FOR WEDDINGS, PARTIES, CORPORATE FUNCTIONS, AND MORE.",
  },
  {
    icon: icon2,
    text: "SKILLED PHOTOGRAPHERS WHO KNOW HOW TO SEIZE THE MOMENT.",
  },
  {
    icon: icon3,
    text: "A MIX OF CANDID AND POSED SHOTS FOR A COMPREHENSIVE STORY.",
  },
  {
    icon: icon4,
    text: "QUICK TURNAROUND FOR YOU TO RELIVE THE DAY'S HIGHLIGHTS.",
  },
];

export const PhotographerBiographySection = () => {
  const [activeService, setActiveService] = useState(0);

  const handlePrevious = (): void => {
    setActiveService((current) =>
      current === 0 ? serviceHighlights.length - 1 : current - 1,
    );
  };

  const handleNext = (): void => {
    setActiveService((current) =>
      current === serviceHighlights.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <section
      className="flex flex-col w-[1596px] items-start gap-20 absolute top-[2389px] left-[162px]"
      aria-labelledby="photography-services-title"
    >
      <header className="flex items-center gap-5 pt-0 pb-[50px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12">
        <div className="flex flex-col items-start gap-1 relative flex-1 grow">
          <p className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
            SERVICES
          </p>
          <h2
            id="photography-services-title"
            className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
          >
            MY PHOTOGRAPHY SERVICES
          </h2>
        </div>
        <div className="inline-flex items-center gap-[30px] relative flex-[0_0_auto]">
          <div
            className="inline-flex items-center gap-2.5"
            role="group"
            aria-label="Service navigation"
          >
            <button
              type="button"
              onClick={handlePrevious}
              className="all-unset box-border inline-flex h-12 w-12 items-center justify-center rounded-[10px] overflow-hidden border border-dark-12 bg-dark-12 text-absolutewhite transition-colors hover:bg-grey-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-55"
              aria-label="Previous service"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                ←
              </span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="all-unset box-border inline-flex h-12 w-12 items-center justify-center rounded-[10px] overflow-hidden border border-dark-12 bg-dark-12 text-absolutewhite transition-colors hover:bg-grey-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-55"
              aria-label="Next service"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                →
              </span>
            </button>
          </div>
          <button
            type="button"
            className="all-unset box-border inline-flex items-center px-6 py-4 flex-[0_0_auto] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-55"
          >
            <span className="relative z-[2] w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
              View All Services -&gt;
            </span>
          </button>
        </div>
      </header>
      <div className="flex items-center gap-[50px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-[50px] relative flex-1 grow">
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <h3 className="w-fit font-semibold font-semibold text-grey-50 text-[44px] leading-[normal] relative tracking-[0]">
                EVENTS
              </h3>
              <div className="inline-flex items-center px-[50px] py-[18px] flex-[0_0_auto] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] gap-2.5 relative">
                <div className="relative w-[30px] h-[30px]">
                  <img
                    className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
                    alt=""
                    aria-hidden="true"
                    src={vector431Stroke3}
                  />
                </div>
              </div>
            </div>
            <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
              Our event photography service is dedicated to capturing the magic
              of your special occasions. Whether it&apos;s a wedding, corporate
              event, or milestone celebration, we&apos;re there to document
              every heartfelt moment. We blend into the background, ensuring
              natural and candid shots that reflect the emotions of the day.
            </p>
          </div>
          <div className="flex flex-col items-end gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <h4 className="self-stretch mt-[-1.00px] font-medium font-medium text-grey-80 text-lg leading-[27px] relative tracking-[0]">
              Service Highlights
            </h4>
            <div
              className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]"
              aria-live="polite"
            >
              {serviceHighlights.map((highlight, index) => (
                <div
                  key={highlight.text}
                  className={`flex items-center gap-2.5 px-5 py-[18px] relative self-stretch w-full flex-[0_0_auto] rounded-xl border border-solid border-dark-12 ${
                    index === activeService ? "bg-dark-12" : ""
                  }`}
                >
                  <img
                    className="relative w-10 h-10"
                    alt=""
                    aria-hidden="true"
                    src={highlight.icon}
                  />
                  <p className="relative flex-1 font-normal text-grey-70 text-lg tracking-[0] leading-[27px]">
                    {highlight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <img
          className="relative flex-1 grow h-[625px] object-cover"
          alt="Photographer capturing an event"
          src={image11.src}
        />
      </div>
    </section>
  );
};
