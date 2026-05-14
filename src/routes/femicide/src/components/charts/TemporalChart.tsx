import { useEffect, useRef } from "react";
import * as d3 from "d3";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemporalChartsProps {
  /**
   * 1 → Weekday vs Weekend (full)
   * 2 → Months of year (full)
   * 3 → Days of week (full)
   * 4 → Month period (full)
   * 5 → all four in 2×2 grid
   * null → intro / all dimmed
   */
  step: number | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const WEEKDAY_DATA = [
  { label: "Weekday", value: 636 },
  { label: "Weekend", value: 325 },
];
const MONTH_DATA = [
  { label: "Jan", value: 104 },
  { label: "Feb", value: 68 },
  { label: "Mar", value: 85 },
  { label: "Apr", value: 84 },
  { label: "May", value: 64 },
  { label: "Jun", value: 74 },
  { label: "Jul", value: 92 },
  { label: "Aug", value: 68 },
  { label: "Sep", value: 74 },
  { label: "Oct", value: 81 },
  { label: "Nov", value: 82 },
  { label: "Dec", value: 85 },
];
const DAY_DATA = [
  { label: "Mon", value: 155 },
  { label: "Tue", value: 116 },
  { label: "Wed", value: 127 },
  { label: "Thu", value: 122 },
  { label: "Fri", value: 116 },
  { label: "Sat", value: 157 },
  { label: "Sun", value: 168 },
];
const MONTH_PART_DATA = [
  { label: "Start", value: 331 },
  { label: "Mid", value: 326 },
  { label: "End", value: 304 },
];

// ─── Palette ──────────────────────────────────────────────────────────────────

const CRIMSON = "#8B1A1A";
const UMBER = "#6B4C2A";
const SAND = "#C4A882";
const IVORY = "#F5F0E8";
const MUTED = "#9C8B7A";

const ACCENTS: Record<number, (i: number, n: number) => string> = {
  1: (i) => (i === 0 ? UMBER : CRIMSON),
  2: (i, n) => d3.interpolateRgb("#3B2A1A", SAND)(i / (n - 1)),
  3: (i, n) => d3.interpolateRgb("#3B2A1A", SAND)(i / (n - 1)),
  4: (i, n) => d3.interpolateRgb(UMBER, SAND)(i / (n - 1)),
};

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawVBar(
  svgEl: SVGSVGElement,
  data: { label: string; value: number }[],
  chartId: number,
  large: boolean,
) {
  const totalW = large ? 600 : 300;
  const totalH = large ? 340 : 220;
  const m = large
    ? { top: 36, right: 24, bottom: 52, left: 56 }
    : { top: 28, right: 14, bottom: 42, left: 40 };
  const iw = totalW - m.left - m.right;
  const ih = totalH - m.top - m.bottom;
  const fs = large ? 12 : 9;
  const fsBold = large ? 12 : 9;

  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${totalW} ${totalH}`);

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  const xS = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, iw])
    .padding(0.3);
  const yS = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)! * 1.18])
    .range([ih, 0]);

  g.append("g")
    .call(
      d3
        .axisLeft(yS)
        .ticks(5)
        .tickSize(-iw)
        .tickFormat(() => ""),
    )
    .call((ax) => {
      ax.select(".domain").remove();
      ax.selectAll(".tick line")
        .attr("stroke", "#E0D8CC")
        .attr("stroke-dasharray", "2,3");
    });

  g.append("g")
    .call(
      d3
        .axisLeft(yS)
        .ticks(5)
        .tickSize(0)
        .tickFormat((v) => String(v)),
    )
    .call((ax) => {
      ax.select(".domain").remove();
      ax.selectAll(".tick text")
        .attr("fill", MUTED)
        .attr("font-size", fs)
        .attr("font-family", "'Source Sans 3', sans-serif");
    });

  g.append("g")
    .attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(xS).tickSize(0))
    .call((ax) => {
      ax.select(".domain").attr("stroke", "#D4C8B8");
      ax.selectAll(".tick text")
        .attr("fill", MUTED)
        .attr("font-size", fs)
        .attr("font-family", "'Source Sans 3', sans-serif")
        .attr("dy", "1.2em");
    });

  const n = data.length;
  const accent = ACCENTS[chartId];

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("rx", 2)
    .attr("x", (d) => xS(d.label)!)
    .attr("width", xS.bandwidth())
    .attr("fill", (_, i) => accent(i, n))
    .attr("y", ih)
    .attr("height", 0)
    .transition()
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("y", (d) => yS(d.value))
    .attr("height", (d) => ih - yS(d.value));

  g.selectAll(".lbl")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d) => xS(d.label)! + xS.bandwidth() / 2)
    .attr("y", (d) => yS(d.value) - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", fsBold)
    .attr("font-weight", 600)
    .attr("font-family", "'Source Sans 3', sans-serif")
    .attr("fill", UMBER)
    .attr("opacity", 0)
    .text((d) => d.value)
    .transition()
    .delay(550)
    .duration(250)
    .attr("opacity", 1);
}

function drawHBar(
  svgEl: SVGSVGElement,
  data: { label: string; value: number }[],
  large: boolean,
) {
  const totalW = large ? 600 : 300;
  const totalH = large ? 340 : 220;
  const m = large
    ? { top: 24, right: 64, bottom: 44, left: 60 }
    : { top: 20, right: 48, bottom: 28, left: 44 };
  const iw = totalW - m.left - m.right;
  const ih = totalH - m.top - m.bottom;
  const fs = large ? 12 : 9;

  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${totalW} ${totalH}`);

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  const yS = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, ih])
    .padding(0.3);
  const xS = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)! * 1.15])
    .range([0, iw]);

  g.append("g")
    .attr("transform", `translate(0,${ih})`)
    .call(
      d3
        .axisBottom(xS)
        .ticks(4)
        .tickSize(-ih)
        .tickFormat(() => ""),
    )
    .call((ax) => {
      ax.select(".domain").remove();
      ax.selectAll(".tick line")
        .attr("stroke", "#E0D8CC")
        .attr("stroke-dasharray", "2,3");
    });

  g.append("g")
    .attr("transform", `translate(0,${ih})`)
    .call(
      d3
        .axisBottom(xS)
        .ticks(4)
        .tickSize(0)
        .tickFormat((v) => String(v)),
    )
    .call((ax) => {
      ax.select(".domain").attr("stroke", "#D4C8B8");
      ax.selectAll(".tick text")
        .attr("fill", MUTED)
        .attr("font-size", fs)
        .attr("font-family", "'Source Sans 3', sans-serif");
    });

  g.append("g")
    .call(d3.axisLeft(yS).tickSize(0))
    .call((ax) => {
      ax.select(".domain").remove();
      ax.selectAll(".tick text")
        .attr("fill", MUTED)
        .attr("font-size", fs + 1)
        .attr("font-family", "'Source Sans 3', sans-serif")
        .attr("dx", "-4");
    });

  const n = data.length;
  const accent = ACCENTS[4];

  g.selectAll(".hbar")
    .data(data)
    .enter()
    .append("rect")
    .attr("rx", 2)
    .attr("y", (d) => yS(d.label)!)
    .attr("height", yS.bandwidth())
    .attr("fill", (_, i) => accent(i, n))
    .attr("x", 0)
    .attr("width", 0)
    .transition()
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("width", (d) => xS(d.value));

  g.selectAll(".hlbl")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d) => xS(d.value) + 6)
    .attr("y", (d) => yS(d.label)! + yS.bandwidth() / 2 + 4)
    .attr("font-size", fs)
    .attr("font-weight", 600)
    .attr("font-family", "'Source Sans 3', sans-serif")
    .attr("fill", UMBER)
    .attr("opacity", 0)
    .text((d) => d.value)
    .transition()
    .delay(550)
    .duration(250)
    .attr("opacity", 1);
}

