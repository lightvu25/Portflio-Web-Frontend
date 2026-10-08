"use client";

import abstractDesign2 from "./abstract-design-2.svg";
import abstractDesign3 from "./abstract-design-3.svg";
import buttonsContainer8 from "./buttons-container-8.svg";
import container from "./container.svg";
import icon12 from "./icon-12.svg";
import icon13 from "./icon-13.svg";
import icon14 from "./icon-14.svg";
import icon15 from "./icon-15.svg";
import icon16 from "./icon-16.svg";
import icon17 from "./icon-17.svg";
import icon18 from "./icon-18.svg";
import line7 from "./line-7.svg";
import vector431Stroke5 from "./vector-431-stroke-5.svg";

const photographyCategories = [
  { label: "EVENT PHOTOGRAPHY", icon: icon12 },
  { label: "COMERCIAL PHOTOGRAPHY", icon: icon13 },
  { label: "PRODUCT PHOTOGRAPHY", icon: icon14 },
  { label: "WEDDING PHOTOGRAPHY", icon: icon15 },
  { label: "LANDSCAPE PHOTOGRAPHY", icon: icon16 },
  { label: "BRANDING PHOTOGRAPHY", icon: icon17 },
  { label: "PORTRAIT  PHOTOGRAPHY", icon: icon18 },
];

const footerNavigation = [
  {
    title: "HOME",
    links: ["ABOUT ME", "MY WORKS", "TESTIMONIALS"],
  },
  {
    title: "CLIENTS",
    links: ["KLOVESTO", "NUKEWAY", "CLOVEN'S", "MENVOL"],
  },
  {
    title: "PORTFOLIO",
    links: ["EVENTS", "PORTRAIT", "BRANDING", "COMMERCIALE", "WEDDING"],
  },
  {
    title: "SERVICES",
    links: ["PORTRAITS", "EVENTS", "COMMERCIAL"],
  },
];

export const ClientTestimonialsSection = () => {
  const handleNavigation = (label: string) => {
    const target = label.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "");

    if (typeof document !== "undefined") {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col w-[1920px] max-w-full items-start absolute left-0 bottom-0">
      <div className="flex flex-col items-end justify-center gap-[100px] relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative flex-[0_0_auto]"
          alt="Decorative container"
          src={container}
        />
        <nav
          aria-label="Photography categories"
          className="flex items-start gap-5 p-5 relative self-stretch w-full flex-[0_0_auto] bg-dark-06 overflow-hidden border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12"
        >
          {photographyCategories.map((category) => (
            <button
              key={category.label}
              type="button"
              onClick={() => handleNavigation(category.label)}
              className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] appearance-none border-0 bg-transparent p-0 text-left"
              aria-label={category.label}
            >
              <img
                className="relative w-10 h-10"
                alt=""
                aria-hidden="true"
                src={category.icon}
              />
              <span className="relative w-fit font-normal text-purple-90 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {category.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
      <footer className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto] bg-transparent">
        <div className="flex items-start px-[162px] py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[60px] px-20 py-[100px] relative flex-[0_0_auto] border-l [border-left-style:solid] border-dark-12">
            <p className="relative w-fit mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              A MORE MEANINGFUL HOME FOR PHOTOGRAPHY
            </p>
            <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                  LET&apos;S
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigation("work together")}
                  className="inline-flex items-center px-[50px] py-[18px] flex-[0_0_auto] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] gap-2.5 relative appearance-none border-0 cursor-pointer"
                  aria-label="Let's work together"
                >
                  <span className="relative w-[30px] h-[30px]">
                    <img
                      className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
                      alt=""
                      aria-hidden="true"
                      src={vector431Stroke5}
                    />
                  </span>
                </button>
              </div>
              <div className="relative w-fit font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                WORK TOGETHER
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between px-20 py-[100px] relative flex-1 grow border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12">
            {footerNavigation.map((section) => (
              <nav
                key={section.title}
                aria-label={`${section.title} links`}
                className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]"
              >
                <div className="relative w-fit mt-[-1.00px] font-semibold font-semibold text-grey-50 text-lg tracking-[0] leading-[normal]">
                  {section.title}
                </div>
                <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]">
                  {section.links.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => handleNavigation(link)}
                      className="all-unset box-border inline-flex items-start px-0 py-1.5 flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-20 gap-2.5 relative cursor-pointer"
                    >
                      <span className="relative w-fit mt-[-1.00px] font-medium font-medium text-grey-95 text-lg tracking-[0] leading-[normal]">
                        {link}
                      </span>
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <img
            className="absolute top-[calc(50.00%_-_101px)] left-0 w-[162px] h-[200px]"
            alt=""
            aria-hidden="true"
            src={abstractDesign2}
          />
          <img
            className="absolute top-[calc(50.00%_-_101px)] right-0 w-[162px] h-[200px]"
            alt=""
            aria-hidden="true"
            src={abstractDesign3}
          />
        </div>
        <div className="flex items-start justify-between px-[162px] py-10 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12">
          <div className="inline-flex items-center gap-[11px] relative flex-[0_0_auto]">
            <a
              href="#terms-and-conditions"
              className="relative w-fit mt-[-1.00px] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap"
            >
              Terms &amp; Conditions
            </a>
            <img
              className="relative self-stretch w-px object-cover"
              alt=""
              aria-hidden="true"
              src={line7}
            />
            <a
              href="#privacy-policy"
              className="relative w-fit mt-[-1.00px] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap"
            >
              Privacy Policy
            </a>
          </div>
          <p className="relative w-fit mt-[-1.00px] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            © 2024 Damien Braun Photography. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => handleNavigation("social links")}
            className="absolute top-[calc(50.00%_-_34px)] left-[calc(50.00%_-_92px)] w-[184px] h-[68px] appearance-none border-0 bg-transparent p-0 cursor-pointer"
            aria-label="Open social links"
          >
            <img
              className="w-full h-full"
              alt=""
              aria-hidden="true"
              src={buttonsContainer8}
            />
          </button>
        </div>
      </footer>
    </div>
  );
};
