<script setup lang="ts">
import { computed } from 'vue'
import { useApi } from '../composables/useApi'
import { useMedia } from '../composables/useMedia'

const { get } = useApi()
const { coverUrl } = useMedia()

// Helpers date (comparaison sur AAAA-MM-JJ pour éviter les soucis de fuseau)
const todayISO = new Date().toISOString().slice(0,10)
const toISO = (d?: string) => d ? new Date(d).toISOString().slice(0,10) : ''

// Normalisation commune pour mixer les 4 collections
type Kind = 'expositions'|'fotoforts'|'workshops'|'showoffs'|'studio-mobiles'
function routeBaseOf(kind: Kind) {
  return kind === 'expositions' ? 'exposition'
       : kind === 'fotoforts'   ? 'fotofort'
       : kind === 'workshops'   ? 'workshop'
       : kind === 'studio-mobiles' ? 'studioMobile'
       : 'showoff'
}
function flat(d:any, kind: Kind) {
  const a = d?.attributes ?? d
  return {
    id: d.id ?? a.id,
    kind,
    routeBase: routeBaseOf(kind),
    title: a.title,
    slug: a.slug,
    period: a.period ?? null,
    images: a.images ?? null,
    createdAt: a.createdAt
  }
}

// Fetch des 4 types (on reste raisonnable en volume)
const [exRes, fotRes, worRes, shoRes] = await Promise.all([
  get<any>('/expositions', { populate: ['images','period'], 'pagination[pageSize]': 30, sort: 'period.startDate:asc' }),
  get<any>('/fotoforts',   { populate: ['images','period'], 'pagination[pageSize]': 30, sort: 'period.startDate:asc' }),
  get<any>('/workshops',   { populate: ['images','period'], 'pagination[pageSize]': 30, sort: 'period.startDate:asc' }),
  get<any>('/showoffs',    { populate: ['images','period'], 'pagination[pageSize]': 30, sort: 'period.startDate:asc' }),
  get<any>('/studio-mobiles',    { populate: ['images','period'], 'pagination[pageSize]': 30, sort: 'period.startDate:asc' }),
])

const all = computed(() => {
  const E = (exRes.value?.data ?? []).map((d:any)=> flat(d,'expositions'))
  const F = (fotRes.value?.data ?? []).map((d:any)=> flat(d,'fotoforts'))
  const W = (worRes.value?.data ?? []).map((d:any)=> flat(d,'workshops'))
  const S = (shoRes.value?.data ?? []).map((d:any)=> flat(d,'showoffs'))
  return [...E, ...F, ...W, ...S]
})

// À venir = fin non passée (inclut futur + en cours)
const upcoming = computed(() =>
  all.value
    .filter(e => !e?.period?.endDate || toISO(e.period.endDate) >= todayISO)
    .sort((a,b) => (a.period?.startDate||'').localeCompare(b.period?.startDate||''))
    .slice(0, 2)
)

// Passés = fin strictement avant aujourd'hui (3 derniers)
const past = computed(() =>
  all.value
    .filter(e => e?.period?.endDate && toISO(e.period.endDate) < todayISO)
    .sort((a,b) => (b.period?.endDate||'').localeCompare(a.period?.endDate||''))
    .slice(0, 3)
)

// format FR
function fmtRange(period?: { startDate?: string; endDate?: string }) {
  if (!period?.startDate) return ''
  const fmt = new Intl.DateTimeFormat('fr-FR',{year:'numeric',month:'long',day:'2-digit'})
  const a = fmt.format(new Date(period.startDate))
  const b = period?.endDate ? fmt.format(new Date(period.endDate)) : ''
  return b ? `${a} — ${b}` : a
}
function toUrl(e:any) { return `/${e.routeBase}/${e.slug}` }
</script>

