<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const { get, mediaUrl } = useApi()

// Récupérer 1 exposition par slug, avec toutes les relations utiles
const res = await get<any>('/expositions', {
  'filters[slug][$eq]': route.params.slug,
  // grâce à buildQS, ceci devient: ?populate=images&populate=period&populate=artists&populate=location&populate=files
  populate: ['images', 'period', 'artists', 'location', 'files'],
  'pagination[pageSize]': 1
})

// item brut (ou null)
const raw = computed(() => (res.value?.data?.[0] ?? null))

// flatten {id, ...attributes}
const item = computed(() => {
  const it = raw.value
  if (!it) return null
  return it.attributes ? { id: it.id, ...it.attributes } : it
})

// helpers
function coverUrl(it: any) {
  const d = it?.images?.data
  return Array.isArray(d) ? d[0]?.attributes?.url : undefined
}

const gallery = computed(() => {
  // cas aplati
  if (Array.isArray(item.value?.images) && item.value.images[0]?.url) {
    return item.value.images.map((m:any) => mediaUrl(m.url))
  }
  // cas classique Strapi
  const d = item.value?.images?.data
  return Array.isArray(d) ? d.map((x:any) => mediaUrl(x?.attributes?.url)).filter(Boolean) : []
})

</script>

<template>
  <article class="container py-5" v-if="item">
    <NuxtLink to="/exposition" class="btn btn-link p-0 mb-3">← Retour</NuxtLink>

    <h1 class="display-6">{{ item.title || '(sans titre)' }}</h1>

    <p class="text-muted" v-if="item.period">
      {{ item.period?.startDate }} — {{ item.period?.endDate }}
    </p>

    <img
  v-if="gallery[0]"
  :src="gallery[0]"
  :alt="item.title"
  class="img-fluid my-3"
  style="max-width:900px;display:block"
/>

<div v-if="gallery.length > 1" class="my-3" style="display:flex;gap:12px;flex-wrap:wrap;">
  <img v-for="(src,i) in gallery.slice(1)" :key="i" :src="src" :alt="`${item.title} ${i+2}`" style="width:260px;height:auto;" />
</div>


    <!-- description -->
    <div v-if="item.description" class="content" v-html="item.description"></div>

    <!-- artistes -->
    <section v-if="item.artists?.length" class="mt-4">
      <h2 class="h5">Artistes</h2>
      <ul class="list-unstyled mb-0">
        <li v-for="(a, i) in item.artists" :key="i">
          <template v-if="a.url"><a :href="a.url" target="_blank" rel="noopener">{{ a.name }}</a></template>
          <template v-else>{{ a.name }}</template>
          <span v-if="a.role"> — {{ a.role }}</span>
        </li>
      </ul>
    </section>

    <!-- lieu -->
    <section v-if="item.location" class="mt-4">
      <h2 class="h5">Lieu</h2>
      <div>
        <strong>{{ item.location?.name }}</strong><br />
        <span v-if="item.location?.address">{{ item.location.address }}</span>
        <span v-if="item.location?.city">, {{ item.location.city }}</span><br />
        <a v-if="item.location?.url" :href="item.location.url" target="_blank" rel="noopener">Site du lieu</a>
      </div>
    </section>

    <!-- crédits -->
    <section v-if="item.credits" class="mt-4">
      <h2 class="h6">Crédits</h2>
      <p class="mb-0">{{ item.credits }}</p>
    </section>

    <!-- fichiers / presse -->
    <section v-if="item.files?.data?.length" class="mt-4">
      <h2 class="h6">Documents</h2>
      <ul class="mb-0">
        <li v-for="f in item.files.data" :key="f.id">
          <a :href="f.attributes?.url" target="_blank" rel="noopener">
            {{ f.attributes?.name || 'Télécharger' }}
          </a>
        </li>
      </ul>
    </section>
  </article>

  <article v-else class="container py-5">
    <NuxtLink to="/exposition" class="btn btn-link p-0 mb-3">← Retour</NuxtLink>
    <p>Exposition introuvable.</p>
  </article>
</template>
