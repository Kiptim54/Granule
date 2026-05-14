const Lady = "/icons/afro-curly.svg";

export const LadyProfile = () => {
  return (
    <div className='flex-1 w-full'>
      <div className='md:min-h-120 w-full h-[60vh] md:w-[80%] mx-auto relative'>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md z-30 p-6'>
          <div className='flex flex-col gap-8 justify-between items-center h-full w-full'>
            <sub className='text-xs text-center tracking-widest uppercase text-gray-400 font-semibold'>
              VICTIM - Rebecca Cheptegei
            </sub>
            <div className='text-center grid gap-2'>
              <img
                src={Lady}
                alt='afro lady icon'
                className='block mx-auto mb-4'
              />
              <p>
                <strong>Name:</strong> REBECCA CHEPTEGAI
              </p>
              <p>
                <strong>Age:</strong> 33yrs
              </p>
              <p>
                <strong>County:</strong> Eldoret
              </p>
              <p>
                <strong>Relationship to perpetrator:</strong> Ex-boyfriend
              </p>
              <p>
                <strong>Date of Death:</strong> September 2024
              </p>
              <p>
                <strong>Status:</strong> Case reported, no prior action taken
              </p>
            </div>

            <sub className='self-end text-gray-400 tracking-widest'>
              001/979
            </sub>
          </div>
        </div>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md rotate-2 z-20'></div>
        <div className='papers absolute inset-0 bg-white w-full min-h-96 h-full shadow-md -rotate-1 z-10'></div>
      </div>
    </div>
  );
};

export default function Story() {
  return (
    <div className='md:w-[60%] mx-auto min-h-screen flex flex-col items-center justify-center p-6 gap-6'>
      <div className='flex-1 grid gap-6 p-2'>
        <h2 className='font-bold text-center titlecase font-headline md:text-h1 text-xl text-primary-red'>
          Not an Outlier
        </h2>
        <p className=' text-lg'>
          Rebecca Cheptegei, an Olympic athlete, died at the age of 33 after her
          supposed ex-boyfriend doused her in petrol and set her on fire. The
          athlete's family said that they had reported the ex-boyfriend to
          authorities over harassment, but no action had been taken. Rebecca's
          story is one of many victims of femicide. Her story is not an outlier
          but a harsh reality that many Kenyan women face at the hands of those
          closest to them.
          <br />
          <br />
          Victims range in age from a 3-year-old child to a 95-year-old
          grandmother, with an average age of 33 and a standard deviation of
          16.4 — confirming that this crisis does not spare any stage of life,
          though women aged 15–29 remain the most affected.
          <br />
          <br />
        </p>
      </div>
      <LadyProfile />
    </div>
  );
}
