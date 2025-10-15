<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const { get } = useApi()
const { coverUrl } = useMedia()

const res = await get<any>('/showoffs', {
  populate: ['images', 'period',],      // adapte si tu as d’autres relations
  sort: 'createdAt:desc',
  'pagination[pageSize]': 20
})

const raw = computed(() => Array.isArray(res.value?.data) ? res.value!.data : [])
const items = computed(() =>
  raw.value.map((it:any) => it.attributes ? ({ id: it.id, ...it.attributes }) : it)
)

function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year:'numeric', month:'long', day:'2-digit' })
  const a = fmt.format(new Date(period.startDate))
  const b = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return b ? `${a} — ${b}` : a
}
function excerpt(text?: string, words = 40) {
  if (typeof text !== 'string') return ''
  return text.split(/\s+/).slice(0, words).join(' ') + '…'
}
</script>

<template>
  <main class="wrap">
    <h1 class="page-title">Showoff</h1>

    <section v-if="items.length" class="list">
      <article v-for="e in items" :key="e.id ?? e.slug" class="item">
        <figure v-if="coverUrl(e)" class="media">
          <NuxtLink :to="`/showoff/${e.slug}`">
            <img :src="coverUrl(e)" :alt="e.title" loading="lazy" />
          </NuxtLink>
        </figure>
        <div class="content">
          <h2 class="title"><NuxtLink :to="`/showoff/${e.slug}`">{{ e.title }}</NuxtLink></h2>
          <p v-if="e.period" class="date">{{ fmtRange(e.period) }}</p>
          <p v-if="typeof e.description === 'string'" class="excerpt">{{ excerpt(e.description, 50) }}</p>
        </div>
      </article>
    </section>

    <p v-else>Aucun projet “Showoff” trouvé…</p>
  </main>
</template>

<style scoped>
.wrap {
  max-width: 960px;
  margin-left: 10px;
  padding: 32px 16px 80px;
}

.page-title {
  font-size: 28px;
  line-height: 1.2;
  margin: 0 0 24px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding-bottom: 24px;
  border-bottom: 1px solid #e7e7e7;
}

.media {
  flex: 0 0 280px; /* largeur fixe image */
}
.media img {
  display: block;
  width: 100%;
  height: auto;
}

.content {
  flex: 1;
  text-align: justify;
}

.title {
  font-size: 20px;
  margin: 0 0 6px;
}
.title a {
  color: inherit;
  text-decoration: none;
}
.title a:hover {
  text-decoration: underline;
}
.date {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}
.excerpt {
  color: #333;
  line-height: 1.5;
  margin: 0;
}
.empty {
  color: #666;
}
</style>