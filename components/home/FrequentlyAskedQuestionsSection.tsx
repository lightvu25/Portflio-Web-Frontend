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
  quote: string;
  ratingAssets: string[];
};

const testimonials: Testimonial[] = [
  {
    name: "Emily Johnson",
    location: "USA, California",
    quote:
      "Damien's photography doesn't just capture moments; it captures emotions. Hes work is simply mesmerizing.",
    ratingAssets: [shape, shape2, shape3, shape4, shape5],
  },
  {
    name: "John Smith",
    location: "USA, California",
    quote:
      "Damien has an incredible talent for making every event feel effortless, and the results speak for themselves.",
    ratingAssets: [shape6, shape7, shape8, shape9, shape10],
  },
  {
    name: "Samantha Davis",
    location: "USA, California",
    quote:
      "I was blown away by Damien's ability to capture the essence of our wedding day. Hes photographs are our cherished memories.",
    ratingAssets: [shape11, shape12, shape13, shape14, shape15],
  },
];

const DecorativeOverlay = () => (
  <div
    aria-hidden="true"
    className="absolute top-[calc(50.00%_-_425px)] left-[calc(50.00%_-_607px)] w-[1142px] h-[947px] opacity-50 pointer-events-none"
  >
    <div className="absolute top-[74px] right-[74px] w-[373px] h-[373px] rounded-[22px] rotate-[-144.54deg] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
    <div className="absolute top-[361px] right-[555px] w-[490px] h-[490px] rounded-[22px] rotate-[-54.66deg] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
  </div>
);

const CardControls = ({ name }: { name: string }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
      <button
        type="button"
        aria-label={`${liked ? "Remove like from" : "Like"} ${name}'s testimonial`}
        aria-pressed={liked}
        onClick={() => setLiked((current) => !current)}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border border-solid border-dark-20 bg-dark-12 text-sm leading-none transition-colors ${
          liked ? "text-yellow-400" : "text-grey-50"
        }`}
      >
        <span aria-hidden="true">♥</span>
      </button>
      <button
        type="button"
        aria-label={`Share ${name}'s testimonial`}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-solid border-dark-20 bg-dark-12 text-grey-50 text-sm leading-none transition-colors hover:text-absolutewhite"
      >
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <article className="flex flex-col items-start gap-[30px] p-10 relative flex-1 grow bg-dark-06 rounded-xl overflow-hidden border border-solid border-dark-12">
    <DecorativeOverlay />
    <div className="flex items-center gap-[26px] relative self-stretch w-full flex-[0_0_auto]">
      <div className="flex flex-1 grow flex-col items-start relative">
        <h3 className="relative self-stretch mt-[-1.00px] font-medium font-medium text-grey-90 text-xl tracking-[0] leading-[30px]">
          {testimonial.name}
        </h3>
        <p className="relative self-stretch font-normal text-grey-40 text-lg tracking-[0] leading-[27px]">
          {testimonial.location}
        </p>
      </div>
      <CardControls name={testimonial.name} />
    </div>
    <div
      className="inline-flex items-start gap-[5px] relative flex-[0_0_auto]"
      aria-label="5 out of 5 stars"
    >
      {testimonial.ratingAssets.map((asset, index) => (
        <img
          key={`${testimonial.name}-rating-${index}`}
          className="relative w-[19.31px] h-[18.56px]"
          src={asset}
          alt=""
          aria-hidden="true"
        />
      ))}
    </div>
    <p className="font-medium font-medium text-grey-90 text-xl leading-[30px] relative self-stretch tracking-[0]">
      {testimonial.quote}
    </p>
  </article>
);

export const FrequentlyAskedQuestionsSection = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="flex flex-col w-[1597px] max-w-[calc(100vw-48px)] items-start gap-20 absolute left-[162px] max-[1200px]:left-6 bottom-[1155px] max-[1200px]:bottom-auto max-[1200px]:top-[1155px]"
    >
      <header className="flex items-end gap-5 pt-0 pb-[50px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12 max-[900px]:flex-col max-[900px]:items-start">
        <div className="flex flex-col items-start justify-center gap-5 relative flex-1 grow">
          <div className="flex gap-1 self-stretch w-full flex-[0_0_auto] flex-col items-start relative">
            <div className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              TESTIMONIALS
            </div>
            <h2
              id="testimonials-heading"
              className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal] max-[900px]:text-4xl"
            >
              WHAT MY CLIENTS SAY
            </h2>
          </div>
          <div className="flex gap-1.5 self-stretch w-full flex-[0_0_auto] flex-col items-start relative">
            <div className="relative self-stretch mt-[-1.00px] font-normal text-grey-40 text-lg tracking-[0] leading-[27px]">
              Total Reviews
            </div>
            <div className="relative self-stretch font-medium font-medium text-grey-80 text-[28px] tracking-[0] leading-[42px]">
              323
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-[30px] relative flex-[0_0_auto]">
          <div
            className="inline-flex items-center gap-2"
            aria-label="Testimonial navigation"
          >
            <button
              type="button"
              aria-label="Previous testimonials"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-solid border-dark-20 bg-dark-12 text-grey-50 text-lg transition-colors hover:text-absolutewhite"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label="Next testimonials"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-solid border-dark-20 bg-dark-12 text-grey-50 text-lg transition-colors hover:text-absolutewhite"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="all-unset box-border inline-flex items-center px-6 py-4 flex-[0_0_auto] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
          >
            <span className="relative w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
              {showAll ? "Hide Testimonials ←" : "View All Testimonials →"}
            </span>
          </button>
        </div>
      </header>
      <div className="flex items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto] max-[900px]:flex-col">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.name} testimonial={testimonial} />
        ))}
      </div>
    </section>
  );
};
