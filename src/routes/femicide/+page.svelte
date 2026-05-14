<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { mountReactApp, unmountReactApp } from "./mountReact";

  let container: HTMLElement | null = null;

  onMount(() => {
    if (container) {
      mountReactApp(container);
    }
  });

  onDestroy(() => {
    unmountReactApp();
  });
</script>

<div bind:this={container} id="react-femicide-root" class="min-h-screen"></div>
