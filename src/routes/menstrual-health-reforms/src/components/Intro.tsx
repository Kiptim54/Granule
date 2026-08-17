import EstherPriceChart from "./EstherPriceChart";

export default function Intro() {
  return (
    <div className='flex flex-col gap-6 p-10 max-w-5xl mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-3'>
        <p className='font-serif text-lg col-span-2 m-auto'>
          Esther is a nanny in Nairobi earning KES 9,000 monthly. Her favorite
          pads cost KES 70 per pack.  Suddenly, last month, the price jumped to 
          KES 100. <b>That 43% increase now takes 8% of her salary</b>. With
          school fees to pay and parents to support, every shilling matters to
          Esther.
          <br />
          <br />
          On paper, Kenya has made great strides to eradicate period poverty.
          Kenya was the first country in the world, in 2004,  to remove
          value-added tax (VAT) on menstrual products. <br />
          <br />
          However Faith Masika, co-founder of Ecovital Dynamics Limited states
          that  “As much as menstrual products are VAT exempt, manufacturers and
          importers are still paying VAT on some of the raw materials because
          not all inputs were exempt.”
        </p>

        <EstherPriceChart />
      </div>
      {/* 
        <p className='font-serif text-lg'>
          Research conducted under the report found that households in the
          lowest income bracket spend close to{" "}
          <b className='font-bolder'>
            10% of their monthly income on menstrual products
          </b>{" "}
        </p> */}

      <blockquote className='font-serif italic text-xl bg-yellow/10 p-4 text-ink my-10 border-l-4 border-yellow pl-6'>
        “As much as menstrual products are VAT exempt, manufacturers and
        importers are still paying VAT on some of the raw materials because not
        all inputs were exempt.”
        <footer className='not-italic text-yellow font-light text-right font-sans text-base text-body-gray mt-3'>
          — Faith Masika, Co-founder of Ecovital Dynamics Limited
        </footer>
      </blockquote>

      <p className='font-serif text-lg'>
        Despite these tax reforms, the end users, women and girls, are still not
        benefiting. Period poverty still persists. 45.6% of girls still face
        difficulties accessing Menstrual Health Products, with thousands of
        girls missing 3-4 school days monthly due to lack of sanitary pads. 
      </p>
    </div>
  );
}
