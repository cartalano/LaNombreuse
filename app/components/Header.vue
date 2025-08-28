<template>
  <nav>
    <NuxtLink to="/" class="logo">
      <img src="/LOGONEWSLETTERblanc.png" alt="La Nombreuse" />
    </NuxtLink>

    <div class="links">
      <NuxtLink to="/exposition">Exposition</NuxtLink>
      <NuxtLink to="/conference">Conference</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
nav {
  background-color: #090909;
  border-radius: 8px;
  color: white;
  padding: 1rem 2rem;

  display: flex;
  align-items: center; /* aligne logo + liens au centre */
  justify-content: space-between; /* logo à gauche, liens à droite */
}

/* Logo */
.logo img {
  height: 24px; /* proche de la taille du texte */
  object-fit: contain; /* garde les proportions */
  vertical-align: middle;
}

/* Liens */
.links {
  display: flex;
  gap: 2rem; /* espace entre les liens */
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
</style>
