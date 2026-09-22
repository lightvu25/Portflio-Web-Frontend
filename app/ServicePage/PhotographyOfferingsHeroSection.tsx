import ellipse1Stroke from "./ellipse-1-stroke.svg";
import image from "./image.png";
import star from "./star.svg";

export const PhotographyOfferingsHeroSection = (): JSX.Element => {
  return (
    <section
      className="absolute top-[219px] left-[162px] flex w-[1596px] flex-col items-start"
      aria-labelledby="photography-offerings-heading"
    >
      <header className="relative z-[1] flex w-full flex-[0_0_auto] flex-col items-start gap-[31px] py-5 pl-[300px] pr-0">
        <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-1">
          <p className="relative mt-[-1px] w-full [font-family:'Manrope-SemiBold',Helvetica] text-xl font-semibold leading-[normal] tracking-[0] text-grey-50">
            SERVICES
          </p>
          <h1
            id="photography-offerings-heading"
            className="relative w-full [font-family:'Manrope-SemiBold',Helvetica] text-[58px] font-semibold leading-[normal] tracking-[0] text-absolutewhite"
          >
            DIVERSE PHOTOGRAPHY OFFERINGS
          </h1>
        </div>
        <p className="relative w-full [font-family:'Manrope-Regular',Helvetica] text-lg font-normal leading-[27px] tracking-[0] text-grey-50">
          Unlock the full spectrum of professional photography services tailored
          to your vision. From timeless portraits to captivating event coverage,
          I bring a unique blend of creativity and technical expertise to each
          project.
        </p>
      </header>
      <div className="relative z-0 mt-[-338px] flex w-full flex-[0_0_auto] flex-col items-start">
        <img
          className="relative h-[784px] w-full self-stretch object-cover"
          alt="Photography studio with lighting equipment"
          src={image}
        />
        <div className="relative mt-[-264px] flex w-full flex-[0_0_auto] items-center justify-between py-[18px] pl-5 pr-[50px]">
          <div className="relative h-[137px] w-[137px]" aria-hidden="true">
            <img
              className="absolute left-[17.07%] top-[17.07%] h-[82.93%] w-[82.93%]"
              alt=""
              src={star}
            />
            <img
              className="absolute left-0 top-0 h-full w-full"
              alt=""
              src={ellipse1Stroke}
            />
          </div>
          <p className="relative w-[205px] [font-family:'Manrope-Medium',Helvetica] text-lg font-medium leading-[normal] tracking-[0] text-grey-50">
            SCROLL DOWN TO SEE ALL SERVICES
          </p>
        </div>
      </div>
    </section>
  );
};
