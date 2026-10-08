import container2 from "./container-2.svg";
import ellipse1Stroke from "./ellipse-1-stroke.svg";
import image from "./image.png";
import star from "./star.svg";

export const HeroShowcaseSection = () => {
  return (
    <section
      aria-labelledby="hero-showcase-title"
      className="flex flex-col w-[1920px] items-start gap-20 absolute top-[219px] left-0"
    >
      <div className="flex flex-col items-start px-[162px] py-0 relative self-stretch w-full flex-[0_0_auto]">
        <header className="flex flex-col items-start gap-[31px] pl-0 pr-[500px] pt-[49px] pb-0 relative self-stretch w-full flex-[0_0_auto] z-[1]">
          <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] font-semibold font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              PORTFOLIO
            </p>
            <h1
              id="hero-showcase-title"
              className="relative self-stretch font-semibold font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
            >
              VISUAL POETRY IN PIXELS
            </h1>
          </div>
          <p className="relative self-stretch font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
            Step into a visual journey that encapsulates the essence of my lens.
            Each photograph in this portfolio is a narrative, a frozen moment in
            time, and a testament to the artistry and passion poured into every
            frame. Explore the diverse tapestry of stories I&apos;ve had the
            privilege to capture and witness the world through my lens.
          </p>
        </header>
        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] mt-[-338px] z-0">
          <img
            className="relative self-stretch w-full h-[784px] object-cover"
            src={image.src}
            alt="Featured photography portfolio image"
          />
          <div className="flex items-center justify-between pl-5 pr-[50px] py-[18px] relative self-stretch w-full flex-[0_0_auto] mt-[-264px]">
            <div className="relative w-[137px] h-[137px]" aria-hidden="true">
              <img
                className="absolute w-[82.93%] h-[82.93%] top-[17.07%] left-[17.07%]"
                src={star}
                alt=""
              />
              <img
                className="absolute w-full h-full top-0 left-0"
                src={ellipse1Stroke}
                alt=""
              />
            </div>
            <p className="relative w-[205px] font-medium font-medium text-grey-50 text-lg tracking-[0] leading-[normal]">
              SCROLL DOWN TO SEE THE WORKS
            </p>
          </div>
        </div>
      </div>
      <section
        aria-labelledby="brands-title"
        className="flex flex-col items-center gap-[18px] relative self-stretch w-full flex-[0_0_auto]"
      >
        <h2
          id="brands-title"
          className="relative self-stretch mt-[-1.00px] font-medium font-medium text-grey-50 text-base text-center tracking-[0] leading-[normal]"
        >
          BRANDS I HAVE WORKED WITH
        </h2>
        <img
          className="relative self-stretch w-full flex-[0_0_auto]"
          src={container2}
          alt="Brands I have worked with"
        />
      </section>
    </section>
  );
};
