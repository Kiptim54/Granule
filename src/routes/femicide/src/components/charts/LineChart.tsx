import { useEffect, useRef } from "react";
import * as d3 from "d3";

const data = [
  { year: 2005, deaths: 1 },
  { year: 2008, deaths: 1 },
  { year: 2009, deaths: 1 },
  { year: 2010, deaths: 6 },
  { year: 2011, deaths: 12 },
  { year: 2012, deaths: 23 },
  { year: 2013, deaths: 15 },
  { year: 2014, deaths: 24 },
  { year: 2015, deaths: 34 },
  { year: 2016, deaths: 42 },
  { year: 2017, deaths: 72 },
  { year: 2018, deaths: 106 },
  { year: 2019, deaths: 89 },
  { year: 2020, deaths: 58 },
  { year: 2021, deaths: 92 },
  { year: 2022, deaths: 75 },
  { year: 2023, deaths: 88 },
  { year: 2024, deaths: 131 },
  { year: 2025, deaths: 91 },
];

const CRIMSON = "#8b1a1a";
const FILL = "rgba(139, 26, 26, 0.10)";
const LABEL = "#8b1a1a";
const AXIS_TEXT = "#7a6a5a";
const BASELINE = "#c4a882";

export default function LineChart() {
  const ref = useRef<HTMLDivElement>(null);
  const linePathRef = useRef<SVGPathElement | null>(null);
  const dotsRef = useRef<SVGCircleElement[]>([]);
  const labelsRef = useRef<SVGTextElement[]>([]);
  const totalLengthRef = useRef<number>(0);
  const xRef = useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear());
  const chartWidthRef = useRef<number>(0);

  // Build chart once on mount
  useEffect(() => {
    if (!ref.current) return;
    d3.select(ref.current).selectAll("*").remove();
    dotsRef.current = [];
    labelsRef.current = [];

    const margin = { top: 40, right: 40, bottom: 56, left: 64 };
    const totalW = ref.current.clientWidth || 700;
    const totalH = 420;
    const width = totalW - margin.left - margin.right;
    const height = totalH - margin.top - margin.bottom;
    chartWidthRef.current = width;

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", totalW)
      .attr("height", totalH)
      .attr("style", "max-width:100%;height:auto;");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([2005, 2025]).range([0, width]);
    xRef.current = x;

    const y = d3.scaleLinear().domain([0, 140]).range([height, 0]);

    // Clip path for area fill — grows left to right with scroll
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "line-clip")
      .append("rect")
      .attr("class", "clip-rect")
      .attr("x", 0)
      .attr("y", -margin.top)
      .attr("width", 0)
      .attr("height", height + margin.top + 10);

    // Baseline
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", height)
      .attr("y2", height)
      .attr("stroke", BASELINE)
      .attr("stroke-width", 1);

    // Area fill
    const area = d3
      .area<{ year: number; deaths: number }>()
      .x((d) => x(d.year))
      .y0(height)
      .y1((d) => y(d.deaths))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", FILL)
      .attr("clip-path", "url(#line-clip)")
      .attr("d", area);

    // Line path
    const line = d3
      .line<{ year: number; deaths: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.deaths))
      .curve(d3.curveMonotoneX);

    const linePath = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", CRIMSON)
      .attr("stroke-width", 2)
      .attr("d", line)
      .node()!;

    linePathRef.current = linePath;

    const totalLength = linePath.getTotalLength();
    totalLengthRef.current = totalLength;

    // Start fully hidden
    d3.select(linePath)
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength);

    // Dots — hidden at start
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.deaths))
      .attr("r", 4)
      .attr("fill", CRIMSON)
      .attr("stroke", "#f5f0e8")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0)
      .each(function () {
        dotsRef.current.push(this as SVGCircleElement);
      });

    // Labels — hidden at start
    g.selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.deaths) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", LABEL)
      .attr("opacity", 0)
      .text((d) => d.deaths)
      .each(function () {
        labelsRef.current.push(this as SVGTextElement);
      });

    // X Axis
    const xTicks = data.map((d) => d.year).filter((_, i) => i % 2 === 0);
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(xTicks)
          .tickFormat((d) => String(d))
          .tickSize(4),
      )
      .call((ax) => ax.select(".domain").remove())
      .selectAll("text")
      .attr("dy", "1.4em")
      .attr("font-size", "11px")
      .attr("fill", AXIS_TEXT);

    g.selectAll(".tick line").attr("stroke", BASELINE);

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(6).tickSize(0))
      .call((ax) => ax.select(".domain").remove())
      .selectAll("text")
      .attr("dx", "-0.6em")
      .attr("font-size", "11px")
      .attr("fill", AXIS_TEXT);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + height / 2))
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", AXIS_TEXT)
      .text("Number of Deaths");

    svg
      .append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", totalH - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", AXIS_TEXT)
      .text("Year");

    // svg
    //   .append("text")
    //   .attr("x", margin.left + width / 2)
    //   .attr("y", 20)
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", "15px")
    //   .attr("font-weight", "700")
    //   .attr("fill", CRIMSON)
    //   .text("Trend of Deaths (2005–2025)");
  }, []);

  // Animate the chart when it enters the viewport
  useEffect(() => {
    if (!ref.current) return;
    const DURATION = 2000;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const totalLength = totalLengthRef.current;
        const width = chartWidthRef.current;
        if (!totalLength) return;

        d3.select(linePathRef.current)
          .transition()
          .duration(DURATION)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);

        d3.select(ref.current)
          .select(".clip-rect")
          .transition()
          .duration(DURATION)
          .ease(d3.easeLinear)
          .attr("width", width);

        dotsRef.current.forEach((el, i) => {
          const delay = ((data[i].year - 2005) / (2025 - 2005)) * DURATION;
          d3.select(el).transition().delay(delay).duration(200).attr("opacity", 1);
        });
        labelsRef.current.forEach((el, i) => {
          const delay = ((data[i].year - 2005) / (2025 - 2005)) * DURATION;
          d3.select(el).transition().delay(delay).duration(200).attr("opacity", 1);
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ width: "100%" }} />;
}
