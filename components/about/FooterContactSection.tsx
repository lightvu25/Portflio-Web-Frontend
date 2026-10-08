import abstractDesign from "./abstract-design.svg";
import abstractDesign2 from "./abstract-design-2.svg";
import container from "./container.svg";
import icon from "./icon.svg";
import icon2 from "./icon-2.svg";
import icon3 from "./icon-3.svg";
import icon4 from "./icon-4.svg";
import icon5 from "./icon-5.svg";
import icon6 from "./icon-6.svg";
import icon7 from "./icon-7.svg";
import line from "./line.svg";
import vector431Stroke from "./vector-431-stroke.svg";

type FooterLinkGroup = {
  title: string;
  links: string[];
};

const serviceCategories = [
  { label: "EVENT PHOTOGRAPHY", image: icon },
  { label: "COMERCIAL PHOTOGRAPHY", image: icon2 },
  { label: "PRODUCT PHOTOGRAPHY", image: icon3 },
  { label: "WEDDING PHOTOGRAPHY", image: icon4 },
  { label: "LANDSCAPE PHOTOGRAPHY", image: icon5 },
  { label: "BRANDING PHOTOGRAPHY", image: icon6 },
  { label: "PORTRAIT  PHOTOGRAPHY", image: icon7 },
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
  "box-border items-start px-0 py-1.5 border-b [border-bottom-style:solid] border-dark-20 inline-flex gap-2.5 relative flex-[0_0_auto] text-left transition-colors hover:border-purple-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55";

export const FooterContactSection = () => {
  return (
    <div className="flex flex-col w-[1920px] items-start absolute left-0 bottom-0">
      <div className="flex flex-col items-end justify-center gap-[100px] relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative flex-[0_0_auto]"
          alt=""
          aria-hidden="true"
          src={container}
        />
        <div className="flex items-start gap-5 p-5 relative self-stretch w-full flex-[0_0_auto] bg-dark-06 overflow-hidden border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12">
          {serviceCategories.map((category) => (
            <div
              className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
              key={category.label}
            >
              <img
                className="relative w-10 h-10"
                alt=""
                aria-hidden="true"
                src={category.image}
              />
              <span className="relative w-fit font-normal text-purple-90 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {category.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <footer className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto] bg-transparent">
        <div className="flex items-start px-[162px] py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[60px] px-20 py-[100px] relative flex-[0_0_auto] border-l [border-left-style:solid] border-dark-12">
            <p className="relative w-fit mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              A MORE MEANINGFUL HOME FOR PHOTOGRAPHY
            </p>
            <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                <span className="relative w-fit mt-[-1.00px] font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                  LET&apos;S
                </span>
                <a
                  className="items-center px-[50px] py-[18px] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] inline-flex gap-2.5 relative flex-[0_0_auto] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55"
                  href="#contact"
                  aria-label="Start a project together"
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
                </a>
              </div>
              <span className="relative w-fit font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                WORK TOGETHER
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between px-20 py-[100px] relative flex-1 grow border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12">
            {footerLinkGroups.map((group) => (
              <nav
                className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]"
                key={group.title}
                aria-label={`${group.title} links`}
              >
                <span className="w-fit text-grey-50 text-lg relative mt-[-1.00px] font-semibold font-semibold tracking-[0] leading-[normal]">
                  {group.title}
                </span>
                <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]">
                  {group.links.map((link) => (
                    <a
                      className={linkClassName}
                      href={`#${link.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      key={link}
                    >
                      <span className="relative w-fit mt-[-1.00px] font-medium font-medium text-grey-95 text-lg tracking-[0] leading-[normal]">
                        {link}
                      </span>
                    </a>
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
            <a
              className="relative w-fit mt-[-1.00px] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:text-grey-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55"
              href="#terms-and-conditions"
            >
              Terms &amp; Conditions
            </a>
            <img
              className="relative self-stretch w-px object-cover"
              alt=""
              aria-hidden="true"
              src={line}
            />
            <a
              className="relative w-fit mt-[-1.00px] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:text-grey-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55"
              href="#privacy-policy"
            >
              Privacy Policy
            </a>
          </nav>
          <p className="relative w-fit mt-[-1.00px] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            © 2024 Damien Braun Photography. All rights reserved.
          </p>
          <div
            className="absolute top-[calc(50.00%_-_34px)] left-[calc(50.00%_-_92px)] w-[184px] h-[68px] inline-flex items-center justify-center gap-2"
            aria-label="Social media links"
          >
            <a
              className="flex items-center justify-center w-10 h-10 rounded-full border border-dark-20 text-grey-50 text-sm transition-colors hover:bg-purple-55 hover:text-absolutewhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55"
              href="#instagram"
              aria-label="Instagram"
            >
              in
            </a>
            <a
              className="flex items-center justify-center w-10 h-10 rounded-full border border-dark-20 text-grey-50 text-sm transition-colors hover:bg-purple-55 hover:text-absolutewhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55"
              href="#facebook"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              className="flex items-center justify-center w-10 h-10 rounded-full border border-dark-20 text-grey-50 text-sm transition-colors hover:bg-purple-55 hover:text-absolutewhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-55"
              href="#linkedin"
              aria-label="LinkedIn"
            >
              li
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
