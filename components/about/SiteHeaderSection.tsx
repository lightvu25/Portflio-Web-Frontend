"use client";

import { useState } from "react";
import Link from "next/link";
import logo from "./logo.svg";

const navigationItems = [
  { label: "Home", active: false },
  { label: "About Me", active: true },
  { label: "Portfolio", active: false },
  { label: "Services", active: false },
];

export const SiteHeaderSection = () => {
  const [activeItem, setActiveItem] = useState("About Me");

  const handleContactClick = (): void => {
    window.location.href = "mailto:contact@example.com";
  };

  return (
    <header className="absolute top-0 left-[calc(50.00%_-_960px)] flex w-[1920px] flex-col items-start gap-2.5 border-b border-dark-12 bg-transparent px-[125px] py-0">
      <div className="relative flex w-full flex-[0_0_auto] items-center justify-between border-l border-r border-dark-12 px-10 py-[30px]">
        <Link
          className="relative block h-[27.24px] w-[134.72px]"
          href="/"
          aria-label="Damien home"
        >
          <img
            className="relative h-[27.24px] w-[134.72px]"
            alt="Damien logo"
            src={logo}
          />
        </Link>
        <button
          type="button"
          onClick={handleContactClick}
          className="all-unset box-border relative mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] inline-flex flex-[0_0_auto] items-center gap-2.5 overflow-hidden rounded-[10px] border-[none] bg-dark-12 px-6 py-4 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[10px] before:p-px before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[mask-composite:exclude] before:content-['']"
          aria-label="Contact Damien"
        >
          <span className="relative w-fit whitespace-nowrap font-medium text-lg font-medium leading-[27px] tracking-[0] text-absolutewhite">
            Contact Me
          </span>
        </button>
        <nav
          className="absolute bottom-0 left-[calc(50.00%_-_308px)] inline-flex items-center overflow-hidden rounded-[12px_12px_0px_0px] border-l border-r border-t border-dark-12"
          aria-label="Main navigation"
        >
          {navigationItems.map((item, index) => {
            const isActive = activeItem === item.label;
            const itemClassName = [
              "all-unset box-border relative inline-flex flex-[0_0_auto] items-center gap-2.5",
              index === 1
                ? "px-[50px] py-[30px] border border-solid border-dark-12"
                : "px-10 py-[30px]",
              index === 0 || index === 2
                ? "border-r [border-right-style:solid] border-dark-12"
                : "",
              isActive && index !== 1 ? "bg-dark-08" : "",
              isActive && index === 1 ? "bg-dark-08" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveItem(item.label)}
                className={itemClassName}
                aria-current={isActive ? "page" : undefined}
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
