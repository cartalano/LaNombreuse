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

/** Normalise un champ média Strapi (flat / single / multiple) → tableau d’"attributes" */
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
   FETCH (Workshop)
---------------------------------------------------------- */
const res = await get<any>('/workshops', {
  'filters[slug][$eq]': String(route.params.slug),
  populate: {
    images:   { fields: ['url', 'alternativeText', 'caption', 'width', 'height', 'mime'] },
    files:    { fields: ['url', 'alternativeText', 'caption', 'width', 'height', 'mime'] },
    period:   true,
  },
  'pagination[pageSize]': 1
})

const raw = computed(() => res.value?.data?.[0] ?? null)
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

// Description Markdown → HTML
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
    <NuxtLink to="/workshop" class="back" aria-label="Retour à la liste des workshops">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </NuxtLink>

    <header class="head">
      <h1 class="title">{{ item.title }}</h1>
      <p v-if="item.period" class="date">{{ fmtRange(item.period) }}</p>
    </header>

    <!-- BLOC HAUT : galerie principale à gauche + description à droite -->
    <section v-if="heroImages.length || descriptionHtml" class="top">
      <!-- Galerie principale -->
      <div v-if="heroImages.length" class="gallery main-gallery">
        <figure v-for="(img,i) in heroImages" :key="`hero-${i}`" class="media">
          <img
            :src="img.src"
            :alt="img.alt || `${item.title} — visuel ${i+1}`"
            loading="lazy"
          />
          <figcaption v-if="img.caption" class="credit">{{ img.caption }}</figcaption>
        </figure>

        <!-- Vidéo liée au workshop -->
        <VideoEmbed v-if="item.videoUrl" :url="item.videoUrl" />
      </div>

      <!-- Description -->
      <section v-if="descriptionHtml" class="body content" v-html="descriptionHtml" />
    </section>

    <!-- BLOC BAS : fichiers images, plein largeur -->
    <section v-if="fileImages.length" class="gallery files-gallery">
      <figure v-for="(img,i) in fileImages" :key="`file-${i}`" class="media">
        <img :src="img.src" :alt="img.alt || `${item.title} — fichier ${i+1}`" loading="lazy" />
        <figcaption v-if="img.caption" class="credit">{{ img.caption }}</figcaption>
      </figure>
    </section>
  </main>

  <main v-else class="wrap">
    <NuxtLink to="/workshop" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </NuxtLink>
    <p>Workshop introuvable.</p>
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
.head {
  display: block;
  gap: 16px;
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

/* BLOC HAUT : galerie principale + texte */
.top {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 12px 0 32px;
}

/* Galerie générique */
.gallery {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Galerie principale (colonne gauche desktop) */
.main-gallery {
  max-width: 540px;
}

/* Fichiers images additionnels : plein largeur, centrés */
.files-gallery {
  margin-top: 32px;
}

/* Figures / images */
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
  text-align: left;
}

/* Markdown */
.body {
  line-height: 1.65;
  color: #222;
}
.body :deep(p) {
  margin: 0 0 1em;
}
.body :deep(a) {
  color: inherit;
  text-decoration: none;
}
.body :deep(a:hover) {
  text-decoration: underline;
}
.body :deep(a:visited) {
  color: inherit;
}

/* Vidéo */
.video-wrap {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  overflow: hidden;
}

/* Desktop : description à droite de la galerie principale,
   fichiers en 2 colonnes */
@media (min-width: 1024px) {
  .top {
    flex-direction: row;
    align-items: flex-start;
  }

  .main-gallery {
    flex: 1 1 55%;
  }

  .body {
    flex: 1 1 45%;
    max-width: none;
    margin-left: 24px;
  }

  .files-gallery {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
