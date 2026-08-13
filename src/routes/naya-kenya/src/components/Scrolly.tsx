import { useState } from "react";
import { motion } from "framer-motion";
import { Scrollama, Step } from "react-scrollama";
import dottedBg from "../images/pattern.png";
import GirlSVG from "./GirlSvg";
import RectangeSvg from "./RectangeSvg";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const girlVariants = {
  hidden: { opacity: 0, scale: 0.4, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const steps = [
  {
    id: 0,
    title: "45.6%",
    description:
      "of girls and women in Kenya cannot afford sanitary pads, forcing many to use improvised alternatives: rags, tissue, pieces of mattress etc. that are often unhygienic and unsafe.",
  },
  {
    id: 1,
    title: "3-4 days",
    description:
      "Nearly one million school-age girls miss an average of four school days per month due to menstruation and lack of access to menstrual products, which undermines their educational attainment and future opportunities",
  },
];

export default function Scrolly() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  // This callback fires when a Step hits the offset threshold. It receives the
  // data prop of the step, which stores the index of the step.
  const onStepEnter = ({ data }: { data: number }) => {
    setCurrentStepIndex(data);
  };

  return (
    <div className='px-10 w-full text-white  mx-auto py-10 bg-blue/15  my-10 relative'>
      <h3 className='text-2xl text-magenta font-bold mb-4 uppercase py-4 text-center  font-serif z-20'>
        Period Poverty Persists in Kenya
      </h3>
      <section className='max-w-5xl  gap-4 mx-auto relative z-10 '>
        <motion.div
          className='flex flex-wrap content-start  gap-2 col-span-2 justify-start p-4 md:w-[65%] w-full md:ml-auto  items-center top-24 z-10 sticky  md:self-start'
          variants={containerVariants}
          initial='hidden'
          animate={currentStepIndex !== null ? "visible" : "hidden"}
        >
          {currentStepIndex == 0 &&
            Array.from({ length: 100 }).map((_, i) => (
              <motion.div key={i} variants={girlVariants}>
                <GirlSVG
                  fill={i < 46 ? "#D62476" : "rgba(0, 0, 0, .8)"}
                  className='md:w-12 w-8 h-8 md:h-12 -z-10'
                />
              </motion.div>
            ))}
          {currentStepIndex == 1 && (
            <div className='border-2 border-black p-4 grid grid-cols-4 md:grid-cols-7 gap-4 w-full h-full content-start justify-start items-start'>
              {Array.from({ length: 35 }).map((_, i) => (
                <motion.div key={i} variants={girlVariants}>
                  <RectangeSvg
                    className='md:w-20 w-14 h-14 md:h-20'
                    fill={
                      i < 4
                        ? "none"
                        : i < 8 || i > 11
                          ? "rgba(0, 0, 0, .25)"
                          : "#D6247A"
                    }
                    showLines={i > 7 && i < 12 ? true : false}
                    borderColor={i < 4 ? "none" : "#000000"}
                    // day={i + 1}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        <Scrollama offset={0.5} onStepEnter={onStepEnter}>
          {steps.map((step, stepIndex) => (
            <Step data={stepIndex} key={step.id}>
              <div
                className='relative my-[50vh] flex flex-col  md:p-0 justify-end md:w-1/4 p-4 rounded-md bg-white md:bg-transparent  z-20 font-serif transition-opacity duration-300 col-span-1 text-black'
                style={{
                  opacity: currentStepIndex === stepIndex ? 1 : 0.2,
                }}
              >
                <p className='text-4xl font-bold text-magenta'>{step.title}</p>
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
