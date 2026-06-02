<script>
  import { onMount } from "svelte";
  import Nav from "../../lib/components/Nav.svelte";
  import Footer from "../../lib/components/Footer.svelte";
  import { MapLibre } from "svelte-maplibre";
</script>

<div class="min-h-screen flex flex-col justify-between">
  <Nav />
  <MapLibre
    center={[50, 20]}
    zoom={3}
    class="map"
    standardControls
    projection={{ type: "globe" }}
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  />

  <Footer />
</div>

<style>
  :global(.map) {
    height: 700px;
  }
</style>
