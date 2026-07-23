<script lang="ts">
  let menuOpen = $state(false);
  function closeMenu() {
    menuOpen = false;
  }

  let { isFixed = true } = $props();
</script>

<div>
  <!-- ───────────── NAV ───────────── -->
  <nav
    class={`${isFixed ? "fixed" : ""} relative top-0 left-0 right-0 z-50 bg-paper border-b-2 border-ink`}
  >
    <div class="flex items-center justify-between px-6 md:px-12 py-4">
      <a
        href="/"
        class="font-display font-bold text-base tracking-widest uppercase text-ink no-underline"
      >
        The <span class=" text-rust">Granule</span>
        <!-- <image
          src="/website-log-nobg.png"
          alt="The Granule Africa Logo"
          class="inline-block w-auto h-[40px] ml-2"
        /> -->
      </a>

      <!-- desktop links -->
      <ul class="hidden md:flex gap-10 list-none m-0 p-0">
        {#each [["/#about", "About"], ["/#team", "Team"], ["/#stories", "Stories"], ["/#contact", "Contact"]] as [href, label]}
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
        {#each [["/#about", "About"], ["/#team", "Team"], ["/#stories", "Stories"], ["/#contact", "Contact"]] as [href, label]}
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
</div>

<style>
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
