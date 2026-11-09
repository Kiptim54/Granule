<script lang="ts">
  import { onMount } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { SITE_NAME, SITE_URL } from "$lib/seo";

  // ["Email", "hello@The Granuleafrica.com", "mailto:hello@The Granuleafrica.com"], ["Twitter", "@The Granuleafrica", "#"],

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      description:
        "A data storytelling studio combining journalism, technology, and design to reveal the stories hidden in Africa's data.",
      sameAs: ["https://twitter.com/thegranuleafrica"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  ];
  let currentSlide = $state(0);
  let heroVisible = $state(false);
  let sectionsVisible: Record<string, boolean> = $state({});
  let menuOpen = $state(false);

  let { data } = $props();

  // Contact form opens the visitor's email app until a real form backend exists
  const CONTACT_EMAIL = "hello@example.com";

  function sendEnquiry(e: SubmitEvent) {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const org = String(f.get("org") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();

    const subject = `Story enquiry from ${name}${org ? ` (${org})` : ""}`;
    const body = `${message}\n\n—\n${name}\n${email}${org ? `\n${org}` : ""}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const stories = [
    {
      id: 0,
      category: "Health",
      title: "Tracing Kenya's first Ebola Case",
      excerpt:
        "On 3 October 2026, a Kenyan businessman landed in Nairobi from Uganda. He had travelled through one of the most active Ebola outbreak zones in the world. He was diagnosed with Ebola at The Nairobi Hospital and died two days later. Kenya now has two confirmed cases and 108 people in quarantine...",
      date: "October 2026",
      tag: ["Data Story", "Interactive"],
      bg: "var(--color-deep)",
      link: "/tracking-ebola-journey",
      image: "/ebola.gif",
    },
    {
      id: 1,
      category: "Menstrual Health",
      title: "The Price of Dignity",
      excerpt:
        "A Naya Kenya report on the menstrual health crisis in Kenya, and the hidden costs of period poverty.",
      date: "August 2026",
      tag: ["Data Story", "Interactive"],
      bg: "var(--color-bright)",
      link: "/menstrual-health-reforms",
      image: "/menstrual.gif",
    },
    {
      id: 2,
      category: "Economy",
      title:
        "Tanzania’s VAT Refund Revolution: A Quiet Reform with Big Implications",
      excerpt: `When governments unveil annual budgets, headlines focus on the big numbers: spending, growth and tax collection. But sometimes the real story sits quietly in the technical annexes.

`,
      date: "June 2026",
      tag: ["Journalism", "Scrollytelling"],
      bg: "var(--color-ink)",
      link: "/tanzania-vat-reform",
      // image: "/tanzania-header.webp",
      image: "/output.gif",
    },
    {
      id: 3,
      category: "Femicide",
      title: "The Names We Don't Say: Mapping Kenya's Femicide Crisis",
      excerpt:
        "A data investigation into the epidemic of gender-based violence across Kenya's counties — told through the women lost.",
      date: "March 2026",
      tag: ["Data Analysis"],
      bg: "var(--color-deep)",
      link: "/femicide",
      image: "/femicide.gif",
    },
  ];

  const team = [
    {
      name: "Eunice Magwambo",
      role: "Co-Founder · Journalism & Storytelling",
      img: "/eunice.jpeg",
      delay: "0.2s",
      bio: "Eunice leads editorial direction and investigative work at The Granule Africa. She brings a rigorous journalism background and a deep commitment to representing African experiences with accuracy, nuance, and narrative power. Her focus is on stories that move people — not just inform them.",
    },
    {
      name: "Brenda Kiptim",
      role: "Co-Founder · Technology & Data",
      img: "/brenda-linkedin.jpeg",
      delay: "0.1s",
      bio: "Brenda architects the technical and analytical backbone of The Granule Africa. She translates complex datasets into clear, interactive experiences — building the tools and pipelines that let our journalism breathe on screen. She believes data is only as powerful as the design that reveals it.",
    },
  ];

  function nextSlide() {
    currentSlide = (currentSlide + 1) % stories.length;
  }
  function prevSlide() {
    currentSlide = (currentSlide - 1 + stories.length) % stories.length;
  }
  function goToSlide(i: number) {
    currentSlide = i;
  }
  function closeMenu() {
    menuOpen = false;
  }

  onMount(() => {
    setTimeout(() => (heroVisible = true), 100);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            sectionsVisible[e.target.getAttribute("data-section") ?? ""] = true;
            sectionsVisible = { ...sectionsVisible };
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll("[data-section]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<Seo
  title="The Granule Africa — Data Storytelling, Journalism & African Data Stories"
  description="The Granule Africa is a data storytelling studio uncovering the stories hidden in Africa's data — combining investigative journalism, data analysis, and interactive design to tell African stories accurately and with humanity."
  path="/"
  image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&auto=format&fit=crop"
  keywords="data storytelling, data journalism, African data stories, data visualization Africa, investigative journalism Africa, Kenya data journalism, interactive journalism"
  {jsonLd}
/>

<!-- ───────────── NAV ───────────── -->
<Nav />

<!-- ───────────── HERO ───────────── -->
<!-- <section
  id="home"
  class="relative min-h-screen bg-ink pt-[62px] md:pt-[70px]"
  style="display:grid; grid-template-rows:1fr auto;"
>
  <div class="absolute inset-0 overflow-hidden">
    <img
      src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&auto=format&fit=crop"
      alt="Africa landscape"
      class="w-full h-full object-cover opacity-35"
      style="filter:grayscale(30%) contrast(1.1);"
    />
    <div
      class="absolute inset-0"
      style="background:linear-gradient(to bottom,rgba(28,28,28,.3) 0%,rgba(28,28,28,.5) 50%,rgba(28,28,28,.92) 100%);"
    ></div>
  </div>

  <div
    class="hero-text relative z-10 flex flex-col justify-end px-6 md:px-12 pb-10 md:pb-12 pt-16 md:pt-20 max-w-4xl"
    class:visible={heroVisible}
  >
    <p
      class="font-mono text-sm md:text-sm tracking-[0.18em] uppercase text-bright mb-4 md:mb-5"
    >
      Data Storytelling Studio
    </p>
    <h1
      class="font-display font-bold leading-none text-paper mb-5 md:mb-6"
      style="font-size:clamp(3rem,10vw,7rem); letter-spacing:-0.01em;"
    >
      The<br /><span class="font-script italic font-semibold text-bright text-[1.05em]"> Granule</span>
    </h1>
    <p
      class="font-serif font-light italic text-paper/80 leading-relaxed text-base md:text-lg w-full"
    >
      We uncover the stories hidden in Africa's data — using journalism,
      technology, and design to reveal what the numbers mean for real people.
    </p>
  </div>

  <div
    class="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 md:py-5 border-t border-paper/20"
  >
    <span class="font-mono text-sm tracking-widest uppercase text-paper/50"
      >Data · Journalism · Africa</span
    >
    <div
      class="hidden sm:flex items-center gap-3 font-mono text-sm tracking-widest uppercase text-paper/50"
    >
      Scroll
      <div class="flex flex-col gap-[3px]">
        <span class="scroll-bar block w-px h-1.5 bg-paper/40"></span>
        <span class="scroll-bar block w-px h-1.5 bg-paper/40"></span>
        <span class="scroll-bar block w-px h-1.5 bg-paper/40"></span>
      </div>
    </div>
  </div>
</section> -->
<!-- ───────────── STORIES ───────────── -->
<section
  id="stories"
  class="py-16 md:pt-16 md:py-24 px-6 md:px-12 bg-paper-dark border-b-[3px] border-double border-ink"
>
  <div class="max-w-5xl mx-auto" data-section="stories">
    <!-- header: stacked on mobile, side-by-side on md+ -->
    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-0 mb-10 md:mb-12"
    >
      <div class="fade-up" class:visible={sectionsVisible["stories"]}>
        <div
          class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-deep mb-3"
        >
          <span class="zigzag-x block w-7 h-[6px] bg-deep"></span>Our Stories
        </div>
        <h2
          class="font-display font-bold leading-tight"
          style="font-size:clamp(2rem,5vw,3rem);"
        >
          Investigations &amp;<br />Data Stories
        </h2>
      </div>
      <p
        class="fade-up font-serif italic text-[#555] text-base leading-relaxed md:max-w-[500px] md:text-right"
        class:visible={sectionsVisible["stories"]}
        style="transition-delay:.1s;"
      >
        A data storytelling studio uncovering the stories in Africa’s data. Each
        story is reported, data-driven, and designed for how people actually
        read today.
      </p>
    </div>

    <div class="fade-up" class:visible={sectionsVisible["stories"]}>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-14">
        {#each stories as story, i}
          {@const featured = i === 0}
          <article
            class="group flex flex-col {featured
              ? 'md:col-span-3 md:flex-row md:items-stretch md:gap-10 md:pb-14 md:border-b md:border-ink/20'
              : 'col-span-1'}"
          >
            <a
              href={story.link}
              class="relative block overflow-hidden aspect-[4/3] {featured
                ? 'md:aspect-auto md:w-3/5 md:min-h-[400px]'
                : ''}"
              style="background:{story.bg};"
              aria-label={story.title}
              tabindex="-1"
            >
              {#if story.image}
                <img
                  src={story.image}
                  alt=""
                  class="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                />
              {:else}
                <div
                  class="absolute inset-0 opacity-[0.06]"
                  style="display:grid; grid-template-columns:repeat(8,1fr); grid-template-rows:repeat(6,1fr);"
                >
                  {#each Array(48) as _}
                    <span class="border-r border-b border-current"></span>
                  {/each}
                </div>
              {/if}
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"
              ></div>
            </a>

            <div
              class="flex flex-col flex-1 pt-5 {featured
                ? 'md:w-2/5 md:pt-0 md:justify-center'
                : ''}"
            >
              <div
                class="flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.22em] uppercase text-deep mb-3"
              >
                <span class="h-2 w-2 rounded-full bg-deep inline-block"></span>
                {story.category}
              </div>
              <h3
                class="font-display font-bold leading-snug mb-3"
                style="font-size:{featured
                  ? 'clamp(1.5rem,3.5vw,2.25rem)'
                  : 'clamp(1.15rem,2vw,1.35rem)'};"
              >
                <a
                  href={story.link}
                  class="text-ink no-underline transition-colors duration-200 hover:text-ink/60"
                  >{story.title}</a
                >
              </h3>
              <p
                class="font-serif italic leading-[1.7] text-[#3A3A3A] mb-5 {featured
                  ? 'text-lg'
                  : 'text-base line-clamp-3'}"
              >
                {story.excerpt}
              </p>
              <div
                class="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-ink/15"
              >
                <span class="font-mono text-sm tracking-wide text-ink/50"
                  >{story.date}</span
                >
                {#if story.link}
                  <a
                    href={story.link}
                    class="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-ink no-underline border-ink transition-colors duration-200 text-deep hover:text-ink/60 hover:border-ink/60"
                  >
                    Read Story →
                  </a>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </div>

      <!-- <div class="flex items-center gap-4 mt-5">
        <button
          onclick={prevSlide}
          class="w-10 h-10 border border-ink flex items-center justify-center bg-transparent hover:bg-ink hover:text-paper transition-colors duration-200 cursor-pointer text-base shrink-0"
        >
          ←
        </button>
        <button
          onclick={nextSlide}
          class="w-10 h-10 border border-ink flex items-center justify-center bg-transparent hover:bg-ink hover:text-paper transition-colors duration-200 cursor-pointer text-base shrink-0"
        >
          →
        </button>
        <div class="flex gap-2 flex-1">
          {#each stories as _, i}
            <button
              onclick={() => goToSlide(i)}
              class="h-0.5 border-none cursor-pointer transition-all duration-200"
              style="width:{i === currentSlide
                ? '36px'
                : '20px'}; background:{i === currentSlide
                ? 'var(--color-deep)'
                : 'rgba(28,28,28,.2)'};"
              aria-label="Story {i + 1}"
            >
            </button>
          {/each}
        </div>
      </div> -->
    </div>
  </div>
</section>
<!-- ───────────── ABOUT ───────────── -->
<section
  id="about"
  class="py-16 md:py-24 px-6 md:px-12 bg-paper border-t-[3px] border-none border-ink"
>
  <div class="max-w-5xl mx-auto" data-section="about">
    <!-- on mobile: single column stacked; on md+: two-column sticky layout -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-20">
      <div
        class="fade-up md:self-start md:sticky md:top-24"
        class:visible={sectionsVisible["about"]}
      >
        <div
          class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-deep mb-3"
        >
          <span class="zigzag-x block w-7 h-[6px] bg-deep"></span>About Us
        </div>
        <h2
          class="font-display font-bold leading-tight"
          style="font-size:clamp(2rem,5vw,3.2rem);"
        >
          We turn data into<br /><span
            class="font-script italic font-semibold text-deep text-[1.05em] px-1"
            style="background:linear-gradient(transparent 58%, var(--color-bright) 58%);"
            >narratives</span
          >
        </h2>
      </div>

      <div
        class="fade-up flex flex-col gap-5 md:gap-6"
        class:visible={sectionsVisible["about"]}
        style="transition-delay:.15s;"
      >
        <p
          class="relative font-serif text-deep font-semibold leading-relaxed pl-6 md:pl-7 text-lg md:text-xl"
        >
          <span
            aria-hidden="true"
            class="zigzag absolute left-0 top-0 h-full w-[10px] bg-deep"
          ></span>
          The Granule Africa is a data storytelling studio built on the belief that
          Africa's story deserves to be told accurately, rigorously, and with humanity.
        </p>
        <p
          class="font-serif leading-[1.8] text-[#2A2A2A] text-[0.97rem] md:text-base"
        >
          Too much of what the world knows about Africa is shaped by distant
          data, colonial frames, and narratives written elsewhere. We exist to
          change that — combining investigative journalism, data analysis, and
          interactive design to produce stories that are grounded in evidence
          and resonant with lived experience.
        </p>
        <p
          class="font-serif leading-[1.8] text-[#2A2A2A] text-[0.97rem] md:text-base"
        >
          Our work is built for the news-avoidant generation: visual,
          interactive, and deeply reported. We don't just show you numbers. We
          show you what those numbers mean for the woman in Kisumu, the boda
          boda rider in Kampala, the mother in Mombasa.
        </p>

        <!-- <div class="grid grid-cols-2 border border-ink mt-2">
          {#each [["01", "Journalism"], ["02", "Data Analysis"], ["03", "Storytelling"], ["04", "Technology"]] as [num, name], i}
            <div
              class="p-4 md:p-5"
              style="border-right:{i % 2 === 0
                ? '1px solid #1C1C1C'
                : 'none'}; border-bottom:{i < 2
                ? '1px solid #1C1C1C'
                : 'none'};"
            >
              <div
                class="font-mono text-[0.6rem] tracking-widest text-deep mb-1"
              >
                {num}
              </div>
              <div class="font-display font-semibold text-sm md:text-base">
                {name}
              </div>
            </div>
          {/each}
        </div> -->
      </div>
    </div>
  </div>
</section>

<!-- ───────────── TEAM ───────────── -->
<section id="team" class="pt-16 md:pt-24 bg-bright">
  <div class="max-w-5xl mx-auto px-6 md:px-12" data-section="team">
    <div class="fade-up" class:visible={sectionsVisible["team"]}>
      <div
        class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-deep mb-3"
      >
        <span class="zigzag-x block w-7 h-[6px] bg-deep"></span>The Team
      </div>
      <h2
        class="font-display font-bold leading-tight text-ink"
        style="font-size:clamp(2rem,5vw,3rem);"
      >
        The <span class="font-script italic text-deep">team</span><br />behind
        the stories
      </h2>
    </div>
  </div>

  <!-- 2-up on desktop: circle portrait above name, role and bio -->
  <div
    class="max-w-5xl mx-auto px-6 md:px-12 pb-16 md:pb-24 mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-16"
  >
    {#each team as m}
      <div
        class="team-card fade-up flex flex-col items-center md:items-start text-center md:text-left"
        class:visible={sectionsVisible["team"]}
        style="transition-delay:{m.delay};"
      >
        <div
          class="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden bg-deep mb-7"
        >
          <img
            src={m.img}
            alt={m.name}
            class="member-img w-full h-full object-cover object-top block"
          />
        </div>
        <h3 class="font-display font-bold text-deep text-2xl md:text-3xl mb-1">
          {m.name}
        </h3>
        <div
          class="font-mono text-sm tracking-[0.14em] uppercase text-ink/50 mb-5"
        >
          {m.role}
        </div>
        <p class="font-serif text-[0.97rem] leading-[1.8] text-ink/80">
          {m.bio}
        </p>
      </div>
    {/each}
  </div>
</section>

<!-- ───────────── CONTACT ───────────── -->
<section id="contact" class="py-16 md:py-24 px-6 md:px-12 bg-paper">
  <div
    class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start"
    data-section="contact"
  >
    <div class="fade-up" class:visible={sectionsVisible["contact"]}>
      <div
        class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-deep mb-3"
      >
        <span class="zigzag-x block w-7 h-[6px] bg-deep"></span>Contact
      </div>
      <h2
        class="font-display font-bold leading-tight mb-4"
        style="font-size:clamp(2rem,5vw,3rem);"
      >
        Let's tell<br />a story
        <span class="font-script text-deep italic">together</span>
      </h2>
      <p class="font-serif text-[1rem] leading-[1.75] text-[#3A3A3A]">
        We work with NGOs, foundations, newsrooms, researchers, and advocates
        who believe data-driven storytelling can drive change. Reach out to
        commission a story, explore a partnership, or just talk.
      </p>
      <div class="flex flex-col mt-7">
        {#each [["Location", "Nairobi, Kenya", "#"]] as [label, value, href]}
          <a
            {href}
            class="flex items-center gap-4 font-mono text-sm tracking-wide text-ink no-underline border-b border-ink/10 pb-4 mb-4 hover:text-ink/60 transition-colors duration-200"
          >
            <span
              class="font-mono text-[0.6rem] tracking-widest uppercase text-ink/40 min-w-[60px]"
              >{label}</span
            >
            {value}
          </a>
        {/each}
      </div>
    </div>

    <form
      class="fade-up flex flex-col gap-5"
      class:visible={sectionsVisible["contact"]}
      style="transition-delay:.15s;"
      onsubmit={sendEnquiry}
    >
      {#each [{ id: "name", label: "Your name", type: "text", placeholder: "Full name", required: true }, { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", required: true }, { id: "org", label: "Organisation", type: "text", placeholder: "Where are you from?", required: false }] as { id, label, type, placeholder, required }}
        <div class="flex flex-col gap-2">
          <label
            for={id}
            class="font-display font-bold text-[0.95rem] text-deep"
            >{label}</label
          >
          <input
            {id}
            name={id}
            {type}
            {placeholder}
            {required}
            class="peer font-serif text-[0.95rem] rounded-2xl px-5 py-3.5 bg-bright/25 text-ink placeholder:text-ink/40 border-2 border-transparent outline-none focus:border-deep transition-colors duration-200"
          />
          <span
            aria-hidden="true"
            class="zigzag-x block w-full h-[6px] bg-deep opacity-0 peer-focus:opacity-100 transition-opacity duration-200"
          ></span>
        </div>
      {/each}
      <div class="flex flex-col gap-2">
        <label
          for="message"
          class="font-display font-bold text-[0.95rem] text-deep">Message</label
        >
        <textarea
          id="message"
          name="message"
          required
          placeholder="Tell us what you have in mind…"
          class="peer font-serif text-[0.95rem] rounded-2xl px-5 py-3.5 bg-bright/25 text-ink placeholder:text-ink/40 border-2 border-transparent outline-none focus:border-deep transition-colors duration-200 resize-none"
          style="min-height:120px;"></textarea>
        <span
          aria-hidden="true"
          class="zigzag-x block w-full h-[6px] bg-deep opacity-0 peer-focus:opacity-100 transition-opacity duration-200"
        ></span>
      </div>
      <button
        type="submit"
        class="self-start font-mono text-sm tracking-[0.14em] uppercase px-10 py-4 rounded-full bg-deep text-paper border-none cursor-pointer hover:bg-bright hover:text-deep transition-colors duration-200"
      >
        Send message →
      </button>
    </form>
  </div>
</section>

<!-- ───────────── FOOTER ───────────── -->
<footer
  class="bg-ink px-6 md:px-12 pt-10 md:pt-12 pb-8"
  style="border-top:4px solid var(--color-bright);"
>
  <!-- stacks to single col on mobile, 3-col on md+ -->
  <div
    class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8 md:pb-10 border-b border-paper/10"
  >
    <div>
      <div class="font-display font-bold text-deep text-3xl mb-2">
        The Granule <span
          class="font-script italic font-semibold text-bright text-[1.05em]"
          >Africa</span
        >
      </div>
      <p
        class="font-serif italic text-base leading-[1.65] text-paper/50 max-w-[280px] mt-2"
      >
        A data storytelling studio telling African stories through journalism,
        technology, and design.
      </p>
    </div>
    <div>
      <div
        class="font-mono text-sm tracking-[0.16em] uppercase text-bright mb-4 md:mb-5"
      >
        Navigate
      </div>
      <ul class="list-none p-0 m-0 flex flex-col gap-2">
        {#each [["#about", "About Us"], ["#team", "The Team"], ["#stories", "Our Stories"], ["#contact", "Contact"]] as [href, label]}
          <li>
            <a
              {href}
              class="font-serif text-base text-paper/60 no-underline hover:text-paper transition-colors duration-200"
              >{label}</a
            >
          </li>
        {/each}
      </ul>
    </div>
    <div>
      <div
        class="font-mono text-sm tracking-[0.16em] uppercase text-bright mb-4 md:mb-5"
      >
        Focus Areas
      </div>
      <ul class="list-none p-0 m-0 flex flex-col gap-2">
        {#each ["Gender & Safety", "Health", "Politics & Power", "Economy"] as area}
          <li>
            <a
              href="#stories"
              class="font-serif text-base text-paper/60 no-underline hover:text-paper transition-colors duration-200"
              >{area}</a
            >
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <!-- footer bottom: stacked on mobile -->
  <div
    class="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-0 mt-6 md:mt-8"
  >
    <span class="font-mono text-sm tracking-widest uppercase text-paper/30"
      >© 2026 The Granule Africa. All rights reserved.</span
    >
    <span class="font-serif italic text-base text-paper/30"></span>
  </div>
</footer>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  :global(body) {
    overflow-x: hidden;
  }

  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.7s ease,
      transform 0.7s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-text {
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.9s ease,
      transform 0.9s ease;
  }
  .hero-text.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes scrollDrop {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }
  .scroll-bar:nth-child(1) {
    animation: scrollDrop 1.4s ease-in-out infinite 0s;
  }
  .scroll-bar:nth-child(2) {
    animation: scrollDrop 1.4s ease-in-out infinite 0.15s;
  }
  .scroll-bar:nth-child(3) {
    animation: scrollDrop 1.4s ease-in-out infinite 0.3s;
  }

  .team-card .member-img {
    transition: transform 0.4s ease;
  }
  .team-card:hover .member-img {
    transform: scale(1.04);
  }
  @media (prefers-reduced-motion: reduce) {
    .team-card .member-img {
      transition: none;
    }
    .team-card:hover .member-img {
      transform: none;
    }
  }

  /* mobile menu slide */
  .mobile-menu {
    transform: translateY(-8px);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
  .mobile-menu.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* Zigzag rule beside the about-section quote; colour comes from bg-deep */
  .zigzag {
    --zz: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='12' viewBox='0 0 10 12'%3E%3Cpath d='M2 0 L8 6 L2 12' fill='none' stroke='black' stroke-width='2.2' stroke-linejoin='miter'/%3E%3C/svg%3E");
    -webkit-mask: var(--zz) repeat-y top / 10px 12px;
    mask: var(--zz) repeat-y top / 10px 12px;
  }

  /* Horizontal zigzag for the section eyebrow dash */
  .zigzag-x {
    --zz: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='6' viewBox='0 0 7 6'%3E%3Cpath d='M0 1 L3.5 5 L7 1' fill='none' stroke='black' stroke-width='1.3' stroke-linejoin='miter'/%3E%3C/svg%3E");
    -webkit-mask: var(--zz) repeat-x left center / 7px 6px;
    mask: var(--zz) repeat-x left center / 7px 6px;
  }
</style>
