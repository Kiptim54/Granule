import { useState } from "react";
import { motion } from "framer-motion";
import { Scrollama, Step } from "react-scrollama";
import dottedBg from "../images/pattern.png";

const steps = [
  {
    id: 0,
    title: "2.5% IDF",
    description:
      "The Import Declaration Fee is 2.5 per cent. IDF is a mandatory processing fee charged by the Kenya Revenue Authority on commercial imports. You must pay and obtain an IDF number before goods can be cleared at any port or airport in Kenya",
  },
  {
    id: 1,
    title: "2% RDL",
    description:
      " Railway Development Levy  is 2 per cent. RDL is a levy charged on all imports into Kenya. It is meant to fund the construction of the Standard Gauge Railway, but it is not refundable for menstrual products, so it adds to the overall cost burden on girls and women in Kenya.",
  },
  {
    id: 2,
    title: "1.5% MSL",
    description:
      "The Maritime Shipping Levy is 1.5 per cent. . It is charged under the Miscellaneous Fees and Levies Act and collected by the Kenya Revenue Authority (KRA) on imports. ",
  },
];

// Bars sit on a shared baseline (y = 400) inside the 500 x 500 viewBox.
// Bar heights are fixed to their true percentage value — only color highlights
// with the active scroll step, so the mark never misrepresents the data.
const BASELINE_Y = 400;
const SCALE = 260 / 6; // px per percentage point (6% total maps to a 260px bar)
const BAR_WIDTH = 80;
const AXIS_X = 55;
const Y_TICKS = [0, 2, 4, 6];

const charges = [
  { id: 0, label: "IDF", value: 2.5, x: 70, fill: "#D6247A" },
  { id: 1, label: "RDL", value: 2, x: 178, fill: "#3fc7de" },
  { id: 2, label: "MSL", value: 1.5, x: 287, fill: "#b8862b" },
];

const TOTAL_CHARGE = { label: "TOTAL", x: 395 };

const MAGENTA = "#D6247A";
const CORAL = "#D8492E";
const INACTIVE_FILL = "rgba(26, 26, 26, 0.12)";
const INK = "#1A1A1A";

