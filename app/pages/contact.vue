<script setup lang="ts">
const contact = {
  name: "La Nombreuse",
  addressLine1: "Rue du fort 42222",
  addressLine2: "1060 Bruxelles",
  email: "lanombreuse@gmail.com",
  photoUrl: "/Nombreuse_expo_2022_2.JPG",
  mapUrl: "https://www.google.com/maps/place/La+Nombreuse/@50.8288276,4.3422884,19z/data=!3m1!4b1!4m6!3m5!1s0x47c3c52b4f439c89:0x44070cb9fabd22b2!8m2!3d50.8288276!4d4.3429321!16s%2Fg%2F11r4_tb911?entry=ttu&g_ep=EgoyMDI1MDkyMS4wIKXMDSoASAFQAw%3D%3D"
}
</script>

<template>
  <main class="wrap">
    <p class="intro">
      Créée en 2020, La Nombreuse n’est ni une galerie ni un “white cube", mais un espace polymorphe dédié à la création photographique.<br /> <br />
      A sa racine; 8 photographes et une coordinatrice qui partageaient plusieurs envies. Créer de nouvelles synergies et mettre en commun leurs compétences afin de présenter aux publics les nombreux talents qui s’activent dans les domaines qui touchent la photographie.<br /> <br />
      Ensemble, iels s’appliquent à montrer la vivacité et la richesse de cette scène en partageant avec celles et ceux qui le souhaitent leur passion pour l’image à travers des expositions novatrices, des visites guidées, des workshops gratuits pour publics spécifiques, des animations scolaires, des conférences et discussions, des collaborations surprenantes. En transmettant simplement des clés de compréhension et de lecture, La Nombreuse partage ses connaissances et ses apprentissages au sujet des images qui façonnent notre époque, nos sociétés comme nos identités. 
    </p>

    <section class="card">
      <div class="info">
        <h2 class="name">{{ contact.name }}</h2>

        <p class="row">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.35-7-10a7 7 0 1 1 14 0c0 5.65-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="11" r="2.5" fill="currentColor"/></svg>
          <span>
            <a v-if="contact.mapUrl" :href="contact.mapUrl" target="_blank" rel="noopener">
              {{ contact.addressLine1 }}<br />{{ contact.addressLine2 }}
            </a>
            <template v-else>
              {{ contact.addressLine1 }}<br />{{ contact.addressLine2 }}
            </template>
          </span>
        </p>

        <p class="row">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5 10.7 12a2 2 0 0 0 2.6 0L21 6.5M4 18h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
          <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
        </p>
      </div>

      <figure class="photo" v-if="contact.photoUrl">
        <img :src="contact.photoUrl" alt="Photo de l’établissement" loading="lazy" />
      </figure>
    </section>
  </main>
</template>

<style scoped>

.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px 16px 80px;
}
.page-title {
  font-size: 28px;
  margin: 0 0 20px;
}

.intro {
  font-size: 16px;
  margin-bottom: 32px;
  color: #000000;
  line-height: 1.2;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
}
@media (min-width: 900px) {
  .card { grid-template-columns: 1fr 1.1fr; align-items: start; }
}

.info .name {
  margin: 0 0 12px;
  font-size: 22px;
}
.row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 10px 0;
  color: #222;
}
.row a {
  color: inherit;
  text-decoration: none;
}
.row a:hover {
  text-decoration: underline;
}
.ico {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  margin-top: 2px;
}

.photo {
  margin: 0;
}
.photo img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
}
</style>
