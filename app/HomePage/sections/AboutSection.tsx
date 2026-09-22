"use client";
import React from "react";
const image7: any = { src: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=800&auto=format&fit=crop" };

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
        <path d="M9.5 14V8.75h1.75l.25-2H9.5V5.5c0-.58.17-.98.98-.98h1.1V2.74A14.6 14.6 0 0 0 10 2.66C8.42 2.66 7.33 3.63 7.33 5.4v1.35H5.5v2h1.83V14H9.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com/",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
        <path d="M13.52 4.35c.01.13.01.27.01.4 0 4.08-3.1 8.78-8.78 8.78-1.75 0-3.37-.5-4.74-1.37.24.03.47.04.72.04 1.44 0 2.77-.49 3.83-1.33a3.1 3.1 0 0 1-2.9-2.15c.19.03.38.05.58.05.28 0 .56-.04.82-.11A3.1 3.1 0 0 1 .55 5.62v-.04c.41.23.88.37 1.38.39A3.09 3.09 0 0 1 .97 1.84a8.8 8.8 0 0 0 6.39 3.24 3.48 3.48 0 0 1-.08-.71 3.1 3.1 0 0 1 5.36-2.12 6.1 6.1 0 0 0 1.97-.75 3.08 3.08 0 0 1-1.36 1.7 6.14 6.14 0 0 0 1.78-.48 6.67 6.67 0 0 1-1.51 1.63Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
        <path d="M3.64 5.4H1.18V14h2.46V5.4ZM2.42 1.5A1.43 1.43 0 1 0 2.4 4.36a1.43 1.43 0 0 0 .02-2.86ZM14 9.07c0-2.6-1.38-3.8-3.22-3.8-1.48 0-2.14.81-2.51 1.39V5.4H5.8V14h2.47V9.74c0-1.12.21-2.2 1.6-2.2 1.37 0 1.39 1.28 1.39 2.28V14h2.46V9.07Z" fill="currentColor" />
      </svg>
    ),
  },
];

export const AboutSection = () => {
  const handleDownloadCv = () => {
    const cvText = [
      "Damien Braun",
      "Photographer",
      "",
      "Email: damienbraun@gmail.com",
      "Phone: +00 000000000",
      "",
      "Professional photographer based in the USA.",
    ].join("\n");
    const blob = new Blob([cvText], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "damien-braun-cv.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <section id="about-me" className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-10 lg:py-[60px] flex flex-col items-start gap-10 lg:gap-[60px] border-b border-dark-12">
      {/* Header */}
      <header className="w-full flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-dark-12 pb-6 lg:pb-10">
        <div className="flex flex-col items-start gap-1">
          <p className="font-semibold text-grey-50 text-sm lg:text-base tracking-[0] uppercase">
            ABOUT
          </p>
          <h2 className="font-semibold text-absolutewhite text-3xl lg:text-5xl tracking-[0] uppercase">
            I AM DAMIEN
          </h2>
        </div>
        <a
          href="#photographer-introduction"
          className="inline-flex items-center justify-center h-[54px] px-6 bg-dark-12 hover:bg-dark-20 transition-colors rounded-lg font-medium text-absolutewhite text-sm border border-dark-20"
        >
          <span className="whitespace-nowrap">Know More -&gt;</span>
        </a>
      </header>

      {/* Content */}
      <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-5">
        {/* Image */}
        <img
          className="w-full lg:w-1/2 h-[400px] lg:h-[700px] object-cover rounded-[20px]"
          alt="Damien standing outdoors with his camera"
          src={image7.src || image7}
        />
        
        {/* Text Content Container */}
        <article className="w-full lg:w-1/2 flex flex-col rounded-[20px] border border-solid border-dark-12 overflow-hidden bg-dark-03">
          
          {/* Introduction */}
          <section
            id="photographer-introduction"
            className="flex flex-col gap-6 border-b border-dark-12 p-8 lg:p-12"
          >
            <div className="flex items-end gap-2.5">
              <svg className="w-8 h-8 text-purple-55" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h3 className="font-medium text-grey-80 text-2xl lg:text-3xl tracking-[0]">
                Introduction
              </h3>
            </div>
            <p className="font-normal text-grey-70 text-base lg:text-lg leading-relaxed tracking-[0]">
              My journey as a photographer has been a lifelong quest to capture
              the extraordinary in the ordinary, to freeze fleeting moments in
              time, and to share the world&apos;s beauty as I see it. Based in
              the enchanting landscapes of the USA, I find inspiration in every
              corner of this diverse and vibrant country. Join me as we embark
              on a visual odyssey, where each photograph tells a story, and
              every frame is a piece of my heart.
            </p>
          </section>

          {/* Contact Info */}
          <section className="flex flex-col gap-8 p-8 lg:p-12 h-full justify-between">
            <div className="flex flex-col gap-8">
              <div className="flex items-end gap-2.5">
                <svg className="w-8 h-8 text-purple-55" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h3 className="font-medium text-grey-80 text-2xl lg:text-3xl tracking-[0]">
                  Contact Information
                </h3>
              </div>
              
              <address className="flex flex-col sm:flex-row gap-8 lg:gap-10 not-italic">
                <div className="flex flex-col gap-2 flex-1">
                  <span className="font-medium text-grey-90 text-base lg:text-lg">
                    Email
                  </span>
                  <a
                    href="mailto:damienbraun@gmail.com"
                    className="font-normal text-grey-70 text-base lg:text-lg hover:text-absolutewhite transition-colors"
                  >
                    damienbraun@gmail.com
                  </a>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="font-medium text-grey-90 text-base lg:text-lg">
                    Phone Number
                  </span>
                  <a
                    href="tel:+00000000000"
                    className="font-normal text-grey-70 text-base lg:text-lg hover:text-absolutewhite transition-colors"
                  >
                    +00 000000000
                  </a>
                </div>
              </address>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 mt-8">
              {/* Social links */}
              <nav aria-label="Damien's social media profiles" className="flex items-center gap-4 rounded-full border border-dark-12 bg-dark-06 px-5 h-[54px] w-full sm:w-auto justify-center">
                {socialLinks.map((socialLink) => (
                  <a
                    key={socialLink.label}
                    aria-label={socialLink.label}
                    href={socialLink.href}
                    rel="noreferrer"
                    target="_blank"
                    className="flex items-center justify-center text-grey-70 hover:text-absolutewhite transition-colors"
                  >
                    {socialLink.icon}
                  </a>
                ))}
              </nav>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <a
                  href="mailto:damienbraun@gmail.com"
                  className="flex-1 flex items-center justify-center h-[54px] rounded-lg bg-dark-12 border border-dark-20 font-medium text-sm text-absolutewhite hover:bg-dark-20 transition-colors px-6"
                >
                  <span className="whitespace-nowrap">Let&apos;s Work</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownloadCv}
                  className="flex-1 flex items-center justify-center h-[54px] rounded-lg bg-dark-12 border border-dark-20 font-medium text-sm text-absolutewhite hover:bg-dark-20 transition-colors px-6"
                >
                  <span className="whitespace-nowrap">Download CV</span>
                </button>
              </div>
            </div>
          </section>
        </article>
      </div>
    </section>
  );
};
