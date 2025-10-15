// app/composables/useMedia.ts
import { useApi } from './useApi'

type MediaItem = { url: string; alt: string };

// Normalize ANY Strapi media field (single/multiple, flat/classic) to [{url, alt}]
function normalizeToArray(field: any): MediaItem[] {
  const out: MediaItem[] = []

  // 1) flat multiple: [{ url, alternativeText }, ...]
  if (Array.isArray(field) && field.length && typeof field[0] === 'object' && 'url' in field[0]) {
    for (const f of field) out.push({ url: f?.url || '', alt: f?.alternativeText || '' })
    return out
  }

  // 2) flat single: { url, alternativeText }
  if (field && typeof field === 'object' && 'url' in field) {
    out.push({ url: field?.url || '', alt: field?.alternativeText || '' })
    return out
  }

  // 3) classic multiple: { data: [{ attributes: { url, alternativeText }}, ...] }
  if (Array.isArray(field?.data)) {
    for (const node of field.data as any[]) {
      const a = node?.attributes
      if (a?.url) out.push({ url: a.url, alt: a.alternativeText || '' })
    }
    return out
  }

  // 4) classic single: { data: { attributes: { url, alternativeText } } }
  if (field?.data?.attributes?.url) {
    const a = field.data.attributes
    out.push({ url: a.url, alt: a.alternativeText || '' })
  }

  return out
}

export function useMedia() {
  const { mediaUrl } = useApi()

  function urlsFrom(field: any): string[] {
    return normalizeToArray(field)
      .map(i => i.url)
      .filter(Boolean)
      .map(u => mediaUrl(u))
  }

  function firstUrlFrom(field: any): string {
    return urlsFrom(field)[0] || ''
  }

  function firstAltFrom(field: any): string {
    return normalizeToArray(field)[0]?.alt || ''
  }

  
  

  /** Portrait + portfolio (override keys if needed) */
  function galleryFrom(obj: any, opts?: { cover?: string; gallery?: string; limit?: number }) {
    const coverKey = opts?.cover ?? 'photo'
    const gallKey  = opts?.gallery ?? 'portfolio'
    const limit    = opts?.limit ?? 6

    const cover = firstUrlFrom(obj?.[coverKey])
    const gallery = urlsFrom(obj?.[gallKey]).slice(0, Math.max(0, limit - (cover ? 1 : 0)))
    return cover ? [cover, ...gallery] : gallery
  }

  // Back-compat with your old helpers
  function coverUrl(obj: any) {
    return firstUrlFrom(obj?.images ?? obj?.photo ?? obj)
  }
  function galleryUrls(obj: any) {
    return urlsFrom(obj?.images ?? obj?.portfolio ?? obj)
  }

  return { urlsFrom, firstUrlFrom, firstAltFrom, galleryFrom, coverUrl, galleryUrls }
}
