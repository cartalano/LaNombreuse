<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const { get } = useApi()
const { coverUrl } = useMedia()

const res = await get<any>('/fotoforts', {
  populate: ['images', 'period'],
  sort: 'createdAt:desc',
  'pagination[pageSize]': 20
})
const raw = computed(() => Array.isArray(res.value?.data) ? res.value!.data : [])
const items = computed(() => raw.value.map((it:any) => it.attributes ? ({ id: it.id, ...it.attributes }) : it))

function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year:'numeric', month:'long', day:'2-digit' })
  const a = fmt.format(new Date(period.startDate))
  const b = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return b ? `${a} — ${b}` : a
}
function excerpt(input: unknown, words = 40) {
  if (typeof input !== 'string') return ''                 // on ne tente pas de split si ce n'est pas une string
  const plain = input.replace(/<[^>]*>/g, ' ')             // si c’est du HTML, on vire les balises
                      .replace(/\s+/g, ' ')
                      .trim()
  if (!plain) return ''
  return plain.split(' ').slice(0, words).join(' ') + '…'
}
</script>

<template>
  <main class="wrap">
    <h1 class="page-title">Fotoforts</h1>
    <p class="intro">
      Un projecteur, deux invité·e·s, trente places assises.
      Les Fotofort sont des projections photographiques au format carte blanche,
      sans modération. Photographes, curateur·rice·s et acteur·rice·s culturels y partagent leurs
      projets en cours dans une atmosphère conviviale, comme à la maison.

    </p>
    <section v-if="items.length" class="list">
      <article v-for="w in items" :key="w.id ?? w.slug" class="item">
        <figure v-if="coverUrl(w)" class="media">
          <NuxtLink :to="`/fotofort/${w.slug}`">
            <img :src="coverUrl(w)" :alt="w.title" loading="lazy" />
          </NuxtLink>
        </figure>
        <div class="content">
          <h2 class="title"><NuxtLink :to="`/fotofort/${w.slug}`">{{ w.title }}</NuxtLink></h2>
          <p v-if="w.period" class="date">{{ fmtRange(w.period) }}</p>
          <p v-if="w.description" class="excerpt">{{ excerpt(w.description) }}</p>
        </div>
      </article>
    </section>
    <p v-else>Aucun fotofort trouvé…</p>
  </main>
</template>

<style scoped>
.wrap {
  max-width: 820px;
  margin-left: 30px;
  padding: 32px 16px 80px;
}

.page-title {
  font-size: 28px;
  line-height: 1.2;
  margin: 0 0 24px;
}

.intro {
  font-size: 16px;
  margin-bottom: 32px;
  color: #000000;
  line-height: 1.5;
  border-bottom: #000000 1px solid;
  padding-bottom: 12px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.item {
  display: flex;
  gap: 34px;
  align-items: flex-start;
  padding-bottom: 24px;
  border-bottom: 1px solid #ffffff;
  line-height: 1.1;
}

.media {
  margin: 0;
  flex: 0 0 280px; 
}
.media img {
  display: block;
  width: 100%;
  height: auto;
}

.content {
  flex: 1;
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

}
.empty {
  color: #666;
}
</style>
