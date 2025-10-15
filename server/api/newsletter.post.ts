import { defineEventHandler, readBody, H3Event } from 'h3'

type Body = {
  email?: string
  source?: string
  consent?: boolean
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const body = (await readBody(event)) as Body

  // 1) Validation simple
  const email = body.email?.trim().toLowerCase()
  const source = (body.source ?? 'homepage').trim()
  const consent = body.consent ?? true

  if (!email || !isValidEmail(email)) {
    setResponseStatus(event, 400)
    return { ok: false, error: 'EMAIL_INVALID' }
  }

  // 2) Appel Strapi (collection: newsletter-subs)
  try {
    const res = await $fetch<any>(`${config.STRAPI_URL}/api/newsletter-subs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: {
        data: {
          email,
          source,
          consent,
          
        }
      }
    })

    // Réponse standardisée
    return { ok: true, id: res?.data?.id ?? null }
  } catch (err: any) {
    // Gestion des erreurs fréquentes (doublon email unique)
    const code = err?.response?._data?.error?.name || 'STRAPI_ERROR'
    const message = err?.response?._data?.error?.message || 'Unknown error'

    // Si l’email est unique dans Strapi, un doublon renverra 400
    if (message?.toLowerCase?.().includes('unique') || code === 'ValidationError') {
      setResponseStatus(event, 409) // Conflict
      return { ok: false, error: 'EMAIL_ALREADY_EXISTS' }
    }

    // Autres erreurs
    console.error('Newsletter API error:', message)
    setResponseStatus(event, 500)
    return { ok: false, error: 'SERVER_ERROR' }
  }
})
