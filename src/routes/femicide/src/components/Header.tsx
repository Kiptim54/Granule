import { ChevronDown } from "lucide-react";
import victims from "../assets/victims.json";

const chunk = Math.ceil(victims.length / 3);
const rows = [
  victims.slice(0, chunk),
  victims.slice(chunk, chunk * 2),
  victims.slice(chunk * 2),
];

type Direction = "left" | "right";

export function MarqueeRow({
  direction,
  duration = 20,
  items,
}: {
  direction: Direction;
  duration?: number;
  items: typeof victims;
}) {
  const looped = [...items, ...items];
  return (
    <div
      className='overflow-x-clip w-full relative pb-5'
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 5%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 5%, black 85%, transparent)",
      }}
    >
      <div
        className='flex w-max'
        style={{
          animation: `marquee-${direction} ${duration}s linear infinite`,
        }}
      >
        {looped.map((person, index) => (
          <div
            key={index}
            className='relative group px-3 shrink-0 transition-transform duration-200 group-hover:scale-110 hover:scale-105 hover:z-50'
          >
            <img
              src={person.image}
              alt={person.name}
              className='h-16 opacity-50 block group-hover:opacity-100 group-hover:cursor-pointer transition-opacity duration-200'
            />
            <span className='absolute md:-bottom-5 -bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-wide text-gray-600 whitespace-nowrap opacity-25 group-hover:opacity-100 transition-opacity duration-200 max-w-[60px]  truncate group-hover:max-w-none group-hover:whitespace-nowrap'>
              {person.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <section className='header flex flex-col min-h-screen md:items-center md:justify-center gap-10 py-10'>
      <div className='text-center flex flex-col gap-4'>
        <h1 className='font-semibold titlecase font-headline md:text-display text-4xl'>
          <span className='text-primary-red font-bold'>Femicide </span>In Kenya
        </h1>
        <p className='md:text-xl text-lg font-light  text-center'>
          Investigating Temporal patterns on when <br /> Kenyan women are most
          Vulnerable
        </p>
      </div>
      <div className='md:min-h-120 w-[90%] h-[60vh] md:w-1/2 mx-auto relative'>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md z-30 p-6'>
          <div className='flex flex-col gap-8 justify-between items-center h-full'>
            <sub className='text-xs text-center tracking-widest uppercase text-gray-400 font-semibold'>
              VICTIMS - Case Files
            </sub>
            <MarqueeRow direction='right' duration={35} items={rows[0]} />
            <MarqueeRow direction='left' duration={50} items={rows[1]} />
            <MarqueeRow direction='right' duration={28} items={rows[2]} />

            <sub className='self-end text-gray-400 tracking-widest'>
              001/979
            </sub>
          </div>
        </div>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md rotate-2 z-20'></div>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md -rotate-1 z-10'></div>
      </div>
      <div className='flex flex-col  items-center justify-center gap-4'>
        <p className='font-light uppercase text-sm'>
          {" "}
          Brenda Kiptim , Eunice Magwambo
        </p>

        <p className='text-accent-sand font-medium text-center'>
          SCROLL TO BEGIN
        </p>
        <ChevronDown className='text-accent-sand animate-bounce ' />
      </div>
    </section>
  );
}
