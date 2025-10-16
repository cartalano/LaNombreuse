<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-text">Nos partenaires</p>

      <div class="logos">
        <img
          v-for="(logo, i) in logos"
          :key="i"
          :src="base(logo.url)"
          :alt="logo.alt"
          loading="lazy"
        />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

// petit helper pour gérer les chemins publics
const base = (path: string) => `${config.app.baseURL.replace(/\/$/, '')}${path}`

const logos = [
  { url: '/FWB-logo.png', alt: 'FWB' },
  { url: '/cocof.png', alt: 'COCOF' },
  { url: '/ASAP_Logo.jpg', alt: 'ASAP' },
  { url: '/incidence2.png', alt: 'Incidence' },
]
</script>

<style scoped>
.footer {
  background: #ffffff;
  padding: 2rem 1rem;
  border-top: 1px solid #ddd;
  text-align: center;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-text {
  font-weight: 600;
  margin-bottom: 1rem;
}

.logos {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.logos img {
  height: 50px;
  width: auto;
  object-fit: contain;
  transition: opacity 0.2s;
}
.logos img:hover {
  opacity: 0.7;
}
</style>
