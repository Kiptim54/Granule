import { useState } from "react";
import { Scrollama, Step } from "react-scrollama";
import TemporalCharts from "../charts/TemporalChart";

interface ScrollamaResponse {
  element: HTMLElement;
  data: number;
  direction: "up" | "down";
  entry?: IntersectionObserverEntry;
}

const steps = [
  {
    id: 1,
    chartTitle: "More women are killed on weekdays",
    content:
      "Contrary to assumptions about weekend violence, <strong>636 femicide deaths</strong> occurred on weekdays versus 325 on weekends between 2005 and 2025. The daily grind of domestic life — not late-night chaos — is where danger concentrates.",
  },
  {
    id: 4,
    chartTitle: "The start of the month is deadliest",
    content:
      "<strong>331 deaths</strong> occurred in the first ten days of the month. Financial pressure at the start of the month — salary disputes, rent stress — may heighten the risk of fatal violence at home.",
  },
  {
    id: 2,
    chartTitle: "January and July are peak months",
    content:
      "Deaths spike in <strong>January (104)</strong> and <strong>July (92)</strong> — months that follow major holidays and school-term transitions. Disruption and economic strain appear to correlate with elevated femicide risk.",
  },
  {
    id: 3,
    chartTitle: "The weekend surge is real — on Sundays",
    content:
      "<strong>Sunday records the highest single-day toll (168)</strong>, followed by Saturday (157) and Monday (155). Violence builds across the weekend and spills into the working week.",
  },
  {
    id: 5,
    chartTitle: "The full picture",
    content:
      "Taken together, these patterns reveal that femicide in Kenya is not random. It follows the rhythms of domestic life — weekday mornings, month-start pressures, holiday tension. Understanding when killings happen is the first step to intervening before they do.",
  },
];

export default function TemporalScrolly() {
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const onStepEnter = ({ data }: ScrollamaResponse) => {
    setCurrentStep(data);
  };

  const onStepExit = ({ data, direction }: ScrollamaResponse) => {
    if (direction === "up" && data === steps[0].id) {
      setCurrentStep(null);
    }
  };

  const isIntro = currentStep === null;
  const isGrid = currentStep === 5;

  // Steps 1-4: left-half sticky. Intro + grid step 5: full-width sticky.
  const stickyFullWidth = isIntro || isGrid;

  return (
    <div className='relative'>
      {/* ── Sticky chart panel ── */}
      <div
        className={`sticky top-0 h-screen -z-10 overflow-hidden w-full transition-all duration-700 ease-in-out ${
          stickyFullWidth ? "md:w-full" : "md:w-1/2"
        }`}
      >
        <div className='absolute inset-0 flex items-center justify-center p-4 md:p-8'>
          <TemporalCharts step={currentStep} />
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
          {steps.map((step, i) => {
            const isLast = step.id === 5;
            const isCurrent = currentStep === step.id;

            const textPanel = (
              <div
                style={{ opacity: isCurrent ? 1 : 0.45 }}
                className='w-full md:w-1/2 md:bg-white/95 bg-white shadow-md flex flex-col gap-4 items-start justify-center p-6 transition-opacity duration-700'
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
            );

            return (
              <Step data={step.id} key={step.id}>
                {isLast ? (
                  /*
                   * Step 5 — grid fills the full sticky area.
                   * `mt-[100vh]` pushes this Step element's top below one full
                   * viewport height so Scrollama fires only after the user has
                   * seen the complete grid. The text panel then appears at the
                   * bottom, never overlapping the charts.
                   */
                  <div className='mt-[100vh] mb-[60vh] flex justify-center px-4'>
                    {textPanel}
                  </div>
                ) : (
                  /*
                   * Steps 1–4 — right-side text panel.
                   * When fullWidth (intro), translate left 50% to keep it centred.
                   * When split, sit naturally in the right half.
                   */
                  <div className='flex mb-[70vh] md:my-[60vh]'>
                    <div
                      style={{ opacity: isCurrent ? 1 : 0.45 }}
                      className={`
                        w-full md:w-1/2 md:ml-auto md:bg-white/95 bg-white shadow-md
                        flex flex-col gap-4 items-start justify-center p-6
                        transition-all duration-700 ease-in-out
                        ${stickyFullWidth ? "md:-translate-x-1/2" : "md:translate-x-0"}
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
                )}
              </Step>
            );
          })}
        </Scrollama>

        <div className='h-[80vh]' />
      </div>
    </div>
  );
}
