"use client";

import { FormEvent, useState } from "react";
import image from "./image.png";
import vector431Stroke2 from "./vector-431-stroke-2.svg";
import vector431Stroke3 from "./vector-431-stroke-3.svg";
import vector431Stroke4 from "./vector-431-stroke-4.svg";

type ContactField = {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
};

const contactFields: ContactField[] = [
  {
    id: "firstName",
    label: "First Name",
    placeholder: "FIRST NAME",
  },
  {
    id: "lastName",
    label: "Last Name",
    placeholder: "LAST NAME",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "EMAIL ADDRESS",
    type: "email",
  },
  {
    id: "phone",
    label: "Phone Number",
    placeholder: "PHONE NUMBER",
    type: "tel",
  },
];

const contactLinks = [
  {
    label: "+1-123-456-7890",
    href: "tel:+11234567890",
    icon: vector431Stroke2,
  },
  {
    label: "info@damienbraunphotography.com",
    href: "mailto:info@damienbraunphotography.com",
    icon: vector431Stroke3,
  },
];

export const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="flex flex-col w-[1596px] max-w-[calc(100vw-80px)] items-end gap-[100px] absolute top-[219px] left-[162px] max-[900px]:static max-[900px]:w-full max-[900px]:max-w-none max-[900px]:px-6 max-[900px]:py-16">
      <section className="flex flex-col items-end relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-6 pl-0 pr-[500px] pt-[230px] pb-0 relative self-stretch w-full flex-[0_0_auto] z-[1] max-[1100px]:pr-[280px] max-[700px]:pr-0 max-[700px]:pt-16">
          <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              CONTACT ME
            </div>
            <h1 className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal] max-[700px]:text-4xl">
              GET IN TOUCH WITH ME
            </h1>
          </div>
          <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
            Step into a world of timeless photography with Damien Braun. Explore
            our range of photography services, each crafted to tell your unique
            story through captivating images. Whether it&apos;s the magic of
            portraits, the emotion of events, or the allure of commercial
            photography, we&apos;re here to bring your vision to life.
          </p>
          <div
            className="absolute top-[94px] right-0 inline-flex items-center gap-2 rounded-full bg-black/70 p-2 max-[700px]:top-4"
            aria-label="Contact actions"
          >
            <button
              type="button"
              aria-label="Start a message"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-12 text-absolutewhite transition-colors hover:bg-purple-55 focus:outline-none focus:ring-2 focus:ring-purple-55"
              onClick={() =>
                document.getElementById("contact-message")?.focus()
              }
            >
              <span aria-hidden="true">↗</span>
            </button>
            <a
              href="mailto:info@damienbraunphotography.com"
              aria-label="Email Damien Braun Photography"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-12 text-absolutewhite transition-colors hover:bg-purple-55 focus:outline-none focus:ring-2 focus:ring-purple-55"
            >
              <span aria-hidden="true">@</span>
            </a>
            <a
              href="tel:+11234567890"
              aria-label="Call Damien Braun Photography"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-12 text-absolutewhite transition-colors hover:bg-purple-55 focus:outline-none focus:ring-2 focus:ring-purple-55"
            >
              <span aria-hidden="true">☎</span>
            </a>
          </div>
          <p className="absolute right-[45px] bottom-[-270px] w-[205px] font-medium font-medium text-grey-50 text-lg tracking-[0] leading-[normal] max-[700px]:hidden">
            SCROLL DOWN TO SEND ME A MESSAGE
          </p>
        </div>
        <img
          className="relative self-stretch w-full h-[746px] mt-[-574px] z-0 object-cover max-[700px]:mt-[-32px] max-[700px]:h-[420px]"
          alt="Photographer looking through a camera during a golden-hour portrait session"
          src={image.src}
        />
      </section>
      <section className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center gap-20 px-0 py-20 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-10 max-[900px]:py-12">
          <div className="w-[535px] max-w-full gap-[30px] flex flex-col items-start relative">
            <h2 className="self-stretch font-semibold font-semibold text-grey-50 text-[44px] relative mt-[-1.00px] tracking-[0] leading-[normal] max-[700px]:text-3xl">
              CONTACT INFORMATION
            </h2>
            <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
              Feel free to reach out to us through various channels. We are
              available by phone, email, and social media for your convenience.
            </p>
          </div>
          <div className="flex items-center gap-[50px] relative flex-1 grow max-[700px]:w-full max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-5">
            {contactLinks.map((contactLink) => (
              <a
                key={contactLink.label}
                href={contactLink.href}
                className="box-border items-start px-0 py-1.5 border-b [border-bottom-style:solid] border-dark-20 inline-flex gap-2.5 relative flex-[0_0_auto] font-medium font-medium text-grey-95 text-lg tracking-[0] leading-[normal] transition-colors hover:text-purple-55 focus:outline-none focus:ring-2 focus:ring-purple-55"
              >
                <span>{contactLink.label}</span>
                <span className="relative w-6 h-6" aria-hidden="true">
                  <img
                    className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
                    alt=""
                    src={contactLink.icon}
                  />
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-20 px-0 py-20 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12 max-[900px]:flex-col max-[900px]:gap-10 max-[900px]:py-12">
          <div className="w-[535px] max-w-full gap-[30px] flex flex-col items-start relative">
            <h2 className="self-stretch font-semibold font-semibold text-grey-50 text-[44px] relative mt-[-1.00px] tracking-[0] leading-[normal] max-[700px]:text-3xl">
              SEND ME A MESSAGE
            </h2>
            <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
              Have a specific inquiry or message for us? Please use the contact
              form below, and we&apos;ll get back to you promptly.
            </p>
          </div>
          <form
            className="flex flex-col items-start justify-center gap-[50px] relative flex-1 grow w-full"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex items-center gap-[50px] relative self-stretch w-full flex-[0_0_auto] max-[700px]:flex-col max-[700px]:gap-8">
              {contactFields.slice(0, 2).map((field) => (
                <label
                  key={field.id}
                  htmlFor={field.id}
                  className="flex flex-col items-start justify-center gap-2.5 relative flex-1 grow w-full"
                >
                  <span className="self-stretch font-normal text-grey-90 text-lg relative mt-[-1.00px] tracking-[0] leading-[normal]">
                    {field.label}
                  </span>
                  <span className="flex items-start gap-2.5 px-0 py-3.5 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-20">
                    <input
                      id={field.id}
                      name={field.id}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      required
                      className="relative flex-1 mt-[-1.00px] min-w-0 bg-transparent font-normal text-grey-40 text-[22px] tracking-[0] leading-[normal] outline-none placeholder:text-grey-40 focus:text-absolutewhite"
                    />
                  </span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-[50px] relative self-stretch w-full flex-[0_0_auto] max-[700px]:flex-col max-[700px]:gap-8">
              {contactFields.slice(2).map((field) => (
                <label
                  key={field.id}
                  htmlFor={field.id}
                  className="flex flex-col items-start justify-center gap-2.5 relative flex-1 grow w-full"
                >
                  <span className="self-stretch font-normal text-grey-90 text-lg relative mt-[-1.00px] tracking-[0] leading-[normal]">
                    {field.label}
                  </span>
                  <span className="flex items-start gap-2.5 px-0 py-3.5 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-20">
                    <input
                      id={field.id}
                      name={field.id}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      required
                      className="relative flex-1 mt-[-1.00px] min-w-0 bg-transparent font-normal text-grey-40 text-[22px] tracking-[0] leading-[normal] outline-none placeholder:text-grey-40 focus:text-absolutewhite"
                    />
                  </span>
                </label>
              ))}
            </div>
            <label
              htmlFor="contact-message"
              className="flex flex-col items-start justify-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]"
            >
              <span className="self-stretch font-normal text-grey-90 text-lg relative mt-[-1.00px] tracking-[0] leading-[normal]">
                Your Message
              </span>
              <span className="flex items-start gap-2.5 px-0 py-3.5 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-20">
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="MESSAGE"
                  required
                  rows={1}
                  className="relative flex-1 min-h-8 resize-y bg-transparent font-normal text-grey-40 text-[22px] tracking-[0] leading-[normal] outline-none placeholder:text-grey-40 focus:text-absolutewhite"
                />
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2.5 pt-0 pb-2.5 px-0 relative flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12 group focus:outline-none focus:ring-2 focus:ring-purple-55"
            >
              <span className="font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal] max-[700px]:text-4xl">
                {submitted ? "MESSAGE SENT" : "SEND MESSAGE"}
              </span>
              <span className="items-center px-[50px] py-[18px] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] inline-flex gap-2.5 relative flex-[0_0_auto] transition-transform group-hover:scale-105 max-[700px]:px-6 max-[700px]:py-3">
                <span className="relative w-[30px] h-[30px]" aria-hidden="true">
                  <img
                    className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
                    alt=""
                    src={vector431Stroke4}
                  />
                </span>
              </span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
