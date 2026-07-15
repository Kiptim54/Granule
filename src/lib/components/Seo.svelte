<script lang="ts">
  import { SITE_NAME, TWITTER_HANDLE, absoluteUrl } from "$lib/seo";

  let {
    title,
    description,
    path = "/",
    image,
    type = "website",
    author,
    publishedTime,
    keywords,
    noindex = false,
    jsonLd,
  }: {
    title: string;
    description: string;
    path?: string;
    image: string;
    type?: "website" | "article";
    author?: string;
    publishedTime?: string;
    keywords?: string;
    noindex?: boolean;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  } = $props();

  let canonical = $derived(absoluteUrl(path));
  let ogImage = $derived(absoluteUrl(image));
  let jsonLdScript = $derived(
    jsonLd
      ? JSON.stringify(jsonLd).replace(/</g, "\\u003c")
      : null,
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}
  <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
  <link rel="canonical" href={canonical} />

  <!-- Open Graph -->
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:locale" content="en_US" />
  {#if type === "article" && publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if type === "article" && author}
    <meta property="article:author" content={author} />
  {/if}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={TWITTER_HANDLE} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  {#if jsonLdScript}
    {@html `<script type="application/ld+json">${jsonLdScript}</script>`}
  {/if}
</svelte:head>
