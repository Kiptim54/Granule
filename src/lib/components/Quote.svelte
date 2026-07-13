<script lang="ts">
  export let text: string = "";
  export let author: string = "";
</script>

<div
  class="text-xl italic p-6 bg-[#C4A882]/17 border-l-4 border-primary-red text-gray-700 rounded-sm my-4"
>
  <p>"{text}"</p>
  <br />
  <p class="font-bold">{author}</p>
</div>
