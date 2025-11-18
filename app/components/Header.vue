<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <nav>
    <NuxtLink to="/" class="logo" @click="closeMenu">
      <img src="/LOGONEWSLETTERblanc.png" alt="La Nombreuse" />
    </NuxtLink>

    <!-- Bouton burger (affiché sur mobile/tablette) -->
    <button
      class="menu-toggle"
      type="button"
      @click="toggleMenu"
      :aria-expanded="isOpen"
      aria-label="Ouvrir le menu de navigation"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Liens -->
    <div class="links" :class="{ open: isOpen }">
      <NuxtLink to="/exposition" @click="closeMenu">Exposition</NuxtLink>
      <NuxtLink to="/fotofort" @click="closeMenu">Fotofort</NuxtLink>
      <NuxtLink to="/workshop" @click="closeMenu">Workshop</NuxtLink>
      <NuxtLink to="/showoff" @click="closeMenu">ShowOff</NuxtLink>
      <NuxtLink to="/studioMobile" @click="closeMenu">Studio Mobile</NuxtLink>
      <NuxtLink to="/equipe" @click="closeMenu">Équipe</NuxtLink>
      <NuxtLink to="/contact" @click="closeMenu">Contact</NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
nav {
  background-color: #090909;
  border-radius: 5px;
  color: white;
  padding: 1rem 1.5rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  position: relative;
  z-index: 1000; 
}


.logo img {
  height: 26px;
  object-fit: contain;
  vertical-align: middle;
}

.links {
  display: flex;
  gap: 2rem;
}

nav a {
  color: white;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 14px;
}

nav a:hover {
  text-decoration: underline;
}


.menu-toggle {
  display: none; 
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: #ffffff;
  margin: 4px 0;
  transition: 0.2s ease;
}


@media (max-width: 900px) {
  nav {
    padding: 0.75rem 1rem;
  }

  
  .menu-toggle {
    display: block;
  }

  
  .links {
    position: absolute;
    top: 100%;        
    right: 0;         
    width: auto;     
    background-color: #090909;
    border-radius: 5px 5px 5px 5px;

    padding: 0.75rem 1rem 1rem;

    display: none;          
    flex-direction: column; 
    gap: 0.9rem;
    text-align: right;   
    z-index: 1100;  
  }

  
  .links.open {
    display: flex;
  }

  .links a {
    font-size: 14px;
    white-space: nowrap;
  }
}
</style>
