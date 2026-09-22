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
import line7 from "./line-7.svg";
import vector431Stroke from "./vector-431-stroke.svg";

const photographyServices = [
  { label: "EVENT PHOTOGRAPHY", icon },
  { label: "COMERCIAL PHOTOGRAPHY", icon: icon2 },
  { label: "PRODUCT PHOTOGRAPHY", icon: icon3 },
  { label: "WEDDING PHOTOGRAPHY", icon: icon4 },
  { label: "LANDSCAPE PHOTOGRAPHY", icon: icon5 },
  { label: "BRANDING PHOTOGRAPHY", icon: icon6 },
  { label: "PORTRAIT  PHOTOGRAPHY", icon: icon7 },
];

const footerNavigation = [
  {
    title: "HOME",
    links: [
      { label: "ABOUT ME", href: "#about-me" },
      { label: "MY WORKS", href: "#my-works" },
      { label: "TESTIMONIALS", href: "#testimonials" },
    ],
  },
  {
    title: "CLIENTS",
    links: [
      { label: "KLOVESTO", href: "#klovesto" },
      { label: "NUKEWAY", href: "#nukeway" },
      { label: "CLOVEN'S", href: "#clovens" },
      { label: "MENVOL", href: "#menvol" },
    ],
  },
  {
    title: "PORTFOLIO",
    links: [
      { label: "EVENTS", href: "#events" },
      { label: "PORTRAIT", href: "#portrait" },
      { label: "BRANDING", href: "#branding" },
      { label: "COMMERCIALE", href: "#commerciale" },
      { label: "WEDDING", href: "#wedding" },
    ],
  },
  {
    title: "SERVICES",
    links: [
      { label: "PORTRAITS", href: "#portraits" },
      { label: "EVENTS", href: "#events" },
      { label: "COMMERCIAL", href: "#commercial" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];

export const SiteFooterSection = (): JSX.Element => {
  return (
    <section
      className="flex w-full min-w-[1920px] flex-col items-start bg-dark-06"
      aria-label="Site footer"
    >
      <div className="flex w-full flex-col items-end justify-center gap-[100px]">
        <img
          className="relative h-auto w-full"
          alt=""
          src={container}
          aria-hidden="true"
        />
        <div
          className="flex w-full items-start gap-5 overflow-hidden border-b border-t border-dark-12 bg-dark-06 p-5"
          aria-label="Photography specialties"
        >
          {photographyServices.map((service) => (
            <div
              className="inline-flex flex-none items-center gap-2.5"
              key={service.label}
            >
              <img
                className="h-10 w-10"
                alt=""
                src={service.icon}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap [font-family:'Manrope-Regular',Helvetica] text-lg font-normal leading-[27px] tracking-[0] text-purple-90">
                {service.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <footer className="relative flex w-full flex-col items-center bg-transparent">
        <div className="relative flex w-full items-start px-[162px] py-0">
          <div className="inline-flex flex-none flex-col items-start gap-[60px] border-l border-dark-12 px-20 py-[100px]">
            <p className="mt-[-1px] w-fit [font-family:'Manrope-SemiBold',Helvetica] text-xl font-semibold leading-[normal] tracking-[0] text-grey-50">
              A MORE MEANINGFUL HOME FOR PHOTOGRAPHY
            </p>
            <a
              className="inline-flex flex-col items-start gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-55 focus-visible:ring-offset-4 focus-visible:ring-offset-dark-06"
              href="#contact"
              aria-label="Let's work together"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="[font-family:'Manrope-SemiBold',Helvetica] text-[58px] font-semibold leading-[normal] tracking-[0] text-absolutewhite">
                  LET&apos;S
                </span>
                <span className="inline-flex flex-none items-center gap-2.5 rounded-[100px] bg-purple-55 px-[50px] py-[18px] shadow-[inset_4px_4px_17.4px_#ffffff47]">
                  <span className="relative h-[30px] w-[30px]">
                    <img
                      className="absolute left-[15.62%] top-[15.62%] h-[84.38%] w-[84.38%]"
                      alt=""
                      src={vector431Stroke}
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </span>
              <span className="[font-family:'Manrope-SemiBold',Helvetica] text-[58px] font-semibold leading-[normal] tracking-[0] text-absolutewhite">
                WORK TOGETHER
              </span>
            </a>
          </div>
          <nav
            className="flex flex-1 items-start justify-between border-l border-r border-dark-12 px-20 py-[100px]"
            aria-label="Footer navigation"
          >
            {footerNavigation.map((section) => (
              <div
                className="inline-flex flex-none flex-col items-start gap-5"
                key={section.title}
              >
                <h2 className="mt-[-1px] w-fit [font-family:'Manrope-SemiBold',Helvetica] text-lg font-semibold leading-[normal] tracking-[0] text-grey-50">
                  {section.title}
                </h2>
                <ul className="inline-flex list-none flex-col items-start gap-1.5 p-0">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <a
                        className="inline-flex items-start gap-2.5 border-b border-dark-20 px-0 py-1.5 [font-family:'Manrope-Medium',Helvetica] text-lg font-medium leading-[normal] tracking-[0] text-grey-95 outline-none transition-colors hover:text-purple-90 focus-visible:text-purple-90 focus-visible:ring-2 focus-visible:ring-purple-55"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <img
            className="absolute left-0 top-[calc(50%-101px)] h-[200px] w-[162px]"
            alt=""
            src={abstractDesign}
            aria-hidden="true"
          />
          <img
            className="absolute right-0 top-[calc(50%-101px)] h-[200px] w-[162px]"
            alt=""
            src={abstractDesign2}
            aria-hidden="true"
          />
        </div>
        <div className="relative flex w-full items-start justify-between border-t border-dark-12 px-[162px] py-10">
          <div className="inline-flex flex-none items-center gap-[11px]">
            <a
              className="mt-[-1px] whitespace-nowrap [font-family:'Manrope-Regular',Helvetica] text-lg font-normal leading-[27px] tracking-[0] text-grey-50 outline-none hover:text-purple-90 focus-visible:text-purple-90 focus-visible:ring-2 focus-visible:ring-purple-55"
              href="#terms"
            >
              Terms &amp; Conditions
            </a>
            <img
              className="h-auto self-stretch w-px object-cover"
              alt=""
              src={line7}
              aria-hidden="true"
            />
            <a
              className="mt-[-1px] whitespace-nowrap [font-family:'Manrope-Regular',Helvetica] text-lg font-normal leading-[27px] tracking-[0] text-grey-50 outline-none hover:text-purple-90 focus-visible:text-purple-90 focus-visible:ring-2 focus-visible:ring-purple-55"
              href="#privacy"
            >
              Privacy Policy
            </a>
          </div>
          <p className="mt-[-1px] w-fit whitespace-nowrap [font-family:'Manrope-Regular',Helvetica] text-lg font-normal leading-[27px] tracking-[0] text-grey-50">
            © 2024 Damien Braun Photography. All rights reserved.
          </p>
          <nav
            className="absolute left-[calc(50%-92px)] top-[calc(50%-34px)] flex h-[68px] w-[184px] items-center justify-center gap-3"
            aria-label="Social media"
          >
            {socialLinks.map((socialLink) => (
              <a
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-dark-12 [font-family:'Manrope-SemiBold',Helvetica] text-xs font-semibold tracking-[0] text-grey-95 outline-none transition-colors hover:border-purple-55 hover:text-purple-90 focus-visible:border-purple-55 focus-visible:ring-2 focus-visible:ring-purple-55"
                href={socialLink.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit Damien Braun Photography on ${socialLink.label}`}
                key={socialLink.label}
              ></a>
            ))}
          </nav>
        </div>
      </footer>
    </section>
  );
};
