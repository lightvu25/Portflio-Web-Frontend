import logo from "./logo.svg";

const navigationItems = [
  {
    label: "Home",
    href: "#home",
    className: "border-r [border-right-style:solid] border-dark-12",
  },
  {
    label: "About Me",
    href: "#about-me",
    className: "border-r [border-right-style:solid] border-dark-12",
  },
  { label: "Portfolio", href: "#portfolio", className: "" },
  {
    label: "Services",
    href: "#services",
    className: "bg-dark-08 border border-solid border-dark-12",
    active: true,
  },
];

export const SiteHeaderSection = () => {
  return (
    <header className="flex flex-col w-[1920px] items-start gap-2.5 px-[125px] py-0 absolute top-0 left-[calc(50.00%_-_960px)] bg-transparent [border-top-style:none] [border-right-style:none] border-b [border-bottom-style:solid] [border-left-style:none] border-dark-12">
      <div className="flex items-center justify-between px-10 py-[30px] relative self-stretch w-full flex-[0_0_auto] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12">
        <a
          href="#home"
          aria-label="Go to homepage"
          className="relative flex shrink-0"
        >
          <img
            className="relative w-[134.72px] h-[27.24px]"
            alt="Logo"
            src={logo}
          />
        </a>
        <a
          href="#contact"
          className="all-unset box-border items-center px-6 py-4 mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] inline-flex gap-2.5 relative flex-[0_0_auto] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <span className="relative w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Contact Me
          </span>
        </a>
        <nav
          className="inline-flex items-center absolute left-[calc(50.00%_-_308px)] bottom-0 rounded-[12px_12px_0px_0px] overflow-hidden border-t [border-top-style:solid] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12"
          aria-label="Primary navigation"
        >
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`all-unset box-border inline-flex items-center gap-2.5 px-10 py-[30px] relative flex-[0_0_auto] ${item.className}`}
            >
              <span
                className={`relative w-fit mt-[-1.00px] font-medium font-medium text-lg tracking-[0] leading-[27px] whitespace-nowrap ${
                  item.active ? "text-absolutewhite" : "text-grey-70"
                }`}
              >
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
