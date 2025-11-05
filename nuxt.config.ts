import { fileURLToPath, URL } from 'node:url'

export default defineNuxtConfig({
  ssr: false,

  css: ['~/assets/css/main.css'],

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  },

  app: {
    baseURL: '/',     
  },

  nitro: {
    preset: 'static', 
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,   
      mediaBase: process.env.NUXT_PUBLIC_MEDIA_BASE, 
    },
  },
})