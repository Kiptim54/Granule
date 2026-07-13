<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import * as d3 from "d3";
  import { gsap } from "gsap";
  import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
  import { geoGinzburg8 } from "d3-geo-projection";
  import { geoPath } from "d3-geo";
  import scrollyData from "$lib/data/scrolly-data.json";
  import IBPGeoCountries from "../../components/obs-stepper/countries.geo.json";
  import {
    chartConfig,
    makeDumbbellScale,
    buildDumbbellData,
  } from "./chartConfig.js";
  import AllScoresChart from "./AllScoresChart.svelte";
  import { SvelteMap } from "svelte/reactivity";

  gsap.registerPlugin(MorphSVGPlugin);

  let {
    index = 0,
    steps,
    progress = 0,
    improvedLabel = "Scores improved",
    declinedLabel = "Scores declined",
  } = $props();

  $inspect("scrollyData", scrollyData);

  let countryPaths = $state({});
  let countryPathElements = $state({});

  let svgEl;

  let chartType = $state("choropleth");
  let colourColumn = null;

  let chartWidth = $state(800);
  let chartHeight = $state(450);
  let screenWidth = $state(1600);
  let screenHeight = $state(900);
  let isMobile = $derived(screenWidth < 1024);

  // scales
  let xTransparencyScale = $state(null);
  let yTransparencyScale = $state(null);
  // One band scale per dumbbell metric, keyed by chart type.
  let dumbbellScales = $state({});

  let currentChartConfig = $derived(chartConfig[index] || {});
  // The active x-scale for the current chart type (drives the x-axis ticks/labels).
  let currentScale = $state(null);

  let width = $state(800);
  let height = $state(450);
  let PADDING = 20;
  let LEFT_AXIS_PADDING = $derived(isMobile ? 35 : 60);
  let useMorph = $derived(index === 0 || (index === 1 && !isMobile));

  const dumbbellConfigs = Object.values(chartConfig).filter(
    (c) => c.startKey && c.endKey,
  );
  const dumbbellTypes = dumbbellConfigs.map((c) => c.chartType);

  const top5 = [...scrollyData]
    .sort((a, b) => a.transparency_rank - b.transparency_rank)
    .slice(0, 5);
  const top5Codes = new Set(top5.map((c) => c.ISO));
  const top5Names = new Set(top5.map((c) => c.country));
  const top5NameMap = new Map(top5.map((c) => [c.ISO, c.country]));
  const scrollyNameMap = new Map(scrollyData.map((c) => [c.ISO, c.country]));

  let highlightDumbbellLabelPositions = $derived.by(() => {
    if (
      !dumbbellTypes.includes(chartType) ||
      !currentChartConfig?.highlights?.length ||
      !isMobile
    )
      return {};
    const highlights = new Set(currentChartConfig.highlights);
    const MIN_GAP = 30;
    const LABEL_HEIGHT = 28;

    const improved = [];
    const declined = [];

    for (const country of Object.values(countryPaths)) {
      if (!highlights.has(country.code)) continue;
      const d = country[chartType];
      if (d?.change == null || !d.position) continue;
      // Anchor to the top circle, then shift up by label height so label sits above the dot
      const entry = {
        code: country.code,
        naturalY: d.position.y - LABEL_HEIGHT,
        change: d.change,
      };
      if (d.change > 0) improved.push(entry);
      else declined.push(entry);
    }

    const applyAvoidance = (group) => {
      group.sort((a, b) => a.naturalY - b.naturalY);
      const out = group.map((e) => ({ ...e, adjY: e.naturalY }));
      for (let i = 1; i < out.length; i++) {
        if (out[i].adjY - out[i - 1].adjY < MIN_GAP) {
          out[i].adjY = out[i - 1].adjY + MIN_GAP;
        }
      }
      return out;
    };

    const result = {};
    for (const e of applyAvoidance(improved)) {
      result[e.code] = {
        x: LEFT_AXIS_PADDING + 4,
        y: e.adjY,
        textAnchor: "start",
      };
    }
    for (const e of applyAvoidance(declined)) {
      result[e.code] = { x: width - PADDING - 4, y: e.adjY, textAnchor: "end" };
    }
    return result;
  });

  let top5LabelPositions = $derived.by(() => {
    if (!countryPaths || Object.keys(countryPaths).length === 0) return {};
    const MIN_GAP = 16;
    const entries = top5
      .map(({ ISO }) => {
        const c = countryPaths[ISO];
        if (!c?.barchart?.position) return null;
        const pos = c.barchart.position;
        const w = Math.max(10, pos.width);
        const h = Math.max(10, pos.height);
        return { code: ISO, naturalY: pos.y + h / 2 + 4, x: pos.x + w + 8 };
      })
      .filter(Boolean)
      .sort((a, b) => a.naturalY - b.naturalY);

    const adjusted = entries.map((e) => ({ ...e, adjY: e.naturalY }));
    for (let i = 1; i < adjusted.length; i++) {
      if (adjusted[i].adjY - adjusted[i - 1].adjY < MIN_GAP) {
        adjusted[i].adjY = adjusted[i - 1].adjY + MIN_GAP;
      }
    }
    return Object.fromEntries(
      adjusted.map(({ code, x, adjY }) => [code, { x, y: adjY }]),
    );
  });

  let useMorphSvg = $derived(
    ["choropleth", "barchart", ...dumbbellTypes].includes(
      steps[index]?.chartType,
    ),
  );

  // Bars are pre-computed once regardless of step, so resolve the colour
  // thresholds from the first bar chart config rather than the current step.
  const barThresholds =
    Object.values(chartConfig).find((c) => c.chartType === "barchart")
      ?.thresholds ?? [];

  // For step 1 get the highlighted countries from the step1Data.json
  const highlightedCountries = new Set(
    Object.values(scrollyData).map((c) => c.ISO),
  );
  const HIGHLIGHT_BLUE = "#003E51";

  onMount(() => {
    prepScrollyData();
  });

  function prepScrollyData() {
    // initialise path generator and map projection
    const geo = IBPGeoCountries;
    const projection = geoGinzburg8().fitSize([width, height], geo);
    const path = geoPath().projection(projection);

    // -------------------------------------------------------------------------
    // Without this russia is not on the map:Consolidate multi-feature geometries under the same ISO country code
    const countryDataMap = new SvelteMap();
    for (const f of geo.features) {
      const d = path(f);
      if (!d) continue;
      const code = f.properties?.id;
      if (!code) continue;

      if (countryDataMap.has(code)) {
        const existing = countryDataMap.get(code);
        // Append the sub-path string safely separated by a space
        existing.d += " " + d;
      } else {
        countryDataMap.set(code, {
          code,
          d,
          name: f.properties?.name ?? code,
        });
      }
    }
    // countryData now contains exactly one row per unique country code
    const countryData = Array.from(countryDataMap.values());

    const rectPath = (x, y, w, h) => `M${x},${y} h${w} v${h} h${-w} Z`;

    // Bar sizing is based only on the 82 OBS countries rather than all 177 in the shapefile used for the map
    const obsCodeSet = new Set(scrollyData.map((c) => c.ISO));
    const obsCountryData = countryData
      .filter(({ code }) => obsCodeSet.has(code))
      .sort((a, b) => {
        const aRank =
          scrollyData.find((c) => c.ISO === a.code)?.transparency_rank ??
          Infinity;
        const bRank =
          scrollyData.find((c) => c.ISO === b.code)?.transparency_rank ??
          Infinity;
        return aRank - bRank;
      });

    xTransparencyScale = d3
      .scaleBand()
      .domain(
        obsCountryData.map(
          ({ code }) =>
            scrollyData.find((c) => c.ISO === code)?.country ?? code,
        ),
      )
      .range([LEFT_AXIS_PADDING, width - PADDING])
      .padding(0.05);

    // Only place countries that have a map shape (avoids empty band slots).
    const shapeCodes = new Set(countryData.map((c) => c.code));

    yTransparencyScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - PADDING, PADDING]);

    const nextScales = {};
    const dumbbellByType = {};
    for (const cfg of dumbbellConfigs) {
      const scale = makeDumbbellScale(scrollyData, {
        startKey: cfg.startKey,
        endKey: cfg.endKey,
        range: [LEFT_AXIS_PADDING, width - PADDING],
        labelKey: "ISO",
        codes: shapeCodes,
      });
      nextScales[cfg.chartType] = scale;
      dumbbellByType[cfg.chartType] = buildDumbbellData(scrollyData, {
        startKey: cfg.startKey,
        endKey: cfg.endKey,
        xScale: scale,
        yScale: yTransparencyScale,
        baseline: height - PADDING,
        labelKey: "ISO",
        codes: shapeCodes,
      });
    }
    dumbbellScales = nextScales;

    // FIXED: colW is now completely accurate because obsCountryData has no duplicates
    const colW = (width - LEFT_AXIS_PADDING - PADDING) / obsCountryData.length;
    const barW = Math.max(1, colW - 2);

    // Pre-compute bar paths indexed by country code
    const barPaths = {};
    obsCountryData.forEach(({ code }, i) => {
      const row = scrollyData.find((c) => c.ISO === code);
      const x = LEFT_AXIS_PADDING + i * colW;

      const obiScore = row?.transparency_2025 || 0;
      const y = yTransparencyScale(obiScore);
      const barH = height - PADDING - y;
      const barColor =
        barThresholds.find((t) => obiScore >= t.min)?.barColor ?? "#6BABB3";
      barPaths[code] = {
        path: rectPath(x, y, barW, barH),
        colorPath: barColor,
        position: {
          x,
          y,
          width: isMobile ? barW * 1.5 : barW,
          height: isMobile ? barW * 1.5 : barH,
        },
      };
    });

    const emptyDumbbell = {
      start: null,
      end: null,
      change: null,
      position: { x: 0, y: height - PADDING, width: 1, height: 0 },
    };
    const next = {};
    countryData.forEach(({ code, d, name }) => {
      const entry = {
        code,
        name,
        choropleth: {
          path: d,
          colorPath: highlightedCountries.has(code)
            ? HIGHLIGHT_BLUE
            : "#DEDEDE",
        },
        barchart: barPaths[code] ?? {
          path: rectPath(0, height - PADDING, 1, 0),
          colorPath: "#DEDEDE",
          position: { x: 0, y: height - PADDING, width: 1, height: 0 },
        },
      };

      for (const type of dumbbellTypes) {
        entry[type] = dumbbellByType[type][code] ?? emptyDumbbell;
      }
      next[code] = entry;
    });
    countryPaths = next;
  }

  $inspect("debug", { chartType, index });
  $inspect("countryPaths", countryPaths);

  function getPathColour(country, colourColumn) {
    const shape = country[chartType];
    if (!shape) return "#DEDEDE";
    return shape[colourColumn] || shape.colorPath || "#DEDEDE";
  }

  // gsap won't morph paths that aren't valid, so need to check here before trying to morph
  function isValidPath(d) {
    return Boolean(d) && !d.includes("NaN");
  }

  function morphPath() {
    const validPathElements = Object.values(countryPathElements).filter((el) =>
      isValidPath(el.getAttribute("d")),
    );
    if (validPathElements.length === 0) return;

    gsap.fromTo(
      validPathElements,
      {
        morphSVG: {
          shape: (_, el) => el.getAttribute("d"),
        },
      },
      {
        scale: 1,
        duration: 1.2,
        ease: "power2.inOut",
        morphSVG: {
          shape: (_, el) => countryPaths[el.dataset.code]?.[chartType]?.path,
          type: "linear",
        },
      },
    );
  }

  function getCountryElementOpacity(chartType, highlight = false) {
    if (chartType === "barchart") {
      return isMobile ? 0.7 : 1;
    } else if (dumbbellTypes.includes(chartType)) {
      if (highlight) {
        return 1;
      } else {
        return isMobile ? 0 : 1;
      }
    }
  }

  $effect(() => {
    if (index === 0) {
      chartType = "choropleth";
      morphPath();
    } else if (index === 1) {
      chartType = "barchart";
      currentScale = xTransparencyScale;
      if (!isMobile) morphPath();
    } else if (index === 2) {
      chartType = "barchart";
      currentScale = xTransparencyScale;
    } else {
      const type = steps[index]?.chartType;
      chartType = type;
      currentScale = dumbbellScales[type] ?? xTransparencyScale;
    }
  });

  let hoveredCountry = $state(null);
  let lastWidth;

  $effect(() => {
    if (screenWidth !== lastWidth) {
      lastWidth = screenWidth;
      width = Math.min(screenWidth * 0.95, 1000);
      height = screenHeight * 0.8;
      chartWidth = width;
      chartHeight = height;
      prepScrollyData();
    }
  });
