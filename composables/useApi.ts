import type { Ref } from 'vue'

export function useApi() {
  const { public: { apiBase } } = useRuntimeConfig()

  async function get<T>(path: string, params: Record<string, any> = {}) {
    // Supporte params objets imbriqués (Strapi aime bien ce format)
    const toQS = (obj: any, prefix?: string): string[] =>
      Object.entries(obj).flatMap(([k, v]) => {
        const key = prefix ? `${prefix}[${k}]` : k
        if (v === undefined || v === null) return []
        if (typeof v === 'object' && !Array.isArray(v)) return toQS(v, key)
        return [`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`]
      })
    const qs = Object.keys(params).length ? `?${toQS(params).join('&')}` : ''
    const url = `${apiBase}${path}${qs}`

    const { data, error } = await useFetch<T>(url, { key: url, server: true })
    if (error.value) throw error.value
    return data as Ref<T>
  }

  return { get }
}
