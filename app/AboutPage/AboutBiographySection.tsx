import ellipse1Stroke from "./ellipse-1-stroke.svg";
import image from "./image.png";
import star from "./star.svg";

const statistics = [
  { value: "15+", label: "Years in Business" },
  { value: "500+", label: "Happy Clients" },
  { value: "10+", label: "Photography Awards" },
  { value: "05+", label: "International Shoots" },
  { value: "10,000+", label: "Social Media Followers" },
  { value: "90%", label: "Client Retention Rate" },
];

export const AboutBiographySection = () => {
  return (
    <section
      aria-labelledby="about-heading"
      className="flex flex-col w-[1593px] items-start gap-[100px] absolute top-[219px] left-[162px]"
    >
      <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-[31px] relative self-stretch w-full flex-[0_0_auto] z-[1]">
          <header className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
              ABOUT
            </div>
            <h1
              id="about-heading"
              className="relative self-stretch [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
            >
              ABOUT DAMIEN BRAUN
            </h1>
          </header>
          <div
            aria-label="Professional statistics"
            className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]"
          >
            {statistics.map((stat) => (
              <div
                key={stat.label}
                className="px-[30px] py-6 flex-1 grow bg-dark-06 rounded-xl border border-solid border-dark-12 flex flex-col items-start relative"
              >
                <div className="self-stretch text-absolutewhite text-5xl relative mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">
                  {stat.value}
                </div>
                <div className="relative self-stretch [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 text-lg tracking-[0] leading-[27px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] mt-[-338px] z-0">
          <img
            className="relative self-stretch w-full h-[784px] object-cover"
            alt="Damien Braun during a photography shoot"
            src={image}
          />
          <div className="flex items-center justify-between pl-5 pr-[50px] py-[18px] relative self-stretch w-full flex-[0_0_auto] mt-[-264px]">
            <a
              href="#biography"
              aria-label="Scroll down to see Damien Braun's journey"
              className="relative w-[137px] h-[137px]"
            >
              <img
                className="absolute w-[82.93%] h-[82.93%] top-[17.07%] left-[17.07%]"
                alt=""
                aria-hidden="true"
                src={star}
              />
              <img
                className="absolute w-full h-full top-0 left-0"
                alt=""
                aria-hidden="true"
                src={ellipse1Stroke}
              />
            </a>
            <a
              href="#biography"
              className="relative w-[205px] [font-family:'Manrope-Medium',Helvetica] font-medium text-grey-50 text-lg tracking-[0] leading-[normal]"
            >
              SCROLL DOWN TO SEE MY JOURNEY
            </a>
          </div>
        </div>
      </div>
      <section
        id="biography"
        aria-labelledby="biography-heading"
        className="gap-10 px-0 py-20 self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-dark-12 flex flex-col items-start relative"
      >
        <h2
          id="biography-heading"
          className="w-fit text-grey-50 text-[44px] relative mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]"
        >
          MY BIOGRAPHY
        </h2>
        <p className="text-xl leading-[30px] relative self-stretch [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 tracking-[0]">
          Damien Braun&apos;s love affair with photography began at a young age,
          nurtured by the captivating landscapes and vibrant cultures
          surrounding her in the heart of the USA. Her passion for storytelling
          through imagery led her to embark on a photography journey that has
          spanned over 15 years.
          <br />
          Driven by an insatiable curiosity to explore the beauty in everyday
          moments, Damien has honed her craft meticulously. Her background in
          digital media provided her with a solid foundation, but it&apos;s her
          keen eye for detail and an innate ability to capture raw emotions that
          truly set her apart.
          <br />
          Damien&apos;s journey is more than just taking pictures; it&apos;s
          about capturing the essence of the human spirit, the fleeting magic of
          nature, and the emotions that define our lives. With each click of her
          camera, she weaves stories that transcend time and space.
        </p>
      </section>
    </section>
  );
};
