const navLinks: [string, string][] = [
  ["/#about", "About Us"],
  ["/#team", "The Team"],
  ["/#stories", "Our Stories"],
  ["/#contact", "Contact"],
];

const focusAreas = ["Gender & Safety", "Health", "Politics & Power", "Economy"];

export default function Footer() {
  return (
    <footer
      className='bg-ink px-6 md:px-12 pt-10 md:pt-12 pb-8'
      style={{ borderTop: "4px solid #B8922A" }}
    >
      <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8 md:pb-10 border-b border-paper/10'>
        <div>
          <div className='font-display font-bold text-paper text-3xl mb-2'>
            The Granule <span className='italic text-gold'>Africa</span>
          </div>
          <p className='font-serif italic text-base leading-[1.65] text-paper/50 max-w-70 mt-2'>
            A data storytelling studio telling African stories through
            journalism, technology, and design.
          </p>
        </div>

        <div>
          <div className='font-mono text-sm tracking-[0.16em] uppercase text-gold mb-4 md:mb-5'>
            Navigate
          </div>
          <ul className='list-none p-0 m-0 flex flex-col gap-2'>
            {navLinks.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className='font-serif text-base text-paper/60 no-underline hover:text-paper transition-colors duration-200'
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className='font-mono text-sm tracking-[0.16em] uppercase text-gold mb-4 md:mb-5'>
            Focus Areas
          </div>
          <ul className='list-none p-0 m-0 flex flex-col gap-2'>
            {focusAreas.map((area) => (
              <li key={area}>
                <a
                  href='/#stories'
                  className='font-serif text-base text-paper/60 no-underline hover:text-paper transition-colors duration-200'
                >
                  {area}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-0 mt-6 md:mt-8'>
        <span className='font-mono text-sm tracking-widest uppercase text-paper/30'>
          © 2026 The Granule Africa. All rights reserved.
        </span>
        <span className='font-serif italic text-base text-paper/30'>
          Rooted in Africa. Rigorous in data. Human in story.
        </span>
      </div>
    </footer>
  );
}
