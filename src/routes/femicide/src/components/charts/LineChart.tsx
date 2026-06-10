import { useEffect, useRef, useState } from "react";
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
const AXIS_TEXT = "#000000";
const BASELINE = "#c4a882";
const FOCUS_YEARS = [2018, 2024];

export default function LineChart({
  stepIndex = 0,
}: {
  stepIndex: number | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const linePathRef = useRef<SVGPathElement | null>(null);
  const dotsRef = useRef<SVGCircleElement[]>([]);
  const labelsRef = useRef<SVGTextElement[]>([]);
  const focusLinesRef = useRef<SVGLineElement[]>([]);
  const totalLengthRef = useRef<number>(0);
  const xRef = useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear());
  const yRef = useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear());
  const chartWidthRef = useRef<number>(0);

  const [introComplete, setIntroComplete] = useState(false);

  // Build chart once on mount
  useEffect(() => {
    if (!ref.current) return;
    d3.select(ref.current).selectAll("*").remove();
    dotsRef.current = [];
    labelsRef.current = [];
    focusLinesRef.current = [];

    // Increased bottom margin slightly to comfortably accommodate angled text strings
    const margin = { top: 40, right: 40, bottom: 64, left: 64 };
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
    yRef.current = y;

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
      .y1((d) => y(d.deaths));
    // .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("class", "area-path")
      .attr("fill", FILL)
      .attr("clip-path", "url(#line-clip)")
      .attr("d", area);

    // Line path
    const line = d3
      .line<{ year: number; deaths: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.deaths));
    // .curve(d3.curveMonotoneX);

    const linePath = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", CRIMSON)
      .attr("stroke-width", 2)
      .attr("clip-path", "url(#line-clip)")
      .attr("d", line)
      .node()!;

    linePathRef.current = linePath;

    const totalLength = linePath.getTotalLength();
    totalLengthRef.current = totalLength;

    d3.select(linePath)
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength);

    // Focus Lines
    g.selectAll("line.focus-line")
      .data(FOCUS_YEARS)
      .join("line")
      .attr("class", "focus-line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", height)
      .attr("y2", (d) => {
        const dPoint = data.find((p) => p.year === d);
        return y(dPoint ? dPoint.deaths : 0);
      })
      .attr("stroke", CRIMSON)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0)
      .each(function () {
        focusLinesRef.current.push(this as SVGLineElement);
      });

    // Dots
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

    // Labels
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

    // Mobile check for initial rendering orientation
    const isMobile = window.innerWidth < 600;
    const xTicks = isMobile
      ? d3.range(2005, 2026).filter((year) => (year - 2005) % 2 === 0)
      : d3.range(2005, 2026);

    const xAxisGroup = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(xTicks)
          .tickFormat((d) => String(d))
          .tickSize(4),
      );

    xAxisGroup.call((ax) => ax.select(".domain").remove());

    // Apply conditional angling on initial render
    const axisLabels = xAxisGroup
      .selectAll<SVGTextElement, unknown>("text")
      .attr("font-size", "11px")
      .attr("fill", AXIS_TEXT);

    if (isMobile) {
      axisLabels
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-0.4em")
        .attr("dy", "0.6em");
    } else {
      axisLabels.attr("dy", "1.4em").style("text-anchor", "middle");
    }

    g.selectAll(".tick line").attr("stroke", BASELINE);

    // Y Axis Setup
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
      .attr("font-size", "14px")
      .attr("fill", AXIS_TEXT)
      .text("Number of Deaths");

    svg
      .append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", totalH - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", AXIS_TEXT)
      .text("Year");

    svg
      .append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("fill", AXIS_TEXT)
      .text("Death Trends (2005-2025)");
  }, []);

  // Intersection Observer Entrance Trigger
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

        focusLinesRef.current.forEach((el, i) => {
          const year = FOCUS_YEARS[i];
          const delay = ((year - 2005) / (2025 - 2005)) * DURATION;
          d3.select(el)
            .transition()
            .delay(delay)
            .duration(200)
            .attr("opacity", 0.8);
        });

        dotsRef.current.forEach((el, i) => {
          const delay = ((data[i].year - 2005) / (2025 - 2005)) * DURATION;
          d3.select(el)
            .transition()
            .delay(delay)
            .duration(200)
            .attr("opacity", 1);
        });

        labelsRef.current.forEach((el, i) => {
          const delay = ((data[i].year - 2005) / (2025 - 2005)) * DURATION;
          d3.select(el)
            .transition()
            .delay(delay)
            .duration(200)
            .attr("opacity", 1);
        });

        setTimeout(() => {
          setIntroComplete(true);
        }, DURATION);
      },
      { threshold: 0.3 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Reactive stepIndex Zoom updates
  useEffect(() => {
    if (!introComplete || !ref.current || !xRef.current || !yRef.current)
      return;

    const isZoomed = stepIndex === 2;
    const targetDomain = isZoomed ? [2017, 2025] : [2005, 2025];
    const height = 420 - 40 - 64;

    const transitionDuration = 1000;
    const t = d3
      .transition()
      .duration(transitionDuration)
      .ease(d3.easeCubicInOut);

    // 1. Morph the X Domain Scale
    xRef.current.domain(targetDomain);

    // 2. Animate Axis Elements with Responsive Modulus logic
    const xAxisGroup = d3.select(ref.current).select<SVGGElement>(".x-axis");
    const isMobile = window.innerWidth < 600;

    let dynamicTicks: number[];
    if (isZoomed) {
      dynamicTicks = d3.range(targetDomain[0], targetDomain[1] + 1);
    } else {
      dynamicTicks = isMobile
        ? d3.range(2005, 2026).filter((year) => (year - 2005) % 2 === 0)
        : d3.range(2005, 2026);
    }

    xAxisGroup
      .transition(t)
      .call(
        d3
          .axisBottom(xRef.current)
          .tickValues(dynamicTicks)
          .tickFormat((d) => String(d))
          .tickSize(4),
      )
      .call((ax) => ax.select(".domain").remove());

    // Smoothly pivot text rotation angle inside the transition block
    xAxisGroup
      .selectAll<SVGTextElement, unknown>("text")
      .transition(t)
      .attr("font-size", "11px")
      .attr("fill", AXIS_TEXT)
      .attr("transform", isMobile && !isZoomed ? "rotate(-45)" : "rotate(0)")
      .style("text-anchor", isMobile && !isZoomed ? "end" : "middle")
      .attr("dx", isMobile && !isZoomed ? "-0.4em" : "0")
      .attr("dy", isMobile && !isZoomed ? "0.6em" : "1.4em");

    xAxisGroup.selectAll(".tick line").attr("stroke", BASELINE);

    // 3. Generators
    const updatedLine = d3
      .line<{ year: number; deaths: number }>()
      .x((d) => xRef.current(d.year))
      .y((d) => yRef.current(d.deaths));
    // .curve(d3.curveMonotoneX);

    const updatedArea = d3
      .area<{ year: number; deaths: number }>()
      .x((d) => xRef.current(d.year))
      .y0(height)
      .y1((d) => yRef.current(d.deaths));
    // .curve(d3.curveMonotoneX);

    // 4. Transition Path Elements
    d3.select(linePathRef.current)
      .transition(t)
      .attr("stroke-dasharray", "none")
      .attr("d", updatedLine(data));

    d3.select(ref.current)
      .select(".area-path")
      .transition(t)
      .attr("d", updatedArea(data));

    // 5. Morph Focus Lines positions
    focusLinesRef.current.forEach((el, i) => {
      const year = FOCUS_YEARS[i];
      const isVisible = year >= targetDomain[0] && year <= targetDomain[1];

      d3.select(el)
        .transition(t)
        .attr("x1", xRef.current(year))
        .attr("x2", xRef.current(year))
        .attr("opacity", isVisible ? 0.8 : 0);
    });

    // 6. Shift coordinates of Dots and Text nodes
    dotsRef.current.forEach((el, i) => {
      const d = data[i];
      const isVisible = d.year >= targetDomain[0] && d.year <= targetDomain[1];

      d3.select(el)
        .transition(t)
        .attr("cx", xRef.current(d.year))
        .attr("opacity", isVisible ? 1 : 0);
    });

    labelsRef.current.forEach((el, i) => {
      const d = data[i];
      const isVisible = d.year >= targetDomain[0] && d.year <= targetDomain[1];

      d3.select(el)
        .transition(t)
        .attr("x", xRef.current(d.year))
        .attr("opacity", isVisible ? 1 : 0);
    });
  }, [stepIndex, introComplete]);

  return <div ref={ref} style={{ width: "100%" }} />;
}
