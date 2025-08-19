<template>
    <nav>
        <NuxtLink to="/">La Nombreuse</NuxtLink>
        <NuxtLink to="/exposition">Exposition</NuxtLink>
        <NuxtLink to="/conference">Conference</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
    </nav>
</template>

<script setup>
</script>

<style>
nav {
    background-color: #090909;
    border-radius: 8px;
    color: white;
    padding: 1rem;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 1rem;
    text-transform: uppercase; 
}

nav a:hover {
    text-decoration: underline;
}
</style>