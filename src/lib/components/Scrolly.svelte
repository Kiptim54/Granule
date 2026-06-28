<script>
  /**
   * Scrollytelling component (Svelte 5 native).
   * Manages which child item is most in view for scroll triggering.
   *
   * <Scrolly bind:value={scrollIndex}>
   * **items here**
   * </Scrolly>
   */

  let {
    root = null,
    top = 0,
    bottom = 0,
    increments = 100,
    value = $bindable(undefined),
    children,
  } = $props();

  let container;

  // Renamed to 'ratios' to avoid colliding mentally with your YAML 'steps' array
  let ratios = [];

  $effect(() => {
    // Ensure the container exists and has children before observing
    if (!container) return;

    // Array.from is safer than :scope > * for capturing rendered snippet children
    const nodes = Array.from(container.children);
    if (nodes.length === 0) return;

    // Build the threshold array [0, 0.01, 0.02 ... 1]
    const threshold = Array.from(
      { length: increments + 1 },
      (_, i) => i / increments,
    );

    const marginTop = top ? top * -1 : 0;
    const marginBottom = bottom ? bottom * -1 : 0;
    const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;
    const options = { root, rootMargin, threshold };

    const observers = nodes.map((node, index) => {
      const io = new IntersectionObserver((entries) => {
        // Update the ratio for this specific step
        entries.forEach((entry) => {
          ratios[index] = entry.intersectionRatio;
        });

        // Calculate which step is MOST in view
        let maxRatio = 0;
        let maxIndex = 0;
        ratios.forEach((ratio, i) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxIndex = i;
          }
        });

        // Update the bound value (scrollIndex in the parent)
        value = maxRatio > 0 ? maxIndex : undefined;
      }, options);

      io.observe(node);
      return io; // Keep track so we can disconnect later
    });

    // Cleanup function: Svelte 5 runs this automatically when the effect is destroyed
    return () => {
      observers.forEach((io) => io.disconnect());
    };
  });
</script>

<div bind:this={container}>
  {@render children()}
</div>
