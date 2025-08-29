<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { setResponseStatus } from '#app'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'

const route = useRoute()
const { get } = useApi()
const { galleryUrls } = useMedia()

const res = await get<any>('/showoffs', {
  'filters[slug][$eq]': String(route.params.slug),
  populate: ['images', 'period', 'lieu'],
  'pagination[pageSize]': 1
})
const raw = computed(() => res.value?.data?.[0] ?? null)
if (!raw.value) setResponseStatus(404)

const item = computed(() => raw.value?.attributes ? ({ id: raw.value.id, ...raw.value.attributes }) : raw.value)
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
    <NuxtLink to="/showoff" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </NuxtLink>

    <header class="head">
      <h1 class="title">{{ item.title }}</h1>
      <p v-if="item.period" class="date">{{ fmtRange(item.period) }}</p>
    </header>

    <section v-if="gallery.length" class="gallery">
      <img v-for="(src,i) in gallery" :key="i" :src="src" :alt="`${item.title} — visuel ${i+1}`" loading="lazy" />
    </section>

    <section v-if="typeof item.description === 'string'" class="body content">
      <p v-for="(p,i) in item.description.split(/\n{2,}/)" :key="i">{{ p }}</p>
    </section>
  </main>

  <main v-else class="wrap">
    <NuxtLink to="/showoff" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
    </NuxtLink>
    <p>Projet Showoff introuvable.</p>
  </main>
</template>


<style scoped>
/* conteneur sobre */
.wrap {
  max-width: 960px;
  margin-left: 10px;
  padding: 24px 16px 80px;
}

/* flèche retour */
.back {
  display: inline-flex;
  align-items: center;
  color: #111;
  text-decoration: none;
  margin-bottom: 12px;
}
.back:hover { opacity: .8; }

/* en-tête : titre + date en ligne */
.head {
  display: flex;
  gap: 16px;
  align-items: baseline;
  flex-wrap: wrap; /* passe à la ligne sur mobile */
  margin-bottom: 16px;
}
.title {
  font-size: 28px;
  line-height: 1.2;
  margin: 0;
}
.date {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* galerie : images homogènes, non recadrées, largeur raisonnable */
.gallery {
  display: grid;
  grid-template-columns: 1fr;    /* 1 par ligne par défaut */
  gap: 16px;
  margin: 12px 0 24px;
}
.gallery img {
  display: block;
  width: 100%;
  max-width: 900px;  /* limite la largeur pour garder de l’air */
  height: auto;      /* conserve le ratio naturel (pas de recadrage) */
  border-radius: 8px;
  margin: 0 auto;    /* centre l’image si plus petite que la colonne */
}

/* texte */
.body {
  line-height: 1.65;
  color: #222;
}
.body :deep(p) { margin: 0 0 1em; }

/* responsive : deux colonnes dès écran moyen (si plusieurs images) */
@media (min-width: 1024px) {
  .gallery {
    grid-template-columns: 1fr 1fr; /* si plusieurs images, ça aligne joliment */
  }
}
</style>