<template>
  <main class="wrap">
    <!-- À VENIR (1 ou 2 cartes plein largeur) -->
    <section class="block">
      <h2 class="h">Événements à venir</h2>

      <div v-if="upcoming.length" class="upcoming-grid" :class="{'two': upcoming.length === 2, 'one': upcoming.length === 1}">
        <article v-for="e in upcoming" :key="e.id" class="hero-card">
          <NuxtLink :to="toUrl(e)" class="hero-link">
            <figure v-if="coverUrl(e)" class="hero-media">
              <img :src="coverUrl(e)" :alt="e.title" loading="eager" />
            </figure>
            <div class="hero-text">
              <p class="badge">{{ e.routeBase }}</p>
              <h3 class="title">{{ e.title }}</h3>
              <p v-if="e.period" class="date">{{ fmtRange(e.period) }}</p>
            </div>
          </NuxtLink>
        </article>
      </div>

      <p v-else class="empty">Rien à venir pour l’instant.</p>
    </section>

    <!-- DERNIERS ÉVÉNEMENTS PASSÉS (3 cartes) -->
    <section class="block">
      <h2 class="h">Derniers événements</h2>
      <ul v-if="past.length" class="cards">
        <li v-for="e in past" :key="e.id" class="card">
          <NuxtLink :to="toUrl(e)">
            <img v-if="coverUrl(e)" :src="coverUrl(e)" :alt="e.title" loading="lazy" />
            <h3 class="t">{{ e.title }}</h3>
            <p v-if="e.period" class="d">{{ fmtRange(e.period) }}</p>
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="empty">Aucun événement récent.</p>
    </section>
  </main>
  <NewsLetterForm />
  <Footer />
</template>

<style scoped>
.wrap {
   max-width: 1200px; 
   margin: 0 auto; 
   padding: 12px 16px 80px; 
  }
.block {
   margin: 28px 0; 
  }
.h {
   font-size: 24px; 
   margin: 0 0 14px; 
  }

/* À venir */
.upcoming-grid {
   display: grid; 
   gap: 16px;
  }

.upcoming-grid.one .hero-card {
  /* taille cible de la card : ajuste selon ton header/viewport */
  --card-max-h: 520px;
  max-width: var(--card-max-h);;           /* optionnel */
  max-height: var(--card-max-h);
  margin: 0 auto;

  /* clé : on passe la card en colonne */
  display: flex;
  flex-direction: column;
  overflow: hidden;           /* garde les coins arrondis */
}

/* Le lien occupe toute la card et devient flex colonne */
.upcoming-grid.one .hero-link {
  display: flex;              
  flex-direction: column;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

/* Le bloc image prend tout le reste disponible */
.upcoming-grid.one .hero-media {
  flex: 1 1 auto;             /* occupe l'espace restant */
  min-height: 0;              /* évite les débordements */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

/* L'image s'adapte SANS rognage et reste entière */
.upcoming-grid.one .hero-media img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;               
  object-fit: contain;        
}

/* Le texte reste en bas, taille fixe/auto, non rogné */
.upcoming-grid.one .hero-text {
  flex: 0 0 auto;
  padding: 14px 16px 16px;
}


.upcoming-grid.two {
   grid-template-columns: 1fr 1fr; 
  }
@media (max-width: 900px){ .upcoming-grid.two { grid-template-columns: 1fr; } }

.hero-card { position: relative; 
  overflow: hidden; 
  border-radius: 14px; 
  border: 1px solid #eee; 
  background:#fff; 
}

.hero-link { 
  display: grid; 
  grid-template-rows: auto 1fr; 
  color: inherit; 
  text-decoration: none; 
}

.hero-media img { 
  width: 100%; 
  height: auto; 
  display: block; 
}

.hero-text { 
  padding: 14px 16px 16px; 
}

.badge { 
  display:inline-block; 
  font-size: 12px; 
  text-transform: uppercase; 
  letter-spacing:.04em; 
  color:#555; 
  margin:0 0 6px; 
}

.title { 
  font-size: 22px; 
  margin: 0 0 4px; 
}

.date { 
  color:#666; 
  margin:0; 
  font-size:14px; 
}

/* Derniers événements */
.cards{
  list-style:none;
  padding:0;
  margin:0 auto;                            
  display:grid;
  gap:16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 320px));
  justify-content: center;                  
}
.card { 
  border:1px solid #eee; 
  border-radius: 10px; 
  overflow:hidden; 
  background:#ffffff; 
}
.card img { 
  width:100%; 
  height:auto; 
  display:block; 
}
.card .t { 
  font-size:16px; 
  margin:.6rem .8rem .1rem; 
}
.card .d { 
  color:#666; 
  margin:0 .8rem .8rem; 
  font-size:14px; 
}

.cards a,
.cards a:link,
.cards a:visited {
  color: inherit;           
  text-decoration: none;    
  outline: none;
  -webkit-tap-highlight-color: transparent; 
}

.empty { 
  color:#666; 
}

/* Hover subtil */
.hero-card:hover, .card:hover { 
  transform: translateY(-1px); 
  transition: .2s ease; 
}
</style>
