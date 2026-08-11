import dottedBg from "../images/dotted-bg.png";

export default function Footer() {
  return (
    <footer className='relative w-full bg-magenta text-cream overflow-hidden'>
      <div
        className='absolute inset-0 bg-cover bg-center opacity-10'
        style={{ backgroundImage: `url(${dottedBg})` }}
      />
      <div className='relative max-w-6xl mx-auto px-6 md:px-16 py-16 md:py-24 flex flex-col gap-12'>
        {/* <blockquote className='font-serif italic text-2xl md:text-4xl leading-snug max-w-3xl'>
          For Esther. For every girl still counting shillings at the till.{" "}
          <span className='text-magenta not-italic font-bold'>
            That's the ask.
          </span>
        </blockquote> */}

        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-t border-cream/15 pt-8'>
          <div>
            <p className='font-serif text-3xl'>The Price of Dignity</p>
            <p className='font-sans text-base uppercase tracking-[0.15em] text-cream/60 mt-1'>
              Menstrual Health Market Fiscal and Regulatory Reform Report — 2026
            </p>
          </div>
          <p className='font-sans text-sm font-semibold text-white uppercase tracking-[0.15em]'>
            NAYA Kenya × UNFPA
          </p>
        </div>

        <p className='font-sans text-xs text-cream/50 max-w-2xl'>
          © 2026 Network for Adolescent and Youth of Africa (NAYA Kenya) and
          UNFPA. All figures drawn from primary interviews and the published
          fiscal data cited throughout this report.
        </p>
      </div>
    </footer>
  );
}
