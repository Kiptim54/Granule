import { MarqueeRow } from "./Header";

import victims from "../assets/victims.json";

const chunk = Math.ceil(victims.length / 3);
const rows = [
  victims.slice(0, chunk),
  victims.slice(chunk, chunk * 2),
  victims.slice(chunk * 2),
];

export default function Women() {
  return (
    <div className='opacity-30 pt-10'>
      <MarqueeRow direction='left' items={rows[0]} />
      <MarqueeRow direction='left' items={rows[1]} />
    </div>
  );
}
