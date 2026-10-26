import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { LANGUAGES, LEVELS, Plan, normalizePlan } from '../lib/schema.js'
import { SYSTEM_PROMPT, userMessage } from '../lib/prompt.js'

const MAX_CHARS = 6000
const RATE_LIMIT = 20 // requests per IP per hour, best effort per warm instance
const hits = new Map()

let client
function getClient() {
  client ??= new Anthropic()
  return client
}

function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3_600_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > RATE_LIMIT
}

function fail(res, status, code, message) {
  res.status(status).json({ error: { code, message } })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'method', 'Use POST.')

  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(res, 503, 'demo_mode', 'Live decoding is off right now. Try one of the examples.')
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'local'
  if (rateLimited(ip)) {
    return fail(res, 429, 'rate_limited', 'Lots of decoding this hour. Try again in a little while.')
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}
  const assignment = String(body.assignment || '').trim()
  const level = String(body.level || '')
  const lang = String(body.language || 'en')
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate || '') ? body.dueDate : ''

  if (assignment.length < 20) {
    return fail(res, 400, 'too_short', 'Paste the whole assignment, at least a sentence or two.')
  }
  if (assignment.length > MAX_CHARS) {
    return fail(res, 400, 'too_long', `That's over ${MAX_CHARS} characters. Paste just the assignment part.`)
  }
  if (!LEVELS.includes(level)) return fail(res, 400, 'level', 'Pick a grade level.')
  if (!LANGUAGES[lang]) return fail(res, 400, 'language', 'Pick a language from the list.')

  const started = Date.now()
  try {
    const response = await getClient().beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(Plan) },
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        {
          role: 'user',
          content: userMessage({
            assignment,
            level,
            language: LANGUAGES[lang],
            dueDate,
            today: new Date().toISOString().slice(0, 10),
          }),
        },
      ],
    })

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      console.log('decode_unusable', { stop: response.stop_reason, ms: Date.now() - started })
      return fail(res, 422, 'unusable', "I couldn't make a plan from that. Check it's the assignment text and try again.")
    }

    const plan = normalizePlan(response.parsed_output, level)

    console.log('decode_ok', {
      level,
      lang,
      steps: plan.steps.length,
      visual: plan.visual.type,
      ms: Date.now() - started,
      in: response.usage?.input_tokens,
      out: response.usage?.output_tokens,
    })
    res.status(200).json({ plan: { ...plan, level, lang } })
  } catch (error) {
    // Log the status and class only: error messages can echo request content.
    console.log('decode_error', { status: error?.status, name: error?.constructor?.name, ms: Date.now() - started })
    if (error instanceof Anthropic.RateLimitError) {
      return fail(res, 429, 'busy', 'The decoder is busy. Try again in a minute.')
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return fail(res, 503, 'demo_mode', 'Live decoding is off right now. Try one of the examples.')
    }
    fail(res, 502, 'upstream', 'Something went wrong while decoding. Try again.')
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}
