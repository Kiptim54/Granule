<!-- <script>
  import { onMount } from "svelte";
  import Nav from "../../lib/components/Nav.svelte";
  import Footer from "../../lib/components/Footer.svelte";
  import { MapLibre } from "svelte-maplibre";
</script>

<div class="min-h-screen flex flex-col justify-between">
  <Nav isFixed={false} />
  <header class="text-center my-8">
    <h1 class="text-4xl font-bold text-primary-500">
      Femicides deaths by County
    </h1>
    <p class="mt-2 text-lg text-gray-600">
      Explore the distribution of femicides across different counties.
    </p>
    <div class="my-6">
      <MapLibre
        center={[50, 20]}
        zoom={3}
        class="map"
        standardControls
        projection={{ type: "globe" }}
        style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </div>

    <Footer />
  </header>
</div>

<style>
  :global(.map) {
    height: 700px;
  }
</style> -->

<script>
  import { onMount, onDestroy, untrack } from "svelte";
  import Nav from "../../lib/components/Nav.svelte";
  import Footer from "../../lib/components/Footer.svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { dev } from "$app/environment";
  import pkg from "maplibre-gl";
  const { Map, LngLatBounds } = pkg;
  import "maplibre-gl/dist/maplibre-gl.css";
  import { parse } from "yaml";
  import { marked } from "marked";
  import Scrolly from "$lib/components/Scrolly.svelte";
  import configRaw from "./config.yaml?raw";
  import customStyle from "./style.json";
  // import wbBoundaries from '$lib/assets/wb-boundaries.json';
  import wbBoundariesUrl from "./wb-boundaries.json?url";
  import kenyanCountiesUrl from "./kenyan-counties.geojson?url";
  import countyDeathsData from "./count-deaths.json";

  let { lang, translation } = $props();

  const baseConfig = parse(configRaw);
  const defaultLang = baseConfig.defaultLanguage || "en";

  // // 2. Convert these configuration nodes into Svelte 5 $derived runes.
  // // This safely prioritizes the runtime translation prop, falling back to bundled translations in dev.
  const activeLang = $derived(lang || defaultLang);
  const isRtl = $derived(activeLang === "ar");

  const config = $derived(baseConfig);

  const steps = $derived(config.steps);
  const theme = $derived(config.theme || {});
  const DEFAULT_HIGHLIGHT_COLOR = $derived(
    theme.defaultHighlightColor || "#0b3d4a",
  );
  const labelDefaults = $derived(config.labelDefaults || {});

  /** @type {Record<string, Record<string, number>>} */
  const CHOROPLETH_DATASETS = {};

  const COUNTY_DEATHS = countyDeathsData.deaths_by_county;

  const mobile = new MediaQuery("max-width: 768px");

  /** @type {any} */
  let map;
  let mapContainer;
  let scrollIndex = $state(undefined);
  let mapLoaded = $state(false);
  let devMode = $state(false);
  let liveCenter = $state([0, 0]);
  let liveZoom = $state(0);
  let livePitch = $state(0);
  let liveBearing = $state(0);
  let copyStatus = $state("");

  const mapHandlers = [
    "dragPan",
    "scrollZoom",
    "boxZoom",
    "dragRotate",
    "keyboard",
    "doubleClickZoom",
    "touchZoomRotate",
  ];

  function setMapInteractive(on) {
    if (!map) return;
    for (const h of mapHandlers) {
      map[h]?.[on ? "enable" : "disable"]();
    }
  }

  function fmt(n, digits = 2) {
    return Number(n).toFixed(digits);
  }

  function currentYamlSnippet() {
    return `    center: [${fmt(liveCenter[0])}, ${fmt(liveCenter[1])}]
    zoom: ${fmt(liveZoom)}
    pitch: ${fmt(livePitch, 1)}
    bearing: ${fmt(liveBearing, 1)}`;
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(currentYamlSnippet());
      copyStatus = "copied!";
    } catch {
      copyStatus = "copy failed";
    }
    setTimeout(() => (copyStatus = ""), 1500);
  }

  function applyStep(idx) {
    if (!map || idx == null) return;
    const s = steps[idx];

    const hasMobileOverride =
      mobile.current && (s.mobile?.center || s.mobile?.zoom != null);
    const activeCenter =
      mobile.current && s.mobile?.center ? s.mobile.center : s.center;
    const activeZoom =
      mobile.current && s.mobile?.zoom != null ? s.mobile.zoom : s.zoom;

    if (
      mobile.current &&
      !hasMobileOverride &&
      s.labels &&
      s.labels.length > 0
    ) {
      const bounds = new LngLatBounds();
      for (const l of s.labels) bounds.extend([l.lng, l.lat]);
      map.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 40, right: 40 },
        pitch: s.pitch ?? 0,
        bearing: s.bearing ?? 0,
        duration: 1800,
        maxZoom: activeZoom,
      });
    } else {
      map.flyTo({
        center: activeCenter,
        zoom: activeZoom,
        pitch: s.pitch ?? 0,
        bearing: s.bearing ?? 0,
        duration: 1800,
        essential: true,
      });
    }

    if (map.getLayer("country-highlight")) {
      const highlightConfig = s.highlight;
      const setHighlightFilter = (f) => {
        map.setFilter("country-highlight", f);
        map.setFilter("country-highlight-border", s.hideBorders ? ["==", "WB_A3", ""] : f);
      };

      if (s.choropleth && CHOROPLETH_DATASETS[s.choropleth]) {
        const data = CHOROPLETH_DATASETS[s.choropleth];
        const stops = s.legend?.stops ?? [];
        const notComparable = s.legend?.notComparableCodes ?? [];

        const comparableCodes = ALL_SSA_CODES.filter(
          (c) => !notComparable.includes(c),
        );
        const valueExpr = [
          "match",
          ["get", "WB_A3"],
          ...Object.entries(data).flat(),
          0,
        ];

        const stopArgs = [];
        for (const stop of stops) stopArgs.push(stop.value, stop.color);
        const colorExpr = ["interpolate", ["linear"], valueExpr, ...stopArgs];

        map.setPaintProperty("country-highlight", "fill-color", colorExpr);
        setHighlightFilter([
          "in",
          ["get", "WB_A3"],
          ["literal", comparableCodes],
        ]);

        if (map.getLayer("country-hatch")) {
          map.setFilter(
            "country-hatch",
            notComparable.length
              ? ["in", ["get", "WB_A3"], ["literal", notComparable]]
              : ["==", "WB_A3", ""],
          );
        }
      } else if (!highlightConfig) {
        setHighlightFilter(["==", "WB_A3", ""]);
        if (map.getLayer("country-hatch"))
          map.setFilter("country-hatch", ["==", "WB_A3", ""]);
      } else if (Array.isArray(highlightConfig)) {
        map.setPaintProperty(
          "country-highlight",
          "fill-color",
          DEFAULT_HIGHLIGHT_COLOR,
        );
        setHighlightFilter(
          highlightConfig.length
            ? ["in", ["get", "WB_A3"], ["literal", highlightConfig]]
            : ["==", "WB_A3", ""],
        );
        if (map.getLayer("country-hatch"))
          map.setFilter("country-hatch", ["==", "WB_A3", ""]);
      } else if (typeof highlightConfig === "object") {
        let matchExpr = ["match", ["get", "WB_A3"]];
        let allCodes = [];
        for (const [color, codes] of Object.entries(highlightConfig)) {
          if (codes && codes.length > 0) {
            matchExpr.push(codes);
            matchExpr.push(color);
            allCodes.push(...codes);
          }
        }
        if (allCodes.length === 0) {
          setHighlightFilter(["==", "WB_A3", ""]);
        } else {
          matchExpr.push("rgba(0,0,0,0)");
          map.setPaintProperty("country-highlight", "fill-color", matchExpr);
          setHighlightFilter(["in", ["get", "WB_A3"], ["literal", allCodes]]);
        }
        if (map.getLayer("country-hatch"))
          map.setFilter("country-hatch", ["==", "WB_A3", ""]);
      }
    }

    if (map.getLayer("kenyan-counties-fill")) {
      map.setPaintProperty(
        "kenyan-counties-fill",
        "fill-opacity",
        s.showCounties ? 1 : 0,
      );
      const showBorders = s.showCounties && s.showCountyBorders !== false;
      map.setPaintProperty(
        "kenyan-counties-border",
        "line-opacity",
        showBorders ? 0.8 : 0,
      );

      if (s.showCounties && s.countyChoropleth === "deaths") {
        const matchArgs = [];
        for (const [county, count] of Object.entries(COUNTY_DEATHS)) {
          matchArgs.push(county, count);
        }
        const valueExpr = ["match", ["get", "COUNTY"], ...matchArgs, 0];
        const colorExpr = [
          "interpolate", ["linear"], valueExpr,
          0,   "#fff5f0",
          25,  "#fc9272",
          65,  "#de2d26",
          146, "#67000d",
        ];
        map.setPaintProperty("kenyan-counties-fill", "fill-color", colorExpr);
      } else {
        map.setPaintProperty("kenyan-counties-fill", "fill-color", "#013E51");
      }
    }

    if (map.getLayer("kenyan-counties-border")) {
      map.setPaintProperty(
        "kenyan-counties-border",
        "line-color",
        s.showCounties ? "#ffffff" : "#013E51",
      );
    }

    const labelFeatures = (s.labels ?? []).map((l) => {
      const defaults = labelDefaults[l.name] || {};
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [l.lng, l.lat] },
        properties: {
          name: l.displayName || l.name,
          anchor: l.anchor ?? defaults.anchor ?? "center",
          offset: l.offset ?? defaults.offset ?? [0, 0],
        },
      };
    });
    const src = map.getSource("step-labels");
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features: mobile.current ? [] : labelFeatures,
      });
    }

    const hasLabels = s.labels && s.labels.length > 0;
    if (map.getLayer("place_country_minor")) {
      map.setLayoutProperty(
        "place_country_minor",
        "visibility",
        hasLabels || s.hideLabels ? "none" : "visible",
      );
    }
    if (map.getLayer("place_country_major")) {
      map.setLayoutProperty(
        "place_country_major",
        "visibility",
        hasLabels || s.hideLabels ? "none" : "visible",
      );
    }
  }

  $effect(() => {
    if (mapLoaded && scrollIndex !== undefined) {
      applyStep(scrollIndex);
    }
  });

  $effect(() => {
    if (!mapLoaded) return;
    const textField =
      activeLang === "en"
        ? "{name:en}"
        : ["coalesce", ["get", `name:${activeLang}`], ["get", "name:en"]];
    map.setLayoutProperty("place_country_minor", "text-field", textField);
    map.setLayoutProperty("place_country_major", "text-field", textField);
  });

  onMount(() => {
    const initStep = steps[0];
    const initCenter =
      mobile.current && initStep.mobile?.center
        ? initStep.mobile.center
        : initStep.center;
    const initZoom =
      mobile.current && initStep.mobile?.zoom != null
        ? initStep.mobile.zoom
        : initStep.zoom;

    map = new Map({
      container: mapContainer,
      style: /** @type {any} */ ({
        ...customStyle,
        projection: { type: "globe" },
      }),
      center: initCenter,
      zoom: initZoom,
      pitch: initStep.pitch ?? 0,
      bearing: initStep.bearing ?? 0,
      interactive: false,
      maxParallelImageRequests: 6,
    });

    const updateLive = () => {
      const c = map.getCenter();
      liveCenter = [c.lng, c.lat];
      liveZoom = map.getZoom();
      livePitch = map.getPitch();
      liveBearing = map.getBearing();
    };
    map.on("move", updateLive);
    updateLive();

    map.on("load", () => {
      const hatchSize = 8;
      const hatchData = new Uint8Array(hatchSize * hatchSize * 4);
      for (let y = 0; y < hatchSize; y++) {
        for (let x = 0; x < hatchSize; x++) {
          const idx = (y * hatchSize + x) * 4;
          const isStripe = (x - y + hatchSize) % 4 < 2;
          hatchData[idx + 0] = isStripe ? 170 : 217;
          hatchData[idx + 1] = isStripe ? 170 : 217;
          hatchData[idx + 2] = isStripe ? 170 : 217;
          hatchData[idx + 3] = 255;
        }
      }
      map.addImage("hatch", {
        width: hatchSize,
        height: hatchSize,
        data: hatchData,
      });

      map.addSource("countries", { type: "geojson", data: wbBoundariesUrl });
      map.addLayer(
        {
          id: "country-borders",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#5D9890",
            "line-opacity": 0,
            "line-width": {
              base: 1.1,
              stops: [
                [3, 1],
                [22, 20],
              ],
            },
            "line-blur": {
              base: 1,
              stops: [
                [0, 0.4],
                [22, 4],
              ],
            },
          },
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "country-highlight",
          type: "fill",
          source: "countries",
          paint: {
            "fill-color": DEFAULT_HIGHLIGHT_COLOR,
            "fill-color-transition": { duration: 600, delay: 0 },
            "fill-opacity": 1,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
          filter: ["==", "WB_A3", ""],
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "country-hatch",
          type: "fill",
          source: "countries",
          paint: {
            "fill-pattern": "hatch",
            "fill-opacity": 0.9,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
          filter: ["==", "WB_A3", ""],
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "country-highlight-border",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#5C978F",
            "line-width": {
              base: 1.1,
              stops: [
                [3, 1],
                [22, 20],
              ],
            },
            "line-blur": {
              base: 1,
              stops: [
                [0, 0.4],
                [22, 4],
              ],
            },
          },
          filter: ["==", "WB_A3", ""],
        },
        "place_country_minor",
      );

      map.addSource("kenyan-counties", {
        type: "geojson",
        data: kenyanCountiesUrl,
      });
      map.addLayer(
        {
          id: "kenyan-counties-fill",
          type: "fill",
          source: "kenyan-counties",
          paint: {
            "fill-color": "#013E51",
            "fill-opacity": 1,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "kenyan-counties-border",
          type: "line",
          source: "kenyan-counties",
          paint: {
            "line-color": "#013E51",
            "line-width": 0.3,
            "line-opacity": 0.8,
            "line-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );

      map.addSource("step-labels", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "step-labels",
        type: "symbol",
        source: "step-labels",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Regular"],
          "text-size": 10,
          "text-anchor": ["get", "anchor"],
          "text-offset": ["get", "offset"],
        },
        paint: {
          "text-color": "#1a1a1a",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });
      mapLoaded = true;
    });

    if (dev) {
      const onKey = (e) => {
        if (e.key !== "`") return;
        const t = e.target;
        if (
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.isContentEditable)
        )
          return;
        e.preventDefault();
        devMode = !devMode;
        setMapInteractive(devMode);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  });

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div class="scrolly-globe-wrapper">
  <Nav />
  <div class="map-wrap">
    <div class="map" bind:this={mapContainer}></div>
  </div>

  <div class="scrolly-container">
    <Scrolly bind:value={scrollIndex}>
      {#each steps as step, i (step)}
        <div class={["step", scrollIndex === i && "active"]}>
          {#if step.text || step.legend || step.title}
            <div class="step-box" dir={isRtl ? "rtl" : undefined}>
              {#if step.text}
                <div class="step-text">{@html marked.parse(step.text)}</div>
              {/if}
              {#if step.legend}
                {#if typeof step.legend === "string"}
                  <div class="step-legend">
                    <span
                      class="legend-swatch"
                      style="background: {DEFAULT_HIGHLIGHT_COLOR}"
                    ></span>
                    {step.legend}
                  </div>
                {:else if step.legend.type === "gradient"}
                  {@const stops = step.legend.stops ?? []}
                  {@const gradientCss = stops.map((s) => s.color).join(", ")}
                  <div class="step-legend-gradient">
                    <div class="gradient-row">
                      <div class="gradient-col">
                        <div
                          class="gradient-bar"
                          style="background: linear-gradient(to right, {gradientCss})"
                        ></div>
                        <div class="gradient-ticks">
                          {#each stops as stop}
                            <span>{stop.label}</span>
                          {/each}
                        </div>
                      </div>
                      {#if step.legend.title}
                        <span class="gradient-label">{step.legend.title}</span>
                      {/if}
                    </div>
                    {#if step.legend.extras?.length}
                      <div class="gradient-extras">
                        {#each step.legend.extras as extra}
                          <div class="legend-item">
                            <span
                              class="legend-swatch {extra.hatched
                                ? 'hatched'
                                : ''}"
                              style={extra.color
                                ? `background: ${extra.color}`
                                : ""}
                            ></span>
                            <span>{extra.label}</span>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="step-legend-complex">
                    {#if step.legend.title}
                      <div class="legend-title">
                        {@html marked.parseInline(step.legend.title)}
                      </div>
                    {/if}
                    {#if step.legend.items}
                      <div
                        class="legend-items"
                        class:stacked={step.legend.stack}
                      >
                        {#each step.legend.items as item}
                          <div class="legend-item">
                            <span
                              class="legend-swatch"
                              style="background: {item.color}"
                            ></span>
                            <span>{item.label}</span>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </Scrolly>
  </div>

  {#if dev && devMode}
    <div class="dev-panel">
      <div class="dev-hint">press <kbd>`</kbd> to exit</div>
      <div class="dev-row">
        <span>step</span><strong>{scrollIndex ?? "–"}</strong>
      </div>
      <div class="dev-row">
        <span>center</span><strong
          >[{fmt(liveCenter[0])}, {fmt(liveCenter[1])}]</strong
        >
      </div>
      <div class="dev-row">
        <span>zoom</span><strong>{fmt(liveZoom)}</strong>
      </div>
      <div class="dev-row">
        <span>pitch</span><strong>{fmt(livePitch, 1)}</strong>
      </div>
      <div class="dev-row">
        <span>bearing</span><strong>{fmt(liveBearing, 1)}</strong>
      </div>
      <pre class="dev-snippet">{currentYamlSnippet()}</pre>
      <button class="dev-btn" onclick={copySnippet}
        >{copyStatus || "copy YAML"}</button
      >
    </div>
  {/if}
</div>

<style>
  .scrolly-globe-wrapper {
    position: relative;
    width: 100%;
    isolation: isolate;
  }

  .map-wrap {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .scrolly-container {
    position: relative;
    z-index: 1;
    pointer-events: none;
    margin-top: -100vh;
  }

  .step {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-box {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px 24px;
    max-width: 560px;
    width: 85%;
    font-family: inherit;
    font-size: 14.5px;
    line-height: 1.65;
    font-weight: 400;
    color: #333;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .step:not(.active) .step-box {
    opacity: 0.15;
    transform: scale(0.95);
  }

  .step-text :global(p) {
    margin: 0;
  }

  .step-text :global(p + p) {
    margin-top: 0.75em;
  }

  .step-legend {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14.5px;
    font-family: inherit;
    color: #555;
  }

  .step-legend-complex {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .legend-title {
    font-family: inherit;
    font-size: 13.5px;
    color: #1a1a1a;
  }

  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .legend-items.stacked {
    flex-direction: column;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: inherit;
    font-size: 13.5px;
    color: #555;
  }

  .legend-swatch {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    border-radius: 2px;
  }

  .step-legend-gradient {
    margin-top: 14px;
  }

  .gradient-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .gradient-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
    width: 120px;
  }

  .gradient-bar {
    height: 10px;
    border-radius: 3px;
    width: 100%;
  }

  .gradient-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #5e5e5e;
    font-family: inherit;
  }

  .gradient-label {
    font-size: 13px;
    color: #5e5e5e;
    font-family: inherit;
    line-height: 1.4;
  }

  .gradient-extras {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .legend-swatch.hatched {
    background-color: #d9d9d9;
    background-image: repeating-linear-gradient(
      -45deg,
      #aaa 0px,
      #aaa 1.5px,
      transparent 1.5px,
      transparent 4px
    );
  }

  .dev-panel {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 10;
    background: rgba(20, 20, 20, 0.92);
    color: #f0f0f0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    padding: 12px 14px;
    border-radius: 6px;
    min-width: 240px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .dev-hint {
    font-size: 11px;
    color: #888;
    margin-bottom: 6px;
  }

  .dev-hint kbd {
    background: #333;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: inherit;
    color: #ddd;
  }

  .dev-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 2px 0;
  }

  .dev-row span {
    color: #999;
  }

  .dev-snippet {
    margin: 10px 0 8px;
    padding: 8px;
    background: #000;
    border-radius: 4px;
    white-space: pre;
    overflow-x: auto;
    font-size: 11.5px;
    line-height: 1.45;
  }

  .dev-btn {
    width: 100%;
    padding: 6px 10px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font: inherit;
  }

  .dev-btn:hover {
    background: #1d4ed8;
  }
</style>
