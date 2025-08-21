<script setup lang="ts">
const { get } = useApi()
const res = await get<any>('/expositions', { populate: ['images','period'], sort: ['period.startDate:desc'] })
const items = computed(() => res.value?.data ?? [])
</script>

<template>
  <pre v-if="!items.length">Aucune expo trouvée…</pre>
  <ul v-else>
    <li v-for="e in items" :key="e.id">{{ e.attributes.title }}</li>
  </ul>
</template>
