import React, { useEffect } from "react";
import * as d3 from "d3";

interface IPieChartProps {
  step: number | null;
}
const perpetratorColors = {
  "Intimate Partner": "#8b1a1a", // deep crimson
  Partner: "#b5451b", // burnt orange-red
  "Known Associate": "#5c4033", // dark espresso brown
  Stranger: "#a0845c", // warm tan
  "Other/Unknown": "#d9cfc4", // lightest warm gray
};
export default function PieChart(props: IPieChartProps) {
  const stepHightlightOpacity = (
    step: number | null,
    d: d3.PieArcDatum<{
      name: string;
      value: number;
    }>,
  ) => {
    if (step === 1) return 1;
    if (step === 2) {
      if (d?.data?.name === "Intimate Partner" || d?.data?.name === "Partner")
        return 1;
      return 0;
    }
    return 1;
  };
  const { step } = props;
  const [data] = React.useState<{ name: string; value: number }[]>([
    { name: "Stranger", value: 25 },
    { name: "intimate Partner", value: 65 },
    { name: "Family", value: 0.4 },
    { name: "Known Associate", value: 6.2 },
    { name: "Other/Unknown", value: 3.6 },
  ]);

  useEffect(() => {
    if (data.length === 0) return;
    const padding = 25;
    const width = 500;
    const height = 500;
    const legendWidth = 150;
    const outerR = Math.min(width, height) / 2 - 1;

    const color = d3
      .scaleOrdinal()
      .domain(Object.keys(perpetratorColors))
      .range(Object.values(perpetratorColors));
    // Select or create SVG (don't clear it completely to enable transitions)
    let svg = d3.select("#pie-chart").select("svg") as d3.Selection<
      SVGSVGElement,
      unknown,
      HTMLElement,
      any
    >;
    if (svg.empty()) {
      svg = d3
        .select("#pie-chart")
        .append("svg")
        .attr("width", width + legendWidth + padding)
        .attr("height", height + padding * 2)
        .attr("viewBox", [
          -width / 2 - padding,
          -height / 2 - padding,
          width + legendWidth + padding,
          height + padding * 2,
        ])
        .attr(
          "style",
          "max-width: 100%; height: auto; font: 14px sans-serif;",
        ) as d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    }

    const pie = d3
      .pie<{ name: string; value: number }>()
      .sort((a, b) => b.value - a.value)
      .value((d) => d.value);

    const arcNormal = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(100)

      .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = (Math.min(width, height) / 2 - 1) * 0.8;

    // A separate arc generator for labels.
    const arcLabel = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius);

    const pieData = pie(data);

    const arcs = svg
      .selectAll("g.arc")
      .data(pieData, (d: any) => d.data.name)
      .join("g")
      .attr("class", "arc");

    arcs
      .selectAll("path")
      .data((d) => [d])
      .join("path")
      .attr("d", arcNormal)
      .attr("fill", (d) => color(d.data.name) as string)
      .attr("stroke", "#f5f0e8")
      .attr("stroke-width", 2)
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .attrTween("d", function (d) {
        const highlighted = step === 1 || d.data.name === "Intimate Partner";
        const targetR = highlighted ? outerR + 22 : outerR;
        const startR: number = (this as any)._outerR ?? outerR;
        (this as any)._outerR = targetR;
        return (t: number) =>
          d3
            .arc<d3.PieArcDatum<{ name: string; value: number }>>()
            .innerRadius(70)
            .outerRadius(startR + (targetR - startR) * t)(d)!;
      })
      .attr("opacity", (d) => {
        const highlighted = step === 1 || d.data.name === "Intimate Partner";
        return highlighted ? 1 : 0.35;
      });

    arcs
      .selectAll("title")
      .data((d) => [d])
      .join("title")
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}%`);

    const textGroup = svg
      .selectAll("g.text-group")
      .data([null])
      .join("g")
      .attr("class", "text-group")
      .attr("text-anchor", "middle");

    textGroup
      .selectAll("text")
      .data(pieData, (d: any) => d.data.name)
      .join("text")
      .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
      .call((text) =>
        text
          .selectAll("tspan.name")
          .data((d) => [d])
          .join("tspan")
          .attr("class", "name")
          .attr("y", "-0.4em")
          .attr("font-weight", "bold")
          .attr("fill", "white")

          .transition()
          .duration(500)
          .attr("opacity", (d) => stepHightlightOpacity(step, d))
          .text((d) => d.data.name),
      )
      .call((text) =>
        text
          .filter((d) => d.endAngle - d.startAngle > 0.25)
          .selectAll("tspan.value")
          .data((d) => [d])
          .join("tspan")
          .attr("class", "value")
          .attr("x", 0)
          .attr("y", "0.7em")
          .attr("fill", "white")
          .attr("font-weight", "bold")

          .transition()
          .duration(500)
          .attr("opacity", (d) => {
            return stepHightlightOpacity(step, d);
          })
          .text((d) => `${d.data.value.toLocaleString("en-US")}%`),
      );

    // Center label inside the donut
    const centerGroup = svg
      .selectAll("g.center-label")
      .data([null])
      .join("g")
      .attr("class", "center-label")
      .attr("text-anchor", "middle");

    centerGroup
      .selectAll("text.center-count")
      .data([null])
      .join("text")
      .attr("class", "center-count")
      .attr("dy", "-0.2em")
      .attr("font-size", "28px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .text("797");

    centerGroup
      .selectAll("text.center-label-text")
      .data([null])
      .join("text")
      .attr("class", "center-label-text")
      .attr("dy", "1.2em")
      .attr("font-size", "13px")
      .attr("fill", "#8b1a1a")
      .attr("font-weight", "bold")
      .text("Deaths");

    // Add legend
    const legend = svg
      .selectAll("g.legend")
      .data([null])
      .join("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width / 2 + 20}, ${-height / 2})`);

    const legendItems = legend
      .selectAll("g.legend-item")
      .data(data)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (_d, i) => `translate(0, ${i * 30})`);

    legendItems
      .selectAll("rect")
      .data((d) => [d])
      .join("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d) => color(d.name) as string)
      .transition()
      .duration(500)
      .attr("opacity", (d) => {
        if (step === 2) return 1;
        if (step === 3) {
          if (d.name === "Husband" || d.name === "Intimate Partner") return 1;
          return 1;
        }
        return 1;
      });

    legendItems
      .selectAll("text")
      .data((d) => [d])
      .join("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .transition()
      .duration(500)
      .attr("opacity", (d) => {
        if (step === 2) return 1;
        if (step === 3) {
          if (d.name === "Husband" || d.name === "Intimate Partner") return 1;
          return 1;
        }
        return 1;
      })
      .text((d) => `${d.name} (${d.value}%)`);
  }, [data, step]);
  return <div id='pie-chart'></div>;
}
