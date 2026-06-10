import { useState } from "react";

const links: [string, string][] = [
  ["/#about", "About"],
  ["/#team", "Team"],
  ["/#stories", "Stories"],
  ["/#contact", "Contact"],
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-background/80 border-b-0 border-ink'>
      <div className='flex items-center justify-between px-6 md:px-12 py-4'>
        <a
          href='/'
          className='font-display font-bold text-base tracking-widest uppercase text-ink no-underline'
        >
          The <span className='italic text-rust'>Granule</span>
        </a>

        {/* desktop links */}
        <ul className='hidden md:flex gap-10 list-none m-0 p-0'>
          {links.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className='font-mono text-base tracking-[0.14em] uppercase text-ink no-underline border-b border-transparent hover:border-rust hover:text-rust transition-colors duration-200'
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* hamburger */}
        <button
          className='md:hidden flex flex-col gap-1.25 bg-transparent border-none cursor-pointer p-1'
          onClick={() => setMenuOpen((o) => !o)}
          aria-label='Toggle menu'
        >
          <span
            className={`block w-6 h-px bg-black transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
          />
          <span
            className={`block w-6 h-px bg-black transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-px bg-black transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          />
        </button>
      </div>

      {/* mobile dropdown */}
      {menuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-background border-b-0 border-ink'>
          <ul className='list-none m-0 p-0 flex flex-col'>
            {links.map(([href, label]) => (
              <li key={href} className='border-b border-ink/10'>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className='block font-mono text-[0.72rem] tracking-[0.16em] uppercase text-ink no-underline px-6 py-4 hover:text-rust hover:bg-paper-dark transition-colors duration-150'
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
