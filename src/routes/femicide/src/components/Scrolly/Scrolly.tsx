import { useState } from "react";
import PieChart from "../charts/PieChart";

import { Scrollama, Step } from "react-scrollama";
interface ScrollamaResponse {
  element: HTMLElement;
  data: number; // The 'data' prop passed to the Step
  direction: "up" | "down";
  entry?: IntersectionObserverEntry;
}
export default function Scrolly() {
  const [currentStepIndex, setCurrentStepIndex] = useState<null | number>(null);

  // This callback fires when a Step hits the offset threshold. It receives the
  // data prop of the step, which in this demo stores the index of the step.
  const onStepEnter = ({ data }: ScrollamaResponse) => {
    console.log("onStepEnter", data);
    setCurrentStepIndex(data);
  };

  const steps = [
    // {
    //   id: 1,
    //   title: "",
    //   chartTitle: "",
    //   content: `After an initiative by Africa Uncensored, Odipo Dev and Africa Data
    //       Hub to track femicide data in Kenya, we are now seeing a clearer
    //       picture of the situation.`,
    // },

    {
      id: 2,
      title: "",
      chartTitle: "Women are dying at Home",
      content:
        "Femicide is defined as an intentional killing with a gender-related motivation. It is different from homicide, where the motivation may not be gender-related. It is mostly driven by hatred of women (misogyny), possessiveness or patriarchal norms, rather than random violence. It is a universal problem.  In 2024, 50,000 women and girls were killed by intimate partners or family members – one every 10 minutes – according to the  UNODC and UN Women.",
    },
    {
      id: 3,
      title: "",
      chartTitle: "Intimate Partners are the main perpetrators",
      content:
        "The majority of femicide victims are killed by intimate partners. In Kenya, 65% of femicide victims are killed by their intimate partners. This highlights the need for stronger legal protections and support for victims of domestic violence.",
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
          <PieChart step={currentStepIndex} />
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
