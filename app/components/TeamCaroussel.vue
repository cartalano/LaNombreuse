<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = withDefaults(defineProps<{
  images: string[]
  alt?: string
  start?: number
}>(), {
  alt: 'Image',
  start: 0
})

const idx = ref(0)
watch(
  () => props.start,
  v => (idx.value = Math.max(0, Math.min(v ?? 0, (props.images?.length ?? 1) - 1))),
  { immediate: true }
)

const hasImages = computed(() => Array.isArray(props.images) && props.images.length > 0)
const showHint = computed(() => (props.images?.length ?? 0) > 1)
const current = computed(() => (hasImages.value ? props.images[idx.value] : ''))

function next() {
  if (!hasImages.value) return
  idx.value = (idx.value + 1) % props.images.length
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    next()
  }
}
</script>

<template>
  <div
    class="frame"
    :class="{ clickable: showHint }"
    role="button"
    tabindex="0"
    :aria-label="showHint ? 'Cliquer pour voir l’image suivante' : 'Photo'"
    @click="next"
    @keydown="onKey"
  >
    <img v-if="current" class="photo" :src="current" :alt="alt" />
    <div v-else class="placeholder" />

    <!-- Petits indicateurs de pages (facultatif) -->
    <div v-if="showHint" class="dots" aria-hidden="true">
      <span
        v-for="(src, i) in images"
        :key="i"
        class="dot"
        :class="{ on: i === idx }"
      />
    </div>
  </div>
</template>

<style scoped>
/* conteneur : on garde le ratio naturel (height auto) */
.frame {
  position: relative;
  width: 70%;
  height: var(--member-frame-h, 480px);
  overflow: hidden;
  margin-left: 34px;
  background: #f4f4f4;
}
.card .frame { --member-frame-h: 560px; }
/* image : largeur colonne, hauteur auto ⇒ ratio intact */
.photo {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain; 
}

/* curseur + feedback hover seulement s’il y a plusieurs images */
.frame.clickable { cursor: pointer; }
.frame.clickable .photo { transition: transform .18s ease, filter .18s ease; }
.frame.clickable:hover .photo { transform: scale(1.01); filter: brightness(0.98); }

/* hint discret au survol */
.hint {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 6px 10px;
  background: rgba(0,0,0,.55);
  color: #fff;
  font-size: 12px;
  border-radius: 999px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .18s ease, transform .18s ease;
  pointer-events: none;
}
.frame.clickable:hover .hint,
.frame.clickable:focus-visible .hint {
  opacity: 1;
  transform: translateY(0);
}

/* petits points de pagination */
.dots {
  position: absolute;
  right: 10px;
  bottom: 12px;
  display: flex;
  gap: 6px;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,.45);
}
.dot.on { background: #fff; }

/* placeholder si pas d’image */
.placeholder {
  width: 100%;
  height: 100%;
  min-height: 260px;
  background: linear-gradient(180deg, #f6f6f6, #efefef);
}
</style>
