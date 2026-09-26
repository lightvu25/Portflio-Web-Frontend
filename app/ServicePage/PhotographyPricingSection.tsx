import { useState } from "react";
import type { StaticImageData } from "next/image";
import buttonsContainer2 from "./buttons-container-2.svg";
import buttonsContainer3 from "./buttons-container-3.svg";
import buttonsContainer4 from "./buttons-container-4.svg";
import icon8 from "./icon-8.svg";
import icon9 from "./icon-9.svg";
import icon10 from "./icon-10.svg";
import icon11 from "./icon-11.svg";
import icon12 from "./icon-12.svg";
import icon13 from "./icon-13.svg";
import icon14 from "./icon-14.svg";
import icon15 from "./icon-15.svg";
import icon16 from "./icon-16.svg";
import icon17 from "./icon-17.svg";
import icon18 from "./icon-18.svg";
import icon19 from "./icon-19.svg";
import icon20 from "./icon-20.svg";
import icon21 from "./icon-21.svg";
import icon22 from "./icon-22.svg";
import icon23 from "./icon-23.svg";
import icon24 from "./icon-24.svg";
import icon25 from "./icon-25.svg";
import icon26 from "./icon-26.svg";
import icon27 from "./icon-27.svg";
import icon28 from "./icon-28.svg";
import icon29 from "./icon-29.svg";
import icon30 from "./icon-30.svg";
import icon31 from "./icon-31.svg";
import icon32 from "./icon-32.svg";
import image2 from "./image-2.png";
import image3 from "./image-3.png";
import image4 from "./image-4.png";
import vector431Stroke2 from "./vector-431-stroke-2.svg";
import vector431Stroke3 from "./vector-431-stroke-3.svg";
import vector431Stroke4 from "./vector-431-stroke-4.svg";
import vector431Stroke5 from "./vector-431-stroke-5.svg";
import vector431Stroke6 from "./vector-431-stroke-6.svg";
import vector431Stroke7 from "./vector-431-stroke-7.svg";
import vector431Stroke8 from "./vector-431-stroke-8.svg";
import vector431Stroke9 from "./vector-431-stroke-9.svg";
import vector431Stroke10 from "./vector-431-stroke-10.svg";
import vector431Stroke11 from "./vector-431-stroke-11.svg";
import vector431Stroke12 from "./vector-431-stroke-12.svg";
import vector431Stroke13 from "./vector-431-stroke-13.svg";

type Feature = {
  icon: string;
  text: string;
};

type Package = {
  name: string;
  price: string;
  priceClassName: string;
  arrow: string;
  features: Feature[];
};

type PhotographyCategory = {
  title: string;
  description: string;
  image: StaticImageData;
  controls: string;
  projectArrow: string;
  packages: Package[];
};

