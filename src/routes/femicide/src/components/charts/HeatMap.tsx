import { useEffect, useRef } from "react";
import * as d3 from "d3";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeatmapChartProps {
  /**
   * null  → full heatmap, no highlight
   * 1     → highlight weekends (Sat + Sun columns)
   * 2     → highlight Monday column
   * 3     → highlight January + July rows
   * 4     → highlight all (summary / "identify windows")
   */
  step: number | null;
}

// ─── Data (Month × Day counts from screenshot) ────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// [month][day] — exactly as read from the heatmap image
const RAW: number[][] = [
  [15, 9, 15, 18, 9, 22, 16], // January
  [14, 7, 7, 5, 6, 11, 18], // February
  [7, 11, 10, 9, 12, 17, 19], // March
  [22, 7, 13, 10, 8, 13, 11], // April
  [16, 11, 8, 9, 5, 9, 6], // May
  [8, 7, 10, 13, 10, 13, 13], // June
  [19, 10, 10, 10, 17, 9, 17], // July
  [14, 5, 9, 9, 2, 14, 15], // August
  [9, 13, 11, 10, 8, 9, 14], // September
  [13, 8, 12, 7, 10, 16, 15], // October
  [8, 14, 12, 12, 15, 10, 11], // November
  [10, 14, 10, 10, 14, 14, 13], // December
];

// Flatten into {month, day, value} records
const data = MONTHS.flatMap((month, mi) =>
  DAYS.map((day, di) => ({ month, day, value: RAW[mi][di] })),
);

// ─── Palette ──────────────────────────────────────────────────────────────────

const CRIMSON = "#8B1A1A";
const IVORY = "#F5F0E8";
const MUTED = "#9C8B7A";
const UMBER = "#6B4C2A";

// Active heat scale: ivory → deep crimson
const colorScale = d3
  .scaleSequential()
  .domain([d3.min(data, (d) => d.value)!, d3.max(data, (d) => d.value)!])
  .interpolator(d3.interpolateRgb("#F5F0E8", "#5C1010"));

// Dimmed (greyed out) heat scale
const dimScale = d3
  .scaleSequential()
  .domain([d3.min(data, (d) => d.value)!, d3.max(data, (d) => d.value)!])
  .interpolator(d3.interpolateRgb("#EDE8DF", "#C4C0B8"));

// ─── Highlight logic ──────────────────────────────────────────────────────────

