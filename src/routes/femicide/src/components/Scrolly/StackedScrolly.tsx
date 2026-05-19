import { useState } from "react";
import StackedScrollyChart from "../charts/StackedBarChart";

import { Scrollama, Step } from "react-scrollama";
interface ScrollamaResponse {
  element: HTMLElement;
  data: number; // The 'data' prop passed to the Step
  direction: "up" | "down";
  entry?: IntersectionObserverEntry;
}
export default function StackedScrolly() {
  const [currentStepIndex, setCurrentStepIndex] = useState<null | number>(null);

  // This callback fires when a Step hits the offset threshold. It receives the
  // data prop of the step, which in this demo stores the index of the step.
  const onStepEnter = ({ data }: ScrollamaResponse) => {
    console.log("onStepEnter", data);
    setCurrentStepIndex(data);
  };

  const steps = [
    {
      id: 1,
      title: "",
      chartTitle: "Which age groups are dying?",
      content: `There is a huge under-reporting in the age group of most deaths with 513 victims not having their ages recorded. 
<br/> <br/>
With the existing data, we can see that the group most at risk is women between <b>15-29 years</b>. Dying at the prime of their life`,
    },

    {
      id: 2,
      title: "",
      chartTitle: "Who is killing them?",
      content: `
       For younger (under 15) and older victims (60+), They are <b>more likely to be killed by strangers</b>.
<br/><br/>
Whereas between the ages of 15-59, the women are <b>more likely to be killed by intimate partners</b>
       `,
    },
  ];

  const isIntro = currentStepIndex == null || currentStepIndex === 1;

  return (
    <div className='relative'>
      {/* Chart: sticky background, full-width on mobile; desktop transitions from full to left-half */}

      <div
        className={`sticky top-0 h-screen -z-10 transition-all duration-700 ease-in-out overflow-hidden w-full ${
          isIntro ? "md:w-full" : "md:w-1/2"
        }`}
      >
        <div className='absolute inset-0 flex items-center justify-center flex-col gap-8 p-2'>
          {/* <h3 className='text-primary-red font-semibold text-3xl text-center'>
            Who is Killing Women?
          </h3> */}
          <StackedScrollyChart step={currentStepIndex} />
        </div>
      </div>

      {/* Text: overlaid on chart, scrolls on top */}
      <div className='relative z-30'>
        <Scrollama offset={0.5} onStepEnter={onStepEnter}>
          {steps.map((step) => (
            <Step data={step.id} key={step.id}>
              <div className='flex mb-[80vh] md:my-[60vh]'>
                <div
                  style={{ opacity: currentStepIndex === step.id ? 1 : 0.5 }}
                  className={`w-full md:w-1/2 md:ml-auto transition-transform duration-700 ease-in-out text-left bg-white md:bg-white/99 shadow-md gap-6 flex flex-col items-start justify-center p-6 ${
                    isIntro ? "md:-translate-x-1/2" : "md:translate-x-0"
                  }`}
                >
                  <h2 className='font-bold titlecase font-headline md:text-h3 text-xl text-primary-red'>
                    {step.chartTitle}
                  </h2>
                  <div
                    className='text-base text-gray-700 leading-relaxed'
                    dangerouslySetInnerHTML={{ __html: step.content }}
                  />
                </div>
              </div>
            </Step>
          ))}
        </Scrollama>
        <div className='h-[80vh]' />
      </div>
    </div>
  );
}