const categories: PhotographyCategory[] = [
  {
    title: "PORTRAIT PHOTOGRAPHY",
    description:
      "Our portrait photography service is all about showcasing your unique personality. Whether you need a professional headshot, a family portrait, or a personal photoshoot, we create images that reflect your true self. We work closely with you to bring out your best angles and expressions, ensuring every portrait tells your story.",
    image: image2,
    controls: buttonsContainer2,
    projectArrow: vector431Stroke13,
    packages: [
      {
        name: "Individual Session",
        price: "$250",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke11,
        features: [
          {
            icon: icon24,
            text: "IDEAL FOR CAPTURING YOUR UNIQUE PERSONALITY AND STYLE.",
          },
          {
            icon: icon25,
            text: "INCLUDES A 2-HOUR PHOTOSHOOT AND 20 PROFESSIONALLY EDITED IMAGES.",
          },
          {
            icon: icon26,
            text: "ADDITIONAL IMAGES CAN BE PURCHASED AT $10 EACH.",
          },
        ],
      },
      {
        name: "Family Session",
        price: "$400",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke10,
        features: [
          {
            icon: icon27,
            text: "PERFECT FOR CREATING LASTING MEMORIES WITH YOUR LOVED ONES.",
          },
          {
            icon: icon28,
            text: "INCLUDES A 3-HOUR PHOTOSHOOT AND 30 PROFESSIONALLY EDITED IMAGES.",
          },
          {
            icon: icon29,
            text: "ADDITIONAL IMAGES CAN BE PURCHASED AT $10 EACH.",
          },
        ],
      },
      {
        name: "Couple Session",
        price: "$300",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke9,
        features: [
          {
            icon: icon30,
            text: "CELEBRATE YOUR LOVE STORY WITH AN INTIMATE PHOTOSHOOT.",
          },
          {
            icon: icon31,
            text: "INCLUDES A 2.5-HOUR PHOTOSHOOT AND 25 PROFESSIONALLY EDITED IMAGES.",
          },
          {
            icon: icon32,
            text: "ADDITIONAL IMAGES CAN BE PURCHASED AT $10 EACH.",
          },
        ],
      },
    ],
  },
  {
    title: "EVENTS PHOTOGRAPHY",
    description:
      "Our event photography service is dedicated to capturing the magic of your special occasions. Whether it's a wedding, corporate event, or milestone celebration, we're there to document every heartfelt moment. We blend into the background, ensuring natural and candid shots that reflect the emotions of the day.",
    image: image3,
    controls: buttonsContainer3,
    projectArrow: vector431Stroke2,
    packages: [
      {
        name: "Wedding Photography",
        price: "$1,500",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke8,
        features: [
          {
            icon: icon8,
            text: "CAPTURE THE MAGIC OF YOUR SPECIAL DAY.",
          },
          {
            icon: icon9,
            text: "INCLUDES FULL-DAY COVERAGE, A SECOND PHOTOGRAPHER, AND 300+ PROFESSIONALLY EDITED IMAGES.",
          },
          {
            icon: icon10,
            text: "CUSTOMIZABLE PACKAGES ARE AVAILABLE TO SUIT YOUR SPECIFIC WEDDING NEEDS.",
          },
        ],
      },
      {
        name: "Party Coverage",
        price: "$800",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke7,
        features: [
          {
            icon: icon11,
            text: "PRESERVE THE FUN AND EXCITEMENT OF YOUR EVENT.",
          },
          {
            icon: icon12,
            text: "INCLUDES UP TO 4 HOURS OF COVERAGE AND 150+ PROFESSIONALLY EDITED IMAGES.",
          },
          {
            icon: icon13,
            text: "ADDITIONAL HOURS CAN BE ADDED AT $150 PER HOUR.",
          },
        ],
      },
      {
        name: "Corporate Events",
        price: "Custom\nPricing",
        priceClassName: "text-[55px] leading-[66px]",
        arrow: vector431Stroke5,
        features: [
          {
            icon: icon14,
            text: "TAILORED SOLUTIONS FOR CORPORATE GATHERINGS, CONFERENCES, AND SEMINARS.",
          },
          {
            icon: icon15,
            text: "CONTACT US FOR A PERSONALIZED QUOTE BASED ON YOUR EVENT'S REQUIREMENTS.",
          },
        ],
      },
    ],
  },
  {
    title: "COMMERCIAL PHOTOGRAPHY",
    description:
      "In the world of business, a compelling image can make all the difference. Our commercial photography service is designed to enhance your brand's visual identity. We create striking images for your products, services, and marketing campaigns that leave a lasting impact on your audience.",
    image: image4,
    controls: buttonsContainer4,
    projectArrow: vector431Stroke3,
    packages: [
      {
        name: "Product Photography",
        price: "$500",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke6,
        features: [
          {
            icon: icon16,
            text: "SHOWCASE YOUR PRODUCTS IN THE BEST LIGHT.",
          },
          {
            icon: icon17,
            text: "INCLUDES A HALF-DAY PHOTOSHOOT, 20 PROFESSIONALLY EDITED PRODUCT IMAGES, AND HIGH-RESOLUTION FILES.",
          },
          {
            icon: icon18,
            text: "ADDITIONAL IMAGES CAN BE PURCHASED AT $20 EACH.",
          },
        ],
      },
      {
        name: "Real Estate Photography",
        price: "$700",
        priceClassName: "text-[80px] leading-[120px] whitespace-nowrap",
        arrow: vector431Stroke4,
        features: [
          {
            icon: icon19,
            text: "HIGHLIGHT THE BEAUTY OF YOUR PROPERTIES.",
          },
          {
            icon: icon20,
            text: "INCLUDES INTERIOR AND EXTERIOR SHOTS, A 2-HOUR PHOTOSHOOT, AND 25 PROFESSIONALLY EDITED IMAGES.",
          },
          {
            icon: icon21,
            text: "ADDITIONAL IMAGES CAN BE PURCHASED AT $20 EACH.",
          },
        ],
      },
      {
        name: "Brand Photography",
        price: "Custom\nPricing",
        priceClassName: "text-[55px] leading-[66px]",
        arrow: vector431Stroke12,
        features: [
          {
            icon: icon22,
            text: "CRAFT A VISUAL NARRATIVE THAT ALIGNS WITH YOUR BRAND IDENTITY.",
          },
          {
            icon: icon23,
            text: "CONTACT US TO DISCUSS YOUR BRAND PHOTOGRAPHY NEEDS AND RECEIVE A PERSONALIZED QUOTE.",
          },
        ],
      },
    ],
  },
];

