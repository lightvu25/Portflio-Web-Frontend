import logo from "./logo.svg";

const navigationItems = [
  { label: "Home", target: "home" },
  { label: "About Me", target: "about" },
  { label: "Portfolio", target: "portfolio" },
  { label: "Services", target: "services" },
];

const navigateToSection = (target: string): void => {
  if (typeof window !== "undefined") {
    window.location.hash = target;
  }
};

export const MainNavigationSection = (): JSX.Element => {
  return (
    <header className="flex flex-col w-[1920px] items-start gap-2.5 px-[125px] py-0 absolute top-0 left-[calc(50.00%_-_960px)] bg-transparent [border-top-style:none] [border-right-style:none] border-b [border-bottom-style:solid] [border-left-style:none] border-dark-12">
      <div className="flex items-center justify-between px-10 py-[30px] relative self-stretch w-full flex-[0_0_auto] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12">
        <a
          className="relative w-[134.71px] h-[27.24px]"
          href="#home"
          aria-label="Go to home"
        >
          <img
            className="relative w-[134.71px] h-[27.24px]"
            alt="Logo"
            src={logo}
          />
        </a>
        <button
          type="button"
          className="all-unset box-border items-center px-6 py-4 mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] inline-flex gap-2.5 relative flex-[0_0_auto] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
          onClick={() => navigateToSection("contact")}
          aria-label="Contact me"
        >
          <span className="relative w-fit [font-family:'Manrope-Medium',Helvetica] font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Contact Me
          </span>
        </button>
        <nav
          className="inline-flex items-center absolute left-[calc(50.00%_-_298px)] bottom-0 rounded-[12px_12px_0px_0px] overflow-hidden border-t [border-top-style:solid] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <button
              key={item.target}
              type="button"
              className="all-unset box-border inline-flex items-center gap-2.5 px-10 py-[30px] relative flex-[0_0_auto] border-r [border-right-style:solid] border-dark-12"
              onClick={() => navigateToSection(item.target)}
              aria-label={`Go to ${item.label}`}
            >
              <span className="relative w-fit mt-[-1.00px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-70 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
