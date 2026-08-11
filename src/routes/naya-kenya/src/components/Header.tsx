import heroImg from "../images/header-img.webp";
import dottedBg from "../images/dotted-bg.png";

export default function Header() {
  return (
    <>
      {/* <div className='relative overflow-hidden bg-white text-xs md:text-sm p-4 gap-2 flex flex-col md:flex-row uppercase justify-between text-center font-serif'>
        <div
          className='absolute inset-0 bg-cover bg-white bg-center'
          style={{ backgroundImage: `url(${dottedBg})` }}
        />
        <p className='relative'>
          Menstrual Health Market Fiscal and Regulatory Reform Report -
          2026{" "}
        </p>
        <p className='relative font-semibold text-magenta'>
          NAYA KENYA × UNFPA
        </p>
      </div> */}
      <div
        className='min-h-[50vh] md:min-h-[85vh] flex flex-col gap-4 bg-cover bg-bottom items-center justify-center relative font-serif'
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className='absolute inset-0 bg-ink/15 text-white text-center' />
        <h1 className='relative text-4xl md:text-6xl text-white'>
          The Price of <span className='text-magenta txt italic'>Dignity</span>
        </h1>
        <h4 className='relative text-center text-base text-white md:text-lg font-serif '>
          Network for Adolescent and Youth of Africa (NAYA) Report
        </h4>
      </div>
    </>
  );
}