type ArrowButtonProps = {
  label: string;
  arrow: string;
  onClick: () => void;
};

const ArrowButton = ({
  label,
  arrow,
  onClick,
}: ArrowButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="all-unset box-border items-start px-0 py-1.5 border-b [border-bottom-style:solid] border-dark-20 inline-flex gap-2.5 relative flex-[0_0_auto] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-95"
    >
      <span className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-95 text-lg tracking-[0] leading-[normal]">
        {label}
      </span>
      <span className="relative w-6 h-6" aria-hidden="true">
        <img
          className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
          alt=""
          src={arrow}
        />
      </span>
    </button>
  );
};

export const PhotographyPricingSection = () => {
  const [announcement, setAnnouncement] = useState("");

  const announceProjectView = (category: string) => {
    setAnnouncement(`Viewing ${category.toLowerCase()} projects.`);
  };

  const announceBooking = (packageName: string) => {
    setAnnouncement(`Booking request started for ${packageName}.`);
  };

  return (
    <section
      className="flex flex-col w-[1596px] items-start absolute top-[1153px] left-[162px]"
      aria-label="Photography pricing"
    >
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      {categories.map((category) => (
        <article
          key={category.title}
          className="flex flex-col items-start pt-20 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12"
        >
          <header className="flex items-center gap-[50px] pt-0 pb-20 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col w-[652px] items-start gap-[50px] relative">
              <h2 className="self-stretch mt-[-1.00px] text-grey-50 text-[44px] relative [font-family:'Manrope-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">
                {category.title}
              </h2>
              <p className="relative self-stretch [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
                {category.description}
              </p>
              <ArrowButton
                label="VIEW PROJECTS"
                arrow={category.projectArrow}
                onClick={() => announceProjectView(category.title)}
              />
            </div>
            <div className="flex flex-col items-center justify-center relative flex-1 grow">
              <img
                className="relative self-stretch w-full h-[360px] object-cover"
                alt={`${category.title.toLowerCase()} showcase`}
                src={category.image.src}
              />
              <button
                type="button"
                className="relative flex-[0_0_auto] mt-[-38px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-95"
                aria-label={`Browse ${category.title.toLowerCase()} gallery`}
                onClick={() => announceProjectView(category.title)}
              >
                <img alt="" src={category.controls} aria-hidden="true" />
              </button>
            </div>
          </header>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            {category.packages.map((servicePackage) => (
              <section
                key={servicePackage.name}
                className="flex items-center gap-[100px] px-0 py-20 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12"
                aria-labelledby={`${category.title}-${servicePackage.name}`}
              >
                <div className="flex flex-col w-96 items-start relative">
                  <h3
                    id={`${category.title}-${servicePackage.name}`}
                    className="relative self-stretch mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-80 text-[22px] tracking-[0] leading-[33px]"
                  >
                    {servicePackage.name}
                  </h3>
                  <div className="flex items-center gap-5 relative self-stretch w-full flex-[0_0_auto]">
                    <div
                      className={`relative w-fit mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-80 tracking-[0] ${servicePackage.priceClassName}`}
                    >
                      {servicePackage.price.split("\n").map((line, index) => (
                        <span key={`${line}-${index}`}>
                          {line}
                          {index <
                          servicePackage.price.split("\n").length - 1 ? (
                            <br />
                          ) : null}
                        </span>
                      ))}
                    </div>
                    <ArrowButton
                      label="BOOK A CALL"
                      arrow={servicePackage.arrow}
                      onClick={() => announceBooking(servicePackage.name)}
                    />
                  </div>
                </div>
                <ul className="flex flex-col items-start gap-2.5 relative flex-1 grow list-none m-0 p-0">
                  {servicePackage.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-center gap-2.5 px-5 py-[18px] relative self-stretch w-full flex-[0_0_auto] rounded-xl border border-solid border-dark-12"
                    >
                      <img
                        className="relative w-10 h-10"
                        alt=""
                        aria-hidden="true"
                        src={feature.icon}
                      />
                      <p className="relative flex-1 [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-70 text-lg tracking-[0] leading-[27px]">
                        {feature.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
};
