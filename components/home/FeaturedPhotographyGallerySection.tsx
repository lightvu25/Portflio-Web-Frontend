"use client";

import { useState } from "react";
import image7 from "./image-7.png";

const contactDetails = [
  {
    label: "Email",
    value: "damienbraun@gmail.com",
    href: "mailto:damienbraun@gmail.com",
  },
  {
    label: "Phone Number",
    value: "+00 000000000",
    href: "tel:+000000000",
  },
];

const socialLinks = [
  { label: "Instagram", symbol: "◎" },
  { label: "Twitter", symbol: "𝕏" },
  { label: "Facebook", symbol: "f" },
];

export const FeaturedPhotographyGallerySection = () => {
  const [statusMessage, setStatusMessage] = useState("");

  const handleAction = (message: string) => {
    setStatusMessage(message);
  };

  return (
    <section
      aria-labelledby="about-heading"
      className="flex flex-col w-[1596px] items-start gap-20 absolute top-[1239px] left-[162px]"
    >
      <header className="flex items-center gap-5 pt-0 pb-[50px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12">
        <div className="flex flex-col items-start gap-1 relative flex-1 grow">
          <p className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
            ABOUT
          </p>
          <h2
            id="about-heading"
            className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
          >
            I AM DAMIEN
          </h2>
        </div>
        <button
          type="button"
          onClick={() => handleAction("More information is available below.")}
          className="all-unset box-border inline-flex items-center px-6 py-4 flex-[0_0_auto] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <span className="relative w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            Know More -&gt;
          </span>
        </button>
      </header>
      <div className="flex items-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative flex-1 grow h-[710px] object-cover"
          alt="Damien Braun photographing an outdoor landscape"
          src={image7.src}
        />
        <article className="flex flex-col items-start relative flex-1 grow rounded-[20px] border border-solid border-dark-12">
          <section className="flex flex-col items-start gap-5 p-10 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12">
            <div className="flex items-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <div
                aria-hidden="true"
                className="relative w-[39px] h-10 bg-[url(/star-2.svg)] bg-[100%_100%]"
              />
              <h3 className="flex-1 mt-[-1.00px] font-medium font-medium text-grey-80 text-3xl leading-[normal] relative tracking-[0]">
                Introduction
              </h3>
            </div>
            <p className="font-normal text-grey-70 text-lg leading-[27px] relative self-stretch tracking-[0]">
              My journey as a photographer has been a lifelong quest to capture
              the extraordinary in the ordinary, to freeze fleeting moments in
              time, and to share the world&apos;s beauty as I see it. Based in
              the enchanting landscapes of the USA, I find inspiration in every
              corner of this diverse and vibrant country. Join me as we embark
              on a visual odyssey, where each photograph tells a story, and
              every frame is a piece of my heart.
            </p>
          </section>
          <section className="flex flex-col items-start gap-10 p-10 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <div
                aria-hidden="true"
                className="relative w-[39px] h-10 bg-[url(/star.svg)] bg-[100%_100%]"
              />
              <h3 className="flex-1 mt-[-1.00px] font-medium font-medium text-grey-80 text-3xl leading-[normal] relative tracking-[0]">
                Contact Information
              </h3>
            </div>
            <address className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto] not-italic">
              {contactDetails.map((contact) => (
                <div
                  key={contact.label}
                  className="flex gap-2.5 flex-1 grow flex-col items-start relative"
                >
                  <span className="w-fit mt-[-1.00px] font-medium font-medium text-grey-90 text-lg leading-[27px] whitespace-nowrap relative tracking-[0]">
                    {contact.label}
                  </span>
                  <a
                    href={contact.href}
                    className="relative w-fit font-normal text-grey-70 text-xl tracking-[0] leading-[30px] whitespace-nowrap"
                  >
                    {contact.value}
                  </a>
                </div>
              ))}
            </address>
            <div className="flex items-center gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
              <nav
                aria-label="Social media"
                className="relative flex-[0_0_auto] flex items-center gap-2.5"
              >
                {socialLinks.map((social) => (
                  <button
                    key={social.label}
                    type="button"
                    aria-label={social.label}
                    onClick={() =>
                      handleAction(`${social.label} link selected.`)
                    }
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-12 text-grey-80 font-medium text-lg"
                  >
                    {social.symbol}
                  </button>
                ))}
              </nav>
              <div className="flex items-start justify-center gap-5 relative flex-1 grow">
                <button
                  type="button"
                  onClick={() => handleAction("Let's Work selected.")}
                  className="all-unset box-border flex items-center justify-center px-[34px] py-[18px] flex-1 grow mt-[-1.00px] mb-[-1.00px] ml-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                >
                  <span className="relative w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                    Let&apos;s Work
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("CV download started.")}
                  className="all-unset box-border flex items-center justify-center px-[34px] py-[18px] flex-1 grow mt-[-1.00px] mb-[-1.00px] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                >
                  <span className="relative w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                    Download CV
                  </span>
                </button>
              </div>
            </div>
            <p aria-live="polite" className="sr-only">
              {statusMessage}
            </p>
          </section>
        </article>
      </div>
    </section>
  );
};
