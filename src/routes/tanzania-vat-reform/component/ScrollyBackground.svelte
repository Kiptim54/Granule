<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import * as d3 from "d3";
  import { gsap } from "gsap";
  import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
  import { geoGinzburg8 } from "d3-geo-projection";
  import { geoPath } from "d3-geo";
  import { SvelteMap } from "svelte/reactivity";
  import eastAfricaGeoUrl from "../east-africa.geojson?url";

  gsap.registerPlugin(MorphSVGPlugin);

  let { index = 0, steps } = $props();

  let eastAfricaGeo: GeoJSON.FeatureCollection | null = $state(null);

  // Mock VAT reform score (0–100) for countries that have data in the geojson
  const mockData = [
    {
      iso3: "TZA",
      name: "Tanzania",
      value: 30,
      color: "#003E51",
      FDI: "$922 million",
      fdiValue: 0.922,
    },
    {
      iso3: "KEN",
      name: "Kenya",
      value: 25,
      color: "#6BABB3",
      FDI: "$2 billion",
      fdiValue: 2,
    },
    {
      iso3: "ETH",
      name: "Ethiopia",
      value: 25,
      color: "#6BABB3",
      FDI: "$3.1 billion",
      fdiValue: 3.1,
    },
  ];

  const fdiColorScale = d3
    .scaleSequential()
    .domain([0, 3.5])
    .interpolator(d3.interpolate("#B8DDE0", "#003E51"));
  let policy_timeline = $state(730);
  let TIMELINE_DAYS = $derived(policy_timeline);
  const TIMELINE_COUNTRY = "TZA";

  type BarShape = {
    path: string;
    colorPath: string;
    position: { x: number; y: number; width: number; height: number };
  };
  type CountryEntry = {
    code: string;
    name: string;
    hasData: boolean;
    choropleth: { path: string; colorPath: string };
    barchart: BarShape;
    timeline: BarShape;
    labelPos: { x: number; y: number };
  };

  let countryPaths = $state<Record<string, CountryEntry>>({});
  let countryPathElements = $state<Record<string, SVGPathElement>>({});

  let chartType = $state<"choropleth" | "barchart" | "timeline">("choropleth");
  let chartWidth = $state(800);
  let chartHeight = $state(450);
  let screenWidth = $state(1600);
  let screenHeight = $state(900);
  let isMobile = $derived(screenWidth < 1024);

  let xScale = $state<d3.ScaleBand<string> | null>(null);
  let yScale = $state<d3.ScaleLinear<number, number> | null>(null);

  // Layout of the 40-box VAT-refund timeline grid (15 days per row, wrapping)
  let timelineLayout = $state<{
    startX: number;
    rowY: number;
    boxWidth: number;
    boxHeight: number;
    boxGap: number;
    rowGap: number;
    cols: number;
  } | null>(null);

  let width = $state(800);
  let height = $state(450);
  const PADDING = 20;
  let LEFT_AXIS_PADDING = $derived(isMobile ? 35 : 60);

  const HIGHLIGHT_COLOR = "#3e9d9b";
  const INACTIVE_COLOR = "#DEDEDE";

  onMount(async () => {
    const res = await fetch(eastAfricaGeoUrl);
    eastAfricaGeo = await res.json();
    buildPaths();
  });

  function buildPaths() {
    if (!eastAfricaGeo) return;
    const projection = geoGinzburg8().fitSize([width, height], eastAfricaGeo);
    const pathGen = geoPath().projection(projection);
    const rectPath = (x: number, y: number, w: number, h: number) =>
      `M${x},${y} h${w} v${h} h${-w} Z`;

    // Consolidate multi-part countries under one iso3 code
    const countryDataMap = new SvelteMap<
      string,
      { code: string; d: string; name: string; hasData: boolean }
    >();
    const centroidMap = new SvelteMap<
      string,
      { x: number; y: number; area: number }
    >();
    for (const f of eastAfricaGeo.features) {
      const d = pathGen(f);
      if (!d) continue;
      const props = f.properties as {
        iso3?: string;
        name?: string;
        hasData?: boolean;
      } | null;
      const code = props?.iso3;
      if (!code) continue;

      const [cx, cy] = pathGen.centroid(f);
      const area = pathGen.area(f);

      if (countryDataMap.has(code)) {
        countryDataMap.get(code)!.d += " " + d;
        if (area > (centroidMap.get(code)?.area ?? 0)) {
          centroidMap.set(code, { x: cx, y: cy, area });
        }
      } else {
        countryDataMap.set(code, {
          code,
          d,
          name: props?.name ?? code,
          hasData: props?.hasData ?? false,
        });
        centroidMap.set(code, { x: cx, y: cy, area });
      }
    }
    const countryData = Array.from(countryDataMap.values());

    // Sort by value descending for a ranked bar chart
    const barCountries = [...mockData].sort((a, b) => b.value - a.value);

    xScale = d3
      .scaleBand()
      .domain(barCountries.map((d) => d.name))
      .range([LEFT_AXIS_PADDING, width - PADDING])
      .padding(0.25);

    yScale = d3
      .scaleLinear()
      .domain([0, 40])
      .range([height - PADDING, PADDING]);

    const colW = xScale.bandwidth();

    // Pre-compute bar rect paths keyed by iso3
    const barPaths: Record<string, BarShape> = {};
    for (const row of barCountries) {
      const x = xScale(row.name)!;
      const y = yScale(row.value);
      const barH = height - PADDING - y;
      barPaths[row.iso3] = {
        path: rectPath(x, y, colW, barH),
        colorPath: row.color,
        position: { x, y, width: colW, height: barH },
      };
    }

    // Grid of boxes for VAT-refund timeline: 15 days per row, wrapping.
    // Only Tanzania morphs into this grid; the other countries fade out.
    const availableWidth = width - LEFT_AXIS_PADDING - PADDING;
    const boxGap = isMobile ? 2 : 4;
    const rowGap = isMobile ? 4 : 6;
    const colsPerRow = 30;
    const boxWidth = (availableWidth - boxGap * (colsPerRow - 1)) / colsPerRow;
    const boxHeight = isMobile ? 24 : 24;
    const numRows = Math.ceil(TIMELINE_DAYS / colsPerRow);
    const totalHeight = numRows * boxHeight + (numRows - 1) * rowGap;
    const startY = height / 2 - totalHeight / 2 + 10;

    timelineLayout = {
      startX: LEFT_AXIS_PADDING,
      rowY: startY,
      boxWidth,
      boxHeight,
      boxGap,
      rowGap,
      cols: colsPerRow,
    };

    const timelineBoxes: string[] = [];
    for (let i = 0; i < TIMELINE_DAYS; i++) {
      const row = Math.floor(i / colsPerRow);
      const col = i % colsPerRow;
      const x = LEFT_AXIS_PADDING + col * (boxWidth + boxGap);
      const y = startY + row * (boxHeight + rowGap);
      timelineBoxes.push(rectPath(x, y, boxWidth, boxHeight));
    }
    const timelineStrip: BarShape = {
      path: timelineBoxes.join(" "),
      colorPath:
        mockData.find((d) => d.iso3 === TIMELINE_COUNTRY)?.color ??
        HIGHLIGHT_COLOR,
      position: {
        x: LEFT_AXIS_PADDING,
        y: startY,
        width: availableWidth,
        height: totalHeight,
      },
    };

    // Build the per-country path data used by the template
    const next: Record<string, CountryEntry> = {};
    for (const { code, d, name, hasData } of countryData) {
      const c = centroidMap.get(code);
      next[code] = {
        code,
        name,
        choropleth: {
          path: d,
          colorPath: hasData ? HIGHLIGHT_COLOR : INACTIVE_COLOR,
        },
        barchart: barPaths[code] ?? {
          // Countries without bar data collapse to an invisible 1px rect at the bottom
          path: rectPath(0, height - PADDING, 1, 0),
          colorPath: INACTIVE_COLOR,
          position: { x: 0, y: height - PADDING, width: 1, height: 0 },
        },
        timeline:
          code === TIMELINE_COUNTRY
            ? timelineStrip
            : {
                // Kenya/Ethiopia morph into the same strip location as Tanzania
                // (rather than collapsing in place), then fade out — so it
                // reads as all three merging into one timeline before only
                // Tanzania's color remains.
                path: timelineStrip.path,
                colorPath: INACTIVE_COLOR,
                position: timelineStrip.position,
              },
        labelPos: { x: c?.x ?? 0, y: c?.y ?? 0 },
        hasData,
      };
    }
    countryPaths = next;
  }

  function getPathColour(country: CountryEntry): string {
    if (index === 2 && country.hasData) {
      const entry = mockData.find((d) => d.iso3 === country.code);
      if (entry) return fdiColorScale(entry.fdiValue);
    }
    return country[chartType]?.colorPath ?? INACTIVE_COLOR;
  }

  // Kenya/Ethiopia fade out on the timeline step — only Tanzania morphs into the strip
  function getPathOpacity(country: CountryEntry): number {
    // if (index === 3 && country.code !== TIMELINE_COUNTRY) return 0;
    return 1;
  }

  function isValidPath(d: string | null): boolean {
    return Boolean(d) && !d!.includes("NaN");
  }

  // Morphs all country SVG paths from their current DOM shape to the new chartType shape.
  // Called right after setting chartType so GSAP reads the old DOM "d" before Svelte re-renders.
  function morphPath() {
    const validEls = Object.values(countryPathElements).filter((el) =>
      isValidPath(el.getAttribute("d")),
    );
    if (validEls.length === 0) return;

    gsap.fromTo(
      validEls,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        morphSVG: {
          shape: ((_: unknown, el: Element) => el.getAttribute("d")) as any,
        },
      },
      {
        duration: 1.2,
        ease: "power2.inOut",
        morphSVG: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shape: ((_: unknown, el: Element) =>
            countryPaths[(el as HTMLElement).dataset.code!]?.[chartType]
              ?.path) as any,
          type: "linear",
        },
      },
    );
  }

  let lastAppliedIndex = $state(-1);
  $effect(() => {
    if (index === lastAppliedIndex) return;
    lastAppliedIndex = index;

    const currentStep = steps[index];
    const requestedChartType = currentStep?.chartType ?? "choropleth";

    if (requestedChartType === "barchart") {
      chartType = "barchart";
      morphPath();
    } else if (requestedChartType === "timeline") {
      chartType = "timeline";
      policy_timeline = 730;
      morphPath();
    } else {
      chartType = "choropleth";
    }
  });

  let hoveredCountry = $state<string | null>(null);
  let lastWidth: number;

  $effect(() => {
    if (screenWidth !== lastWidth) {
      lastWidth = screenWidth;
      width = Math.min(screenWidth * 0.95, 1000);
      height = screenHeight * 0.8;
      chartWidth = width;
      chartHeight = height;
      buildPaths();
    }
  });
