// app/composables/useMedia.ts
import { useApi } from './useApi'

/**
 * Helpers médias compatibles avec :
 * - structure Strapi "classique"  => images.data[].attributes.url
 * - structure "aplatie" (ton cas) => images[].url
 */
export function useMedia() {
  const { mediaUrl } = useApi()

  /** Retourne le chemin relatif de la 1re image trouvée (ou undefined) */
  function firstImagePath(obj: any): string | undefined {
    // cas aplati
    const flat = obj?.images?.[0]?.url
    if (flat) return flat
    // cas Strapi classique
    return obj?.images?.data?.[0]?.attributes?.url
  }

  /** Retourne l'URL absolue de la 1re image (ou '') */
  function coverUrl(obj: any): string {
    const rel = firstImagePath(obj)
    return rel ? mediaUrl(rel) : ''
  }

  /** Retourne une galerie (URLs absolues) */
  function galleryUrls(obj: any): string[] {
    // cas aplati
    if (Array.isArray(obj?.images) && obj.images[0]?.url) {
      return obj.images.map((m: any) => mediaUrl(m.url)).filter(Boolean)
    }
    // cas Strapi classique
    const d = obj?.images?.data
    if (Array.isArray(d)) {
      return d
        .map((x: any) => x?.attributes?.url)
        .filter(Boolean)
        .map((u: string) => mediaUrl(u))
    }
    return []
  }

  /** Texte alternatif (si présent) */
  function altText(obj: any): string {
    // aplati
    if (Array.isArray(obj?.images) && obj.images[0]?.alternativeText) {
      return obj.images[0].alternativeText
    }
    // classique
    return obj?.images?.data?.[0]?.attributes?.alternativeText ?? ''
  }

  return { firstImagePath, coverUrl, galleryUrls, altText }
}