</script>

<svelte:window bind:innerWidth={screenWidth} bind:innerHeight={screenHeight} />

<div class="chart-container relative w-full">
  <div class="svg-container relative">
    <div
      class="flex items-center justify-between px-2 pt-4 text-lg md:px-6 md:pt-6 md:text-2xl"
    >
      <p class="chart-title font-display" class:first-title={index == 0}>
        {steps[index]?.title}
      </p>
      <p class="chart-title font-display">{steps[index]?.year}</p>
    </div>
    <div class="morph-stage" style:height="{chartHeight}px">
      {#if useMorphSvg}
        <div class="morph-layer" out:fade={{ duration: 400 }}>
          <svg
            bind:this={svgEl}
            style="width: {chartWidth}px !important; height: {chartHeight}px !important;"
          >
            <defs>
              <filter
                id="hl-text-shadow"
                x="-20%"
                y="-40%"
                width="140%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="2"
                  flood-color="rgba(0,0,0,0.30)"
                />
              </filter>
            </defs>
            {#if chartType !== "choropleth" && chartType !== "bargroup"}
              <g class="background-bands">
                <!-- Each band: a rect spanning the chart width, height determined by the y scale -->
                {#each currentChartConfig.thresholds ?? [] as band (band.min)}
                  <rect
                    x={LEFT_AXIS_PADDING}
                    y={yTransparencyScale(band.max)}
                    width={width - LEFT_AXIS_PADDING - PADDING}
                    height={yTransparencyScale(band.min) -
                      yTransparencyScale(band.max)}
                    fill={band.bandFill}
                  />
                {/each}
              </g>

              <g
                class="barchart"
                style:transform="translate(0px, 0px)"
                in:fade={{ duration: 500, delay: 1000 }}
              >
                {#if currentScale && yTransparencyScale}
                  <g class="x-axis">
                    {#if isMobile}
                      <text
                        x={(LEFT_AXIS_PADDING + width - PADDING) / 2}
                        y={height - PADDING + 20}
                        text-anchor="middle"
                        fill="black"
                        font-size="14"
                        font-weight="bold">Assessed Countries</text
                      >
                    {:else}
                      {#each currentScale.domain() as name (name)}
                        <g
                          class="x-tick"
                          transform={`translate(${currentScale(name) + currentScale.bandwidth() / 2}, 0)`}
                        >
                          <line
                            y1={height - PADDING}
                            y2={height - PADDING + 12}
                            stroke="#EEE"
                          />
                          <text
                            transform={`translate(0, ${height - PADDING + 12}) rotate(-60)`}
                            fill="black"
                            text-anchor="end"
                            font-size="9.6"
                            font-weight={index === 2 && top5Names.has(name)
                              ? "bold"
                              : "normal"}>{name}</text
                          >
                        </g>
                      {/each}
                    {/if}
                  </g>

                  <g class="y-axis">
                    {#each yTransparencyScale.ticks(6) as tick (tick)}
                      <g
                        class="y-tick"
                        transform={`translate(0, ${yTransparencyScale(tick)})`}
                      >
                        <line
                          x1={LEFT_AXIS_PADDING}
                          x2={width - PADDING}
                          stroke="#e0e0e0"
                        />
                        <text
                          x={LEFT_AXIS_PADDING - 10}
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
                      font-size="16"
                      transform={`rotate(-90, ${LEFT_AXIS_PADDING / 2}, ${height / 2})`}
                    ></text>
                  </g>

                  {#if dumbbellTypes.includes(chartType) && !isMobile}
                    {@const ay = height - PADDING + 52}
                    {@const improvedColor = "#003E51"}
                    {@const declinedColor = "#B5523F"}
                    <polygon
                      points="{LEFT_AXIS_PADDING},{ay} {LEFT_AXIS_PADDING +
                        9},{ay - 4} {LEFT_AXIS_PADDING + 9},{ay + 4}"
                      fill={improvedColor}
                    />
                    <line
                      x1={LEFT_AXIS_PADDING + 8}
                      y1={ay}
                      x2={LEFT_AXIS_PADDING + 72}
                      y2={ay}
                      stroke={improvedColor}
                      stroke-width="1.5"
                    />
                    <text
                      x={LEFT_AXIS_PADDING + 78}
                      y={ay + 4}
                      font-size="14"
                      font-weight="600"
                      fill={improvedColor}>{improvedLabel}</text
                    >
                    <text
                      x={width - PADDING - 78}
                      y={ay + 4}
                      font-size="14"
                      font-weight="600"
                      fill={declinedColor}
                      text-anchor="end">{declinedLabel}</text
                    >
                    <line
                      x1={width - PADDING - 72}
                      y1={ay}
                      x2={width - PADDING - 8}
                      y2={ay}
                      stroke={declinedColor}
                      stroke-width="1.5"
                    />
                    <polygon
                      points="{width - PADDING},{ay} {width - PADDING - 9},{ay -
                        4} {width - PADDING - 9},{ay + 4}"
                      fill={declinedColor}
                    />
                  {/if}
                {/if}
              </g>
            {/if}

            <g class="country-path" class:opacity-0={!useMorph}>
              {#each Object.values(countryPaths) as country (country.code)}
                <path
                  bind:this={countryPathElements[country.code]}
                  class="country-path"
                  class:not-hovered={hoveredCountry &&
                    hoveredCountry.code !== country.code}
                  class:country-hovered={hoveredCountry &&
                    hoveredCountry.code === country.code}
                  data-code={country.code}
                  d={country?.[chartType]?.path || ""}
                  fill={getPathColour(country, colourColumn)}
                  stroke="none"
                  role="img"
                  aria-label={country.name}
                />
              {/each}
            </g>

            <g class="country-elements" class:opacity-0={useMorph}>
              {#each Object.values(countryPaths) as country (country.code)}
                {#if country?.[chartType]?.position && country[chartType].position.x > 0}
                  {@const highlight = currentChartConfig?.highlights?.includes(
                    country.code,
                  )}
                  <g
                    class="country-element"
                    class:not-highlighted={currentChartConfig?.highlights
                      ?.length > 0 && !highlight}
                    style={highlight && isMobile
                      ? "filter: drop-shadow(0 0 4px white)"
                      : ""}
                  >
                    <rect
                      x={country[chartType].position.x}
                      y={country[chartType].position.y}
                      width={chartType === "barchart"
                        ? Math.max(10, country[chartType].position.width)
                        : country[chartType].position.width}
                      height={chartType === "barchart"
                        ? Math.max(10, country[chartType].position.height)
                        : country[chartType].position.height}
                      fill={country[chartType].fill ||
                        getPathColour(country, colourColumn)}
                      fill-opacity={getCountryElementOpacity(
                        chartType,
                        highlight,
                      )}
                      stroke={chartType === "barchart"
                        ? country[chartType].fill
                        : "none"}
                      stroke-width={isMobile ? 1.5 : 0}
                      rx={isMobile && chartType === "barchart"
                        ? Math.max(10, country[chartType].position.width) / 2
                        : 0}
                      class="country-element transition-all duration-500"
                    />

                    {#if index === 2 && chartType === "barchart" && top5Codes.has(country.code) && !isMobile}
                      <text
                        x={country[chartType].position.x +
                          Math.max(10, country[chartType].position.width) / 2}
                        y={country[chartType].position.y + 14}
                        text-anchor="middle"
                        fill="white"
                        font-size="8">★</text
                      >
                    {/if}

                    {#if index > 2 && country[chartType].change !== null}
                      <!-- dumbell upper circle -->
                      {@const change = country[chartType].change}
                      <circle
                        cx={country[chartType].position.x +
                          country[chartType].position.width / 2}
                        cy={country[chartType].position.y}
                        r={5}
                        fill={change > 0
                          ? country[chartType].dotFill
                          : "#FDFBF6"}
                        stroke={change > 0
                          ? country[chartType].dotFill
                          : country[chartType].fill}
                        stroke-width={change > 0 ? 0 : 1.5}
                        opacity={isMobile && highlight === false ? 0.3 : 1}
                        class="transition-all duration-500"
                        in:fade={isMobile && !highlight
                          ? { duration: 0 }
                          : { delay: 300, duration: 300 }}
                      />

                      <!-- dumbell lower circle -->
                      <circle
                        cx={country[chartType].position.x +
                          country[chartType].position.width / 2}
                        cy={country[chartType].position.y +
                          country[chartType].position.height}
                        r={5}
                        fill={change < 0
                          ? country[chartType].dotFill
                          : "#FDFBF6"}
                        stroke={change < 0
                          ? country[chartType].dotFill
                          : country[chartType].fill}
                        stroke-width={change < 0 ? 0 : 1.5}
                        opacity={isMobile && highlight === false ? 0.3 : 1}
                        class="transition-all duration-500"
                        in:fade={isMobile && !highlight
                          ? { duration: 0 }
                          : { delay: 300, duration: 300 }}
                      />
                    {/if}
                  </g>
                {/if}
              {/each}
            </g>

            {#if index > 2 && dumbbellTypes.includes(chartType)}
              <g class="highlight-labels">
                {#each Object.values(countryPaths) as country (country.code)}
                  {@const highlight = currentChartConfig?.highlights?.includes(
                    country.code,
                  )}
                  {#if highlight && country?.[chartType]?.change != null}
                    {@const change = country[chartType].change}
                    {@const cx =
                      country[chartType].position.x +
                      country[chartType].position.width / 2}
                    {#if isMobile && highlightDumbbellLabelPositions[country.code]}
                      {@const lp =
                        highlightDumbbellLabelPositions[country.code]}
                      {@const displayName =
                        scrollyNameMap.get(country.code) ?? country.name}
                      <text
                        x={lp.x}
                        y={lp.y}
                        fill={country[chartType].fill}
                        font-size="11"
                        font-weight="bold"
                        text-anchor={lp.textAnchor}
                        stroke="white"
                        stroke-width="3"
                        paint-order="stroke"
                        in:fade={{ delay: 300, duration: 300 }}
                      >
                        <tspan x={lp.x} dy="0">{displayName}</tspan>
                        <tspan x={lp.x} dy="1.3em" font-size="12"
                          >{change > 0 ? "+" : "-"}{Math.round(
                            Math.abs(change),
                          )}</tspan
                        >
                      </text>
                    {:else if !isMobile}
                      <text
                        x={cx}
                        y={country[chartType].position.y - 12}
                        fill={country[chartType].fill}
                        font-size="12"
                        font-weight="bold"
                        text-anchor="middle"
                        stroke="white"
                        stroke-width="3"
                        paint-order="stroke"
                        class="transition-opacity duration-500"
                        in:fade={{ delay: 300, duration: 300 }}
                      >
                        {change > 0 ? "+" : "-"}{Math.round(Math.abs(change))}
                      </text>
                    {/if}
                  {/if}
                {/each}
              </g>
            {/if}

            {#if index === 2 && chartType === "barchart" && isMobile}
              <g class="top5-labels">
                {#each top5 as { ISO } (ISO)}
                  {#if top5LabelPositions[ISO]}
                    {@const lp = top5LabelPositions[ISO]}
                    <text
                      x={lp.x}
                      y={lp.y}
                      text-anchor="start"
                      fill="#003E51"
                      font-size="12"
                      font-weight="bold"
                      stroke="white"
                      stroke-width="3"
                      paint-order="stroke">{top5NameMap.get(ISO)}</text
                    >
                  {/if}
                {/each}
              </g>
            {/if}

            <g class="band-labels">
              {#each currentChartConfig.thresholds ?? [] as band, bandIndex (band.min)}
                {#if chartType !== "choropleth" && chartType !== "bargroup"}
                  <text
                    x={width - PADDING - 10}
                    y={yTransparencyScale(band.max) + 20}
                    text-anchor="end"
                    fill="#5E5E5E"
                    font-size={isMobile ? 13 : 14}
                    font-weight="500"
                    opacity={index === 1 || bandIndex === 0 ? "0.9" : "0.1"}
                  >
                    {#each band.text as line, i (line)}
                      <tspan
                        x={width - PADDING - 10}
                        dy={i === 0 ? "0" : "1.2em"}>{line}</tspan
                      >
                    {/each}
                  </text>
                {/if}
              {/each}
            </g>

            {#if index > 2 && dumbbellTypes.includes(chartType) && currentChartConfig?.highlights?.length && !isMobile}
              {@const hlCodes = new Set(currentChartConfig.highlights)}
              {@const hlEntries = Object.values(countryPaths)
                .filter(
                  (c) => hlCodes.has(c.code) && c?.[chartType]?.change != null,
                )
                .sort((a, b) => a[chartType].change - b[chartType].change)}
              {@const worstHL = hlEntries[0]}
              {@const bestHL = hlEntries[hlEntries.length - 1]}

              {#if bestHL?.[chartType]?.position}
                {@const pos = bestHL[chartType].position}
                {@const cx = pos.x + pos.width / 2}
                {@const startY = Math.max(10, pos.y - 45)}
                <text
                  font-size="11"
                  font-weight="700"
                  text-anchor="middle"
                  fill="#003E51"
                  stroke="white"
                  stroke-width="2"
                  paint-order="stroke"
                  filter="url(#hl-text-shadow)"
                  in:fade={{ delay: 300, duration: 300 }}
                >
                  <tspan x={cx} y={startY}>2025 Score</tspan>
                  <tspan x={cx} dy="1.3em">Increased by</tspan>
                  <!-- <tspan x={cx} dy="1.5em" font-size="16"
										>+{Math.round(bestHL[chartType].change)}</tspan
									> -->
                </text>
              {/if}

              {#if worstHL?.[chartType]?.position}
                {@const pos = worstHL[chartType].position}
                {@const cx = pos.x + pos.width / 2}
                {@const startY = Math.max(10, pos.y - 45)}
                <text
                  font-size="11"
                  font-weight="700"
                  text-anchor="middle"
                  fill="#B5523F"
                  stroke="white"
                  stroke-width="2"
                  paint-order="stroke"
                  filter="url(#hl-text-shadow)"
                  in:fade={{ delay: 300, duration: 300 }}
                >
                  <tspan x={cx} y={startY}>2025 Score</tspan>
                  <tspan x={cx} dy="1.3em">decreased by</tspan>
                  <!-- <tspan x={cx} dy="1.5em" font-size="16"
										>{Math.round(worstHL[chartType].change)}</tspan
									> -->
                </text>
              {/if}
            {/if}
          </svg>
        </div>
      {:else}
        {#if index === 7}
          <div
            in:fade={{ duration: 300, delay: 400 }}
            class="morph-layer flex items-center justify-center"
          >
            <AllScoresChart />
          </div>
        {/if}
        <!-- Normal D3 chart for step 2+ -->
        <!-- e.g. <AllScoresBarChart {index} {steps} /> -->
      {/if}
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
    width: min(98vw, 1000px) !important;
    max-width: 100%;
    margin: 0 auto;
    shape-rendering: crispEdges;
  }

  svg {
    max-width: 100%;
    margin: 0 auto;
    shape-rendering: crispEdges;
    overflow: visible;
  }

  .svg-container {
    padding-bottom: 120px;
  }

  .country-path {
    transition:
      fill 1s ease,
      opacity 0.2s ease;
  }

  .country-path.not-hovered {
    opacity: 0.4 !important;
  }

  .country-path.country-hovered {
    opacity: 1 !important;
    stroke-width: 2;
    stroke: #666666;
  }

  :global(.country-elements .not-highlighted) {
    opacity: 0.4;
  }

  :global(.country-elements circle) {
    shape-rendering: geometricPrecision;
  }

  .chart-title {
    font-size: 18px !important;
    font-family: inherit;
    font-family: "Adelle Sans", sans-serif;
  }

  @media (min-width: 768px) {
    .chart-title {
      font-size: 20px !important;
    }
  }

  .first-title {
    text-align: center !important;
    width: 100%;
    font-size: 22px !important;
  }
</style>
