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
    baseURL: process.env.GITHUB_ACTIONS ? '/LaNombreuse/' : '/',
  },

  nitro: {
    preset: process.env.GITHUB_ACTIONS ? 'github-pages' : undefined,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://strapi-lanombreuse-api.onrender.com/api',
      mediaBase: process.env.NUXT_PUBLIC_MEDIA_BASE || 'https://strapi-lanombreuse-api.onrender.com',
    },
  },
})
