import { defineNuxtPlugin } from '#app'
import { useMedia } from '~/composables/useMedia'

export default defineNuxtPlugin((nuxtApp) => {
  const { firstUrlFrom, firstAltFrom } = useMedia()

  function setImg(el: HTMLImageElement, value: any) {
    const src = firstUrlFrom(value)      // string absolue
    const alt = firstAltFrom(value)      // alt si dispo
    el.src = src || ''
    if (alt) el.alt = alt
    el.loading = 'lazy'
    el.decoding = 'async'
  }

  nuxtApp.vueApp.directive('media', {
    mounted(el: HTMLImageElement, binding) { setImg(el, binding.value) },
    updated(el: HTMLImageElement, binding) { setImg(el, binding.value) },
  })
})