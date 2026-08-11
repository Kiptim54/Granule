import { Fragment } from "react";
import { Check, X } from "lucide-react";

const comparisonRows: { before: React.ReactNode; after: React.ReactNode }[] = [
  {
    before: "Raw material imported — VAT charged.",
    after: "Raw material imported — VAT charged.",
  },
  {
    before: (
      <>
        Manufacturer pays VAT, <span className='italic font-bold'>cannot</span>{" "}
        reclaim it.
      </>
    ),
    after: (
      <>
        Manufacturer reclaims the VAT{" "}
        <span className='italic font-bold'>in full</span>.
      </>
    ),
  },
  {
    before: "Cost baked into the shelf price, invisibly.",
    after: "Shelf price carries no hidden VAT.",
  },
  {
    before: (
      <>
        Esther pays the <span className='italic font-bold'>hidden</span> VAT at
        the till.
      </>
    ),
    after: (
      <>
        Esther pays a <span className='italic font-bold'>genuinely</span>{" "}
        zero-rated price.
      </>
    ),
  },
];

export default function VatTrap() {
  return (
    <div className='max-w-5xl mx-auto flex flex-col gap-4 mt-10 px-10'>
      <h3 className='font-serif uppercase text-2xl  text-ink font-bold'>
        The VAT <span className='text-magenta  font-bolder'>Trap</span>
      </h3>
      <div className='flex flex-col gap-4 p-0 md:p-10'>
        <p className='font-serif text-lg'>
          When researchers, manufacturers and policymakers sat down to work out
          why, they found the exemption wasn't the whole story. It was part of a
          tax trap. Manufacturers and retailers have long been blamed for greed.
          The research points somewhere else: they are caught in the same trap.
        </p>
        <h3 className='font-serif text-xl text-ink mt-4'>
          1. The first trap is the{" "}
          <span className='text-magenta italic font-bold'>
            exemption itself
          </span>
          .
        </h3>
        <p className='font-serif text-lg'>
          Kenya exempted menstrual products from VAT; but exemption is not the
          same as removing tax. When pads are exempt, the manufacturer still
          pays VAT on inputs it cannot claim back. Not all raw materials were
          exempted, so VAT is still paid on some of them. Under an exemption,
          that money is gone. It cannot be recovered from KRA, so it is
          recovered from the customer instead. It is baked into the shelf price
          of every pack, invisible, before the pack ever reaches a shop.
          <br /> <br />
          The alternative is zero-rating. Zero-rated goods are still taxable; 
          just at zero per cent. The seller charges no VAT, and can claim back
          the VAT paid on inputs. The chain stays intact and the product is
          genuinely tax-free by the time it reaches Esther. Under exemption, the
          chain breaks, and the break is paid for at the till.
        </p>
        <div className='grid grid-cols-2 rounded-md bg-none text-cream shadow-none overflow-hidden mt-2 p-6  md:w-[80%] mx-auto'>
          <h4 className='font-serif uppercase text-base text-black text-center py-5 px-4 border-b-4 border-magenta/90 border-r-4'>
            Exemption — current law
          </h4>
          <h4 className='font-serif uppercase text-base text-black text-center py-5 px-4 border-b-4 border-magenta/90'>
            Zero-rating —{" "}
            <span className='text-magenta italic font-bold'>the ask</span>
          </h4>

          <ul className='flex flex-col gap-6 font-serif  text-black text-base text-left py-8 px-4 md:px-8 border-r-4 border-magenta/90'>
            <li>Raw material imported — VAT charged.</li>
            <li>
              Manufacturer pays VAT,{" "}
              <span className='italic font-bold'>cannot</span> reclaim it.
            </li>
            <li>Cost baked into the shelf price, invisibly.</li>
            <li>
              Esther pays the <span className='italic font-bold'>hidden</span>{" "}
              VAT at the till.
            </li>
          </ul>
          <ul className='flex flex-col gap-6 font-serif text-base text-black text-left py-8 px-4 md:px-8'>
            <li>Raw material imported — VAT charged.</li>
            <li>
              Manufacturer reclaims the VAT{" "}
              <span className='italic font-bold'>in full</span>.
            </li>
            <li>Shelf price carries no hidden VAT.</li>
            <li>
              Esther pays a <span className='italic font-bold'>genuinely</span>{" "}
              zero-rated price.
            </li>
          </ul>
        </div>
      </div>

      {/* hidden costs */}
    </div>
  );
}
