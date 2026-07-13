<script lang="ts">
  let { config } = $props();

  let steps = $derived(config?.steps ?? []);

  let index = $state(0);

  let foreground: HTMLDivElement | null = $state(null);
  import ScrollyBackground from "./ScrollyBackground.svelte";

  $effect(() => {
    if (!foreground) return;

    const sections = Array.from(foreground.querySelectorAll("section[data-i]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            index = Number((entry.target as HTMLElement).dataset.i);
          }
        }
      },
      { threshold: 0.5 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<div class="scroller">
  <div class="background">
    <!-- chart / visualization goes here -->
    <ScrollyBackground {index} {steps} />
  </div>

  <div class="foreground" bind:this={foreground}>
    <section class="spacer" data-i="-1"></section>

    {#each steps as step, i (i)}
      <section class="step" data-i={i}>
        {#if step.caption}
          <div class="step-content">
            <p class="step-caption">{@html step.caption}</p>

            {#if step?.legend}
              <div class="step-legend">
                {#if step.legend.title}
                  <p class="legend-title">{step.legend.title}</p>
                {/if}
                {#if step.legend.items?.length}
                  <div class="legend-items">
                    {#each step.legend.items as item, j (j)}
                      {#if item.label}
                        <div class="legend-item">
                          {#if item.color}
                            <div
                              class="legend-color"
                              style:background-color={item.color}
                            ></div>
                          {/if}
                          <div class="legend-label">{item.label}</div>
                        </div>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </section>
    {/each}

    <section class="spacer-end"></section>
  </div>
</div>

<style>
  .scroller {
    position: relative;
  }

  .background {
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .foreground {
    position: relative;
    z-index: 1;
    margin-top: -100vh;
    pointer-events: none;
  }

  .spacer {
    min-height: 100vh;
  }

  .spacer-end {
    min-height: 40vh;
  }

  .step {
    min-height: 120vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-content {
    pointer-events: auto;
    width: min(100vw - 2rem, 700px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.92);
    padding: 1rem 1.5rem;
    box-shadow: 0 4px 12.1px 0 rgba(0, 0, 0, 0.3);
    font-family: "Adelle Sans", sans-serif;
  }

  .step-caption {
    font-size: 16px;
    font-weight: 400;
    line-height: 1.6;
    margin: 0;
  }

  .step-legend {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .legend-title {
    font-size: 16px;
    font-weight: 700;
    padding: 5px;
    margin: 0;
    font-family: "Adelle Sans", sans-serif;
  }

  .legend-items {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
  }

  .legend-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.375rem;
  }

  .legend-color {
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .legend-label {
    font-size: 14px;
    line-height: 1.4;
  }

  :global(.dot) {
    font-size: 1.8em !important;
    line-height: 0;
    vertical-align: sub;
  }

  @media (min-width: 768px) {
    .step-content {
      padding: 1.25rem 1.5rem;
    }
    .step-caption {
      font-size: 1rem;
    }
  }
</style>
