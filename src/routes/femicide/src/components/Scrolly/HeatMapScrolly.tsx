import { useState } from "react";
import { Scrollama, Step } from "react-scrollama";
import HeatmapChart from "../charts/HeatMap";

interface ScrollamaResponse {
  element: HTMLElement;
  data: number;
  direction: "up" | "down";
  entry?: IntersectionObserverEntry;
}

const steps = [
  {
    id: 1,
    chartTitle: "Weekend surge",
    content:
      "The data reveals the daily risk rate is highest on <strong>weekends</strong>, despite lower total counts compared to the 5-day work week. Saturday and Sunday carry disproportionate danger relative to their share of the week.",
  },
  {
    id: 2,
    chartTitle: "Monday is not safe",
    content:
      "High rates on <strong>Monday</strong> suggest weekend-adjacent violence or significant reporting delays. Violence that begins on Sunday often surfaces in records the following morning.",
  },
  {
    id: 3,
    chartTitle: "Seasonal peaks: January and July",
    content:
      "<strong>January</strong> (post-holiday financial stress) and <strong>July</strong> represent the highest-risk months. These transitions — the end of festivity, the start of school terms — appear to intensify domestic pressure.",
  },
  {
    id: 4,
    chartTitle: "A predictable temporal pulse",
    content:
      "Femicide in Kenya isn't random. It follows a predictable temporal pulse. The 'heat' intensifies during the weekend and peaks at the start of the year, allowing us to <strong>identify windows where intervention and police presence could be most effective.</strong>",
  },
];

export default function HeatmapScrolly() {
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const onStepEnter = ({ data }: ScrollamaResponse) => setCurrentStep(data);
  const onStepExit = ({ data, direction }: ScrollamaResponse) => {
    if (direction === "up" && data === steps[0].id) setCurrentStep(null);
  };

  const isIntro = currentStep === null;

  return (
    <div className='relative'>
      {/* ── Sticky heatmap ── */}
      <div
        className={`sticky top-0 h-screen -z-10 overflow-hidden w-full transition-all duration-700 ease-in-out ${
          isIntro ? "md:w-full" : "md:w-1/2"
        }`}
      >
        <div className='absolute inset-0 flex items-center justify-center p-4 md:p-8'>
          <HeatmapChart step={currentStep} />
        </div>
      </div>

      {/* ── Scrolling text ── */}
      <div className='relative z-30'>
        <div className='h-[15vh]' />

        <Scrollama
          offset={0.5}
          onStepEnter={onStepEnter}
          onStepExit={onStepExit}
        >
          {steps.map((step, i) => (
            <Step data={step.id} key={step.id}>
              <div className='flex mb-[70vh] md:my-[60vh]'>
                <div
                  style={{ opacity: currentStep === step.id ? 1 : 0.45 }}
                  className={`
                    w-full md:w-1/2 md:ml-auto md:bg-white/95 bg-white shadow-md
                    flex flex-col gap-4 items-start justify-center p-6
                    transition-all duration-700 ease-in-out
                    ${isIntro ? "md:-translate-x-1/2" : "md:translate-x-0"}
                  `}
                >
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                      color: "#9C8B7A",
                      fontWeight: 600,
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}
                  >
                    Temporal Analysis · {i + 1} of {steps.length}
                  </span>

                  <h2
                    className='font-bold font-headline md:text-h3 text-xl'
                    style={{
                      color: "#8B1A1A",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      lineHeight: 1.3,
                    }}
                  >
                    {step.chartTitle}
                  </h2>

                  <div
                    className='text-base text-gray-700 leading-relaxed'
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
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
