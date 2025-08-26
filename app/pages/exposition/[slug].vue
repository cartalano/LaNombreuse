<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const route = useRoute()
const { get } = useApi()
const { galleryUrls, altText } = useMedia()

const res = await get<any>('/expositions', {
  'filters[slug][$eq]': route.params.slug,
  populate: ['images', 'period', 'artists', 'location', 'files'],
  'pagination[pageSize]': 1
})

const raw = computed(() => res.value?.data?.[0] ?? null)
const item = computed(() =>
  raw.value?.attributes ? ({ id: raw.value.id, ...raw.value.attributes }) : raw.value
)

const gallery = computed(() => galleryUrls(item.value))
const alt = computed(() => altText(item.value))
</script>

<template>
  <article class="container py-5" v-if="item">
    <NuxtLink to="/exposition" class="btn btn-link p-0 mb-3">← Retour</NuxtLink>

    <h1 class="display-6">{{ item.title }}</h1>
    <p class="text-muted" v-if="item.period">{{ item.period?.startDate }} — {{ item.period?.endDate }}</p>

    <img
      v-if="gallery[0]"
      :src="gallery[0]"
      :alt="alt || item.title"
      class="img-fluid my-3"
      style="max-width:900px;display:block"
    />

    <div v-if="gallery.length > 1" class="my-3" style="display:flex;gap:12px;flex-wrap:wrap;">
      <img v-for="(src,i) in gallery.slice(1)" :key="i" :src="src" :alt="`${item.title} ${i+2}`" style="width:260px;height:auto;" />
    </div>

    <div v-if="item.description" class="content" v-html="item.description"></div>
  </article>

  <article v-else class="container py-5">
    <NuxtLink to="/exposition" class="btn btn-link p-0 mb-3">← Retour</NuxtLink>
    <p>Exposition introuvable.</p>
  </article>
</template>
