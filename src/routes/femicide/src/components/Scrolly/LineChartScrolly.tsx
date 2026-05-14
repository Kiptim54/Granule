import { useState } from "react";
import LineChart from "../charts/LineChart";

import { Scrollama, Step } from "react-scrollama";
interface ScrollamaResponse {
  element: HTMLElement;
  data: number; // The 'data' prop passed to the Step
  direction: "up" | "down";
  entry?: IntersectionObserverEntry;
}
export default function LineChartScrolly() {
  const [currentStepIndex, setCurrentStepIndex] = useState<null | number>(null);

  const onStepEnter = ({ data }: ScrollamaResponse) => {
    console.log("onStepEnter", data);
    setCurrentStepIndex(data);
  };

  const steps = [
    {
      id: 1,
      title: "",
      chartTitle: "",
      content: `After an initiative by Africa Uncensored, Odipo Dev and Africa Data
          Hub to track femicide data in Kenya, we are now seeing a clearer
          picture of the situation.`,
    },
    {
      id: 2,
      title: "",
      chartTitle: "",
      content: `There is an upward trajectory in documented femicide cases over the last two decades. This may be attributed to increased reporting.

There was a significant dip in cases in 2020 which was a lockdown/covid-19 year.

The 2025 data only covers through September and therefore  it may approach or even surpass the 2024 record.
`,
    },
  ];

  // const isIntro = currentStepIndex == null || currentStepIndex === 1;

  return (
    <div className='relative'>
      {/* Chart: sticky background, full-width on mobile; desktop transitions from full to left-half */}
      <h3 className='font-bold text-3xl text-primary-red text-center my-6'>
        {" "}
        Death Trends (2005-2025){" "}
      </h3>
      <div
        className={`sticky top-0 h-screen -z-10 transition-all duration-700 ease-in-out overflow-hidden w-full `}
      >
        <div className='absolute inset-0 flex items-center justify-center flex-col gap-8 p-2'>
          <LineChart />
        </div>
      </div>

      {/* Text: overlaid on chart, scrolls on top */}
      <div className='relative z-30'>
        <Scrollama offset={0.5} onStepEnter={onStepEnter}>
          {steps.map((step) => (
            <Step data={step.id} key={step.id}>
              <div className='flex my-[80vh] md:my-[60vh]'>
                <div
                  style={{ opacity: currentStepIndex === step.id ? 1 : 0.5 }}
                  className={`w-full md:w-1/2 mx-auto transition-transform duration-700 ease-in-out text-left bg-white md:bg-white/99 shadow-md gap-6 flex flex-col items-start justify-center p-6 
                  `}
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
