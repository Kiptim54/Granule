export default function Quote({
  text,
  author,
}: {
  text?: string;
  author?: string;
}) {
  return (
    <div className='text-xl italic p-6 bg-[#C4A882]/17 border-l-4 border-primary-red text-gray-700 rounded-sm'>
      <p>"{text}"</p>
      <br />
      <p className='font-bold'> {author}</p>
    </div>
  );
}