</script>

<svelte:window bind:innerWidth={screenWidth} bind:innerHeight={screenHeight} />

<div class="chart-container relative w-full">
  <div class="svg-container relative">
    <div
      class="flex items-center justify-between px-2 pt-4 text-lg md:px-6 md:pt-6 md:text-2xl pb-6"
    >
      <p class="chart-title my-4 font-semibold" class:first-title={index === 0}>
        {steps[index]?.title}
      </p>
    </div>

    <div class="morph-stage" style:height="{chartHeight}px">
      <div class="morph-layer" out:fade={{ duration: 400 }}>
        <svg
          style="width: {chartWidth}px !important; height: {chartHeight}px !important;"
        >
          {#if chartType === "barchart" && xScale && yScale}
            <!-- Y-axis gridlines + labels -->
            <g class="y-axis" in:fade={{ duration: 500, delay: 800 }}>
              {#each yScale.ticks(5) as tick (tick)}
                <g transform={`translate(0, ${yScale(tick)})`}>
                  <line
                    x1={LEFT_AXIS_PADDING}
                    x2={width - PADDING}
                    stroke="#e0e0e0"
                  />
                  <text
                    x={LEFT_AXIS_PADDING - 8}
                    dy="4"
                    fill="#535353"
                    text-anchor="end"
                    font-size="12">{tick}</text
                  >
                </g>
              {/each}
              <text
                x={LEFT_AXIS_PADDING / 2}
                y={height / 2}
                fill="#535353"
                text-anchor="middle"
                font-size="13"
                transform={`rotate(-90, ${LEFT_AXIS_PADDING / 2}, ${height / 2})`}
                >Corporate Tax Rate</text
              >
              <!-- show percentage on top of bars -->
              {#each Object.values(countryPaths) as country (country.code)}
                {#if country.hasData}
                  <text
                    transition:fade={{ duration: 400 }}
                    x={country.barchart.position.x +
                      country.barchart.position.width / 2}
                    y={country.barchart.position.y - 6}
                    text-anchor="middle"
                    font-size="14"
                    fill="#333"
                    font-weight="600"
                    >{mockData.find((d) => d.iso3 === country.code)
                      ?.value}%</text
                  >
                {/if}
              {/each}
            </g>

            <!-- X-axis country labels -->
            <g class="x-axis" in:fade={{ duration: 500, delay: 800 }}>
              {#each xScale.domain() as name (name)}
                <text
                  transform={`translate(${xScale(name)! + xScale.bandwidth() / 2}, ${height - PADDING + 14}) rotate(-30)`}
                  fill="#333"
                  text-anchor="end"
                  font-size={isMobile ? "10" : "12"}
                  font-weight={name === "Tanzania" ? "bold" : "normal"}
                  >{name}</text
                >
              {/each}
            </g>
          {/if}

          <!-- Country shapes — morphed by GSAP between map and bar rect -->

          <g class="country-paths">
            {#each Object.values(countryPaths) as country (country.code)}
              <path
                bind:this={countryPathElements[country.code]}
                data-code={country.code}
                d={country[chartType]?.path ?? ""}
                fill={getPathColour(country)}
                stroke="white"
                stroke-width="0.5"
                opacity={getPathOpacity(country)}
                style={`transition: fill 1s ease, opacity ${index === 3 ? 1200 : 200}ms ease;`}
                role="img"
                aria-label={country.name}
                class:not-hovered={hoveredCountry &&
                  hoveredCountry !== country.code}
              />
            {/each}
          </g>

          {#if chartType === "timeline" && timelineLayout}
            <g class="timeline-grid" in:fade={{ duration: 500, delay: 800 }}>
              {#if index === 5}
                <rect
                  in:fade={{ duration: 400 }}
                  out:fade={{ duration: 200 }}
                  x={timelineLayout.startX - 1}
                  y={timelineLayout.rowY - 1}
                  width={30 * timelineLayout.boxWidth +
                    29 * timelineLayout.boxGap +
                    2}
                  height={timelineLayout.boxHeight + 2}
                  fill="#165061"
                  stroke="#165061"
                  stroke-width="4"
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                  style="transition: all 400ms ease; padding: 14px;"
                />
              {/if}

              {#each Array(TIMELINE_DAYS) as _, i (i)}
                {@const row = Math.floor(i / timelineLayout.cols)}
                {@const col = i % timelineLayout.cols}
                {@const isHighlighted = index === 5 && i < 30}

                <rect
                  in:fade={{ duration: 400 }}
                  out:fade={{ duration: 400 }}
                  x={timelineLayout.startX +
                    col * (timelineLayout.boxWidth + timelineLayout.boxGap)}
                  y={timelineLayout.rowY +
                    row * (timelineLayout.boxHeight + timelineLayout.rowGap)}
                  width={timelineLayout.boxWidth}
                  height={timelineLayout.boxHeight}
                  fill={isHighlighted ? "none" : "#E5E4E2"}
                  stroke="none"
                  opacity={isHighlighted ? 1 : 0}
                  style="transition: all 400ms ease; padding: 14px;"
                />
              {/each}

              {#each Array.from({ length: TIMELINE_DAYS }, (_, i) => i + 1) as day (day)}
                {@const row = Math.floor((day - 1) / timelineLayout.cols)}
                {@const col = (day - 1) % timelineLayout.cols}
                <text
                  x={timelineLayout.startX +
                    col * (timelineLayout.boxWidth + timelineLayout.boxGap) +
                    timelineLayout.boxWidth / 2}
                  y={timelineLayout.rowY +
                    row * (timelineLayout.boxHeight + timelineLayout.rowGap) +
                    5}
                  fill={index === 5 && day <= 30 ? "white" : "#535353"}
                  text-anchor="middle"
                  dominant-baseline="hanging"
                  font-size={isMobile ? "8" : index === 5 ? "16" : "14"}
                  opacity={index === 5 ? (day <= 30 ? 1 : 0) : 1}
                >
                  {day}
                </text>
              {/each}
              <text
                x={LEFT_AXIS_PADDING / 2}
                y={height / 2}
                fill="#535353"
                text-anchor="middle"
                font-size="14"
                transform={`rotate(-90, ${LEFT_AXIS_PADDING / 2}, ${height / 2})`}
                >Total Number of Days</text
              >
            </g>
          {/if}
          <!-- Country name labels — choropleth only -->
          {#if chartType === "choropleth"}
            <defs>
              <linearGradient
                id="fdi-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#B8DDE0" />
                <stop offset="100%" stop-color="#003E51" />
              </linearGradient>
            </defs>

            <g
              class="country-labels"
              pointer-events="none"
              in:fade={{ duration: 300 }}
            >
              {#each Object.values(countryPaths) as country (country.code)}
                {#if country.hasData && index === 1}
                  <text
                    transition:fade={{ duration: 400 }}
                    x={country.labelPos.x}
                    y={country.labelPos.y}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size={isMobile ? "9" : "11"}
                    font-weight="600"
                    fill="white"
                    paint-order="stroke"
                    stroke="black"
                    stroke-width="2.5"
                    stroke-linejoin="round">{country.name}</text
                  >
                {/if}
                {#if country.hasData && index == 2}
                  <text
                    transition:fade={{ duration: 400 }}
                    x={country.labelPos.x}
                    y={country.labelPos.y}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size={isMobile ? "8" : "15"}
                    font-weight="400"
                    fill="white"
                    paint-order="stroke"
                    stroke="black"
                    stroke-width="2.5"
                    stroke-linejoin="round"
                    >{mockData.find((d) => d.iso3 === country.code)?.FDI}</text
                  >
                {/if}
              {/each}
            </g>

            {#if index === 2}
              <g transition:fade={{ duration: 400 }} pointer-events="none">
                <text
                  x={isMobile ? 14 : (width * 3) / 4 - 65}
                  y={height - 48}
                  font-size={isMobile ? "9" : "14"}
                  fill="#333"
                  font-weight="600">FDI Inflows</text
                >
                <rect
                  x={isMobile ? 14 : (width * 3) / 4 - 65}
                  y={height - 38}
                  width={isMobile ? 90 : 130}
                  height={13}
                  fill="url(#fdi-gradient)"
                  rx="2"
                />
                <text
                  x={isMobile ? 14 : (width * 3) / 4 - 65}
                  y={height - 10}
                  font-size={isMobile ? "8" : "12"}
                  fill="#555">Low</text
                >
                <text
                  x={isMobile ? 100 : (width * 3) / 4 + 65}
                  y={height - 10}
                  font-size={isMobile ? "8" : "12"}
                  text-anchor="end"
                  fill="#555">High</text
                >
              </g>
            {/if}
          {/if}
        </svg>
      </div>
    </div>
  </div>
</div>

<style>
  .morph-stage {
    position: relative;
    width: 100%;
  }

  .morph-layer {
    position: absolute;
    inset: 0;
  }

  .svg-container {
    width: min(98vw, 1000px);
    max-width: 100%;
    margin: 0 auto;
    shape-rendering: crispEdges;
    padding-bottom: 120px;
  }

  svg {
    max-width: 100%;
    margin: 0 auto;
    shape-rendering: crispEdges;
    overflow: visible;
  }

  path {
    transition:
      fill 1s ease,
      opacity 0.2s ease;
  }

  path.not-hovered {
    opacity: 0.4;
  }

  .chart-title {
    font-size: 18px;
    font-family: "Source Serif 4", "Georgia", serif;
  }

  @media (min-width: 768px) {
    .chart-title {
      font-size: 20px;
    }
  }

  .first-title {
    text-align: center;
    width: 100%;
    font-size: 20px;
  }
</style>
