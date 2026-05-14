import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgeGroupDatum {
  group: string;
  deaths: number;
}

interface PerpetratorDatum {
  group: string;
  family: number;
  intimatePartner: number;
  knownAssociate: number;
  otherUnknown: number;
  stranger: number;
}

export interface FemicideAgeChartProps {
  /**
   * 1 → deaths by age group (bar chart)
   * 2 → perpetrators by age group (stacked bar)
   *
   * Controlled externally — driven by your scrollytelling step.
   */
  step: number | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGE_DATA: AgeGroupDatum[] = [
  { group: "Under 15", deaths: 21 },
  { group: "15–29", deaths: 225 },
  { group: "30–59", deaths: 177 },
  { group: "60+", deaths: 43 },
  { group: "Not Available", deaths: 513 },
];

const PERP_DATA: PerpetratorDatum[] = [
  {
    group: "Under 15",
    family: 0,
    intimatePartner: 19.0,
    knownAssociate: 14.3,
    otherUnknown: 4.8,
    stranger: 61.9,
  },
  {
    group: "15–29",
    family: 1.2,
    intimatePartner: 68.0,
    knownAssociate: 5.8,
    otherUnknown: 0.0,
    stranger: 24.9,
  },
  {
    group: "30–59",
    family: 0,
    intimatePartner: 75.7,
    knownAssociate: 7.5,
    otherUnknown: 0.9,
    stranger: 15.8,
  },
  {
    group: "60+",
    family: 7.0,
    intimatePartner: 20.9,
    knownAssociate: 4.2,
    otherUnknown: 1.0,
    stranger: 67.4,
  },
  {
    group: "Not Available",
    family: 0,
    intimatePartner: 67.6,
    knownAssociate: 1.4,
    otherUnknown: 7.0,
    stranger: 23.6,
  },
];

// ─── Palette ──────────────────────────────────────────────────────────────────

const CRIMSON = "#8B1A1A";
const SAND = "#C4A882";
const UMBER = "#6B4C2A";
const IVORY = "#F5F0E8";
const MUTED = "#9C8B7A";

const STACKED_KEYS = [
  "intimatePartner",
  "stranger",
  "knownAssociate",
  "family",
  "otherUnknown",
] as const;

type StackKey = (typeof STACKED_KEYS)[number];

const PERP_COLORS: Record<StackKey, string> = {
  intimatePartner: CRIMSON,
  stranger: "#4A3728",
  knownAssociate: "#7D5C3A",
  family: "#B8956A",
  otherUnknown: SAND,
};

const PERP_LABELS: Record<StackKey, string> = {
  intimatePartner: "Intimate Partner",
  stranger: "Stranger",
  knownAssociate: "Known Associate",
  family: "Family",
  otherUnknown: "Other / Unknown",
};

// ─── Dimensions ───────────────────────────────────────────────────────────────

const W = 680;
const H = 400;
const MARGIN = { top: 30, right: 24, bottom: 56, left: 56 };
const INNER_W = W - MARGIN.left - MARGIN.right;
const INNER_H = H - MARGIN.top - MARGIN.bottom;

// ─── Shared x-scale (stable reference — domain never changes) ─────────────────

const xScale = d3
  .scaleBand()
  .domain(AGE_DATA.map((d) => d.group))
  .range([0, INNER_W])
  .padding(0.32);

// ─── Component ────────────────────────────────────────────────────────────────

export default function FemicideAgeChart({ step }: FemicideAgeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  // ── Draw helpers ────────────────────────────────────────────────────────────

  const drawXAxis = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ) => {
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${INNER_H})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((ax) => {
        ax.select(".domain").attr("stroke", "#D4C8B8");
        ax.selectAll(".tick text")
          .attr("fill", MUTED)
          .attr("font-size", 11)
          .attr("font-family", "'Source Sans 3', sans-serif")
          .attr("dy", "1.2em");
      });
  };

  const drawDeaths = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ) => {
    const maxDeaths = d3.max(AGE_DATA, (d) => d.deaths)!;
    const yS = d3
      .scaleLinear()
      .domain([0, maxDeaths * 1.1])
      .range([INNER_H, 0]);

    g.append("g")
      .attr("class", "y-axis")
      .call(
        d3
          .axisLeft(yS)
          .ticks(6)
          .tickSize(-INNER_W)
          .tickFormat((v) => String(v)),
      )
      .call((ax) => {
        ax.select(".domain").remove();
        ax.selectAll(".tick line")
          .attr("stroke", "#D4C8B8")
          .attr("stroke-dasharray", "3,3");
        ax.selectAll(".tick text")
          .attr("fill", MUTED)
          .attr("font-size", 11)
          .attr("font-family", "'Source Sans 3', sans-serif");
      });

    g.selectAll<SVGRectElement, AgeGroupDatum>(".bar-death")
      .data(AGE_DATA, (d) => d.group)
      .enter()
      .append("rect")
      .attr("class", "bar-death")
      .attr("x", (d) => xScale(d.group)!)
      .attr("width", xScale.bandwidth())
      .attr("rx", 2)
      .attr("fill", (_, i) => (i === 1 ? CRIMSON : i === 4 ? "#C4C0B8" : UMBER))
      .attr("opacity", (_, i) => (i === 4 ? 0.55 : 1))
      .attr("y", INNER_H)
      .attr("height", 0)
      .on("mousemove", (event, d) => {
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltip({
          x: mx,
          y: my,
          html: `<strong>${d.group}</strong><br/>${d.deaths} deaths`,
        });
      })
      .on("mouseleave", () => setTooltip(null))
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => yS(d.deaths))
      .attr("height", (d) => INNER_H - yS(d.deaths));

    g.selectAll<SVGTextElement, AgeGroupDatum>(".death-label")
      .data(AGE_DATA, (d) => d.group)
      .enter()
      .append("text")
      .attr("class", "death-label")
      .attr("x", (d) => xScale(d.group)! + xScale.bandwidth() / 2)
      .attr("y", (d) => yS(d.deaths) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("font-weight", "600")
      .attr("font-family", "'Source Sans 3', sans-serif")
      .attr("fill", (_, i) => (i === 4 ? MUTED : UMBER))
      .attr("opacity", 0)
      .text((d) => d.deaths)
      .transition()
      .delay(500)
      .duration(300)
      .attr("opacity", 1);
  };

  const drawPerpetrators = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ) => {
    const yS = d3.scaleLinear().domain([0, 100]).range([INNER_H, 0]);

    g.append("g")
      .attr("class", "y-axis")
      .call(
        d3
          .axisLeft(yS)
          .ticks(5)
          .tickSize(-INNER_W)
          .tickFormat((v) => `${v}%`),
      )
      .call((ax) => {
        ax.select(".domain").remove();
        ax.selectAll(".tick line")
          .attr("stroke", "#D4C8B8")
          .attr("stroke-dasharray", "3,3");
        ax.selectAll(".tick text")
          .attr("fill", MUTED)
          .attr("font-size", 11)
          .attr("font-family", "'Source Sans 3', sans-serif");
      });

    const stack = d3
      .stack<PerpetratorDatum, StackKey>()
      .keys([...STACKED_KEYS])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    stack(PERP_DATA).forEach((layer) => {
      const key = layer.key;

      g.append("g")
        .attr("class", "stack-layer")
        .selectAll<SVGRectElement, d3.SeriesPoint<PerpetratorDatum>>("rect")
        .data(layer)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.data.group)!)
        .attr("width", xScale.bandwidth())
        .attr("fill", PERP_COLORS[key])
        .attr("y", INNER_H)
        .attr("height", 0)
        .on("mousemove", (event, d) => {
          const [mx, my] = d3.pointer(event, svgRef.current);
          setTooltip({
            x: mx,
            y: my,
            html: `<strong>${d.data.group}</strong><br/>${PERP_LABELS[key]}: ${(d[1] - d[0]).toFixed(1)}%`,
          });
        })
        .on("mouseleave", () => setTooltip(null))
        .transition()
        .duration(700)
        .delay((_, i) => i * 40)
        .ease(d3.easeCubicOut)
        .attr("y", (d) => yS(d[1]))
        .attr("height", (d) => yS(d[0]) - yS(d[1]));
    });
  };

  // ── Redraw whenever step changes ────────────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    setTooltip(null);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    drawXAxis(g);

    if (step === 1) {
      drawDeaths(g);
    } else {
      drawPerpetrators(g);
    }
  }, [step]);

  // ── Derived UI ──────────────────────────────────────────────────────────────

  const isStep1 = step === 1;

  return (
    <div
      style={{
        fontFamily: "'Source Sans 3', sans-serif",
        background: IVORY,
        borderRadius: 4,
        padding: "28px 32px 24px",
        maxWidth: W,
      }}
    >
      {/* Eyebrow */}
      <span
        style={{
          display: "block",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: MUTED,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        Age Groups · {isStep1 ? "Step 1 of 2" : "Step 2 of 2"}
      </span>

      {/* Heading */}
      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 4px",
          color: "#2C1810",
          lineHeight: 1.3,
        }}
      >
        {isStep1 ? (
          <>
            Which age groups are <span style={{ color: CRIMSON }}>dying?</span>
          </>
        ) : (
          <>
            Who is <span style={{ color: CRIMSON }}>killing</span> them?
          </>
        )}
      </h2>

      <p
        style={{
          fontSize: 13,
          color: MUTED,
          margin: "0 0 20px",
          lineHeight: 1.5,
        }}
      >
        {isStep1
          ? "Documented femicide deaths, 2005–2025. Women aged 15–29 face the highest recorded risk — 513 cases are missing age data entirely."
          : "Relative proportion of perpetrators by victim age group. Women aged 15–59 are disproportionately killed by intimate partners."}
      </p>

      {/* SVG wrapper */}
      <div style={{ position: "relative" }}>
        {/* Rotated Y-axis label */}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: H / 2,
            fontSize: 11,
            color: MUTED,
            transform: "translateY(-50%) rotate(-90deg) translateX(-30px)",
            transformOrigin: "left center",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {isStep1 ? "Number of deaths" : "% of total cases"}
        </span>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ display: "block", maxWidth: "100%" }}
          role='img'
          aria-label={
            isStep1
              ? "Bar chart: femicide deaths by age group, 2005–2025"
              : "Stacked bar chart: perpetrator relationships by victim age group"
          }
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x + 12,
              top: tooltip.y - 12,
              background: "#2C1810",
              color: IVORY,
              borderRadius: 4,
              padding: "6px 10px",
              fontSize: 12,
              lineHeight: 1.5,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
      </div>

      {/* Legend — step 2 only */}
      {!isStep1 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 20px",
            marginTop: 16,
          }}
        >
          {STACKED_KEYS.map((k) => (
            <span
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: UMBER,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: PERP_COLORS[k],
                  flexShrink: 0,
                }}
              />
              {PERP_LABELS[k]}
            </span>
          ))}
        </div>
      )}

      {/* Source */}
      <p style={{ fontSize: 11, color: MUTED, marginTop: 20, marginBottom: 0 }}>
        Source: Femicide Count Kenya, 2005–2025 · 979 documented cases
      </p>
    </div>
  );
}
