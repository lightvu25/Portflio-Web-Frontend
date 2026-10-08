"use client";

import { useState } from "react";
import shape from "./shape.svg";
import shape2 from "./shape-2.svg";
import shape3 from "./shape-3.svg";
import shape4 from "./shape-4.svg";
import shape5 from "./shape-5.svg";
import shape6 from "./shape-6.svg";
import shape7 from "./shape-7.svg";
import shape8 from "./shape-8.svg";
import shape9 from "./shape-9.svg";
import shape10 from "./shape-10.svg";
import shape11 from "./shape-11.svg";
import shape12 from "./shape-12.svg";
import shape13 from "./shape-13.svg";
import shape14 from "./shape-14.svg";
import shape15 from "./shape-15.svg";

type Testimonial = {
  name: string;
  location: string;
  text: string;
  rating: string[];
};

const testimonials: Testimonial[] = [
  {
    name: "Emily Johnson",
    location: "USA, California",
    text: "Damien's photography doesn't just capture moments; it captures emotions. Hes work is simply mesmerizing.",
    rating: [shape, shape2, shape3, shape4, shape5],
  },
  {
    name: "John Smith",
    location: "USA, California",
    text: "Damien has an incredible talent for making every event feel effortless, and the results speak for themselves.",
    rating: [shape6, shape7, shape8, shape9, shape10],
  },
  {
    name: "Samantha Davis",
    location: "USA, California",
    text: "I was blown away by Damien's ability to capture the essence of our wedding day. Hes photographs are our cherished memories.",
    rating: [shape11, shape12, shape13, shape14, shape15],
  },
];

const buttonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-dark-12 bg-dark-12 text-grey-70 transition-colors hover:bg-dark-20 hover:text-absolutewhite focus:outline-none focus:ring-2 focus:ring-grey-50";

export const ClientTestimonialsSection = () => {
  const [isTestimonialsVisible, setIsTestimonialsVisible] = useState(false);
  const [controlIndex, setControlIndex] = useState(0);

  const handlePrevious = () => {
    setControlIndex((currentIndex) =>
      currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1,
    );
  };

  const handleNext = () => {
    setControlIndex((currentIndex) =>
      currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="absolute bottom-[1155px] left-[162px] flex w-[1597px] flex-col items-start gap-20"
    >
      <header className="relative flex w-full flex-[0_0_auto] items-end gap-5 border-b [border-bottom-style:solid] border-dark-12 pb-[50px]">
        <div className="relative flex flex-1 grow flex-col items-start justify-center gap-5">
          <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-1">
            <div className="relative mt-[-1.00px] w-full self-stretch font-semibold text-xl font-semibold leading-[normal] tracking-[0] text-grey-50">
              TESTIMONIALS
            </div>
            <h2
              id="testimonials-heading"
              className="relative w-full self-stretch font-semibold text-[58px] font-semibold leading-[normal] tracking-[0] text-absolutewhite"
            >
              WHAT MY CLIENTS SAY
            </h2>
          </div>
          <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-1.5">
            <div className="relative mt-[-1.00px] w-full self-stretch text-lg font-normal leading-[27px] tracking-[0] text-grey-40">
              Total Reviews
            </div>
            <div className="relative w-full self-stretch font-medium text-[28px] font-medium leading-[42px] tracking-[0] text-grey-80">
              323
            </div>
          </div>
        </div>
        <div className="relative inline-flex flex-[0_0_auto] items-center gap-[30px]">
          <div
            className="inline-flex items-center gap-2.5"
            aria-label="Testimonial navigation"
          >
            <button
              type="button"
              className={buttonClass}
              onClick={handlePrevious}
              aria-label="Previous testimonial"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ←
              </span>
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={handleNext}
              aria-label="Next testimonial"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                →
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsTestimonialsVisible((visible) => !visible)}
            aria-expanded={isTestimonialsVisible}
            className="relative mr-[-1.00px] inline-flex flex-[0_0_auto] items-center gap-2.5 overflow-hidden rounded-[10px] border-[none] bg-dark-12 px-6 py-4 before:absolute before:inset-0 before:z-[1] before:pointer-events-none before:rounded-[10px] before:p-px before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]"
          >
            <span className="relative z-[2] w-fit whitespace-nowrap font-medium text-lg font-medium leading-[27px] tracking-[0] text-absolutewhite">
              {isTestimonialsVisible
                ? "Hide Testimonials"
                : "View All Testimonials ->"}
            </span>
          </button>
        </div>
      </header>
      <div className="relative flex w-full flex-[0_0_auto] items-start gap-[30px]">
        {testimonials.map((testimonial, testimonialIndex) => (
          <article
            key={testimonial.name}
            aria-current={
              testimonialIndex === controlIndex ? "true" : undefined
            }
            className="relative flex flex-1 grow flex-col items-start gap-[30px] overflow-hidden rounded-xl border border-solid border-dark-12 bg-dark-06 p-10"
          >
            <div
              aria-hidden="true"
              className="absolute left-[calc(50.00%_-_607px)] top-[calc(50.00%_-_425px)] h-[947px] w-[1142px] opacity-50"
            >
              <div className="absolute right-[74px] top-[74px] h-[373px] w-[373px] rotate-[-144.54deg] rounded-[22px] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
              <div className="absolute right-[555px] top-[361px] h-[490px] w-[490px] rotate-[-54.66deg] rounded-[22px] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
            </div>
            <div className="relative flex w-full flex-[0_0_auto] items-center gap-[26px]">
              <div className="relative flex flex-1 grow flex-col items-start">
                <h3 className="relative mt-[-1.00px] w-full self-stretch font-medium text-xl font-medium leading-[30px] tracking-[0] text-grey-90">
                  {testimonial.name}
                </h3>
                <div className="relative w-full self-stretch text-lg font-normal leading-[27px] tracking-[0] text-grey-40">
                  {testimonial.location}
                </div>
              </div>
              <button
                type="button"
                className={buttonClass}
                onClick={() => setControlIndex(testimonialIndex)}
                aria-label={`Select ${testimonial.name}'s testimonial`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  •••
                </span>
              </button>
            </div>
            <div
              className="relative inline-flex flex-[0_0_auto] items-start gap-[5px]"
              aria-label="5 out of 5 stars"
            >
              {testimonial.rating.map((ratingShape, ratingIndex) => (
                <img
                  key={`${testimonial.name}-rating-${ratingIndex}`}
                  className="relative h-[18.56px] w-[19.31px]"
                  src={ratingShape}
                  alt=""
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="relative w-full self-stretch font-medium text-xl font-medium leading-[30px] tracking-[0] text-grey-90">
              {testimonial.text}
            </p>
          </article>
        ))}
      </div>
      {isTestimonialsVisible && (
        <div className="sr-only" aria-live="polite">
          All client testimonials are currently displayed.
        </div>
      )}
    </section>
  );
};
