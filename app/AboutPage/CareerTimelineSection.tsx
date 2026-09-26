type TimelineEntry = {
  year: string;
  description: string;
};

const timelineEntries: TimelineEntry[] = [
  {
    year: "2005",
    description:
      "In 2005, Damien acquired her first camera, igniting her passion for photography. She started experimenting with landscapes and candid shots, marking the beginning of her visual storytelling journey.",
  },
  {
    year: "2010",
    description:
      "Damien pursued a degree in Fine Arts with a focus on photography, refining her technical skills and artistic sensibilities.",
  },
  {
    year: "2012",
    description:
      "In 2012, Damien held her first solo exhibition, showcasing her unique perspective on nature and people through her lens.",
  },
  {
    year: "2015",
    description:
      "Damien officially launched her photography business in 2015, offering portrait, event, and commercial photography services.",
  },
  {
    year: "2017",
    description:
      "Damien's work took her beyond the USA, capturing breathtaking scenes and cultures from around the world.",
  },
  {
    year: "2020",
    description:
      "In 2020, Damien's dedication and creativity earned her several prestigious photography awards, solidifying her position as a visionary photographer.",
  },
];

const timelineRows = [
  timelineEntries.slice(0, 2),
  timelineEntries.slice(2, 4),
  timelineEntries.slice(4, 6),
];

const TimelineBackground = (): JSX.Element => {
  return (
    <div
      aria-hidden="true"
      className="absolute top-[calc(50.00%_-_395px)] left-[calc(50.00%_-_739px)] w-[1260px] h-[947px] opacity-50"
    >
      <div className="absolute top-14 right-[-78px] w-[459px] h-[459px] rounded-[22px] rotate-[-144.54deg] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
      <div className="absolute top-[361px] right-[646px] w-[490px] h-[490px] rounded-[22px] rotate-[-54.66deg] bg-[linear-gradient(207deg,rgba(24,24,27,1)_0%,rgba(24,24,27,0)_100%)]" />
    </div>
  );
};

const TimelineCard = ({ entry }: { entry: TimelineEntry }): JSX.Element => {
  return (
    <article className="flex flex-col items-start gap-5 p-[50px] relative flex-1 grow bg-dark-06 rounded-xl overflow-hidden border border-solid border-dark-12">
      <TimelineBackground />
      <h3 className="self-stretch text-grey-50 text-[44px] relative mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">
        YEAR - {entry.year}
      </h3>
      <p className="text-lg leading-[27px] relative self-stretch [font-family:'Manrope-Regular',Helvetica] font-normal text-grey-50 tracking-[0]">
        {entry.description}
      </p>
    </article>
  );
};

export const CareerTimelineSection = (): JSX.Element => {
  return (
    <section
      aria-labelledby="career-timeline-title"
      className="flex flex-col w-[1583px] items-start gap-20 absolute top-[1743px] left-[162px]"
    >
      <header className="gap-1 pt-0 pb-[50px] px-0 self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-dark-12 flex flex-col items-start relative">
        <div className="relative self-stretch mt-[-1.00px] [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-grey-50 text-xl tracking-[0] leading-[normal]">
          JOURNEY
        </div>
        <h2
          id="career-timeline-title"
          className="relative self-stretch [font-family:'Manrope-SemiBold',Helvetica] font-semibold text-absolutewhite text-[58px] tracking-[0] leading-[normal]"
        >
          DAMIEN&apos;S JOURNEY - A TIMELINE
        </h2>
      </header>
      <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        {timelineRows.map((row, rowIndex) => (
          <div
            key={`timeline-row-${rowIndex}`}
            className="flex items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]"
          >
            {row.map((entry) => (
              <TimelineCard key={entry.year} entry={entry} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
