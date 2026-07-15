# SEO checklist for new pages/articles

This site's SEO is centralized in two files:

- [`src/lib/seo.ts`](src/lib/seo.ts) — site-wide constants (domain, name, Twitter handle)
- [`src/lib/components/Seo.svelte`](src/lib/components/Seo.svelte) — the component every page renders to emit `<title>`, meta description, canonical link, Open Graph, Twitter Card, and JSON-LD

Every route under `src/routes/**/+page.svelte` should render `<Seo ... />` once, near the top of the markup (after the `</script>` tag, before the rest of the page). Look at [`src/routes/femicide/+page.svelte`](src/routes/femicide/+page.svelte) or [`src/routes/tanzania-vat-reform/+page.svelte`](src/routes/tanzania-vat-reform/+page.svelte) as templates.

## 1. Add the `<Seo>` component

```svelte
<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import { SITE_URL } from "$lib/seo";

  const TITLE = "Your Article Headline";
  const DESCRIPTION = "One or two sentences, under ~160 characters, that make someone want to click. Include the country/topic and 'The Granule Africa' framing if it fits naturally.";
  const PUBLISHED_TIME = "2026-07-15T00:00:00Z"; // ISO date, only for articles

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/your-og-image.jpg`],
    datePublished: PUBLISHED_TIME,
    author: { "@type": "Person", name: "Author Name" }, // or "@type": "Organization"
    publisher: {
      "@type": "Organization",
      name: "The Granule Africa",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/your-route` },
  };
</script>

<Seo
  title="{TITLE} | The Granule Africa"
  description={DESCRIPTION}
  path="/your-route"
  image="/your-og-image.jpg"
  type="article"
  author="Author Name"
  publishedTime={PUBLISHED_TIME}
  keywords="comma, separated, topical, terms"
  {jsonLd}
/>
```

For non-article pages (landing pages, section indexes), omit `author`/`publishedTime`/`jsonLd` and leave `type` as the default `"website"`.

### Prop reference

| Prop | Required | Notes |
|---|---|---|
| `title` | yes | Include `\| The Granule Africa` at the end. Keep under ~60 characters where possible so it doesn't truncate in search results. |
| `description` | yes | 120–160 characters. This is what shows under the title in Google — write it to earn the click, don't just restate the title. |
| `path` | yes (default `/`) | The route path, e.g. `/tanzania-vat-reform`. Used to build the canonical URL and `og:url`. |
| `image` | yes | Either an absolute URL or a path served from `static/` (e.g. `/my-image.png`). Prefer ~1200×630 for a clean Open Graph/Twitter card crop. |
| `type` | no | `"website"` (default) or `"article"`. |
| `author` | no | Only for `type="article"`. |
| `publishedTime` | no | ISO 8601 date, only for `type="article"`. |
| `keywords` | no | Low SEO value today but cheap to add; keep it topical, not stuffed. |
| `noindex` | no | Set `true` for drafts, duplicate/experimental pages, or anything not ready for search engines (see `/femicide-counties` for an example). |
| `jsonLd` | no | A plain object or array of objects — see the article example above. Helps Google show rich results (byline, publish date) for stories. |

## 2. Add the page to the sitemap

Open [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts) and add an entry to the `pages` array:

```ts
{ path: "/your-route", changefreq: "monthly", priority: 0.8 },
```

Skip this step (or add the page with `noindex` on the `<Seo>` component instead) if the page is a draft, a duplicate, or otherwise shouldn't be indexed — see how `/femicide-counties` is handled for reference.

## 3. Images

- Every `<img>` needs descriptive `alt` text — not "image1.png", but what's actually shown ("Map of femicide deaths by Kenyan county, 2020–2025").
- The `image` you pass to `<Seo>` is what shows up when the article is shared on WhatsApp, Twitter/X, LinkedIn, etc. Test it — a broken or missing OG image is one of the most common reasons a shared link looks unprofessional.
- Compress large images before adding them (the `tanzania-header.webp` in `static/` is already 600KB+; don't add anything heavier without compressing first — it also hurts Core Web Vitals, which Google uses as a ranking signal).

## 4. Headings and content

- One `<h1>` per page — the article/page title. Don't reuse `<h1>` for section headers; use `<h2>`/`<h3>` for those.
- Write the first paragraph so it stands alone — search snippets and social previews often pull from it.
- Internal links: link to related stories from within the article body (e.g. a Tanzania economy piece could link to other economy stories) — this helps both readers and search crawlers discover your other work.

## 5. Verify before shipping

```bash
npm run dev
```

Then in another terminal:

```bash
curl -s http://localhost:5173/your-route | grep -o '<title>.*</title>\|<meta property="og:[^>]*>\|<link rel="canonical"[^>]*>'
curl -s http://localhost:5173/sitemap.xml
```

Confirm:
- `<title>` and `og:title` match what you intended
- `og:image` resolves to a real, absolute URL (open it in a browser)
- `<link rel="canonical">` points to the right path
- the new route shows up in `/sitemap.xml` (unless intentionally excluded)

You can also paste the live URL (once deployed) into a social debugger to check the preview card:
- Facebook/OG: https://developers.facebook.com/tools/debug/
- Twitter/X: https://cards-dev.twitter.com/validator (may require login)

## 6. After deploying a new article

- Submit the URL in Google Search Console ("Request indexing") so it doesn't wait for organic crawl discovery.
- Share it — inbound links/shares from social and other sites remain one of the strongest ranking signals for new content.

## Site-wide config

If the production domain or Twitter handle ever changes, update them once in [`src/lib/seo.ts`](src/lib/seo.ts) — every page's canonical URL, OG tags, and Twitter card pick it up automatically. `SITE_URL` is currently a placeholder (`https://thegranule.org`) — confirm it matches the real production domain before launch.
