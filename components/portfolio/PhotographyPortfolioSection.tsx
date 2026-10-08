"use client";

import { useState } from "react";
import image2 from "./image-2.png";
import image3 from "./image-3.png";
import image4 from "./image-4.png";
import image5 from "./image-5.png";
import image6 from "./image-6.png";
import image7 from "./image-7.png";
import image8 from "./image-8.png";
import image9 from "./image-9.png";
import image10 from "./image-10.png";
import vector431Stroke2 from "./vector-431-stroke-2.svg";
import vector431Stroke3 from "./vector-431-stroke-3.svg";
import vector431Stroke4 from "./vector-431-stroke-4.svg";
import vector431Stroke5 from "./vector-431-stroke-5.svg";
import vector431Stroke6 from "./vector-431-stroke-6.svg";
import vector431Stroke7 from "./vector-431-stroke-7.svg";
import vector431Stroke8 from "./vector-431-stroke-8.svg";
import vector431Stroke9 from "./vector-431-stroke-9.svg";
import vector431Stroke10 from "./vector-431-stroke-10.svg";

const photographySections = [
  {
    title: "PORTRAITS PHOTOGRAPHY",
    projects: [
      {
        title: "Faces of Resilience",
        date: "March 2022",
        image: image2.src,
        arrow: vector431Stroke10,
      },
      {
        title: "Innocence Unveiled",
        date: "January 2020",
        image: image3.src,
        arrow: vector431Stroke5,
      },
      {
        title: "Elegance in Monochrom",
        date: "January 2020",
        image: image4.src,
        arrow: vector431Stroke4,
      },
    ],
  },
  {
    title: "EVENTS PHOTOGRAPHY",
    projects: [
      {
        title: "A Wedding Tale",
        date: "September 2021",
        image: image5.src,
        arrow: vector431Stroke7,
      },
      {
        title: "Corporate Excellence Summit",
        date: "November 2019",
        image: image6.src,
        arrow: vector431Stroke2,
      },
      {
        title: "Festival of Colors",
        date: "March 2018",
        image: image7.src,
        arrow: vector431Stroke3,
      },
    ],
  },
  {
    title: "COMMERCIAL PHOTOGRAPHY",
    projects: [
      {
        title: "Product Elegance",
        date: "August 2020",
        image: image8.src,
        arrow: vector431Stroke6,
      },
      {
        title: "Brand Storytelling",
        date: "May 2019",
        image: image9.src,
        arrow: vector431Stroke8,
      },
      {
        title: "Culinary Delights",
        date: "February 2017",
        image: image10.src,
        arrow: vector431Stroke9,
      },
    ],
  },
];

const ProjectLink = ({ project, onSelect, isSelected }: { project: { title: string; arrow: string }; onSelect: (title: string) => void; isSelected: boolean }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(project.title)}
      aria-label={`View project: ${project.title}`}
      aria-pressed={isSelected}
      className="all-unset box-border items-start px-0 py-1.5 border-b [border-bottom-style:solid] border-dark-20 inline-flex gap-2.5 relative flex-[0_0_auto] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-50"
    >
      <span className="relative w-fit mt-[-1.00px] font-medium font-medium text-grey-95 text-lg tracking-[0] leading-[normal]">
        VIEW PROJECT
      </span>
      <span className="relative w-6 h-6" aria-hidden="true">
        <img
          className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
          alt=""
          src={project.arrow}
        />
      </span>
    </button>
  );
};

const SectionControl = ({ title, onActivate }: { title: string; onActivate: () => void }) => {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={`View ${title.toLowerCase()} projects`}
      className="relative flex h-12 w-12 flex-[0_0_auto] items-center justify-center rounded-full border border-dark-20 text-grey-80 transition-colors hover:border-grey-50 hover:text-grey-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-50"
    >
      <span className="text-xl leading-none" aria-hidden="true">
        ↗
      </span>
    </button>
  );
};

export const PhotographyPortfolioSection = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [activeSection, setActiveSection] = useState("");

  return (
    <main className="flex flex-col w-[1596px] items-start absolute top-[1383px] left-[162px]">
      {photographySections.map((section) => (
        <section
          key={section.title}
          aria-labelledby={`${section.title.toLowerCase().replaceAll(" ", "-")}-heading`}
          className="flex flex-col items-start gap-[50px] px-0 py-20 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-dark-12"
        >
          <header className="flex items-center gap-[50px] relative self-stretch w-full flex-[0_0_auto]">
            <h2
              id={`${section.title.toLowerCase().replaceAll(" ", "-")}-heading`}
              className="flex-1 font-semibold font-semibold text-grey-50 text-[44px] relative tracking-[0] leading-[normal]"
            >
              {section.title}
            </h2>
            <SectionControl
              title={section.title}
              onActivate={() => setActiveSection(section.title)}
            />
          </header>
          <div className="flex items-start gap-[50px] relative self-stretch w-full flex-[0_0_auto]">
            {section.projects.map((project) => (
              <article
                key={project.title}
                className="flex flex-col items-start gap-[19px] relative flex-1 grow"
              >
                <img
                  className="relative self-stretch w-full h-[519px] object-cover"
                  alt={`${project.title} photography project`}
                  src={project.image}
                />
                <div className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="gap-1 flex-1 grow flex flex-col items-start relative">
                    <h3 className="self-stretch mt-[-1.00px] font-medium font-medium text-grey-80 text-xl relative tracking-[0] leading-[normal]">
                      {project.title}
                    </h3>
                    <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[normal]">
                      {project.date}
                    </p>
                  </div>
                  <ProjectLink
                    project={project}
                    onSelect={setSelectedProject}
                    isSelected={selectedProject === project.title}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <div className="sr-only" aria-live="polite">
        {activeSection
          ? `${activeSection} projects selected.`
          : selectedProject
            ? `${selectedProject} selected.`
            : ""}
      </div>
    </main>
  );
};