function isHighlighted(
  month: string,
  day: string,
  step: number | null,
): boolean {
  if (step === null || step === 4) return true;
  if (step === 1) return day === "Saturday" || day === "Sunday";
  if (step === 2) return day === "Monday";
  if (step === 3) return month === "January" || month === "July";
  return true;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeatmapChart({ step }: HeatmapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const W = 780,
      H = 620;
    const m = { top: 32, right: 110, bottom: 56, left: 86 };
    const iw = W - m.left - m.right;
    const ih = H - m.top - m.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    const xS = d3.scaleBand().domain(DAYS).range([0, iw]).padding(0.06);
    const yS = d3.scaleBand().domain(MONTHS).range([0, ih]).padding(0.06);

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(xS).tickSize(0))
      .call((ax) => {
        ax.select(".domain").remove();
        ax.selectAll(".tick text")
          .attr("fill", MUTED)
          .attr("font-size", 10)
          .attr("font-family", "'Source Sans 3', sans-serif")
          .attr("dy", "1.4em");
      });

    // X axis label
    g.append("text")
      .attr("x", iw / 2)
      .attr("y", ih + 46)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", MUTED)
      .attr("font-family", "'Source Sans 3', sans-serif")
      .text("Day of the week");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yS).tickSize(0))
      .call((ax) => {
        ax.select(".domain").remove();
        ax.selectAll(".tick text")
          .attr("fill", MUTED)
          .attr("font-size", 10)
          .attr("font-family", "'Source Sans 3', sans-serif")
          .attr("dx", "-6");
      });

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -ih / 2)
      .attr("y", -72)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", MUTED)
      .attr("font-family", "'Source Sans 3', sans-serif")
      .text("Month");

    // Cells
    const cells = g
      .selectAll(".cell")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "cell");

    cells
      .append("rect")
      .attr("x", (d) => xS(d.day)!)
      .attr("y", (d) => yS(d.month)!)
      .attr("width", xS.bandwidth())
      .attr("height", yS.bandwidth())
      .attr("rx", 3)
      .attr("fill", (d) =>
        isHighlighted(d.month, d.day, step)
          ? colorScale(d.value)
          : dimScale(d.value),
      )
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay((_, i) => i * 4)
      .attr("opacity", 1);

    cells
      .append("text")
      .attr("x", (d) => xS(d.day)! + xS.bandwidth() / 2)
      .attr("y", (d) => yS(d.month)! + yS.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .attr("font-family", "'Source Sans 3', sans-serif")
      .attr("fill", (d) => {
        if (!isHighlighted(d.month, d.day, step)) return "#A09890";
        // Dark text on light cells, light on dark
        return d.value > 14 ? "#F5F0E8" : UMBER;
      })
      .attr("pointer-events", "none")
      .attr("opacity", 0)
      .text((d) => d.value)
      .transition()
      .delay(300)
      .duration(400)
      .attr("opacity", 1);

    // ── Column / row highlight outlines ────────────────────────────────────────

    if (step === 1) {
      // Weekend column brackets
      ["Saturday", "Sunday"].forEach((day) => {
        g.append("rect")
          .attr("x", xS(day)! - 2)
          .attr("y", -4)
          .attr("width", xS.bandwidth() + 4)
          .attr("height", ih + 8)
          .attr("fill", "none")
          .attr("stroke", CRIMSON)
          .attr("stroke-width", 1.5)
          .attr("rx", 4)
          .attr("opacity", 0)
          .transition()
          .delay(600)
          .duration(300)
          .attr("opacity", 1);
      });
    }

    if (step === 2) {
      g.append("rect")
        .attr("x", xS("Monday")! - 2)
        .attr("y", -4)
        .attr("width", xS.bandwidth() + 4)
        .attr("height", ih + 8)
        .attr("fill", "none")
        .attr("stroke", CRIMSON)
        .attr("stroke-width", 1.5)
        .attr("rx", 4)
        .attr("opacity", 0)
        .transition()
        .delay(600)
        .duration(300)
        .attr("opacity", 1);
    }

    if (step === 3) {
      ["January", "July"].forEach((month) => {
        g.append("rect")
          .attr("x", -4)
          .attr("y", yS(month)! - 2)
          .attr("width", iw + 8)
          .attr("height", yS.bandwidth() + 4)
          .attr("fill", "none")
          .attr("stroke", CRIMSON)
          .attr("stroke-width", 1.5)
          .attr("rx", 4)
          .attr("opacity", 0)
          .transition()
          .delay(600)
          .duration(300)
          .attr("opacity", 1);
      });
    }

    // ── Legend (vertical) ──────────────────────────────────────────────────────

    const legendH = ih * 0.7;
    const legendX = iw + 20;
    const legendY = ih * 0.15;
    const steps_n = 8;

    const legendScale = d3
      .scaleLinear()
      .domain([d3.max(data, (d) => d.value)!, d3.min(data, (d) => d.value)!])
      .range([0, legendH]);

    const legendAxis = d3.axisRight(legendScale).ticks(5).tickSize(4);

    // Gradient rects
    for (let i = 0; i < steps_n; i++) {
      const t = i / (steps_n - 1);
      const val =
        d3.min(data, (d) => d.value)! +
        t * (d3.max(data, (d) => d.value)! - d3.min(data, (d) => d.value)!);
      g.append("rect")
        .attr("x", legendX)
        .attr("y", legendY + (1 - t) * legendH - legendH / steps_n)
        .attr("width", 14)
        .attr("height", legendH / steps_n + 1)
        .attr("fill", colorScale(val));
    }

    g.append("g")
      .attr("transform", `translate(${legendX + 14}, ${legendY})`)
      .call(legendAxis)
      .call((ax) => {
        ax.select(".domain").remove();
        ax.selectAll(".tick line").attr("stroke", MUTED);
        ax.selectAll(".tick text")
          .attr("fill", MUTED)
          .attr("font-size", 9)
          .attr("font-family", "'Source Sans 3', sans-serif");
      });
  }, [step]);

  return (
    <div
      style={{
        background: IVORY,
        borderRadius: 8,
        padding: "20px 16px 12px",
        width: "100%",
        maxWidth: 840,
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: CRIMSON,
          margin: "0 0 2px",
          fontFamily: "'Source Sans 3', sans-serif",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Month vs Day Heatmap · 2005–2025
      </p>
      <svg
        ref={svgRef}
        viewBox='0 0 580 420'
        width='100%'
        style={{ display: "block" }}
        role='img'
        aria-label='Heatmap of femicide deaths by month and day of week, 2005 to 2025'
      />
      <p
        style={{
          fontSize: 11,
          color: MUTED,
          margin: "8px 0 0",
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        Source: Femicide Count Kenya, 2005–2025 · 979 documented cases
      </p>
    </div>
  );
}
