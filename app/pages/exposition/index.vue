<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const { get } = useApi()
const { coverUrl } = useMedia()

// Fetch
const res = await get<any>('/expositions', {
  populate: ['images', 'period'],
  sort: 'createdAt:desc',
  'pagination[pageSize]': 20
})

// Normalisation
const raw = computed(() => Array.isArray(res.value?.data) ? res.value!.data : [])
const items = computed(() =>
  raw.value.map((it:any) => it?.attributes ? ({ id: it.id, ...it.attributes }) : it)
)

// Format FR lisible
function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year:'numeric', month:'long', day:'2-digit' })
  const start = fmt.format(new Date(period.startDate))
  const end = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return end ? `${start} — ${end}` : start
}
</script>

<template>
  <main class="wrap">
    <h1 class="page-title">Expositions</h1>

    <p v-if="!items.length" class="empty">Aucune expo trouvée…</p>

    <section v-else class="list">
      <article v-for="e in items" :key="e.id ?? e.slug" class="item">
        <header class="head">
          <h2 class="title">
            <NuxtLink :to="`/exposition/${e.slug}`">{{ e.title }}</NuxtLink>
          </h2>
          <p v-if="e.period" class="date">{{ fmtRange(e.period) }}</p>
        </header>

        <figure v-if="coverUrl(e)" class="media">
          <NuxtLink :to="`/exposition/${e.slug}`">
            <img :src="coverUrl(e)" :alt="e.title" loading="lazy" />
          </NuxtLink>
        </figure>
      </article>
    </section>
  </main>
</template>

<style scoped>
/* Conteneur sobre et lisible */
.wrap {
  max-width: 920px;
  margin: 0 auto;
  padding: 32px 16px 80px;
}

/* Titre de page */
.page-title {
  font-size: 28px;
  line-height: 1.2;
  margin: 0 0 20px;
}

/* Liste : un article = une ligne */
.list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Carte simple */
.item {
  padding-bottom: 24px;
  border-bottom: 1px solid #e7e7e7;
}

/* En-tête : titre + date */
.head {
  margin-bottom: 12px;
}
.title {
  font-size: 20px;
  margin: 0 0 4px;
}
.title a {
  color: inherit;
  text-decoration: none;
}
.title a:hover {
  text-decoration: underline;
}
.date {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Image en dessous, plein largeur, ratio correct */
.media {
  margin: 0;
}
.media img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  /* Optionnel: ratio visuel constant si tes images sont hétérogènes */
  /* aspect-ratio: 16/9; object-fit: cover; */
}

/* État vide */
.empty {
  color: #666;
  margin-top: 8px;
}
</style>
