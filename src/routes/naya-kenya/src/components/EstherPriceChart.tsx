const BEFORE = 70;
const AFTER = 100;
const CHANGE_PCT = Math.round(((AFTER - BEFORE) / BEFORE) * 100);
const SALARY_SHARE_PCT = 8;

const CHART_H = 150;
const BAR_W = 64;
const MAX_VALUE = 120;
const PAD_TOP = 30;
const PAD_BOTTOM = 28;

function barHeight(value: number) {
  return (value / MAX_VALUE) * CHART_H;
}

export default function EstherPriceChart() {
  const beforeH = barHeight(BEFORE);
  const afterH = barHeight(AFTER);
  const baseline = PAD_TOP + CHART_H;

  return (
    <div className='font-serif max-w-xl mx-auto flex flex-col gap-4 mt-6'>
      <p className='text-sm font-semibold uppercase tracking-wide text-body-gray text-center mb-2'>
        Price per pad pack
      </p>

      <svg
        viewBox={`0 0 240 ${PAD_TOP + CHART_H + PAD_BOTTOM}`}
        className='w-full h-auto'
        role='img'
        aria-label={`Price per pack rose from KES ${BEFORE} to KES ${AFTER}, a ${CHANGE_PCT}% increase`}
      >
        {/* baseline */}
        <line
          x1='0'
          y1={baseline + 0.5}
          x2='240'
          y2={baseline + 0.5}
          stroke='var(--color-cream-border)'
          strokeWidth='1'
        />

        {/* before bar */}
        <rect
          x='48'
          y={baseline - beforeH}
          width={BAR_W}
          height={beforeH}
          rx='4'
          fill='var(--color-meta-gray)'
        />
        <text
          x={48 + BAR_W / 2}
          y={baseline - beforeH - 8}
          textAnchor='middle'
          className='fill-ink text-[13px] font-semibold'
        >
          KES {BEFORE}
        </text>
        <text
          x={48 + BAR_W / 2}
          y={baseline + 20}
          textAnchor='middle'
          className='fill-body-gray text-[11px] uppercase tracking-wide'
        >
          Before
        </text>

        {/* after bar */}
        <rect
          x='128'
          y={baseline - afterH}
          width={BAR_W}
          height={afterH}
          rx='4'
          fill='var(--color-magenta)'
        />
        <text
          x={128 + BAR_W / 2}
          y={baseline - afterH - 8}
          textAnchor='middle'
          className='fill-ink text-[13px] font-semibold'
        >
          KES {AFTER}
        </text>
        <text
          x={128 + BAR_W / 2}
          y={baseline + 20}
          textAnchor='middle'
          className='fill-body-gray text-[11px] uppercase tracking-wide'
        >
          After
        </text>

        {/* change callout */}
        <text
          x='120'
          y='16'
          textAnchor='middle'
          className='fill-magenta text-[15px] font-bold'
        >
          +{CHANGE_PCT}%
        </text>
      </svg>

      {/* <div className='mt-6'>
        <p className='text-sm font-semibold uppercase tracking-wide text-body-gray mb-2'>
          Share of Esther&rsquo;s monthly salary
        </p>
        <svg
          viewBox='0 0 240 24'
          className='w-full h-auto'
          role='img'
          aria-label={`Pads now take up ${SALARY_SHARE_PCT}% of Esther's monthly salary`}
        >
          <rect
            x='0'
            y='0'
            width='240'
            height='16'
            rx='4'
            fill='var(--color-cream)'
            stroke='var(--color-cream-border)'
          />
          <rect
            x='0'
            y='0'
            width={(SALARY_SHARE_PCT / 100) * 240}
            height='16'
            rx='4'
            fill='var(--color-magenta)'
          />
          <text
            x={(SALARY_SHARE_PCT / 100) * 240 + 8}
            y='12'
            className='fill-ink text-[12px] font-semibold'
          >
            {SALARY_SHARE_PCT}%
          </text>
        </svg>
      </div> */}
    </div>
  );
}
