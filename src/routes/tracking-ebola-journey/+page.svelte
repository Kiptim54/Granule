<script>
  import { onMount, onDestroy, untrack } from "svelte";
  import Nav from "../../lib/components/Nav.svelte";
  import Footer from "../../lib/components/Footer.svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { dev } from "$app/environment";
  import pkg from "maplibre-gl";
  const { Map, LngLatBounds, Popup } = pkg;
  import "maplibre-gl/dist/maplibre-gl.css";
  import { parse } from "yaml";
  import { marked } from "marked";
  import { geoInterpolate } from "d3-geo";
  import Scrolly from "$lib/components/Scrolly.svelte";
  import configRaw from "./config.yaml?raw";
  import routeCarIconSvg from "./route-car.svg?raw";
  import routeFlightIconSvg from "./route-flight.svg?raw";
  import customStyle from "./style.json";
  // import wbBoundaries from '$lib/assets/wb-boundaries.json';
  import wbBoundariesUrl from "./wb-boundaries.json?url";
  import kenyanCountiesUrl from "./kenyan-counties.geojson?url";
  import UgandaCountiesUrl from "./uga_admin2.geojson?url";
  import congoCountiesUrl from "./congo-admin2.geojson?url";
  import congoProvincesUrl from "./congo-provinces.geojson?url";
  import countyDeathsData from "./count-deaths.json";
  import ebolaProvinceData from "./ebola-province-data.json";
  import Seo from "$lib/components/Seo.svelte";
  import CircleChevronDown from "@lucide/svelte/icons/chevron-down";
  import Tracing from "./components/tracing.svelte";

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
  const COUNTY_COLORS = { fill: "#ffffff", border: "#000000" };
  const labelDefaults = $derived(config.labelDefaults || {});

  /** @type {Record<string, Record<string, number>>} */
  const CHOROPLETH_DATASETS = {};

  const COUNTY_DEATHS = countyDeathsData.deaths_by_county;
  /** @type {Record<string, {name: string, cases: number, deaths: number, cfr: number}>} */
  const EBOLA_PROVINCES = ebolaProvinceData.provinces;

  const mobile = new MediaQuery("max-width: 768px");

  /** @type {any} */
  let map;
  let mapContainer;
  let scrollIndex = $state(undefined);
  const currentStep = $derived(scrollIndex == null ? null : steps[scrollIndex]);
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

  /**
   * @param {string} svg
   * @returns {Promise<HTMLImageElement>}
   */
  async function loadSvgIcon(svg) {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    return image;
  }

  // function selectProvinceMetric(
  //   /** @type {"cases" | "deaths" | "cfr"} */ metric,
  // ) {
  //   activeProvinceMetric = metric;
  //   updateProvinceMetric();
  // }

  function applyStep(idx) {
    if (!map || idx == null) return;
    const s = steps[idx];
    if (map.getLayer("country-borders")) {
      map.setPaintProperty(
        "country-borders",
        "line-opacity",
        idx === 0 ? 0 : 1,
      );
    }

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
        map.setFilter(
          "country-highlight-border",
          s.hideBorders || idx === 0 ? ["==", "WB_A3", ""] : f,
        );
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

    if (map.getLayer("country-highlight-labels")) {
      const countryLabels = s.countryLabels ?? [];
      map.setFilter(
        "country-highlight-labels",
        countryLabels.length
          ? ["in", ["get", "WB_A3"], ["literal", countryLabels]]
          : ["==", "WB_A3", ""],
      );
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
        showBorders ? 0.3 : 0,
      );

      // if (s.showCounties && s.countyChoropleth === "deaths") {
      //   const matchArgs = [];
      //   for (const [county, count] of Object.entries(COUNTY_DEATHS)) {
      //     matchArgs.push(county, count);
      //   }
      //   const valueExpr = ["match", ["get", "COUNTY"], ...matchArgs, 0];
      //   const colorExpr = [
      //     "interpolate",
      //     ["linear"],
      //     valueExpr,
      //     0,
      //     "#fff5f0",
      //     25,
      //     "#fc9272",
      //     65,
      //     "#de2d26",
      //     146,
      //     "#67000d",
      //   ];
      //   map.setPaintProperty("kenyan-counties-fill", "fill-color", colorExpr);
      // } else {
      //   map.setPaintProperty(
      //     "kenyan-counties-fill",
      //     "fill-color",
      //     COUNTY_COLORS.fill,
      //   );
      //   map.setPaintProperty(
      //     "congo-provinces-fill",
      //     "fill-color",
      //     COUNTY_COLORS.fill,
      //   );
      // }
    }

    if (map.getLayer("kenyan-counties-border")) {
      map.setPaintProperty(
        "kenyan-counties-border",
        "line-color",
        COUNTY_COLORS.border,
      );
    }

    if (map.getLayer("uganda-counties-fill")) {
      map.setPaintProperty(
        "uganda-counties-fill",
        "fill-opacity",
        s.showCounties ? 1 : 0,
      );
      const showBorders = s.showCounties && s.showCountyBorders !== false;
      map.setPaintProperty(
        "uganda-counties-border",
        "line-opacity",
        showBorders ? 0.4 : 0,
      );
      map.setPaintProperty(
        "uganda-counties-fill",
        "fill-color",
        COUNTY_COLORS.fill,
      );
    }

    if (map.getLayer("uganda-counties-border")) {
      map.setPaintProperty(
        "uganda-counties-border",
        "line-color",
        COUNTY_COLORS.border,
      );
    }

    if (map.getLayer("congo-counties-fill")) {
      map.setPaintProperty(
        "congo-counties-fill",
        "fill-opacity",
        s.showCounties ? 1 : 0,
      );
      const showBorders = s.showCounties && s.showCountyBorders !== false;
      map.setPaintProperty(
        "congo-counties-border",
        "line-opacity",
        showBorders ? 0.4 : 0,
      );
      map.setPaintProperty(
        "congo-counties-fill",
        "fill-color",
        COUNTY_COLORS.fill,
      );
    }

    if (map.getLayer("congo-provinces-fill")) {
      const showProvinceDeaths = s.showProvinces === true;
      const provinceValues = Object.entries(EBOLA_PROVINCES).flatMap(
        ([province, data]) => [province, data.deaths],
      );
      const provinceDeathsExpr = [
        "match",
        ["get", "shapeName"],
        ...provinceValues,
        -1,
      ];
      const colorExpr = [
        "case",
        [">", provinceDeathsExpr, 0],
        [
          "step",
          provinceDeathsExpr,
          "#fff5f0", // 0–99
          100,
          "#fc9272", // 100–499
          500,
          "#de2d26", // 500–1999
          2000,
          "#a50f15", // 2000–2999
          3000,
          "#67000d", // 3000+
        ],
        "#ffffff",
      ];

      map.setPaintProperty(
        "congo-provinces-fill",
        "fill-color",
        showProvinceDeaths ? colorExpr : "#deded8",
      );
      map.setPaintProperty(
        "congo-provinces-fill",
        "fill-opacity",
        showProvinceDeaths ? 0.82 : 0,
      );
      map.setPaintProperty(
        "congo-provinces-border",
        "line-opacity",
        showProvinceDeaths ? 0.8 : 0,
      );
      map.setLayoutProperty(
        "congo-province-labels",
        "visibility",
        showProvinceDeaths ? "visible" : "none",
      );
      map.setFilter(
        "congo-province-labels",
        showProvinceDeaths
          ? [">", provinceDeathsExpr, 0]
          : ["==", "shapeName", ""],
      );
      map.setLayoutProperty(
        "congo-province-labels",
        "text-field",
        // idx !== 2 &&
        s.showProvinces ? ["concat", ["get", "shapeName"], "\n"] : "",
      );
    }

    if (map.getLayer("congo-counties-border")) {
      map.setPaintProperty(
        "congo-counties-border",
        "line-color",
        COUNTY_COLORS.border,
      );
    }

    /** @type {Array<{name: string, lng: number, lat: number, number?: number, color?: string, transportToNext?: "road" | "flight" | "car", displayName?: string, anchor?: string, offset?: [number, number], marker?: boolean}>} */
    const stepLabels = s.labels ?? [];
    const numberedLabels = stepLabels
      .filter((label) => typeof label.number === "number")
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    const routeFeatures = numberedLabels
      .slice(0, -1)
      .flatMap((label, index) => {
        const nextLabel = numberedLabels[index + 1];
        if (!nextLabel || !label.transportToNext) return [];
        const interpolate = geoInterpolate(
          [label.lng, label.lat],
          [nextLabel.lng, nextLabel.lat],
        );
        const coordinates = Array.from({ length: 65 }, (_, pointIndex) =>
          interpolate(pointIndex / 64),
        );
        const midpoint = interpolate(0.5);
        const beforeMidpoint = interpolate(0.49);
        const afterMidpoint = interpolate(0.51);
        const latitudeRadians = (midpoint[1] * Math.PI) / 180;
        const rotation =
          (Math.atan2(
            (afterMidpoint[0] - beforeMidpoint[0]) * Math.cos(latitudeRadians),
            afterMidpoint[1] - beforeMidpoint[1],
          ) *
            180) /
          Math.PI;
        const modeIcon =
          label.transportToNext === "flight" || label.transportToNext === "car"
            ? [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: interpolate(0.15),
                  },
                  properties: {
                    kind: "route-mode-icon",
                    mode: label.transportToNext,
                    rotation,
                  },
                },
              ]
            : [];
        return [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: { kind: "route", mode: label.transportToNext },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: midpoint },
            properties: {
              kind: "route-arrow",
              mode: label.transportToNext,
              rotation,
            },
          },
          ...modeIcon,
        ];
      });
    const labelFeatures = [
      ...routeFeatures,
      ...stepLabels.map((l) => {
        const defaults = labelDefaults[l.name] || {};
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [l.lng, l.lat] },
          properties: {
            name: ["Kenya", "Uganda", "DR Congo"].includes(l.name)
              ? (l.displayName || l.name).toUpperCase()
              : l.displayName || l.name,
            kind: l.marker === false ? "label" : "town",
            number: l.number,
            color: l.color ?? "#52090d",
            anchor:
              l.anchor ?? defaults.anchor ?? (l.number ? "left" : "center"),
            offset:
              l.offset ?? defaults.offset ?? (l.number ? [1.4, 0] : [0, 0]),
          },
        };
      }),
    ];
    const src = map.getSource("step-labels");
    if (src) {
      src.setData({
        type: "FeatureCollection",
        features: labelFeatures,
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
      interactive: true,
      attributionControl: false,
      maxParallelImageRequests: 6,
    });

    map.addControl(
      new pkg.AttributionControl({
        compact: true,
      }),
      "bottom-right",
    );
    setMapInteractive(false);

    const updateLive = () => {
      const c = map.getCenter();
      liveCenter = [c.lng, c.lat];
      liveZoom = map.getZoom();
      livePitch = map.getPitch();
      liveBearing = map.getBearing();
    };
    map.on("move", updateLive);
    updateLive();

    map.on("load", async () => {
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

      const [flightIcon, carIcon] = await Promise.all([
        loadSvgIcon(routeFlightIconSvg),
        loadSvgIcon(routeCarIconSvg),
      ]);
      map.addImage("route-flight", flightIcon);
      map.addImage("route-car", carIcon);

      map.addSource("countries", { type: "geojson", data: wbBoundariesUrl });
      map.addLayer(
        {
          id: "country-borders",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#000000",
            "line-opacity": 0,
            "line-width": {
              base: 1.5,
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
          filter: ["in", ["get", "WB_A3"], ["literal", ["DRC", "UGA", "KEN"]]],
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
            "line-color": "#000000",
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
            "fill-color": COUNTY_COLORS.fill,
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
            "line-color": COUNTY_COLORS.border,
            "line-width": 0.3,
            "line-opacity": 0.8,
            "line-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );

      map.addSource("uganda-counties", {
        type: "geojson",
        data: UgandaCountiesUrl,
      });
      map.addLayer(
        {
          id: "uganda-counties-fill",
          type: "fill",
          source: "uganda-counties",
          paint: {
            "fill-color": COUNTY_COLORS.fill,
            "fill-opacity": 1,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "uganda-counties-border",
          type: "line",
          source: "uganda-counties",
          paint: {
            "line-color": COUNTY_COLORS.border,
            "line-width": 0.3,
            "line-opacity": 0.8,
            "line-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );

      map.addSource("congo-counties", {
        type: "geojson",
        data: congoCountiesUrl,
        attribution: "",
      });
      map.addLayer(
        {
          id: "congo-counties-fill",
          type: "fill",
          source: "congo-counties",
          paint: {
            "fill-color": COUNTY_COLORS.fill,
            "fill-opacity": 1,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "congo-counties-border",
          type: "line",
          source: "congo-counties",
          paint: {
            "line-color": COUNTY_COLORS.border,
            "line-width": 0.3,
            "line-opacity": 0.8,
            "line-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );

      map.addSource("congo-provinces", {
        type: "geojson",
        data: congoProvincesUrl,
        attribution: "",
      });
      map.addLayer(
        {
          id: "congo-provinces-fill",
          type: "fill",
          source: "congo-provinces",
          paint: {
            "fill-color": "#deded8",
            "fill-opacity": 0,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );
      map.addLayer(
        {
          id: "congo-provinces-border",
          type: "line",
          source: "congo-provinces",
          paint: {
            "line-color": "#333333",
            "line-width": 0.8,
            "line-opacity": 0,
            "line-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "place_country_minor",
      );
      map.addLayer({
        id: "congo-province-labels",
        type: "symbol",
        source: "congo-provinces",
        filter: ["==", "shapeName", ""],
        layout: {
          visibility: "none",
          "text-field": "",
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
          "text-anchor": "center",
          // "text-transform": "uppercase",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1a1a1a",
          // "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });
      // updateProvinceMetric();

      map.addSource("step-labels", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "step-label-route",
        type: "line",
        source: "step-labels",
        filter: ["==", ["get", "kind"], "route"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": [
            "match",
            ["get", "mode"],
            "road",
            "#8B5A2B",
            "flight",
            "#168A36",
            "car",
            "#2878B5",
            "#777777",
          ],
          "line-width": 2.5,
          "line-dasharray": [1, 2],
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "step-label-route-arrows",
        type: "symbol",
        source: "step-labels",
        filter: [
          "all",
          ["==", ["get", "kind"], "route-arrow"],
          ["==", ["get", "mode"], "road"],
        ],
        layout: {
          "text-field": "▶",
          "text-font": ["Noto Sans Regular"],
          "text-size": 13,
          "text-anchor": "center",
          "text-rotate": ["-", ["get", "rotation"], 90],
          "text-rotation-alignment": "map",
          "text-keep-upright": false,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": [
            "match",
            ["get", "mode"],
            "road",
            "#52090d",
            "flight",
            "#168A36",
            "car",
            "#2878B5",
            "#777777",
          ],
          "text-halo-color": "#fff",
          "text-halo-width": 0.5,
        },
      });
      map.addLayer({
        id: "step-label-route-mode-icons",
        type: "symbol",
        source: "step-labels",
        filter: [
          "all",
          ["==", ["get", "kind"], "route-mode-icon"],
          ["in", ["get", "mode"], ["literal", ["flight", "car"]]],
        ],
        layout: {
          "icon-image": [
            "match",
            ["get", "mode"],
            "flight",
            "route-flight",
            "car",
            "route-car",
            "route-car",
          ],
          "icon-size": 0.85,
          "icon-rotate": [
            "case",
            ["==", ["get", "mode"], "car"],
            ["-", ["get", "rotation"], 180],
            ["get", "rotation"],
          ],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });
      map.moveLayer("country-borders", "step-label-route");
      map.addLayer({
        id: "step-label-points",
        type: "circle",
        source: "step-labels",
        filter: ["==", ["get", "kind"], "town"],
        paint: {
          "circle-radius": 9,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "step-label-numbers",
        type: "symbol",
        source: "step-labels",
        filter: ["has", "number"],
        layout: {
          "text-field": ["to-string", ["get", "number"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
          "text-anchor": "center",
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#fff",
        },
      });
      map.addLayer({
        id: "step-labels",
        type: "symbol",
        source: "step-labels",
        filter: [
          "!",
          ["in", ["get", "name"], ["literal", ["KENYA", "UGANDA", "DR CONGO"]]],
        ],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
          "text-anchor": ["get", "anchor"],
          "text-offset": ["get", "offset"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#1a1a1a",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });
      map.addLayer({
        id: "step-country-labels",
        type: "symbol",
        source: "step-labels",
        filter: [
          "in",
          ["get", "name"],
          ["literal", ["KENYA", "UGANDA", "DR CONGO"]],
        ],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
          "text-anchor": ["get", "anchor"],
          "text-offset": ["get", "offset"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#1a1a1a",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });
      map.addLayer({
        id: "country-highlight-labels",
        type: "symbol",
        source: "countries",
        filter: ["==", "WB_A3", ""],
        layout: {
          "text-field": [
            "match",
            ["get", "WB_A3"],
            "DRC",
            "DR Congo",
            ["get", "NAM_0"],
          ],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
          "text-transform": "uppercase",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1a1a1a",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });
      map.moveLayer("water", "congo-provinces-border");
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

<Seo
  title="Tracing how Ebola Kenya | The Granule Africa"
  description="Tracing the journey of Ebola patient zero in Kenya"
  path="/femicide-counties"
  image="/Femicide.png"
  noindex
/>

<div class="scrolly-globe-wrapper">
  <Nav />
  <section class="container mx-auto pt-20 p-10 grid gap-6 text-balance">
    <p class="w-3/4 font-light mx-auto text-sm text-center font-serif">
      NAIROBI — 15 October 2026 <br /> Brenda Kiptim & Eunice Magwambo
    </p>
    <h1 class="text-4xl md:text-6xl text-center font-bold font-display">
      Tracing Kenya's first
      <span class="text-[#920c1d] font-bolder italic">Ebola</span> Case
    </h1>
    <p class="mx-auto text-lg text-center text-balance font-serif md:w-[75%]">
      On 3 October 2026, a Kenyan businessman landed in Nairobi from Uganda. He
      had travelled through one of the most active Ebola outbreak zones in the
      world. He was diagnosed with Ebola at The Nairobi Hospital and died two
      days later. Kenya now has two confirmed cases and 108 people in
      quarantine.
    </p>
    <p
      class="mx-auto text-lg text-center text-balance font-serif md:w-[75%] mt-2"
    >
      We traced his path in the weeks before he landed in Kenya.
    </p>
    <section
      class=" mx-auto mt-4 flex gap-4 flex-col items-center justify-center"
    >
      <!-- <CircleChevronDown /> -->
      <span class="uppercase font-light font-serif text-gray-500"
        >Scroll to follow the journey</span
      >
      <CircleChevronDown size={30} class="animate-bounce" />
    </section>
  </section>
  <div class="map-wrap bg-gray-50 relative">
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
                {:else if step.legend.type === "route"}
                  <div class="step-legend-complex">
                    {#if step.legend.title}
                      <div class="legend-title font-bold">
                        {@html marked.parseInline(step.legend.title)}
                      </div>
                    {/if}
                    <div class="route-legend-items">
                      {#each step.legend.stops ?? [] as stop (stop.value)}
                        <div class="legend-item">
                          <span
                            class="route-mode-line"
                            style:border-color={stop.color}
                          ></span>
                          <span>{stop.label}</span>
                        </div>
                      {/each}
                    </div>
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
<p class="text-xs text-right text-neutral-500 p-6 italic">
  The chart and story are inspired by the BBC news <a
    href="https://www.bbc.com/news/articles/cqp8gknl1njjo"
    target="_blank"
    class="text-red-900">article</a
  >
  <br />
</p>
<section>
  <Tracing />
  <section class="container mx-auto pt-20 grid p-6 gap-6 md:w-3/4 w-full mb-6">
    <p class="text-lg font-serif w-3/4 mx-auto">
      Contacts are monitored for 21 days from their last possible exposure to
      the virus, with daily symptom and temperature checks. <br /> <br /> The
      Ministry of Health says there is no evidence of spread in the wider
      community. But the clock is not the same for everyone. The second patient
      fell ill while in quarantine, so everyone who has been in contact with him
      since his symptoms began has a count of their own. Until those windows
      close and the 15 people still being traced are found, the picture can
      still change. <br /> <br /> We will keep updating this page as new figures
      are released.
    </p>
  </section>

  <Footer />
</section>

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

  .route-legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .route-mode-line {
    width: 25px;
    border-top: 3px dashed;
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

  @media (max-width: 768px) {
    .step {
      height: 150vh;
    }
  }

  .step-box {
    pointer-events: auto;
    background: #ffffff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px 24px;
    max-width: 560px;
    width: 60%;
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

  @media (max-width: 768px) {
    .province-map-controls {
      top: 70px;
      right: 12px;
      width: min(250px, calc(100vw - 24px));
    }
  }
</style>
