<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '~/composables/useApi'

const { get, mediaUrl } = useApi()

// Fetch
const res = await get<any>('/expositions', {
  populate: ['images', 'period'],      // => ?populate=images&populate=period (grâce à buildQS)
  sort: 'createdAt:desc',
  'pagination[pageSize]': 20,
})

console.log("DATA STRAPI =>", res.value?.data?.[0]);

// Tableau brut (ou [] si rien)
const raw = computed(() => Array.isArray(res.value?.data) ? res.value!.data : [])

// Normalisation : si l’item a "attributes", on le “flatten”
const items = computed(() =>
  raw.value.map((it: any) => it?.attributes ? { id: it.id, ...it.attributes } : it)
)

function firstImagePath(obj: any): string | undefined {
  const flat = obj?.images?.[0]?.url
  if (flat) return flat
  const rel = obj?.images?.data?.[0]?.attributes?.url
  return rel
}

// Helper image (Strapi peut renvoyer images.data[0].attributes.url)
function coverUrl(item:any) {
  const rel = firstImagePath(item)
  return rel ? mediaUrl(rel) : ''
}
</script>

<template>
  <main class="container py-5">
    <h1 class="h3 mb-4">Expositions</h1>

    <p v-if="!items.length">Aucune expo trouvée…</p>

    <ul v-else class="list-unstyled">
      <li v-for="e in items" :key="e.id ?? e.slug">
        <NuxtLink :to="`/exposition/${e.slug}`" class="text-decoration-none">
          <img
  v-if="coverUrl(e)"
  :src="coverUrl(e)"
  :alt="e.title"
  style="max-width:320px;display:block"
/>
          <strong>{{ e.title || '(sans titre)' }}</strong>
          <div v-if="e.period">
            {{ e.period?.startDate }} — {{ e.period?.endDate }}
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
