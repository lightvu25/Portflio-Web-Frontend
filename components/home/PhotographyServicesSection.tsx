"use client";

import { useState } from "react";
import image from "./image.svg";
import image8 from "./image-8.png";
import image9 from "./image-9.png";
import image10 from "./image-10.png";
import vector431Stroke from "./vector-431-stroke.svg";
import vector431Stroke2 from "./vector-431-stroke-2.svg";

type PhotographyProject = {
  title: string;
  date: string;
  image: string;
  imageAlt: string;
  arrow: string;
};

const photographyProjects: PhotographyProject[] = [
  {
    title: "Faces of Resilience",
    date: "March 2022",
    image: image8.src,
    imageAlt: "Portrait from the Faces of Resilience photography project",
    arrow: vector431Stroke,
  },
  {
    title: "A Wedding Tale",
    date: "January 2020",
    image: image9.src,
    imageAlt: "Wedding portrait from the A Wedding Tale photography project",
    arrow: image,
  },
  {
    title: "Product Elegance",
    date: "January 2020",
    image: image10.src,
    imageAlt:
      "Product photograph from the Product Elegance photography project",
    arrow: vector431Stroke2,
  },
];

export const PhotographyServicesSection = () => {
  const [activeProject, setActiveProject] = useState(0);

  const showPreviousProject = (): void => {
    setActiveProject((currentProject) =>
      currentProject === 0
        ? photographyProjects.length - 1
        : currentProject - 1,
    );
  };

  const showNextProject = (): void => {
    setActiveProject(
      (currentProject) => (currentProject + 1) % photographyProjects.length,
    );
  };

  const handleViewAllWorks = (): void => {
    document
      .getElementById("photography-projects")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      aria-labelledby="photography-services-heading"
      className="flex flex-col w-[1597px] max-w-[calc(100vw-32px)] items-start gap-20 absolute top-[3454px] left-[162px] max-[1200px]:left-8 max-[1200px]:w-[calc(100vw-64px)] max-[767px]:top-[2200px] max-[767px]:left-4 max-[767px]:w-[calc(100vw-32px)] max-[767px]:gap-10"
    >
      <header className="flex items-end gap-5 pt-0 pb-[50px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12 max-[767px]:flex-col max-[767px]:items-start max-[767px]:gap-8 max-[767px]:pb-8">
        <div className="flex gap-1 flex-1 self-stretch grow flex-col items-start relative">
          <p className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
            PORTFOLIO
          </p>
          <h2
            id="photography-services-heading"
            className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal] max-[767px]:text-[36px]"
          >
            EXPLORE MY PHOTOGRAPHY WORK.
          </h2>
        </div>
        <div className="inline-flex items-center gap-[30px] relative flex-[0_0_auto] max-[767px]:w-full max-[767px]:justify-between">
          <div
            aria-label="Photography project navigation"
            className="inline-flex items-center gap-2"
            role="group"
          >
            <button
              type="button"
              aria-label="Previous photography project"
              onClick={showPreviousProject}
              className="all-unset box-border inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-dark-20 bg-dark-12 text-absolutewhite transition-colors hover:bg-dark-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-absolutewhite"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ←
              </span>
            </button>
            <button
              type="button"
              aria-label="Next photography project"
              onClick={showNextProject}
              className="all-unset box-border inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-dark-20 bg-dark-12 text-absolutewhite transition-colors hover:bg-dark-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-absolutewhite"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                →
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleViewAllWorks}
            className="all-unset box-border inline-flex items-center px-6 py-4 flex-[0_0_auto] mr-[-1.00px] bg-dark-12 rounded-[10px] overflow-hidden border-[none] gap-2.5 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10px] before:[background:linear-gradient(136deg,rgba(47,47,55,1)_28%,rgba(47,47,55,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-absolutewhite"
          >
            <span className="relative z-[2] w-fit font-medium font-medium text-absolutewhite text-lg tracking-[0] leading-[27px] whitespace-nowrap">
              View All Works -&gt;
            </span>
          </button>
        </div>
      </header>
      <div
        id="photography-projects"
        className="flex items-start gap-[50px] relative self-stretch w-full flex-[0_0_auto] max-[767px]:flex-col max-[767px]:gap-12"
      >
        {photographyProjects.map((project, index) => (
          <article
            key={project.title}
            className={`flex flex-col items-start gap-[19px] relative flex-1 grow max-[767px]:w-full ${
              index === activeProject ? "max-[767px]:order-first" : ""
            }`}
          >
            <img
              className="relative self-stretch w-full h-[519px] object-cover max-[1200px]:h-[360px] max-[767px]:h-[300px]"
              alt={project.imageAlt}
              src={project.image}
            />
            <div className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                <h3 className="self-stretch mt-[-1.00px] font-medium font-medium text-grey-80 text-xl leading-[normal] relative tracking-[0]">
                  {project.title}
                </h3>
                <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[normal]">
                  {project.date}
                </p>
              </div>
              <button
                type="button"
                aria-label={`View ${project.title} project`}
                className="all-unset box-border inline-flex items-start px-0 py-1.5 flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-20 gap-2.5 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-absolutewhite"
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
