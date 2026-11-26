import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'
import { getEntitlement, moduleAllowed, lockedText } from '@/lib/access'
import { checkAiLimit, logAiUsage } from '@/lib/aiGuard'
import { buildPhotoActions, PHOTO_PROMPT } from '@/lib/photoRecords'

export const maxDuration = 60

const MAX_BYTES = 3 * 1024 * 1024
// A vision model on Groq. Can be changed in Vercel without a new release if Groq renames it.
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b'

function stripJson(t: string): any {
  const s = t.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try { return JSON.parse(s) } catch {
    const a = s.indexOf('{'), b = s.lastIndexOf('}')
    if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)) } catch { /* ignore */ } }
    return null
  }
}

function imageType(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return 'image/webp'
  return null
}

/** Reads a photo of a supplier bill or stock list and proposes records. The owner still confirms before anything is saved. */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user || !isSafeId(user.id)) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    const ent = await getEntitlement(user)
    if (!ent.ai) return NextResponse.json({ error: ent.message || 'Choose a plan to continue.' }, { status: 403 })

    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'No photo received.' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That photo is too large. Please send a smaller one.' }, { status: 400 })

    const buf = new Uint8Array(await file.arrayBuffer())
    const type = imageType(buf)
    if (!type) return NextResponse.json({ error: 'Please send a JPG, PNG or WebP photo.' }, { status: 400 })

    const limit = checkAiLimit(user, 'import')
    if (!limit.ok) return NextResponse.json({ error: limit.message }, { status: 429 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Photo reading is not available right now.' }, { status: 503 })

    const dataUrl = `data:${type};base64,${Buffer.from(buf).toString('base64')}`
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PHOTO_PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 2500,
      }),
    })

    if (!res.ok) {
      console.error('Photo read error:', res.status, (await res.text()).slice(0, 300))
      return NextResponse.json(
        { error: res.status === 429 ? 'Photo reading is busy right now. Please try again in a minute.' : 'I could not read that photo right now. Please try again, or type the items in the chat.' },
        { status: res.status === 429 ? 429 : 502 }
      )
    }

    const data = await res.json()
    logAiUsage('import', VISION_MODEL, data.usage)
    const read = stripJson(String(data.choices?.[0]?.message?.content ?? ''))
    const result = buildPhotoActions(read)

    const locked = result.actions.find(a => !moduleAllowed(ent, a.module))
    if (locked) return NextResponse.json({ error: lockedText(locked.module) }, { status: 403 })

    return NextResponse.json({
      reply: result.reply,
      actions: result.actions,
      needsConfirm: result.actions.length > 0,
    })
  } catch (err: any) {
    console.error('photo-extract error:', err?.message)
    return NextResponse.json({ error: 'I could not read that photo. Please try again.' }, { status: 500 })
  }
}
