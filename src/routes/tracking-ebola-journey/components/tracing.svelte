<script lang="ts">
  import { onMount } from "svelte";
  import Person from "./Person.svelte";

  type Status =
    | "confirmed"
    | "quarantine"
    | "out_of_country"
    | "untraced"
    | "dead";
  type Contact = { status: Status };

  // MoH press release, 14 Oct 2026 (figures as at 13 Oct)
  const counts: Record<Status, number> = {
    dead: 1,

    confirmed: 1,
    quarantine: 107, // 108 in quarantine minus case 2
    out_of_country: 5,
    untraced: 15,
  };

  const label: Record<Status, string> = {
    dead: "Dead",
    confirmed: "Tested positive",
    quarantine: "In quarantine",
    out_of_country: "Outside Kenya",
    untraced: "Still being traced",
  };

  const colour: Record<Status, string> = {
    confirmed: "#e07b00",
    quarantine: "#3d3d3d",
    out_of_country: "#0f8b8d",
    untraced: "#d1d5db",
    dead: "#920c1d",
  };

  const makeGroup = (count: number, status: Status): Contact[] =>
    Array.from({ length: count }, () => ({ status }));

  const PIVOT_AT = 7; // case 2 sits inside the quarantine crowd
  const people: Contact[] = [
    ...makeGroup(PIVOT_AT, "quarantine"),
    ...makeGroup(counts.confirmed, "confirmed"),
    ...makeGroup(counts.quarantine - PIVOT_AT, "quarantine"),
    ...makeGroup(counts.out_of_country, "out_of_country"),
    ...makeGroup(counts.untraced, "untraced"),
  ];

  let peopleGrid = $state<HTMLDivElement>();
  let peopleVisible = $state(false);
  let revealReady = $state(false);

  onMount(() => {
    if (!peopleGrid || !("IntersectionObserver" in window)) {
      peopleVisible = true;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          peopleVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(peopleGrid);
    revealReady = true;
    return () => observer.disconnect();
  });
</script>

<section
  class="container mx-auto text-center pt-20 grid p-6 gap-6 text-balance md:w-3/4"
>
  <h1 class="text-4xl font-bold text-balance font-display">
    Kenya's first Ebola case has
    <span class="standout">128 contacts.</span>
  </h1>
  <p class="text-lg font-serif text-balance w-3/4 mx-auto">
    Of the 128 contacts, 108 were in quarantine in Kenya on 13 October. One of
    them, a close relative, fell ill and tested positive. Five are outside Kenya
    and 15 are still being traced.
  </p>
  <section class=" flex justify-center mx-auto w-[80%]">
    <Person color="#920c1d" />
  </section>
  <ul class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-serif">
    {#each Object.keys(counts) as Status[] as s}
      <li class="flex items-center gap-2">
        <span class="inline-block size-3" style:background={colour[s]}></span>
        {counts[s]}
        {label[s].toLowerCase()}
      </li>
    {/each}
  </ul>

  <div
    bind:this={peopleGrid}
    role="img"
    aria-label={`128 contacts: ${counts.quarantine} in quarantine, ${counts.confirmed} tested positive, ${counts.out_of_country} outside Kenya, ${counts.untraced} still being traced`}
    class:reveal-ready={revealReady}
    class="grid grid-cols-8 md:grid-cols-25 gap-0 mx-auto w-[90%]"
  >
    {#each people as person, index}
      <div
        class="person-item"
        aria-hidden="true"
        class:revealed={peopleVisible}
        style={`--reveal-delay: ${index * 10}ms`}
      >
        <Person color={colour[person.status]} />
      </div>
    {/each}
  </div>

  <p class="text-sm text-neutral-500">
    Source: Ministry of Health press release, 14 October 2026. Figures as at 13
    October.
  </p>
</section>

<style>
  .standout {
    color: #920c1d;
    font-weight: bolder;
    font-style: italic;
  }

  .reveal-ready .person-item:not(.revealed) {
    opacity: 0;
    transform: translateY(10px) scale(0.94);
  }

  .person-item.revealed {
    animation: person-reveal 320ms ease-out both;
    animation-delay: var(--reveal-delay);
  }

  @keyframes person-reveal {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.94);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-ready .person-item:not(.revealed),
    .person-item.revealed {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>
