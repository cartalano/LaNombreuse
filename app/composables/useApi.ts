/// <reference types="nuxt" />
import type { Ref } from 'vue'
import { useRuntimeConfig, useFetch } from 'nuxt/app'

function buildQS(params: Record<string, any>): string {
  const qp = new URLSearchParams()

  const add = (key: string, value: any) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((v, i) => add(`${key}[${i}]`, v))
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => add(`${key}[${k}]`, v))
    } else {
      qp.append(key, String(value))
    }
  }

  Object.entries(params).forEach(([k, v]) => add(k, v))
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
