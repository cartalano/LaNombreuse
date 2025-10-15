<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { setResponseStatus } from '#app'
import { useApi } from '../../composables/useApi'
import { marked } from 'marked'

/* ----------------------------------------------------------
   CONFIG
---------------------------------------------------------- */
const route = useRoute()
const { get, mediaUrl } = useApi()

type ImgItem = { src: string; alt: string; caption: string }

/* ----------------------------------------------------------
   OUTILS
---------------------------------------------------------- */

/** Normalise un champ média Strapi (flat / single / multiple) en tableau d'objets attributes */
function nodesFrom(field: any): any[] {
  if (!field) return []
  if (Array.isArray(field?.data)) return field.data.map((n: any) => n?.attributes ?? n)
  if (field?.data?.attributes)   return [field.data.attributes]
  if (Array.isArray(field))       return field
  if (field?.url)                 return [field]
  return []
}

/** Transforme les attributes Strapi en ImgItem[], avec filtre optionnel image/* */
function toImages(nodes: any[], onlyImages = false): ImgItem[] {
  return nodes
    .filter((n) => !onlyImages || (n?.mime ?? '').startsWith('image/'))
    .map((a: any) => ({
      src: a?.url ? mediaUrl(a.url) : '',
      alt: a?.alternativeText || '',
      caption: a?.caption || ''
    }))
    .filter((i) => !!i.src)
}

/* ----------------------------------------------------------
   FETCH (Fotofort)
---------------------------------------------------------- */
const res = await get<any>('/fotoforts', {
  'filters[slug][$eq]': String(route.params.slug),
  populate: {
    images: { fields: ['url', 'alternativeText', 'caption', 'width', 'height', 'mime'] },
    files:  { fields: ['url', 'alternativeText', 'caption', 'width', 'height', 'mime'] },
    period: true,
    speakers: true,
    lieu: true,
  },
  'pagination[pageSize]': 1
})


const raw  = computed(() => res.value?.data?.[0] ?? null)
if (!raw.value) setResponseStatus(404)

const item = computed(() =>
  raw.value?.attributes ? ({ id: raw.value.id, ...raw.value.attributes }) : raw.value
)

/* ----------------------------------------------------------
   COMPUTED
---------------------------------------------------------- */

// Images principales (avec captions)
const heroImages = computed<ImgItem[]>(() => toImages(nodesFrom(item.value?.images)))

// Fichiers médias additionnels (ne garder que image/*)
const fileImages = computed<ImgItem[]>(() => toImages(nodesFrom(item.value?.files), true))

// Description Markdown → HTML (si besoin)
const descriptionHtml = computed(() =>
  item.value?.description ? marked.parse(item.value.description) : ''
)

// Format période FR
function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' })
  const a = fmt.format(new Date(period.startDate))
  const b = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return b ? `${a} — ${b}` : a
}
</script>

<template>
  <main class="wrap" v-if="item">
    <NuxtLink to="/fotofort" class="back" aria-label="Retour à la liste des Fotofort">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </NuxtLink>

    <header class="head">
      <h1 class="title">{{ item.title }}</h1>
      <p v-if="item.period" class="date">{{ fmtRange(item.period) }}</p>
    </header>

    <!-- Galerie principale -->
    <section v-if="heroImages.length" class="gallery">
      <figure v-for="(img,i) in heroImages" :key="`hero-${i}`" class="media">
        <img :src="img.src" :alt="img.alt || `${item.title} — visuel ${i+1}`" loading="lazy" />
        <figcaption v-if="img.caption" class="credit">{{ img.caption }}</figcaption>
      </figure>
    </section>

    <!-- Corps -->
    <section v-if="descriptionHtml" class="body content" v-html="descriptionHtml" />

    <!-- Fichiers images additionnels -->
    <section v-if="fileImages.length" class="gallery">
      <figure v-for="(img,i) in fileImages" :key="`file-${i}`" class="media">
        <img :src="img.src" :alt="img.alt || `${item.title} — fichier ${i+1}`" loading="lazy" />
        <figcaption v-if="img.caption" class="credit">{{ img.caption }}</figcaption>
      </figure>
    </section>
      <!-- Vidéo (seule ou en plus) -->
    <section v-if="item.videoUrl" class="gallery">
      <div class="video-wrap">
        <VideoEmbed :url="item.videoUrl" />
      </div>
    </section>
  </main>

  <main v-else class="wrap">
    <NuxtLink to="/fotofort" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </NuxtLink>
    <p>Fotofort introuvable.</p>
  </main>
</template>

<style scoped>
.wrap {
  max-width: 960px;
  margin-left: 10px;
  padding: 24px 16px 40px;
}

/* Back */
.back {
  display: inline-flex;
  align-items: center;
  color: #111;
  text-decoration: none;
  margin-bottom: 12px;
}
.back:hover { opacity: .8; }

/* Header */
.head { display: block; gap: 16px; margin-bottom: 16px; }
.title { font-size: 28px; line-height: 1.2; margin: 0; }
.date { margin: 0; color: #666; font-size: 14px; }

/* Galerie */
.gallery {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 12px 0 24px;
}
.media {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.media img {
  display: block;
  width: 100%;
  max-width: 900px;
  height: auto;
  border-radius: 8px;
  margin: 0 auto;
}

/* Crédit photo */
.credit {
  margin-top: 6px;
  width: 100%;
  max-width: 900px;
  font-size: 12px;
  color: #777;
  font-style: italic;
  text-align: left; /* ajuste si tu préfères right */
}

/* Texte */
.body {
  line-height: 1.65;
  color: #222;
  text-align: justify;
  text-justify: inter-word;
}
.body :deep(p) { margin: 0 0 1em; }
.video-wrap {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden; /* si tu veux des coins arrondis visibles */
}
/* Responsive */
@media (min-width: 1024px) {
  .gallery { grid-template-columns: 1fr 1fr; }
}
</style>
