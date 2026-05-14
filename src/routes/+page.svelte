<script lang="ts">
  import { onMount } from "svelte";
  // ["Email", "hello@The Granuleafrica.com", "mailto:hello@The Granuleafrica.com"], ["Twitter", "@The Granuleafrica", "#"],
  let currentSlide = 0;
  let heroVisible = false;
  let sectionsVisible: Record<string, boolean> = {};
  let menuOpen = false;

  const stories = [
    {
      id: 1,
      category: "Femicide",
      title: "The Names We Don't Say: Mapping Kenya's Femicide Crisis",
      excerpt:
        "A data investigation into the epidemic of gender-based violence across Kenya's counties — told through the women lost.",
      date: "March 2025",
      tag: "Data Investigation",
      bg: "#C1440E",
      link: "/femicide",
      image: "/Femicide.png",
    },
    // {
    //   id: 2,
    //   category: "Health",
    //   title: "Born Into Risk: Maternal Mortality and the Counties Left Behind",
    //   excerpt:
    //     "Behind the national statistics lies a geography of neglect. We mapped where Kenyan mothers are most likely to die giving life.",
    //   date: "January 2025",
    //   tag: "Scrollytelling",
    //   bg: "#1A3A2A",
    // },
    // {
    //   id: 3,
    //   category: "Politics",
    //   title: "Follow the Money: How Public Funds Move in an Election Year",
    //   excerpt:
    //     "An audit of public spending patterns in election cycles — and what the data reveals about where power actually flows.",
    //   date: "November 2024",
    //   tag: "Interactive",
    //   bg: "#2A2060",
    // },
    // {
    //   id: 4,
    //   category: "Economy",
    //   title: "The Informal Economy is Not Informal: Nairobi's Hidden GDP",
    //   excerpt:
    //     "Street traders, boda bodas, and roadside kiosks account for more of Nairobi's economy than anyone officially counts.",
    //   date: "September 2024",
    //   tag: "Data Story",
    //   bg: "#5C3A1E",
    // },
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

<!-- ───────────── NAV ───────────── -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-paper border-b-2 border-ink">
  <div class="flex items-center justify-between px-6 md:px-12 py-4">
    <a
      href="#home"
      class="font-display font-bold text-base tracking-widest uppercase text-ink no-underline"
    >
      The <span class="italic text-rust">Granule</span>
    </a>

    <!-- desktop links -->
    <ul class="hidden md:flex gap-10 list-none m-0 p-0">
      {#each [["#about", "About"], ["#team", "Team"], ["#stories", "Stories"], ["#contact", "Contact"]] as [href, label]}
        <li>
          <a
            {href}
            class="font-mono text-base tracking-[0.14em] uppercase text-ink no-underline border-b border-transparent hover:border-rust hover:text-rust transition-colors duration-200"
          >
            {label}
          </a>
        </li>
      {/each}
    </ul>

    <!-- hamburger -->
    <button
      class="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
      onclick={() => (menuOpen = !menuOpen)}
      aria-label="Toggle menu"
    >
      <span
        class="block w-6 h-px bg-ink transition-all duration-200"
        class:rotate-45={menuOpen}
        class:translate-y-[6px]={menuOpen}
      ></span>
      <span
        class="block w-6 h-px bg-ink transition-all duration-200"
        class:opacity-0={menuOpen}
      ></span>
      <span
        class="block w-6 h-px bg-ink transition-all duration-200"
        class:-rotate-45={menuOpen}
        class:-translate-y-[6px]={menuOpen}
      ></span>
    </button>
  </div>

  <!-- mobile dropdown -->
  <div
    class="mobile-menu md:hidden absolute top-full left-0 right-0 bg-paper border-b-2 border-ink"
    class:open={menuOpen}
  >
    <ul class="list-none m-0 p-0 flex flex-col">
      {#each [["#about", "About"], ["#team", "Team"], ["#stories", "Stories"], ["#contact", "Contact"]] as [href, label]}
        <li class="border-b border-ink/10">
          <a
            {href}
            onclick={closeMenu}
            class="block font-mono text-[0.72rem] tracking-[0.16em] uppercase text-ink no-underline px-6 py-4 hover:text-rust hover:bg-paper-dark transition-colors duration-150"
          >
            {label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<!-- ───────────── HERO ───────────── -->
<section
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
      class="font-mono text-sm md:text-sm tracking-[0.18em] uppercase text-gold mb-4 md:mb-5"
    >
      Data Storytelling Studio
    </p>
    <h1
      class="font-display font-bold leading-none text-paper mb-5 md:mb-6"
      style="font-size:clamp(3rem,10vw,7rem); letter-spacing:-0.01em;"
    >
      The<br /><span class="italic text-gold"> Granule</span>
    </h1>
    <p
      class="font-serif font-light italic text-paper/80 max-w-lg leading-relaxed text-base md:text-lg"
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
</section>
<!-- ───────────── STORIES ───────────── -->
<section
  id="stories"
  class="py-16 md:py-24 px-6 md:px-12 bg-paper-dark border-t-[3px] border-b-[3px] border-double border-ink"
>
  <div class="max-w-5xl mx-auto" data-section="stories">
    <!-- header: stacked on mobile, side-by-side on md+ -->
    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-0 mb-10 md:mb-12"
    >
      <div class="fade-up" class:visible={sectionsVisible["stories"]}>
        <div
          class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-rust mb-3"
        >
          <span class="block w-6 h-px bg-rust"></span>Our Stories
        </div>
        <h2
          class="font-display font-bold leading-tight"
          style="font-size:clamp(2rem,5vw,3rem);"
        >
          Investigations &amp;<br />Data Stories
        </h2>
      </div>
      <p
        class="fade-up font-serif italic text-[#555] text-base leading-relaxed md:max-w-[240px] md:text-right"
        class:visible={sectionsVisible["stories"]}
        style="transition-delay:.1s;"
      >
        Each story is reported, data-driven, and designed for how people
        actually read today.
      </p>
    </div>

    <div class="fade-up" class:visible={sectionsVisible["stories"]}>
      <div class="border border-ink overflow-hidden">
        {#each stories as story, i}
          {#if i === currentSlide}
            <!-- stacks on mobile, side-by-side on md+ -->
            <div class="grid grid-cols-1 md:grid-cols-[1fr_1.4fr]">
              <div
                class="p-6 md:p-10 md:border-r border-b md:border-b-0 border-ink flex flex-col justify-between gap-6"
                style="min-height:280px;"
              >
                <span class="font-mono text-sm tracking-widest text-ink/40">
                  Story {String(i + 1).padStart(2, "0")} / {String(
                    stories.length,
                  ).padStart(2, "0")}
                </span>
                <div>
                  <div
                    class="flex items-center gap-2 font-mono text-sm tracking-[0.18em] uppercase text-rust mb-2"
                  >
                    <span class="w-2 h-2 rounded-full bg-rust inline-block"
                    ></span>{story.category}
                  </div>
                  <h3
                    class="font-display font-bold leading-snug mb-3"
                    style="font-size:clamp(1.2rem,3vw,1.9rem);"
                  >
                    {story.title}
                  </h3>
                  <p
                    class="font-serif italic text-base leading-[1.75] text-[#3A3A3A]"
                  >
                    {story.excerpt}
                  </p>
                  <span
                    class="inline-block font-mono text-sm tracking-widest uppercase px-3 py-1 border border-ink text-ink mt-4"
                    >{story.tag}</span
                  >
                </div>
                <span class="font-mono text-sm tracking-wide text-ink/50"
                  >{story.date}</span
                >
              </div>
              <!-- colour panel — shorter on mobile -->
              <div
                class="relative flex items-center justify-center overflow-hidden"
                style="background:{story.bg}; min-height:180px;"
              >
                {#if story.image}
                  <img
                    src={story.image}
                    alt={story.title}
                    class="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                {/if}
                <div
                  class="absolute inset-0"
                  style="background:linear-gradient(135deg,transparent,rgba(0,0,0,.45));"
                ></div>
                {#if !story.image}
                  <div
                    class="absolute inset-0 opacity-[0.06]"
                    style="display:grid; grid-template-columns:repeat(8,1fr); grid-template-rows:repeat(6,1fr);"
                  >
                    {#each Array(48) as _}
                      <span class="border-r border-b border-current"></span>
                    {/each}
                  </div>
                {/if}
                <span
                  class="absolute font-display font-bold italic text-paper/15 leading-none"
                  style="font-size:clamp(4rem,12vw,8rem); bottom:-0.5rem; right:1rem;"
                  >{story.category[0]}</span
                >
                {#if story.link}
                  <a
                    href={story.link}
                    // target="_blank"
                    // rel="noopener noreferrer"
                    class="relative z-10 font-mono text-sm tracking-[0.14em] uppercase px-5 py-3 border border-paper text-paper no-underline hover:bg-paper hover:text-ink transition-colors duration-200"
                  >
                    Read Story →
                  </a>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <div class="flex items-center gap-4 mt-5">
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
                ? '#C1440E'
                : 'rgba(28,28,28,.2)'};"
              aria-label="Story {i + 1}"
            >
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
<!-- ───────────── ABOUT ───────────── -->
<section
  id="about"
  class="py-16 md:py-24 px-6 md:px-12 bg-paper border-t-[3px] border-double border-ink"
>
  <div class="max-w-5xl mx-auto" data-section="about">
    <!-- on mobile: single column stacked; on md+: two-column sticky layout -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-20">
      <div
        class="fade-up md:self-start md:sticky md:top-24"
        class:visible={sectionsVisible["about"]}
      >
        <div
          class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-rust mb-3"
        >
          <span class="block w-6 h-px bg-rust"></span>About Us
        </div>
        <h2
          class="font-display font-bold leading-tight"
          style="font-size:clamp(2rem,5vw,3.2rem);"
        >
          We make data<br /><span class="italic text-rust">legible</span>
        </h2>
      </div>

      <div
        class="fade-up flex flex-col gap-5 md:gap-6"
        class:visible={sectionsVisible["about"]}
        style="transition-delay:.15s;"
      >
        <p
          class="font-serif leading-relaxed text-ink border-l-[3px] border-rust pl-4 md:pl-5 text-lg md:text-xl"
        >
          The Granule Africa is a data storytelling studio built on the belief
          that Africa's story deserves to be told accurately, rigorously, and
          with humanity.
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

        <div class="grid grid-cols-2 border border-ink mt-2">
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
                class="font-mono text-[0.6rem] tracking-widest text-rust mb-1"
              >
                {num}
              </div>
              <div class="font-display font-semibold text-sm md:text-base">
                {name}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ───────────── TEAM ───────────── -->
<section id="team" class="py-16 md:py-24 px-6 md:px-12 bg-ink">
  <div class="max-w-5xl mx-auto" data-section="team">
    <div class="fade-up" class:visible={sectionsVisible["team"]}>
      <div
        class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-gold mb-3"
      >
        <span class="block w-6 h-px bg-gold"></span>The Team
      </div>
      <h2
        class="font-display font-bold leading-tight text-paper"
        style="font-size:clamp(2rem,5vw,3rem);"
      >
        The people<br />behind the stories
      </h2>
    </div>

    <!-- stacks on mobile, side by side on md+ -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 mt-8 md:mt-10"
      style="gap:1px; background:rgba(245,240,232,.15);"
    >
      {#each team as m}
        <div
          class="team-card fade-up p-8 md:p-12 bg-ink hover:bg-[#242424] transition-colors duration-300"
          class:visible={sectionsVisible["team"]}
          style="transition-delay:{m.delay};"
        >
          <div
            class="photo-wrap relative w-24 h-32 md:w-48 md:h-52 mb-6 md:mb-7"
          >
            <img
              src={m.img}
              alt={m.name}
              class="member-img w-full h-full object-cover object-top block transition-all duration-300"
              style="filter:grayscale(20%) contrast(1.05);"
            />
          </div>
          <div
            class="font-display font-bold text-paper text-xl md:text-2xl mb-1"
          >
            {m.name}
          </div>
          <div
            class="font-mono text-sm tracking-[0.14em] uppercase text-gold mb-4 md:mb-5"
          >
            {m.role}
          </div>
          <p class="font-serif text-[0.93rem] leading-[1.75] text-paper/70">
            {m.bio}
          </p>
        </div>
      {/each}
    </div>
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
        class="flex items-center gap-3 font-mono text-sm tracking-[0.18em] uppercase text-rust mb-3"
      >
        <span class="block w-6 h-px bg-rust"></span>Contact
      </div>
      <h2
        class="font-display font-bold leading-tight mb-4"
        style="font-size:clamp(2rem,5vw,3rem);"
      >
        Let's tell<br />a story together
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
            class="flex items-center gap-4 font-mono text-sm tracking-wide text-ink no-underline border-b border-ink/10 pb-4 mb-4 hover:text-rust transition-colors duration-200"
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

    <div
      class="fade-up"
      class:visible={sectionsVisible["contact"]}
      style="transition-delay:.15s;"
    >
      {#each [["name", "Your name", "text", "Full name"], ["email", "Email address", "email", "you@example.com"], ["org", "Organisation", "text", "Where are you from?"]] as [id, label, type, placeholder]}
        <div
          class="flex flex-col border border-ink"
          style="border-bottom:none;"
        >
          <label
            for={id}
            class="font-mono text-sm tracking-[0.14em] uppercase text-ink/50 px-4 pt-3 pb-1"
            >{label}</label
          >
          <input
            {id}
            {type}
            {placeholder}
            class="font-serif text-[0.95rem] border-none outline-none px-4 pb-3 bg-transparent text-ink"
          />
        </div>
      {/each}
      <div class="flex flex-col border border-ink">
        <label
          for="message"
          class="font-mono text-sm tracking-[0.14em] uppercase text-ink/50 px-4 pt-3 pb-1"
          >Message</label
        >
        <textarea
          id="message"
          placeholder="Tell us what you have in mind…"
          class="font-serif text-[0.95rem] border-none outline-none px-4 pb-3 bg-transparent text-ink resize-none"
          style="min-height:100px;"
        ></textarea>
      </div>
      <button
        class="w-full mt-3 font-mono text-sm tracking-[0.14em] uppercase px-8 py-4 bg-ink text-paper border-none cursor-pointer hover:bg-rust transition-colors duration-200"
      >
        <!-- Send Message → -->
        COMING SOON
      </button>
    </div>
  </div>
</section>

<!-- ───────────── FOOTER ───────────── -->
<footer
  class="bg-ink px-6 md:px-12 pt-10 md:pt-12 pb-8"
  style="border-top:4px solid #B8922A;"
>
  <!-- stacks to single col on mobile, 3-col on md+ -->
  <div
    class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8 md:pb-10 border-b border-paper/10"
  >
    <div>
      <div class="font-display font-bold text-paper text-3xl mb-2">
        The Granule <span class="italic text-gold">Africa</span>
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
        class="font-mono text-sm tracking-[0.16em] uppercase text-gold mb-4 md:mb-5"
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
        class="font-mono text-sm tracking-[0.16em] uppercase text-gold mb-4 md:mb-5"
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
    <span class="font-serif italic text-base text-paper/30"
      >Rooted in Africa. Rigorous in data. Human in story.</span
    >
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

  .photo-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    border: 1px solid #b8922a;
    transform: translate(6px, 6px);
    pointer-events: none;
    transition: transform 0.3s;
  }
  .team-card:hover .photo-wrap::after {
    transform: translate(4px, 4px);
  }
  .team-card:hover .member-img {
    filter: grayscale(0%) contrast(1.05) !important;
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
</style>