export default function HiddenCostScrolly() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  // This callback fires when a Step hits the offset threshold. It receives the
  // data prop of the step, which stores the index of the step.
  const onStepEnter = ({ data }: { data: number }) => {
    setCurrentStepIndex(data);
  };

  return (
    <div className='px-10 w-full text-white  mx-auto py-10 bg-transparent  my-10 relative'>
      <h3 className='text-2xl text-magenta font-bold mb-4  py-4 text-center  font-serif z-20'>
        Hidden Charges (Para-Tariffs) on Menstrual Products in Kenya
      </h3>
      <section className='max-w-5xl  gap-4 mx-auto relative z-10 '>
        <motion.div
          className='flex flex-wrap content-start  gap-2 col-span-2 justify-start p-4 md:w-[65%] w-full md:ml-auto  items-center top-24 z-10 sticky  md:self-start'
          animate={currentStepIndex !== null ? "visible" : "hidden"}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 500 500'
            className='w-full h-auto max-w-none font-serif'
          >
            {/* y axis */}
            <line
              x1={AXIS_X}
              y1={BASELINE_Y}
              x2={AXIS_X}
              y2={BASELINE_Y - 6 * SCALE - 20}
              stroke={INK}
              strokeOpacity={0.15}
              strokeWidth={1}
            />
            {Y_TICKS.map((tick) => {
              const tickY = BASELINE_Y - tick * SCALE;
              return (
                <g key={tick}>
                  <line
                    x1={AXIS_X - 5}
                    y1={tickY}
                    x2={AXIS_X}
                    y2={tickY}
                    stroke={INK}
                    strokeOpacity={0.15}
                    strokeWidth={1}
                  />
                  <text
                    x={AXIS_X - 10}
                    y={tickY + 4}
                    textAnchor='end'
                    fontSize={12}
                    fill={INK}
                    fillOpacity={0.5}
                    fontFamily='var(--font-serif)'
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            <line
              x1={AXIS_X}
              y1={BASELINE_Y}
              x2={485}
              y2={BASELINE_Y}
              stroke={INK}
              strokeOpacity={0.15}
              strokeWidth={1}
            />

            {charges.map((charge) => {
              const isActive =
                currentStepIndex !== null && charge.id <= currentStepIndex;
              const height = charge.value * SCALE;
              const y = BASELINE_Y - height;
              const center = charge.x + BAR_WIDTH / 2;

              return (
                <g key={charge.id}>
                  <motion.rect
                    x={charge.x}
                    width={BAR_WIDTH}
                    rx={4}
                    initial={false}
                    animate={{
                      y,
                      height,
                      fill: isActive ? charge.fill || "MAGENTA" : INACTIVE_FILL,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                  <motion.text
                    x={center}
                    y={y - 12}
                    textAnchor='middle'
                    fontSize={14}
                    fontFamily='var(--font-serif)'
                    initial={false}
                    animate={{ fill: INK, fontWeight: isActive ? 700 : 400 }}
                  >
                    {charge.value}%
                  </motion.text>
                  <motion.text
                    x={center}
                    y={BASELINE_Y + 24}
                    textAnchor='middle'
                    fontSize={10}
                    letterSpacing={1}
                    fontFamily='var(--font-serif)'
                    initial={false}
                    animate={{ fill: INK, fontWeight: isActive ? 700 : 400 }}
                  >
                    {charge.label}
                  </motion.text>
                </g>
              );
            })}

            {/* connectors: IDF + RDL + MSL = TOTAL */}
            <text
              x={164}
              y={BASELINE_Y - 20}
              textAnchor='middle'
              fontSize={22}
              fill={INK}
              fillOpacity={0.35}
            >
              +
            </text>
            <text
              x={273}
              y={BASELINE_Y - 20}
              textAnchor='middle'
              fontSize={22}
              fill={INK}
              fillOpacity={0.35}
            >
              +
            </text>
            <text
              x={381}
              y={BASELINE_Y - 20}
              textAnchor='middle'
              fontSize={22}
              fill={INK}
              fillOpacity={0.35}
            >
              =
            </text>

            {(() => {
              const cumulativeValue =
                currentStepIndex === null || currentStepIndex === undefined
                  ? 0
                  : charges
                      .filter((charge) => charge.id <= currentStepIndex)
                      .reduce((sum, charge) => sum + charge.value, 0);
              const height = cumulativeValue * SCALE;
              const y = BASELINE_Y - height;
              const center = TOTAL_CHARGE.x + BAR_WIDTH / 2;
              return (
                <g>
                  <motion.rect
                    x={TOTAL_CHARGE.x}
                    width={BAR_WIDTH}
                    rx={4}
                    initial={false}
                    animate={{ y, height, fill: CORAL }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                  <motion.text
                    x={center}
                    textAnchor='middle'
                    fontSize={14}
                    fontWeight={700}
                    fill={INK}
                    fontFamily='var(--font-serif)'
                    initial={false}
                    animate={{ y: y - 12 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {cumulativeValue}%
                  </motion.text>
                  <text
                    x={center}
                    y={BASELINE_Y + 24}
                    textAnchor='middle'
                    fontSize={10}
                    letterSpacing={1}
                    fontWeight={700}
                    fill={CORAL}
                    fontFamily='var(--font-serif)'
                  >
                    {TOTAL_CHARGE.label}
                  </text>
                </g>
              );
            })()}
          </svg>{" "}
        </motion.div>
        <Scrollama offset={0.5} onStepEnter={onStepEnter}>
          {steps.map((step, stepIndex) => (
            <Step data={stepIndex} key={step.id}>
              <div
                className='relative my-[50vh] flex flex-col justify-end md:w-1/4 bg-white md:bg-transparent p-4 z-20 font-serif transition-opacity duration-300 col-span-1 text-black'
                style={{
                  opacity: currentStepIndex === stepIndex ? 1 : 0.2,
                }}
              >
                <p className='text-3xl font-bold text-magenta'>{step.title}</p>
                <p className='mt-4 text-base pl-2'>{step.description}</p>
              </div>
            </Step>
          ))}
          <div className='mt-[50vh] flex flex-col justify-end w-1/4 font-serif transition-opacity duration-300 col-span-1 text-black'></div>
        </Scrollama>
      </section>

      <div
        className='absolute inset-0 bg-fit bg-center opacity-90'
        style={{ backgroundImage: `url(${dottedBg})` }}
      />
    </div>
  );
}
