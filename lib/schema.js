import { z } from 'zod'

export const LEVELS = ['prek', 'elem', 'mid', 'high', 'col']

export const LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  vi: 'Vietnamese',
  ar: 'Arabic',
  zh: 'Chinese (Simplified)',
  tl: 'Tagalog',
  fr: 'French',
  ht: 'Haitian Creole',
  pt: 'Portuguese',
  ko: 'Korean',
}

// Tabler icon names the client knows how to draw. normalizePlan swaps anything
// else for a checklist so an unknown name can never render blank.
export const ICONS = [
  'pencil', 'book', 'books', 'bulb', 'flask', 'table', 'scale', 'list-tree',
  'upload', 'backpack', 'palette', 'message-circle', 'photo', 'search', 'files',
  'notes', 'git-merge', 'calculator', 'microscope', 'presentation', 'mood-smile',
  'ruler', 'world', 'music', 'run', 'users', 'checklist', 'file-text', 'clock',
  'player-play', 'check', 'map-2',
]

const Step = z.object({
  icon: z.string(),
  title: z.string(),
  detail: z.string(),
  time: z.string(),
  when: z.string(),
  home: z.string(),
})

const Word = z.object({
  word: z.string(),
  meaning: z.string(),
  translation: z.string(),
})

const ArgumentSide = z.object({
  label: z.string(),
  claim: z.string(),
  reasons: z.array(z.object({ point: z.string(), evidence: z.string() })),
  counter: z.string(),
})

export const Plan = z.object({
  title: z.string(),
  kind: z.string(),
  help: z.string(),
  simple: z.string(),
  steps: z.array(Step),
  words: z.array(Word),
  quiz: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer_index: z.number().int(),
  }),
  family_note: z.string(),
  visual: z.object({
    type: z.string(),
    shape: z.array(z.string()),
    argument: z
      .object({
        sides: z.array(ArgumentSide),
        word_budget: z.array(z.object({ part: z.string(), words: z.number().int() })),
      })
      .nullable(),
    experiment: z
      .object({
        conditions: z.array(z.object({ label: z.string(), detail: z.string() })),
        measure: z.string(),
        unit: z.string(),
        max: z.number().int(),
      })
      .nullable(),
    matrix: z
      .object({
        themes: z.array(z.string()),
        min_sources: z.number().int(),
      })
      .nullable(),
  }),
})

export const VISUALS = ['road', 'experiment', 'argument', 'matrix', 'outline']

// The schema accepts plain strings so one odd value can't sink a whole decode.
// This pins every enum-like field to a value the client can render.
export function normalizePlan(plan, level) {
  for (const step of plan.steps) {
    if (!ICONS.includes(step.icon)) step.icon = 'checklist'
  }
  const v = plan.visual
  if (level === 'prek' || level === 'elem') v.type = 'road'
  if (!VISUALS.includes(v.type)) v.type = 'outline'
  if (v.type === 'argument' && !(v.argument?.sides?.length >= 2)) v.type = 'outline'
  if (v.type === 'experiment' && !(v.experiment?.conditions?.length >= 2)) v.type = 'outline'
  if (v.type === 'matrix' && !(v.matrix?.themes?.length >= 2)) v.type = 'outline'
  const q = plan.quiz
  if (!(q.answer_index >= 0 && q.answer_index < q.options.length)) q.answer_index = 0
  return plan
}