// ─── Chart config ─────────────────────────────────────────────────────────────

const CHARTS = [
  {
    id: 1,
    title: "Deaths: Weekday vs Weekend",
    data: WEEKDAY_DATA,
    type: "v" as const,
  },
  {
    id: 2,
    title: "Deaths across months (2005–2025)",
    data: MONTH_DATA,
    type: "v" as const,
  },
  {
    id: 3,
    title: "Deaths across days of the week",
    data: DAY_DATA,
    type: "v" as const,
  },
  {
    id: 4,
    title: "Deaths by month period",
    data: MONTH_PART_DATA,
    type: "h" as const,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TemporalCharts({ step }: TemporalChartsProps) {
  const refs = [
    useRef<SVGSVGElement>(null),
    useRef<SVGSVGElement>(null),
    useRef<SVGSVGElement>(null),
    useRef<SVGSVGElement>(null),
  ];

  const isGrid = step === 5;

  // Redraw each chart whenever step changes
  useEffect(() => {
    CHARTS.forEach((chart, idx) => {
      const el = refs[idx].current;
      if (!el) return;
      // In grid mode (step 5) render all small; otherwise render large only the active one
      const large = isGrid ? false : step === chart.id;
      if (chart.type === "v") {
        drawVBar(el, chart.data, chart.id, large);
      } else {
        drawHBar(el, chart.data, large);
      }
    });
  }, [step]);

  // ── Grid mode: 2×2 ────────────────────────────────────────────────────────
  if (isGrid) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: 16,
          background: "#EDE8DF",
          borderRadius: 8,
          width: "100%",
          maxWidth: 680,
          transition: "all 0.6s ease",
        }}
      >
        {CHARTS.map((chart, idx) => (
          <div
            key={chart.id}
            style={{
              background: IVORY,
              borderRadius: 6,
              padding: "12px 10px 8px",
              border: `1px solid ${SAND}`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: MUTED,
                margin: "0 0 4px",
                fontFamily: "'Source Sans 3', sans-serif",
                letterSpacing: "0.01em",
              }}
            >
              {chart.title}
            </p>
            <svg
              ref={refs[idx] as React.RefObject<SVGSVGElement>}
              viewBox='0 0 300 220'
              width='100%'
              style={{ display: "block" }}
              role='img'
              aria-label={chart.title}
            />
          </div>
        ))}
      </div>
    );
  }

  // ── Focused mode: one chart fills the container ────────────────────────────
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 680,
        padding: "16px 8px",
        transition: "all 0.5s ease",
      }}
    >
      {CHARTS.map((chart, idx) => {
        const isActive = step === chart.id;
        return (
          <div
            key={chart.id}
            style={{
              display: isActive ? "block" : "none",
              background: IVORY,
              borderRadius: 8,
              padding: "20px 16px 14px",
              border: `1.5px solid ${isActive ? CRIMSON : "transparent"}`,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: CRIMSON,
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: CRIMSON,
                  margin: 0,
                  fontFamily: "'Source Sans 3', sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                {chart.title}
              </p>
            </div>

            <svg
              ref={refs[idx] as React.RefObject<SVGSVGElement>}
              viewBox='0 0 600 340'
              width='100%'
              style={{ display: "block" }}
              role='img'
              aria-label={chart.title}
            />
          </div>
        );
      })}

      {/* No step yet — placeholder */}
      {step === null && (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <p>
            Are there patterns to when women{" "}
            <span className='text-primary-red'>die?</span> <br />
            <br /> Scroll to explore temporal patterns
          </p>
        </div>
      )}
    </div>
  );
}
