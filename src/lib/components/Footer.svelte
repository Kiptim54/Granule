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
