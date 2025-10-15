<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-text">Nos partenaires</p>

      <div class="logos">
        <img
          v-for="(logo, i) in logos"
          :key="i"
          :src="logo.url"
          :alt="logo.alt"
          loading="lazy"
        />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">

const logos = [
  { url: '/FWB-logo.png', alt: 'Partenaire 1' },
  { url: '/cocof.png', alt: 'Partenaire 2' },
  { url: '/ASAP_Logo.jpg', alt: 'Partenaire 3' },
  { url: '/incidence2.png', alt: 'Partenaire 4' },

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
