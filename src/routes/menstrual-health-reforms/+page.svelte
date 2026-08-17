<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { mountReactApp, unmountReactApp } from "./mountReact";
  import Seo from "$lib/components/Seo.svelte";

  let container: HTMLElement | null = null;

  const TITLE = "The Price of Dignity";
  const DESCRIPTION =
    "A Naya Kenya report on the menstrual health crisis in Kenya, and the hidden costs of period poverty.";

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
  path="/naya-kenya"
  image="/kenya-health-crisis.gif"
  type="article"
/>

<div bind:this={container} id="react-naya-kenya-root" class="min-h-screen"></div>
