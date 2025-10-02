<script setup lang="ts">
defineProps<{ url: string }>()
// transforme un lien youtube en embed
function toEmbed(url: string): string {
  if (!url) return ''
  const yt = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&#]+)/)
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url
}
</script>

<template>
  <div v-if="url" class="video">
    <iframe
      :src="toEmbed(url)"
      title="Vidéo"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>

<style scoped>
.video {
  position: relative;
  padding-bottom: 56.25%; /* ratio 16:9 */
  height: 0;
}
.video iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: 0;
  border-radius: 8px;
}
</style>
