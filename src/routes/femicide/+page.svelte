<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { mountReactApp, unmountReactApp } from "./mountReact";
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/seo";

  let container: HTMLElement | null = null;

  const TITLE = "The Names We Don't Say: Mapping Kenya's Femicide Crisis";
  const DESCRIPTION =
    "A data investigation into the epidemic of gender-based violence across Kenya's counties — told through the women lost. An interactive data story from The Granule Africa.";
  const PUBLISHED_TIME = "2026-03-01T00:00:00Z";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/Femicide.png`],
    datePublished: PUBLISHED_TIME,
    author: {
      "@type": "Organization",
      name: "The Granule Africa",
    },
    publisher: {
      "@type": "Organization",
      name: "The Granule Africa",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/femicide`,
    },
  };

  onMount(() => {
    if (container) {
      mountReactApp(container);
    }
  });

  onDestroy(() => {
    unmountReactApp();
  });
</script>

<Seo
  title="{TITLE} | The Granule Africa"
  description={DESCRIPTION}
  path="/femicide"
  image="/Femicide.png"
  type="article"
  publishedTime={PUBLISHED_TIME}
  keywords="Kenya femicide, gender-based violence Kenya, femicide data Kenya, women safety Africa, data journalism Kenya"
  {jsonLd}
/>

<div bind:this={container} id="react-femicide-root" class="min-h-screen"></div>
