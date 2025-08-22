/// <reference types="nuxt" />
import type { Ref } from 'vue'
import { useRuntimeConfig, useFetch } from 'nuxt/app'

function buildQS(params: Record<string, any>) {
  const qp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue
    if (Array.isArray(v)) v.forEach(val => qp.append(k, String(val)))
    else qp.append(k, String(v))
  }
  const s = qp.toString()
  return s ? `?${s}` : ''
}

export function useApi() {
  const { public: { apiBase } } = useRuntimeConfig()

  // ex: http://localhost:1337/api -> http://localhost:1337
  const assetsBase = apiBase.replace(/\/api\/?$/, '')
  function mediaUrl(path?: string) {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${assetsBase}${path}`
  }

  async function get<T>(path: string, params: Record<string, any> = {}) {
    const url = `${apiBase}${path}${buildQS(params)}`
    const { data, error } = await useFetch<T>(url, { key: url, server: true })
    if (error.value) throw error.value
    return data as Ref<T>
  }

  return { get, mediaUrl }
}
