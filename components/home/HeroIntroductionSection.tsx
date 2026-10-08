import abstractDesign from "./abstract-design.svg";
import icon5 from "./icon-5.svg";
import icon6 from "./icon-6.svg";
import icon7 from "./icon-7.svg";
import icon8 from "./icon-8.svg";
import icon9 from "./icon-9.svg";
import icon10 from "./icon-10.svg";
import icon11 from "./icon-11.svg";
import image from "./image.png";
import image2 from "./image-2.png";
import image3 from "./image-3.png";
import image4 from "./image-4.png";
import image5 from "./image-5.png";
import image6 from "./image-6.png";
import vector431Stroke4 from "./vector-431-stroke-4.svg";

type Category = {
  icon: string;
  label: string;
};

type CollageImage = {
  source: string;
  className: string;
  alt: string;
};

const categories: Category[] = [
  { icon: icon5, label: "EVENT PHOTOGRAPHY" },
  { icon: icon6, label: "COMERCIAL PHOTOGRAPHY" },
  { icon: icon7, label: "PRODUCT PHOTOGRAPHY" },
  { icon: icon8, label: "WEDDING PHOTOGRAPHY" },
  { icon: icon9, label: "LANDSCAPE PHOTOGRAPHY" },
  { icon: icon10, label: "BRANDING PHOTOGRAPHY" },
  { icon: icon11, label: "PORTRAIT  PHOTOGRAPHY" },
];

const collageImages: CollageImage[] = [
  {
    source: image.src,
    className: "absolute w-full h-full top-0 left-0 object-cover",
    alt: "Photography portfolio image",
  },
  {
    source: image2.src,
    className: "absolute w-[66.17%] h-full top-0 left-[33.83%] object-cover",
    alt: "Photography portfolio image",
  },
  {
    source: image6.src,
    className:
      "absolute w-[88.41%] h-[69.14%] top-[30.86%] left-[11.59%] object-cover",
    alt: "Photography portfolio image",
  },
  {
    source: image3.src,
    className: "absolute w-[24.44%] h-full top-0 left-[75.56%] object-cover",
    alt: "Photography portfolio image",
  },
  {
    source: image4.src,
    className:
      "absolute w-[24.44%] h-[40.04%] top-[59.96%] left-[75.56%] object-cover",
    alt: "Photography portfolio image",
  },
  {
    source: image5.src,
    className:
      "absolute w-[99.94%] h-[27.93%] top-[72.07%] left-0 object-cover",
    alt: "Photography portfolio image",
  },
];

export const HeroIntroductionSection = () => {
  return (
    <main className="flex flex-col w-[1920px] items-start absolute top-[119px] left-0">
      <header className="flex items-center justify-between px-[162px] py-20 relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12">
        <img
          className="absolute top-[calc(50.00%_-_164px)] left-[calc(50.00%_-_173px)] w-[346px] h-[328px]"
          src={abstractDesign}
          alt=""
          aria-hidden="true"
        />
        <div className="inline-flex justify-center gap-2.5 flex-[0_0_auto] ml-[-971px] flex-col items-start relative">
          <p className="relative w-fit mt-[-1.00px] font-medium font-medium text-grey-40 text-[22px] tracking-[0] leading-[normal]">
            STUNNING PHOTOGRAPHY BY
          </p>
          <h1 className="w-fit font-semibold font-semibold text-grey-90 text-[80px] leading-[normal] relative tracking-[0]">
            DAMIEN BRAUN
          </h1>
        </div>
        <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto] ml-[-971px]">
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <p className="w-fit mt-[-1.00px] font-semibold font-semibold text-absolutewhite text-[58px] leading-[normal] relative tracking-[0]">
              LET&apos;S
            </p>
            <button
              type="button"
              aria-label="Start working together"
              className="inline-flex items-center px-[50px] py-[18px] flex-[0_0_auto] bg-purple-55 rounded-[100px] shadow-[inset_4px_4px_17.4px_#ffffff47] gap-2.5 relative"
            >
              <span className="relative w-[30px] h-[30px]" aria-hidden="true">
                <img
                  className="absolute w-[84.38%] h-[84.38%] top-[15.62%] left-[15.62%]"
                  src={vector431Stroke4}
                  alt=""
                />
              </span>
            </button>
          </div>
          <p className="relative w-fit font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]">
            WORK TOGETHER
          </p>
        </div>
      </header>
      <section className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <nav
          aria-label="Photography services"
          className="flex items-start gap-5 p-5 relative self-stretch w-full flex-[0_0_auto] bg-dark-06 overflow-hidden border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12"
        >
          {categories.map((category, index) => (
            <div
              key={`${category.label}-${index}`}
              className={`inline-flex items-center gap-2.5 relative flex-[0_0_auto]${
                index === categories.length - 1 ? " mr-[-20.00px]" : ""
              }`}
            >
              <img
                className="relative w-10 h-10"
                src={category.icon}
                alt=""
                aria-hidden="true"
              />
              <span className="relative w-fit font-normal text-purple-90 text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                {category.label}
              </span>
            </div>
          ))}
        </nav>
        <div className="flex flex-col items-start gap-2.5 px-[162px] py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative self-stretch w-full h-[512px]">
            {collageImages.map((collageImage, index) => (
              <img
                key={`${collageImage.source}-${index}`}
                className={collageImage.className}
                src={collageImage.source}
                alt={collageImage.alt}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
