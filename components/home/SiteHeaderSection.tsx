"use client";

import { useState } from "react";
import logo from "./logo.svg";

const navigationItems = [
  { label: "Home", active: true },
  { label: "About Me", active: false },
  { label: "Portfolio", active: false },
  { label: "Services", active: false },
];

export const SiteHeaderSection = () => {
  const [activeItem, setActiveItem] = useState("Home");

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
          className="all-unset box-border inline-flex items-center px-6 py-4 flex-[0_0_auto] mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
          aria-label="Contact me"
          onClick={() => {
            window.location.href = "mailto:";
          }}
        >
          <span className="relative w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Contact Me
          </span>
        </button>
        <nav
          className="inline-flex items-center absolute left-[calc(50.00%_-_308px)] bottom-0 rounded-[12px_12px_0px_0px] overflow-hidden border-t [border-top-style:solid] border-r [border-right-style:solid] border-l [border-left-style:solid] border-dark-12"
          aria-label="Primary navigation"
        >
          {navigationItems.map((item, index) => {
            const isActive = activeItem === item.label;

            const buttonClassName = [
              "all-unset",
              "box-border",
              "inline-flex",
              "items-center",
              "relative",
              "flex-[0_0_auto]",
              "gap-2.5",
              index === 0 ? "px-[50px]" : "px-10",
              "py-[30px]",
              index === 0 && isActive ? "bg-dark-08" : "",
              index < navigationItems.length - 1
                ? "border-r [border-right-style:solid] border-dark-12"
                : "",
              index === 0 && isActive
                ? "border border-solid border-dark-12"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            const textClassName = [
              "relative",
              "w-fit",
              "mt-[-1.00px]",
              "font-medium",
              "font-medium",
              "text-lg",
              "tracking-[0]",
              "leading-[27px]",
              "whitespace-nowrap",
              isActive ? "text-absolutewhite" : "text-grey-70",
            ].join(" ");

            return (
              <button
                key={item.label}
                type="button"
                className={buttonClassName}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveItem(item.label)}
              >
                <span className={textClassName}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
