interface Ask {
  label: string;
}

interface RecommendationProps {
  eyebrow?: string;
  heading?: React.ReactNode;
  context?: React.ReactNode;
  asks?: Ask[];
}

const defaultAsks: Ask[] = [
  { label: "Move menstrual products from exempt to zero-rated" },
  { label: "Remove port levies on qualifying raw materials" },
];

export default function Recommendation({
  eyebrow = "The Ask",
  heading = (
    <>
      Zero-rating, not exemption. A precedent that already exists, extended to
      the products that need it most.
    </>
  ),
  context = (
    <>
      NAYA Kenya (Network for Adolescent and Youth of Africa) will sit before
      the National Treasury in the coming weeks with two asks. Recently, the
      Finance Act 2025 granted mosquito-repellent manufacturers a full 0 per
      cent rate on equivalent import fees. The precedent exists. It has simply
      never been extended to menstrual health.
    </>
  ),
  asks = defaultAsks,
}: RecommendationProps) {
  return (
    <section className='w-full bg-white text-black px-6 md:px-16 py-16 md:py-24'>
      <div className='max-w-6xl mx-auto flex flex-col gap-10 md:gap-8'>
        {/* <p className='font-sans font-semibold uppercase text-base tracking-[0.2em] text-black/80'>
          {eyebrow}
        </p> */}
        <h2 className='font-sans font-extrabold text-magenta text-4xl md:text-4xl leading-[1.1] max-w-4xl'>
          {heading}
        </h2>
        <p className='font-serif text-base md:text-xl text-black/90 leading-relaxed max-w-3xl'>
          {context}
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 max-w-4xl'>
          {asks.map((ask, i) => (
            <p
              key={i}
              className='font-sans text-sm md:text-lg text-black font-semibold leading-snug'
            >
              <span className='text-black/90 font-bold mr-2'>
                {String(i + 1).padStart(2, "0")} —
              </span>{" "}
              {ask.label}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
