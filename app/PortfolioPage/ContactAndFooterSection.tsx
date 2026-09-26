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
  { label: "EVENT PHOTOGRAPHY", icon: icon },
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
  "box-border items-start px-0 py-1.5 border-b [border-bottom-style:solid] border-dark-20 inline-flex gap-2.5 relative flex-[0_0_auto] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55";

export const ContactAndFooterSection = (): JSX.Element => {
  return (
    <div className="flex flex-col w-[1920px] items-start absolute left-0 bottom-0">
      <div className="flex flex-col items-end justify-center gap-[100px] relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative flex-[0_0_auto]"
          alt="Decorative container"
          src={container}
        />
        <nav
          aria-label="Photography services"
          className="flex items-start gap-5 p-5 relative self-stretch w-full flex-[0_0_auto] bg-dark-06 overflow-hidden border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12"
        >
          {photographyServices.map((service) => (
            <a
              key={service.label}
              href="#contact"
              className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
            >
              <img
                className="relative w-10 h-10"
                alt=""
                aria-hidden="true"
                src={service.icon}
              />
              <span className="relative w-fit [font-family:'Manrope-Regular',Helvetica] font-normal text-purple-90 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {service.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
      <footer
        id="contact"
        className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto] bg-transparent"
      >
        <div className="flex items-start px-[162px] py-0 relative self-stretch w-full flex-[0_0_auto]">
          <section
            aria-labelledby="contact-heading"
            className="inline-flex flex-col items-start gap-[60px] px-20 py-[100px] relative flex-[0_0_auto] border-l [border-left-style:solid] border-dark-12"
          >
            <h2
              id="contact-heading"
              className="relative w-fit mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]"
            >
              A MORE MEANINGFUL HOME FOR PHOTOGRAPHY
            </h2>
            <a
              href="mailto:hello@damienbraun.com"
              className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
              aria-label="Contact Damien Braun"
            >
              <span className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                  LET&apos;S
                </span>
                <span className="items-center px-[50px] py-[18px] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] inline-flex gap-2.5 relative flex-[0_0_auto]">
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
                </span>
              </span>
              <span className="relative w-fit [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
                WORK TOGETHER
              </span>
            </a>
          </section>
          <nav
            aria-label="Footer navigation"
            className="flex items-start justify-between px-20 py-[100px] relative flex-1 grow border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12"
          >
            {footerNavigation.map((section) => (
              <div
                key={section.title}
                className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]"
              >
                <h3 className="w-fit mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-lg relative tracking-[0] leading-[normal]">
                  {section.title}
                </h3>
                <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]">
                  {section.links.map((link) => (
                    <a key={link} href="#contact" className={linkClassName}>
                      <span className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-95 text-lg tracking-[0] leading-[normal]">
                        {link}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
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
            aria-label="Legal navigation"
            className="inline-flex items-center gap-[11px] relative flex-[0_0_auto]"
          >
            <a
              href="#terms"
              className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
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
              href="#privacy"
              className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
            >
              Privacy Policy
            </a>
          </nav>
          <p className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            © 2024 Damien Braun Photography. All rights reserved.
          </p>
          <div
            className="absolute top-[calc(50.00%_-_34px)] left-[calc(50.00%_-_92px)] w-[184px] h-[68px] flex items-center justify-center gap-2.5"
            aria-label="Social links"
          >
            <a
              href="#instagram"
              aria-label="Instagram"
              className="w-3 h-3 rounded-full bg-grey-50 opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
            />
            <a
              href="#behance"
              aria-label="Behance"
              className="w-3 h-3 rounded-full bg-grey-50 opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
            />
            <a
              href="#linkedin"
              aria-label="LinkedIn"
              className="w-3 h-3 rounded-full bg-grey-50 opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-55"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
