import { useState } from "react";
import image from "./image.svg";
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

const testimonials = [
  {
    name: "Emily Johnson",
    location: "USA, California",
    review:
      "Damien's photography doesn't just capture moments; it captures emotions. Hes work is simply mesmerizing.",
    shapes: [shape, shape2, shape3, shape4, shape5],
  },
  {
    name: "John Smith",
    location: "USA, California",
    review:
      "Damien has an incredible talent for making every event feel effortless, and the results speak for themselves.",
    shapes: [shape6, shape7, shape8, shape9, shape10],
  },
  {
    name: "Samantha Davis",
    location: "USA, California",
    review:
      "I was blown away by Damien's ability to capture the essence of our wedding day. Hes photographs are our cherished memories.",
    shapes: [shape11, shape12, shape13, shape14, shape15],
  },
];

const HeaderControls = ({ onPrevious, onNext }) => (
  <div className="inline-flex items-center gap-[30px] relative flex-[0_0_auto]">
    <div
      className="inline-flex items-center gap-2"
      role="group"
      aria-label="Testimonial navigation"
    >
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous testimonials"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-dark-12 bg-dark-06 text-grey-80 transition-colors hover:bg-dark-12 focus:outline-none focus:ring-2 focus:ring-grey-50"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next testimonials"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-dark-12 bg-dark-06 text-grey-80 transition-colors hover:bg-dark-12 focus:outline-none focus:ring-2 focus:ring-grey-50"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
    <button
      type="button"
      className="all-unset box-border items-center px-6 py-4 mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] inline-flex gap-2.5 relative flex-[0_0_auto] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none focus:outline-none focus:ring-2 focus:ring-grey-50"
    >
      <span className="relative z-[2] w-fit [font-family:'Manrope-Medium',Helvetica] font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
        View All Testimonials -&gt;
      </span>
    </button>
  </div>
);

const CardControls = ({ name }) => (
  <div
    className="inline-flex items-center gap-1"
    role="group"
    aria-label={`${name} actions`}
  >
    <button
      type="button"
      aria-label={`Previous testimonial for ${name}`}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-12 bg-dark-12 text-grey-80 transition-colors hover:text-absolutewhite focus:outline-none focus:ring-1 focus:ring-grey-50"
    >
      <span aria-hidden="true">←</span>
    </button>
    <button
      type="button"
      aria-label={`Next testimonial for ${name}`}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-12 bg-dark-12 text-grey-80 transition-colors hover:text-absolutewhite focus:outline-none focus:ring-1 focus:ring-grey-50"
    >
      <span aria-hidden="true">→</span>
    </button>
    <button
      type="button"
      aria-label={`Open ${name}'s testimonial`}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-12 bg-dark-12 text-grey-80 transition-colors hover:text-absolutewhite focus:outline-none focus:ring-1 focus:ring-grey-50"
    >
      <span aria-hidden="true">↗</span>
    </button>
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <article className="flex flex-col items-start gap-[30px] p-10 relative flex-1 grow bg-dark-06 rounded-xl overflow-hidden border border-solid border-dark-12">
    <div
      aria-hidden="true"
      className="absolute top-[calc(50.00%_-_425px)] left-[calc(50.00%_-_607px)] w-[1142px] h-[947px] opacity-50"
    >
      <div className="absolute top-[74px] right-[74px] w-[373px] h-[373px] rounded-[22px] rotate-[-144.54deg] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
      <div className="absolute top-[361px] right-[555px] w-[490px] h-[490px] rounded-[22px] rotate-[-54.66deg] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
    </div>
    <div className="flex items-center gap-[26px] relative self-stretch w-full flex-[0_0_auto]">
      <div className="flex-1 grow flex flex-col items-start relative">
        <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-90 text-xl tracking-[0] leading-[30px]">
          {testimonial.name}
        </h3>
        <div className="relative self-stretch [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-40 text-lg tracking-[0] leading-[27px]">
          {testimonial.location}
        </div>
      </div>
      <div className="relative flex-[0_0_auto]">
        <img className="sr-only" src={image} alt="" />
        <CardControls name={testimonial.name} />
      </div>
    </div>
    <div
      className="inline-flex items-start gap-[5px] relative flex-[0_0_auto]"
      aria-label="5 out of 5 stars"
    >
      {testimonial.shapes.map((star, index) => (
        <img
          key={`${testimonial.name}-star-${index}`}
          className="relative w-[19.31px] h-[18.56px]"
          alt=""
          aria-hidden="true"
          src={star}
        />
      ))}
    </div>
    <p className="relative self-stretch [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-90 text-xl tracking-[0] leading-[30px]">
      {testimonial.review}
    </p>
  </article>
);

export const ClientTestimonialsSection = () => {
  const [navigationStep, setNavigationStep] = useState(0);

  const handlePrevious = () => {
    setNavigationStep((step) => step - 1);
  };

  const handleNext = () => {
    setNavigationStep((step) => step + 1);
  };

  return (
    <section
      aria-labelledby="client-testimonials-heading"
      className="flex flex-col w-[1597px] items-start gap-20 absolute left-[162px] bottom-[1155px]"
    >
      <div className="flex items-end gap-5 pt-0 pb-[50px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12">
        <div className="flex flex-col items-start justify-center gap-5 relative flex-1 grow">
          <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              TESTIMONIALS
            </div>
            <h2
              id="client-testimonials-heading"
              className="relative self-stretch [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
            >
              WHAT MY CLIENTS SAY
            </h2>
          </div>
          <div className="gap-1.5 self-stretch w-full flex-[0_0_auto] flex flex-col items-start relative">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-40 text-lg tracking-[0] leading-[27px]">
              Total Reviews
            </div>
            <div className="relative self-stretch [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-80 text-[28px] tracking-[0] leading-[42px]">
              323
            </div>
          </div>
        </div>
        <HeaderControls onPrevious={handlePrevious} onNext={handleNext} />
      </div>
      <div
        className="flex items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]"
        data-navigation-step={navigationStep}
      >
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.name} testimonial={testimonial} />
        ))}
      </div>
    </section>
  );
};
