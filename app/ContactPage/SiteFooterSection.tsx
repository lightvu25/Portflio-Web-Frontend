import { useCallback } from "react";
import abstractDesign from "./abstract-design.svg";
import abstractDesign2 from "./abstract-design-2.svg";
import container from "./container.svg";
import icon from "./icon.svg";
import icon2 from "./icon-2.svg";
import icon3 from "./icon-3.svg";
import icon4 from "./icon-4.svg";
import icon5 from "./icon-5.svg";
import icon6 from "./icon-6.svg";
import image from "./image.svg";
import line from "./line.svg";
import vector431Stroke from "./vector-431-stroke.svg";

type FooterLinkGroup = {
  title: string;
  links: string[];
};

type PhotographyCategory = {
  label: string;
  asset: string;
};

const photographyCategories: PhotographyCategory[] = [
  { label: "EVENT PHOTOGRAPHY", asset: icon2 },
  { label: "COMERCIAL PHOTOGRAPHY", asset: icon3 },
  { label: "PRODUCT PHOTOGRAPHY", asset: icon4 },
  { label: "WEDDING PHOTOGRAPHY", asset: icon5 },
  { label: "LANDSCAPE PHOTOGRAPHY", asset: icon6 },
  { label: "BRANDING PHOTOGRAPHY", asset: icon },
  { label: "PORTRAIT  PHOTOGRAPHY", asset: image },
];

const footerLinkGroups: FooterLinkGroup[] = [
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

const linkClassName =
  "all-unset box-border items-start px-0 py-1.5 border-b [border-bottom-style:solid] border-dark-20 inline-flex gap-2.5 relative flex-[0_0_auto]";

const linkTextClassName =
  "relative w-fit mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-95 text-lg tracking-[0] leading-[normal]";

export const SiteFooterSection = (): JSX.Element => {
  const handleNavigation = useCallback((label: string) => {
    const target = label.toLowerCase().replaceAll(" ", "-").replaceAll("'", "");
    const element = document.getElementById(target);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col w-[1920px] items-start absolute left-0 bottom-0">
      <div className="flex flex-col items-end justify-center gap-[100px] relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative flex-[0_0_auto]"
          alt=""
          aria-hidden="true"
          src={container}
        />
        <nav
          className="flex items-start gap-5 p-5 relative self-stretch w-full flex-[0_0_auto] bg-dark-06 overflow-hidden border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12"
          aria-label="Photography categories"
        >
          {photographyCategories.map((category) => (
            <div
              className={`inline-flex items-center gap-2.5 relative flex-[0_0_auto] ${
                category.label.startsWith("PORTRAIT") ? "mr-[-20.00px]" : ""
              }`}
              key={category.label}
            >
              <img
                className="relative w-10 h-10"
                alt=""
                aria-hidden="true"
                src={category.asset}
              />
              <span className="relative w-fit [font-family:'Manrope-Regular',Helvetica] font-normal text-purple-90 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {category.label}
              </span>
            </div>
          ))}
        </nav>
      </div>
      <footer
        className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto] bg-transparent"
        aria-label="Site footer"
      >
        <div className="flex items-start px-[162px] py-0 relative self-stretch w-full flex-[0_0_auto]">
          <section className="inline-flex flex-col items-start gap-[60px] px-20 py-[100px] relative flex-[0_0_auto] border-l [border-left-style:solid] border-dark-12">
            <p className="relative w-fit mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              A MORE MEANINGFUL HOME FOR PHOTOGRAPHY
            </p>
            <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                  LET&apos;S
                </span>
                <button
                  type="button"
                  className="items-center px-[50px] py-[18px] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] inline-flex gap-2.5 relative flex-[0_0_auto]"
                  aria-label="Start working together"
                  onClick={() => handleNavigation("CONTACT")}
                >
                  <span
                    className="relative w-[30px] h-[30px]"
                    aria-hidden="true"
                  >
                    <img
                      className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
                      alt=""
                      src={vector431Stroke}
                    />
                  </span>
                </button>
              </div>
              <h2 className="relative w-fit [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                WORK TOGETHER
              </h2>
            </div>
          </section>
          <div className="flex items-start justify-between px-20 py-[100px] relative flex-1 grow border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12">
            {footerLinkGroups.map((group) => (
              <nav
                className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]"
                aria-label={`${group.title} links`}
                key={group.title}
              >
                <h3 className="w-fit [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-lg relative mt-[-1.00px] tracking-[0] leading-[normal]">
                  {group.title}
                </h3>
                <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]">
                  {group.links.map((link) => (
                    <button
                      className={linkClassName}
                      type="button"
                      key={link}
                      onClick={() => handleNavigation(link)}
                    >
                      <span className={linkTextClassName}>{link}</span>
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
            src={abstractDesign}
          />
          <img
            className="absolute top-[calc(50.00%_-_101px)] right-0 w-[162px] h-[200px]"
            alt=""
            aria-hidden="true"
            src={abstractDesign2}
          />
        </div>
        <div className="flex items-start justify-between px-[162px] py-10 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12">
          <nav
            className="inline-flex items-center gap-[11px] relative flex-[0_0_auto]"
            aria-label="Legal links"
          >
            <button
              type="button"
              className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap"
              onClick={() => handleNavigation("TERMS-CONDITIONS")}
            >
              Terms &amp; Conditions
            </button>
            <img
              className="relative self-stretch w-px object-cover"
              alt=""
              aria-hidden="true"
              src={line}
            />
            <button
              type="button"
              className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap"
              onClick={() => handleNavigation("PRIVACY-POLICY")}
            >
              Privacy Policy
            </button>
          </nav>
          <p className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            © 2024 Damien Braun Photography. All rights reserved.
          </p>
          <div
            className="absolute top-[calc(50.00%_-_34px)] left-[calc(50.00%_-_92px)] w-[184px] h-[68px] inline-flex items-center justify-center gap-2"
            aria-label="Social media links"
          >
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-dark-20 text-grey-50 text-sm"
              aria-label="Instagram"
              onClick={() => handleNavigation("INSTAGRAM")}
            >
              ig
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-dark-20 text-grey-50 text-sm"
              aria-label="Facebook"
              onClick={() => handleNavigation("FACEBOOK")}
            >
              f
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-dark-20 text-grey-50 text-sm"
              aria-label="LinkedIn"
              onClick={() => handleNavigation("LINKEDIN")}
            >
              in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
