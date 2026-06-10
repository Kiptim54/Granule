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
      content: `There is an upward trajectory in documented femicide cases over the last two decades. This may be attributed to increased reporting.
      <br/><br/>
      We see a <b>correlation between periods of national political turbulence and spikes in femicide and gender based violence cases</b>. 
      `,
    },
    {
      id: 2,
      title: "",
      chartTitle: "",
      content: `There was a significant dip in cases in 2020 which was a lockdown/covid-19 year. Femicide cases may have been overshadowed by the covid-19 case reportings. <br/> <br/>

Additionally, the 2025 data only covers through September and therefore  it may approach or even surpass the 2024 record once all the data is compiled.
`,
    },
    {
      id: 3,
      title: "The Possible Impact of Political Instability",
      chartTitle: "",
      content: `<b>The Possible Impact of Political Instability</b>
          <br/> <br/>

          There appears to be a correlation between periods of national political  turbulence and spikes in femicide:
           <br/>
    <ul class="list-disc list-inside">
    <li>In <b>2018 (106 deaths)</b> which was the second-highest peak, and marked the fallout of the contested 2017 elections and the subsequent "Handshake" agreement which led to a lot of protests and political unrest in the country. </li>

    <br/>
    <li><b>2024 (131 deaths)</b> was similarly marked by significant civil unrest and Gen-Z-led protests. </li>
    </ul>
    <br/>Political instability and public demonstrations can lead to a breakdown in community security and a diversion of law enforcement resources, potentially increasing the vulnerability of women.

    `,
    },
  ];

  // const isIntro = currentStepIndex == null || currentStepIndex === 1;

  return (
    <div className='relative'>
      {/* Chart: sticky background, full-width on mobile; desktop transitions from full to left-half */}
      {/* <h3 className='font-bold text-3xl text-primary-red text-center my-6'>
        {" "}
        Death Trends (2005-2025){" "}
      </h3> */}
      <div
        className={`sticky top-0 h-[80vh] -z-10 transition-all duration-700 ease-in-out overflow-hidden w-full `}
      >
        <div className='absolute inset-0 flex items-center justify-center flex-col gap-8 p-2 bg-white/90 shadow-md'>
          <LineChart stepIndex={currentStepIndex} />
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
                  className={`w-full md:w-1/2 mx-auto transition-transform duration-700 ease-in-out text-left bg-white shadow-md gap-6 flex flex-col items-start justify-center p-6 
                  `}
                >
                  {step.title && (
                    <h2 className='font-bold titlecase font-headline md:text-h3 text-xl text-primary-red'>
                      {step.chartTitle}
                    </h2>
                  )}
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
