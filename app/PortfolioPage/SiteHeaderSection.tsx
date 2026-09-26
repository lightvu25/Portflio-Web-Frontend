import { useState } from "react";
import logo from "./logo.svg";

const navigationItems = [
  { label: "Home", value: "home" },
  { label: "About Me", value: "about" },
  { label: "Portfolio", value: "portfolio" },
  { label: "Services", value: "services" },
];

export const SiteHeaderSection = () => {
  const [activeItem, setActiveItem] = useState("portfolio");

  const handleNavigation = (value) => {
    setActiveItem(value);
  };

  return (
    <header className="flex flex-col w-[1920px] items-start gap-2.5 px-[125px] py-0 absolute top-0 left-[calc(50.00%_-_960px)] bg-transparent [border-top-style:none] [border-right-style:none] border-b [border-bottom-style:solid] [border-left-style:none] border-dark-12">
      <div className="flex items-center justify-between px-10 py-[30px] relative self-stretch w-full flex-[0_0_auto] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12">
        <img
          className="relative w-[134.72px] h-[27.24px]"
          alt="Logo"
          src={logo}
        />
        <button
          type="button"
          aria-label="Contact me"
          className="all-unset box-border items-center px-6 py-4 mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] inline-flex gap-2.5 relative flex-[0_0_auto] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <span className="relative w-fit [font-family:'Manrope-Medium',Helvetica] font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Contact Me
          </span>
        </button>
        <nav
          aria-label="Primary navigation"
          className="inline-flex items-center absolute left-[calc(50.00%_-_308px)] bottom-0 rounded-[12px_12px_0px_0px] overflow-hidden border-t [border-top-style:solid] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12"
        >
          {navigationItems.map((item, index) => {
            const isActive = activeItem === item.value;
            const _isFirst = index === 0;
            const _isPortfolio = item.value === "portfolio";

            return (
              <button
                key={item.value}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavigation(item.value)}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
