<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../../composables/useApi'
import { marked } from 'marked'

/* ----------------------------------------------------------
   CONFIG DE BASE
---------------------------------------------------------- */
const route = useRoute()
const { get, mediaUrl } = useApi()

// Typage d'image enrichie
type ImgItem = { src: string; alt: string; caption: string }

/* ----------------------------------------------------------
   OUTILS
---------------------------------------------------------- */

/** Normalise un champ média Strapi (flat/single/multiple) */
function nodesFrom(field: any): any[] {
  if (!field) return []
  if (Array.isArray(field?.data)) return field.data.map((n: any) => n?.attributes ?? n)
  if (field?.data?.attributes) return [field.data.attributes]
  if (Array.isArray(field)) return field
  if (field?.url) return [field]
  return []
}

/** Transforme un tableau d’objets Strapi en ImgItem[] */
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
   FETCH DE L’EXPOSITION
---------------------------------------------------------- */
const res = await get<any>('/expositions', {
  'filters[slug][$eq]': route.params.slug,
  populate: ['images', 'period', 'artists', 'location', 'files'],
  'pagination[pageSize]': 1
})

const raw = computed(() => res.value?.data?.[0] ?? null)
const item = computed(() => raw.value?.attributes ? ({ id: raw.value.id, ...raw.value.attributes }) : raw.value)

/* ----------------------------------------------------------
   COMPUTED
---------------------------------------------------------- */

// Images principales avec légendes
const heroImages = computed(() => toImages(nodesFrom(item.value?.images)))

// Fichiers (autres visuels)
const fileImages = computed(() => toImages(nodesFrom(item.value?.files), true))

// Description markdown → HTML
const descriptionHtml = computed(() =>
  item.value?.description ? marked.parse(item.value.description) : ''
)

// Format de période
function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' })
  const start = fmt.format(new Date(period.startDate))
  const end = period.endDate ? fmt.format(new Date(period.endDate)) : ''
  return end ? `${start} — ${end}` : start
}
</script>




<template>
  <main class="wrap" v-if="item">
    <NuxtLink to="/exposition" class="back" aria-label="Retour à la liste des expositions">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </NuxtLink>

    <header class="head">
      <h1 class="title">
        {{ item.title }}
        <span v-if="item.expotitre"> — <em>{{ item.expotitre }}</em></span>
      </h1>
      <p v-if="item.period" class="date">{{ fmtRange(item.period) }}</p>
    </header>

    <!-- BLOC HAUT : galerie principale à gauche + texte à droite -->
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

        <!-- Vidéo liée à la galerie -->
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
    <NuxtLink to="/exposition" class="back" aria-label="Retour">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </NuxtLink>
    <p>Exposition introuvable.</p>
  </main>
</template>



<style scoped>
.wrap {
  max-width: 960px;
  margin-left: 10px;
  padding: 24px 16px 80px;
}

.back {
  display: inline-flex;
  align-items: center;
  color: #111;
  text-decoration: none;
  margin-bottom: 12px;
}
.back:hover { opacity: .8; }

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

/* Galerie principale (colonne de gauche sur desktop) */
.main-gallery {
  max-width: 540px;
}

/* Fichiers images (plein largeur, centré) */
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

/* Crédit */
.credit {
  margin-top: 6px;
  width: 100%;
  max-width: 900px;
  font-size: 12px;
  color: #777;
  font-style: italic;
  text-align: left;
}

/* Texte */
.body {
  line-height: 1.65;
  color: #222;
}
.body :deep(p) {
  margin: 0 0 1em;
}

/* Desktop : description à droite de la galerie principale */
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

  /* Galerie des fichiers en 2 colonnes sur la largeur du wrap */
  .files-gallery {
    grid-template-columns: 1fr 1fr;
  }
}

</style>
