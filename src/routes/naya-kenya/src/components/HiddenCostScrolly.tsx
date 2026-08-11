import dottedBg from "../images/pattern.png";

export default function HiddenCostScrolly() {
  return (
    <div className='px-10 w-full uppercase mx-auto py-10 bg-blue/30 min-h-[90vh] my-10 relative'>
      scrolly here
      <div
        className='absolute inset-0 bg-cover bg-center opacity-20'
        style={{ backgroundImage: `url(${dottedBg})` }}
      />
    </div>
  );
}
