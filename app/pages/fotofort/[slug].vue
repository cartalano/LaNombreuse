<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { setResponseStatus } from '#app'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const route = useRoute()
const { get } = useApi()
const { galleryUrls } = useMedia()

const res = await get<any>('/fotoforts', {
  'filters[slug][$eq]': String(route.params.slug),
  // ✅ populate sûr (les clés existent dans ton modèle)
  populate: {
    images: { fields: ['url', 'alternativeText', 'width', 'height'] },
    period: true,
    speakers: true,
    lieu: true
  },
  'pagination[pageSize]': 1
})

const raw = computed(() => res.value?.data?.[0] ?? null)
if (!raw.value) setResponseStatus(404) // si aucun item, on met le status 404

// flatten { id, ...attributes }
const item = computed(() => raw.value?.attributes ? ({ id: raw.value.id, ...raw.value.attributes }) : raw.value)
// urls d’images via ton composable
const gallery = computed(() => galleryUrls(item.value))

function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year:'numeric', month:'long', day:'2-digit' })
  const a = fmt.format(new Date(period.startDate))
  const b = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return b ? `${a} — ${b}` : a
}
</script>


<template>
  <main class="wrap" v-if="item">
    <NuxtLink to="/fotofort" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </NuxtLink>

    <header class="head">
      <h1 class="title">{{ item.title }}</h1>
      <p v-if="item.period" class="date">{{ fmtRange(item.period) }}</p>
    </header>

    <section v-if="gallery.length" class="gallery">
      <img v-for="(src,i) in gallery" :key="i" :src="src" :alt="`${item.title} — visuel ${i+1}`" loading="lazy" />
    </section>

    <section v-if="item.description" class="body content" v-html="item.description" />
  </main>

  <main v-else class="wrap">
    <NuxtLink to="/fotofort" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </NuxtLink>
    <p>fotofort introuvable.</p>
  </main>
</template>

<style scoped>

</style>
