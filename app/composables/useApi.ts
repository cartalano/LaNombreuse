/// <reference types="nuxt" />
import type { Ref } from 'vue'
import { useRuntimeConfig, useFetch } from 'nuxt/app'

function buildQS(params: Record<string, any>): string {
  const qp = new URLSearchParams()
  const add = (k: string, v: any) => {
    if (v == null) return
    if (Array.isArray(v)) v.forEach((x, i) => add(`${k}[${i}]`, x))
    else if (typeof v === 'object') Object.entries(v).forEach(([kk, vv]) => add(`${k}[${kk}]`, vv))
    else qp.append(k, String(v))
  }
  Object.entries(params).forEach(([k, v]) => add(k, v))
  const s = qp.toString()
  return s ? `?${s}` : ''
}

export function useApi() {
  const config = useRuntimeConfig()

  // API (toujours public côté client)
  const apiBase = config.public.apiBase                          // ex: http://localhost:1337/api
  // Base Strapi pour les médias (exposée en public)
  const strapiBase = config.public.strapiURL || apiBase.replace(/\/api\/?$/, '')

  function mediaUrl(path = ''): string {
    if (!path) return ''
    return path.startsWith('http') ? path : `${strapiBase}${path}`
  }

  async function get<T = any>(
    path: string,
    params: Record<string, any> = {}
  ): Promise<Ref<T | null>> {
    const url = (path.startsWith('http') ? path : `${apiBase}${path}`) + buildQS(params)
    const r = (await useFetch<T>(url, { key: url, server: true })) as {
      data: Ref<T | null>
      error: Ref<any>
    }
    if (r.error.value) throw r.error.value
    return r.data
  }

  return { get, mediaUrl }
}
