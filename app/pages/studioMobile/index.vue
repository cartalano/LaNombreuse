<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const { get } = useApi()
const { coverUrl } = useMedia()

const res = await get<any>('/studio-mobiles', {
  populate: ['images', 'period'],
  sort: 'createdAt:desc',
  'pagination[pageSize]': 20
})

const raw = computed(() => Array.isArray(res.value?.data) ? res.value!.data : [])
const items = computed(() =>
  raw.value.map((it:any) => it?.attributes ? ({ id: it.id, ...it.attributes }) : it)
)

// format de date FR
function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year:'numeric', month:'long', day:'2-digit' })
  const start = fmt.format(new Date(period.startDate))
  const end = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return end ? `${start} — ${end}` : start
}

// extrait des 50 premiers mots
function excerpt(text?: string, words = 50) {
  if (!text) return ''
  return text.split(/\s+/).slice(0, words).join(' ') + '…'
}
</script>

<template>
  <main class="wrap">
    <h1 class="page-title">Studio Mobile</h1>
    <p class="intro"><h2> Studio photographique itinérant</h2>
        Depuis 2020, La Nombreuse propose, sur demande, des studios photographiques itinérants.<br /><br />
        Légers, mobiles et adaptables, nos studios s’installent aussi bien en intérieur qu’en extérieur.<br /><br />
        Piloté par un duo de photographes et accompagné d’une personne dédiée à l’accueil du public,
        ce dispositif est pensé comme un outil de rencontre et de cartographie sensible d’un lieu à un instant T :
        une place publique en plein été, une fête de Nouvel An, une brocante, un événement familial, la Foire du Midi…<br /><br />
        Menée collectivement, chaque session permet aux participant·es de repartir avec une photo de famille, un portrait, ou une trace digitale de ce moment partagé.
        <h2>Envie de proposer cette expérience ?</h2>
        lanombreuse@gmail.com
    </p>

    <p v-if="!items.length" class="empty"></p>

    <section v-else class="list">
      <article v-for="e in items" :key="e.id ?? e.slug" class="item">
        <figure v-if="coverUrl(e)" class="media">
          <NuxtLink :to="`/studioMobile/${e.slug}`">
            <img :src="coverUrl(e)" :alt="e.title" loading="lazy" />
          </NuxtLink>
        </figure>

        <div class="content">
          <h2 class="title">
            <NuxtLink :to="`/studioMobile/${e.slug}`">{{ e.title }}</NuxtLink>
          </h2>
          <p v-if="e.period" class="date">{{ fmtRange(e.period) }}</p>
          <p v-if="e.description" class="excerpt">{{ excerpt(e.description) }}</p>
        </div>
      </article>
    </section>
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
  max-width: 640px;
  font-size: 15px;
  color: #000000;
  line-height: 1.3;
  
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
}

.media {
  flex: 0 0 280px; /* largeur fixe image */
}
.media img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
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
  margin: 0;
}
.empty {
  color: #666;
}
</style>
