<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '../../composables/useApi'
import { useMedia } from '../../composables/useMedia'
import { marked } from 'marked'

const { get } = useApi()
const { coverUrl } = useMedia()

const res = await get<any>('/expositions', {
  populate: ['images', 'period'],
  sort: 'createdAt:desc',
  'pagination[pageSize]': 20
})

const raw = computed(() =>
  Array.isArray(res.value?.data) ? res.value!.data : []
)

const items = computed(() =>
  raw.value.map((it: any) =>
    it?.attributes ? ({ id: it.id, ...it.attributes }) : it
  )
)

// format de date FR
function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  })
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
    <h1 class="page-title">Expositions</h1>
    <p class="intro">
      Deux rendez-vous annuels dédiés aux photographes qui présentent leurs créations
      photographiques et plastiques via un commissariat collaboratif. Chaque exposition
      s’accompagne de visites guidées, d’ateliers et d’événements spécifiques pour vivre
      ensemble des temps d’exploration artistique.
    </p>

    <p v-if="!items.length" class="empty">Aucune expo trouvée…</p>

    <section v-else class="list">
      <article v-for="e in items" :key="e.id ?? e.slug" class="item">
        <figure v-if="coverUrl(e)" class="media">
          <NuxtLink :to="`/exposition/${e.slug}`">
            <img :src="coverUrl(e)" :alt="e.title" loading="lazy" />
          </NuxtLink>
        </figure>

        <div class="content">
          <h2 class="title">
            <NuxtLink :to="`/exposition/${e.slug}`">
              {{ e.title }}
              <span v-if="e.expotitre"> — <em>{{ e.expotitre }}</em></span>
            </NuxtLink>
          </h2>

          <p v-if="e.period" class="date">{{ fmtRange(e.period) }}</p>
          <div
            v-if="e.description"
            class="excerpt"
            v-html="marked.parse(excerpt(e.description))"
          />
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
  font-size: 16px;
  margin-bottom: 42px;
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
  margin: 0;
  hyphens: auto;
}

.empty {
  color: #666;
}

/* --------- Responsive --------- */

/* Tablettes / petits écrans */
@media (max-width: 900px) {
  .wrap {
    padding: 24px 16px 60px;
  }

  .item {
    gap: 20px;
  }

  .media {
    flex: 0 0 220px;
  }
}

/* Mobile : image au-dessus, texte en-dessous */
@media (max-width: 640px) {
  .page-title {
    font-size: 24px;
  }

  .intro {
    font-size: 15px;
    margin-bottom: 32px;
  }

  .item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .media {
    flex: 0 0 auto;
  }

  .media img {
    width: 100%;
  }

  .title {
    font-size: 18px;
  }

  .date {
    font-size: 13px;
  }
}
</style>
