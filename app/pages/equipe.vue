<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
const { get, mediaUrl } = useApi()
const { galleryUrls } = useMedia()



const { galleryFrom } = useMedia()

// Récupération
const res = await get<any>('/members', {
  populate: {
    photo:     { fields: ['url','alternativeText','width','height'] },
    portfolio: { fields: ['url','alternativeText','width','height'] }
  },
  sort: 'lastName:asc',
  'pagination[pageSize]': 100
})

// Tableau brut
const raw = computed(() => Array.isArray(res.value?.data) ? res.value!.data : [])

// Normalisation : on accepte les 2 formes (row.attributes || row)
const members = computed(() =>
  raw.value.map((row: any) => {
    const a = row?.attributes ?? row ?? {}
    return {
      id: row.id ?? a.id,
      firstName: a.firstName ?? '',
      lastName: a.lastName ?? '',
      role: a.role ?? '',
      bio:  a.bio  ?? '',
      bioHtml:   a.bio ? marked.parse(a.bio) : '',
      // useMedia va convertir en URLs absolues et gérer plat/classique
      gallery: galleryFrom(a, { cover: 'photo', gallery: 'portfolio', limit: 6 })
    }
    
  })
)
</script>

<template>
  <main class="wrap">
    <h1 class="page-title">L’équipe</h1>

    <section v-if="members.length" class="team">
      <article v-for="m in members" :key="m.id" class="card">
        <div class="left">
          <TeamCaroussel :images="m.gallery" alt="Visuels membre" :start="0" />
        </div>
        <div class="right">
          <h2 class="name">
            {{ m.firstName }} {{ m.lastName }}
            <small v-if="m.role"> — {{ m.role }}</small>
          </h2>

          <!-- bio en HTML (markdown rendu) -->
          <div v-if="m.bioHtml" class="bio" v-html="m.bioHtml" />
        </div>
      </article>
    </section>

    <p v-else>Aucun membre publié…</p>
  </main>
</template>


<style scoped>
.wrap {
  max-width: 920px;
  margin-left: 30px;
  padding: 32px 16px 80px;
}

.page-title {
  font-size: 28px;
  line-height: 1.2;
  margin: 0 0 24px;
}

.team { 
  display: flex; 
  flex-direction: column; 
  gap: 5rem; 
}

.card { 
  display: grid;
  grid-template-columns: 320px 1fr; 
  gap: 3rem; 
  align-items: start; 
}
.left, .right { 
  min-width: 0; 
}

.name { 
  margin: 0 0 .5rem; 
  font-size: 1.4rem; 
}
.name small { 
  font-weight: normal; 
  color: #666; 
}

/* Texte bio */
.bio { 
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.3; 
}

.bio :deep(p) { 
  margin: .6rem 0; 
  line-height: 1.55; 
}

/* Liens dans le markdown : pas de violet ni underline permanent */
.bio :deep(a) { 
  color: inherit;          /* garde la couleur du texte */
  text-decoration: none;   /* enlève le soulignement */
}
.bio :deep(a:hover) {
  text-decoration: underline;  /* optionnel : underline au hover */
}
.bio :deep(a:visited) {
  color: inherit;              /* évite le violet */
}

.bio :deep(h2),
.bio :deep(h3) { 
  margin: 1rem 0 .5rem; 
}

@media (max-width: 1024px) {
  .card { grid-template-columns: 1fr; }
}
</style>

