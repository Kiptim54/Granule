import React from "react";

export default function HiddenCharges() {
  return (
    <div className='max-w-5xl mx-auto flex flex-col gap-4 my-10 p-10'>
      <h3 className='font-serif uppercase text-2xl font-bold text-ink'>
        Hidden <span className='text-magenta italic font-bold'>Charges</span>
      </h3>
      <div className='flex flex-col gap-4 p-0 md:px-10'>
        <h3 className='font-serif text-2xl text-ink mt-4'>
          2. The{" "}
          <span className='text-magenta italic font-bold'>
            second trap sits at the port
          </span>
          , and no VAT reform touches it.
        </h3>
        <p className='font-serif text-lg'>
          Every import into Kenya carries a stack of charges levied on the
          customs value, whatever its VAT status. The Import Declaration Fee is
          2.5 per cent. The Railway Development Levy is 2 per cent. The Maritime
          Shipping Levy is 1.5 per cent. Together: a 6 per cent cumulative
          burden, applied to menstrual products and to the raw materials used to
          make them. These costs are non-refundable. 
        </p>
      </div>
    </div>
  );
}
