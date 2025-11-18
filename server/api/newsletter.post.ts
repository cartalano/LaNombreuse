import { defineEventHandler, readBody, H3Event, setResponseStatus } from 'h3'

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
  const apiBase = config.public.apiBase // Exemple : https://api-staging.lanombreuse.com/api

  const body = (await readBody(event)) as Body

  const email = body.email?.trim().toLowerCase()
  const source = (body.source ?? 'homepage').trim()
  const consent = body.consent ?? true

  // Validation email
  if (!email || !isValidEmail(email)) {
    setResponseStatus(event, 400)
    return { ok: false, error: 'EMAIL_INVALID' }
  }

  try {
    // Route publique -> aucun token nécessaire
    const res = await $fetch<any>(`${apiBase}/newsletter-subs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        data: {
          email,
          source,
          consent
        }
      }
    })

    return { ok: true, id: res?.data?.id ?? null }
  } catch (err: any) {
    const message = err?.response?._data?.error?.message || err?.message

    // Doublon email (champ unique Strapi)
    if (message?.toLowerCase?.().includes('unique')) {
      setResponseStatus(event, 409)
      return { ok: false, error: 'EMAIL_ALREADY_EXISTS' }
    }

    console.error('[Newsletter API Error]', message)
    setResponseStatus(event, 500)
    return { ok: false, error: 'SERVER_ERROR' }
  }
})
