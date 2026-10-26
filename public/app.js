import { SAMPLES } from './samples.js'

const LEVELS = [
  ['prek', 'Preschool'],
  ['elem', 'Elementary'],
  ['mid', 'Middle school'],
  ['high', 'High school'],
  ['col', 'College'],
]
const LEVEL_NAME = Object.fromEntries(LEVELS)
const KID = new Set(['prek', 'elem'])
const LEVEL_HINT = {
  prek: 'Pick this with a grown-up. I’ll use big pictures and read it out loud.',
  elem: 'I’ll turn it into short steps with pictures.',
  mid: 'I’ll make a checklist and explain why each part matters.',
  high: 'I’ll make a day-by-day plan and a blueprint for your work.',
  col: 'I’ll lay out milestones and a research strategy.',
}
const SPEECH_LANG = { en: 'en-US', es: 'es-ES', vi: 'vi-VN', ar: 'ar-SA', zh: 'zh-CN', tl: 'fil-PH', fr: 'fr-FR', ht: 'ht-HT', pt: 'pt-BR', ko: 'ko-KR' }
const VISUAL = {
  road: ['map-2', 'Picture map'],
  experiment: ['flask', 'Experiment view'],
  argument: ['sitemap', 'Argument map'],
  matrix: ['table', 'Synthesis matrix'],
  outline: ['layout-list', 'Plan outline'],
}
const CHEERS = ['Let’s go', 'Nice start', 'You’re rolling', 'Halfway there', 'So close', 'Almost there', 'All done, amazing work']
const TINTS = ['c2', 'c4', 'c1', 'c0', 'c3']
const FILLS = ['var(--te-s)', 'var(--am-s)', 'var(--co-s)', 'var(--pu-s)', 'var(--pi-s)']

const $ = (sel) => document.querySelector(sel)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode: nothing to save */ }
  },
}

const prefs = { fs: 16, easy: false, contrast: false, ...(store.get('ad:prefs') || {}) }
let S = { level: 'high', plan: null, done: [], mode: 'steps', focus: false, side: null, secs: [], mx: [], bilingual: false, shared: false }
let speaking = null

/* ---------- Preferences ---------- */

function applyPrefs() {
  const root = document.documentElement
  root.style.setProperty('--fs', `${prefs.fs}px`)
  root.dataset.easy = prefs.easy ? 'on' : 'off'
  if (prefs.contrast) root.dataset.contrast = 'high'
  else delete root.dataset.contrast
  $('#easy').setAttribute('aria-pressed', prefs.easy)
  $('#contrast').setAttribute('aria-pressed', prefs.contrast)
  store.set('ad:prefs', prefs)
}
$('#smaller').onclick = () => { prefs.fs = Math.max(13, prefs.fs - 1); applyPrefs() }
$('#bigger').onclick = () => { prefs.fs = Math.min(24, prefs.fs + 1); applyPrefs() }
$('#easy').onclick = () => { prefs.easy = !prefs.easy; applyPrefs() }
$('#contrast').onclick = () => { prefs.contrast = !prefs.contrast; applyPrefs() }

/* ---------- Form ---------- */

$('#levels').innerHTML = LEVELS.map(([key, name]) => `<button type="button" class="chip level" data-level="${key}" aria-pressed="false">${name}</button>`).join('')
$('#levels').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-level]')
  if (btn) setLevel(btn.dataset.level)
})

function setLevel(level) {
  S.level = level
  document.querySelectorAll('.level').forEach((b) => b.setAttribute('aria-pressed', b.dataset.level === level))
  document.documentElement.dataset.age = KID.has(level) ? 'kid' : 'older'
  $('#buddy').style.display = level === 'high' || level === 'col' ? 'none' : ''
  if (!S.plan || S.plan.level !== level) $('#bubble').textContent = LEVEL_HINT[level]
}

$('#assignment').addEventListener('input', () => { $('#assignment-error').textContent = '' })

$('#form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const assignment = $('#assignment').value.trim()
  if (assignment.length < 20) {
    $('#assignment-error').textContent = 'Paste the whole assignment, at least a sentence or two.'
    $('#assignment').focus()
    return
  }
  const button = $('#decode')
  button.setAttribute('aria-busy', 'true')
  button.disabled = true
  setStatus('<span class="loading"><svg class="buddy" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6c14 0 26 9 26 25s-10 27-26 27S6 47 6 31 18 6 32 6z" class="buddy-body"/><circle cx="23" cy="29" r="4" class="buddy-face"/><circle cx="41" cy="29" r="4" class="buddy-face"/></svg> Untangling your assignment… this takes about 15 seconds.</span>')
  try {
    const res = await fetch('/api/decode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignment, level: S.level, language: $('#lang').value, dueDate: $('#due').value }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data.error?.message || 'Something went wrong. Try again.'
      setStatus(esc(msg) + (data.error?.code === 'demo_mode' ? ' <button type="button" class="chip" data-example>Show an example</button>' : ''))
      return
    }
    setStatus('')
    loadPlan(data.plan, false)
  } catch {
    setStatus(navigator.onLine ? 'Couldn’t reach the decoder. Try again.' : 'You’re offline. Decoding needs the internet, but saved plans and examples still work.')
  } finally {
    button.removeAttribute('aria-busy')
    button.disabled = false
  }
})

function setStatus(html) { $('#status').innerHTML = html }

function showExample() {
  const sample = SAMPLES[S.level]
  $('#assignment').value = sample.assignment
  $('#lang').value = sample.plan.lang
  setStatus('Showing an example plan. Its translations are in Spanish.')
  loadPlan(structuredClone(sample.plan), false)
}
$('#example').onclick = showExample
$('#status').addEventListener('click', (e) => { if (e.target.closest('[data-example]')) showExample() })

/* ---------- Plan state ---------- */

function defaultMode(plan) {
  return plan.level === 'elem' || plan.visual.type === 'outline' ? 'steps' : 'visual'
}

function loadPlan(plan, shared) {
  stopSpeaking()
  const rows = Math.min(12, Math.max(2, plan.visual.matrix?.min_sources || 6))
  const themes = plan.visual.matrix?.themes?.length || 0
  S = {
    level: plan.level,
    plan,
    done: plan.steps.map(() => false),
    mode: defaultMode(plan),
    focus: false,
    side: null,
    secs: (plan.visual.experiment?.conditions || []).map(() => ''),
    mx: Array.from({ length: rows }, () => Array(themes).fill(false)),
    bilingual: false,
    shared,
  }
  setLevel(plan.level)
  $('#bubble').textContent = plan.help
  if (!shared && location.hash) history.replaceState(null, '', location.pathname)
  render()
  save()
  const heading = $('#plan-title')
  heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  heading.focus({ preventScroll: true })
}

function save() {
  if (!S.shared) store.set('ad:last', S)
}

/* ---------- Rendering ---------- */

function render() {
  const p = S.plan
  const [vIcon, vName] = VISUAL[p.visual.type]
  const result = $('#result')
  result.hidden = false
  result.style.fontSize = p.level === 'prek' ? '1.2rem' : p.level === 'elem' ? '1.07rem' : ''
  result.innerHTML = `<div class="card">
    ${S.shared ? '<p class="shared"><i class="ti ti-link" aria-hidden="true"></i> Your teacher shared this plan with you.</p>' : ''}
    <div class="plan-head"><h2 id="plan-title" tabindex="-1">${esc(p.title)}</h2><span class="pill">${esc(LEVEL_NAME[p.level])}</span></div>
    <p class="label" style="margin-top:14px"><span class="num" aria-hidden="true">2</span> What works for you today?</p>
    <div class="modes" role="group" aria-label="Choose a format">
      ${modeButton('visual', vIcon, vName, 'm-visual')}
      ${modeButton('steps', 'list-check', 'Bite-size steps', 'm-steps')}
      ${modeButton('listen', 'headphones', 'Listen', 'm-listen')}
      ${modeButton('simple', 'message-circle', 'Simple words', 'm-simple')}
    </div>
    <div class="tools">
      <button class="chip" data-act="focus" aria-pressed="${S.focus}"><i class="ti ti-target" aria-hidden="true"></i> Focus: one step at a time</button>
      ${p.lang !== 'en' && p.steps.some((s) => s.home) ? `<button class="chip" data-act="bilingual" aria-pressed="${S.bilingual}"><i class="ti ti-language" aria-hidden="true"></i> Show my language too</button>` : ''}
      <button class="chip" data-act="family" aria-expanded="false" aria-controls="note"><i class="ti ti-users" aria-hidden="true"></i> ${KID.has(p.level) ? 'Note for a grown-up' : 'Family note'}</button>
      <button class="chip" data-act="print"><i class="ti ti-printer" aria-hidden="true"></i> Print checklist</button>
      <button class="chip" data-act="share"><i class="ti ti-share" aria-hidden="true"></i> Share link</button>
    </div>
    <div id="note"></div>
    <div id="plan-body"></div>
    <div class="quiz">
      <p style="margin:0"><i class="ti ti-bulb" aria-hidden="true"></i> Quick check: ${esc(p.quiz.question)}</p>
      <div class="row">${p.quiz.options.map((o, i) => `<button class="chip" data-act="quiz" data-i="${i}">${esc(o)}</button>`).join('')}</div>
      <p id="quiz-result" class="small" role="status" style="margin:8px 0 0"></p>
    </div>
    ${printView(p)}
  </div>`
  renderBody()
}

function modeButton(mode, icon, name, cls) {
  return `<button class="mode ${cls}" data-act="mode" data-mode="${mode}" aria-pressed="${S.mode === mode}"><i class="ti ti-${icon}" aria-hidden="true"></i>${name}</button>`
}

function renderBody() {
  const key = document.activeElement?.dataset?.key
  const p = S.plan
  const views = { steps: stepsView, visual: visualView, listen: listenView, simple: simpleView }
  $('#plan-body').innerHTML = views[S.mode](p)
  document.querySelectorAll('[data-act="mode"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === S.mode))
  if (key) document.querySelector(`[data-key="${key}"]`)?.focus()
}

function homeLine(step) {
  if (!S.bilingual || !step.home) return ''
  return `<div class="step-home" lang="${S.plan.lang}" dir="auto">${esc(step.home)}</div>`
}

function nextIndex() {
  const i = S.done.indexOf(false)
  return i < 0 ? S.done.length : i
}

function progress() {
  const n = S.done.filter(Boolean).length
  const t = S.done.length
  const label = KID.has(S.plan.level) ? CHEERS[Math.round((n / t) * 6)] : 'done'
  return `<div class="progress"><div class="track" role="progressbar" aria-label="Steps done" aria-valuemin="0" aria-valuemax="${t}" aria-valuenow="${n}"><div class="fill" style="width:${(n / t) * 100}%"></div></div><span class="pill">${n} of ${t} · ${label}</span></div>`
}

function stepsView(p) {
  if (S.focus) {
    const i = nextIndex()
    if (i >= p.steps.length) {
      return progress() + '<div class="focus-card"><i class="ti ti-confetti" aria-hidden="true"></i><p class="big">Every step is done.</p></div>'
    }
    const s = p.steps[i]
    return progress() + `<div class="focus-card">
      <p class="small" style="margin:0">Step ${i + 1} of ${p.steps.length} · just this one · ${esc(s.time)}</p>
      <i class="ti ti-${esc(s.icon)}" aria-hidden="true"></i>
      <p class="big" style="margin:0">${esc(s.title)}</p>
      <p style="margin:4px 0 0">${esc(s.detail)}</p>${homeLine(s)}
      <button class="primary" data-act="next" data-key="next" style="margin-top:12px">Done, next step</button>
    </div>`
  }
  return progress() + p.steps.map((s, i) => `<label class="step${S.done[i] ? ' done' : ''}">
    <input type="checkbox" data-act="toggle" data-i="${i}" data-key="cb${i}" ${S.done[i] ? 'checked' : ''}>
    <i class="ti ti-${esc(s.icon)}" aria-hidden="true"></i>
    <span class="step-body"><span class="step-title">${esc(s.title)}</span><br><span class="step-detail">${esc(s.detail)}</span>${homeLine(s)}</span>
    <span class="pill">${esc(s.time)}</span>
  </label>`).join('')
}

function visualView(p) {
  const v = p.visual
  if (v.type === 'road') return roadView(p)
  if (v.type === 'experiment') return experimentView(p)
  if (v.type === 'argument') return argumentView(p)
  if (v.type === 'matrix') return matrixView(p)
  return `<p class="sub" style="margin-top:4px">What you’ll hand in</p>${shapeStrip(v.shape)}${timeline(p)}`
}

function shapeStrip(shape) {
  return `<div class="shape">${shape.map((t, i) => `<div class="${TINTS[i % 5]}">${esc(t)}</div>`).join('')}</div>`
}

function timeline(p, title = 'Your timeline') {
  const days = [...new Set(p.steps.map((s) => s.when))]
  const cols = Math.min(days.length, 6)
  return `<p class="sub">${title} · tap a task when it’s done</p>
  <div class="timeline" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${days.map((day, j) => {
    const due = j === days.length - 1
    return `<div class="day${due ? ' due' : ''}"><div class="day-name">${esc(day)}${due ? ' · due' : ''}</div>${p.steps.map((s, i) => s.when !== day ? '' : `<button class="task${S.done[i] ? ' ok' : ''}" data-act="toggle" data-i="${i}" data-key="task${i}" aria-pressed="${S.done[i]}"><i class="ti ti-${S.done[i] ? 'check' : esc(s.icon)}" aria-hidden="true"></i> ${esc(s.title)}</button>`).join('')}</div>`
  }).join('')}</div>`
}

function roadView(p) {
  const n = p.steps.length
  const W = 600
  const H = 280
  const pts = p.steps.map((_, i) => [50 + i * (500 / Math.max(1, n - 1)), i % 2 ? 200 : 78])
  let d = `M0 ${pts[0][1]} L${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < n; i++) {
    const [a, b] = pts[i - 1]
    const [c, e] = pts[i]
    const m = (c - a) / 2
    d += ` C${a + m} ${b} ${c - m} ${e} ${c} ${e}`
  }
  d += ` L${W} ${pts[n - 1][1]}`
  const cur = nextIndex()
  const deco = [[2, 88, 'tree'], [22, 4, 'cloud'], [50, 2, 'cloud'], [78, 4, 'cloud'], [96, 90, 'tree']]
    .map(([x, y, k]) => `<i class="ti ti-${k} deco ${k}" aria-hidden="true" style="left:${x}%;top:${y}%"></i>`).join('')
  const stops = pts.map(([x, y], i) => {
    const s = p.steps[i]
    const ok = S.done[i]
    const now = i === cur
    return `<button class="stop${ok ? ' ok' : now ? ' now' : ''}" data-act="toggle" data-i="${i}" data-key="stop${i}" aria-pressed="${ok}" aria-label="Step ${i + 1}: ${esc(s.title)}" style="left:${(x / W) * 100}%;top:${(y / H) * 100}%"><i class="ti ti-${ok ? 'check' : esc(s.icon)}" aria-hidden="true"></i></button>
      <div class="stop-label" aria-hidden="true" style="left:${(x / W) * 100}%;top:calc(${(y / H) * 100}% + ${now ? 40 : 34}px)"><b>${esc(s.title)}</b><br>${esc(s.when)}</div>`
  }).join('')
  const at = pts[Math.min(cur, n - 1)]
  return `${progress()}<div class="road">
    <svg class="path" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d}" fill="none" stroke="var(--am-b)" stroke-width="34" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <path d="${d}" fill="none" stroke="var(--am-s)" stroke-width="3" stroke-dasharray="8 10" vector-effect="non-scaling-stroke"/>
    </svg>${deco}${stops}
    <svg class="walker" viewBox="0 0 64 64" aria-hidden="true" style="left:${(at[0] / W) * 100}%;top:${(at[1] / H) * 100}%"><path d="M32 6c14 0 26 9 26 25s-10 27-26 27S6 47 6 31 18 6 32 6z" class="buddy-body"/><circle cx="23" cy="29" r="4" class="buddy-face"/><circle cx="41" cy="29" r="4" class="buddy-face"/><path d="M25 39q7 6 14 0" class="buddy-smile"/></svg>
    <i class="ti ti-flag-3 flag" aria-hidden="true" style="top:${(pts[n - 1][1] / H) * 100}%"></i>
  </div>
  <p class="sub">What you’ll make</p>${shapeStrip(p.visual.shape)}`
}

function experimentView(p) {
  const x = p.visual.experiment
  return `<p class="sub" style="margin-top:4px">Your experiment · change one thing, measure the result</p>
  <div class="cups">${x.conditions.map((c, i) => `<div class="cup ${TINTS[i % 5]}">
    <i class="ti ti-cup" aria-hidden="true"></i><b>${esc(c.label)}</b><div class="small">${esc(c.detail)}</div>
    <label>${esc(x.measure)} (${esc(x.unit)})<input type="number" inputmode="decimal" min="0" max="${x.max}" step="1" data-act="sec" data-i="${i}" value="${esc(S.secs[i])}"></label>
  </div>`).join('')}</div>
  <div id="chart" aria-live="polite">${chart()}</div>
  <p class="sub">Your report, section by section</p>
  <div class="shape">${p.visual.shape.map((t, i) => `<div class="note-soft" style="border:1px solid var(--line)">${i + 1}. ${esc(t)}</div>`).join('')}</div>
  ${timeline(p)}`
}

function chart() {
  const x = S.plan.visual.experiment
  const filled = S.secs.map((s) => s !== '')
  if (!filled.some(Boolean)) return '<p class="small" style="margin:10px 0 0;color:var(--muted)">Type your results and your graph draws itself.</p>'
  const vals = S.secs.map(Number)
  if (S.secs.some((s, i) => filled[i] && (Number.isNaN(vals[i]) || vals[i] < 0 || vals[i] > x.max))) {
    return `<p class="error" style="margin-top:10px">Enter a number from 0 to ${x.max}.</p>`
  }
  const top = Math.max(...vals.filter((_, i) => filled[i]), 1)
  return `<div class="bars">${x.conditions.map((c, i) => `<div class="bar-row"><span class="name">${esc(c.label)}</span><div class="bar"><div style="width:${filled[i] ? Math.round((vals[i] / top) * 100) : 0}%;background:${FILLS[i % 5]}"></div></div><span class="val">${filled[i] ? `${Math.round(vals[i])} ${esc(x.unit)}` : '—'}</span></div>`).join('')}</div>
  <p class="small" style="margin:8px 0 0;color:var(--muted)">Does your graph match your hypothesis? That’s the start of your conclusion.</p>`
}

function argumentView(p) {
  const a = p.visual.argument
  const side = S.side === null ? null : a.sides[S.side]
  const total = a.word_budget.reduce((n, b) => n + b.words, 0)
  return `<p class="sub" style="margin-top:4px">Argument blueprint</p>
  <div class="claim">
    <div class="small">Your claim (thesis)</div>
    <div class="big">${side ? esc(side.claim) : 'Pick a side to build your claim'}</div>
    <div class="row" style="justify-content:center;margin-top:10px" role="group" aria-label="Pick a side">${a.sides.map((s, i) => `<button class="chip" data-act="side" data-i="${i}" data-key="side${i}" aria-pressed="${S.side === i}">${esc(s.label)}</button>`).join('')}</div>
  </div>
  <div class="vline"></div><div class="hline"></div>
  <div class="reasons">${[0, 1, 2].map((i) => {
    const r = side?.reasons[i]
    return `<div><div class="vline"></div><div class="tile">
      <div class="small" style="color:var(--muted)">Reason ${i + 1}</div>
      <b>${r ? esc(r.point) : '…'}</b>
      <div class="evidence"><i class="ti ti-file-text" aria-hidden="true"></i> Evidence idea: ${r ? esc(r.evidence) : 'a primary source'}</div>
      <div class="small" style="color:var(--muted);margin-top:6px"><i class="ti ti-arrow-up" aria-hidden="true"></i> Then explain how it proves your claim</div>
    </div></div>`
  }).join('')}</div>
  <div class="counter"><b>Counterargument + rebuttal</b> · ${side ? esc(side.counter) : 'What would the other side say? Answer it in one paragraph.'}</div>
  <p class="small" style="color:var(--muted);margin:8px 0 0">Evidence ideas are starting points. Check that each source exists and says what you need before you cite it.</p>
  <p class="sub">Word budget · about ${total} words</p>
  <div class="budget">${a.word_budget.map((b, i) => `<div class="${['c0', 'c2', 'c2', 'c2', 'c1', 'c0'][i] || 'c4'}" style="flex:${b.words}">${esc(b.part)}<br>~${b.words}</div>`).join('')}</div>
  ${timeline(p, 'Your week')}`
}

function matrixView(p) {
  const m = p.visual.matrix
  const counts = m.themes.map((_, j) => S.mx.filter((row) => row[j]).length)
  return `<p class="sub" style="margin-top:4px">Synthesis matrix · mark which themes each source covers</p>
  <table class="matrix">
    <thead><tr><th class="src" scope="col">Source</th>${m.themes.map((t, j) => `<th scope="col" class="${TINTS[j % 5]}">${esc(t)}</th>`).join('')}</tr></thead>
    <tbody>${S.mx.map((row, i) => `<tr><th scope="row" class="src" style="font-weight:400">Source ${i + 1}</th>${m.themes.map((t, j) => `<td><button class="cell ${row[j] ? TINTS[j % 5] : ''}" data-act="cell" data-i="${i}" data-j="${j}" data-key="cell${i}-${j}" aria-pressed="${row[j]}" aria-label="Source ${i + 1} covers ${esc(t)}">${row[j] ? '<i class="ti ti-circle-check" aria-hidden="true"></i>' : ''}</button></td>`).join('')}</tr>`).join('')}
    <tr><th scope="row" class="src">Sources per theme</th>${counts.map((c) => `<td style="text-align:center">${c < 3 ? `<span class="pill gap">${c} · gap</span>` : `<b>${c}</b>`}</td>`).join('')}</tr></tbody>
  </table>
  <p class="small" style="color:var(--muted);margin:6px 0 0">Each theme becomes a section of your review. A theme with fewer than 3 sources is a gap: find more, or name it as a limitation.</p>
  ${timeline(p, 'Milestones')}`
}

function chunks(p) {
  const home = S.bilingual && p.lang !== 'en'
  return [
    { text: p.simple, lang: 'en' },
    ...p.steps.map((s, i) => home && s.home ? { text: s.home, lang: p.lang } : { text: `Step ${i + 1}. ${s.title}. ${s.detail}`, lang: 'en' }),
  ]
}

function listenView(p) {
  const canSpeak = 'speechSynthesis' in window
  return `<div class="player">
    <button class="play" data-act="play" data-key="play" aria-label="${speaking ? 'Pause' : 'Play'} read-aloud" ${canSpeak ? '' : 'disabled'}><i class="ti ti-player-${speaking ? 'pause' : 'play'}" aria-hidden="true"></i></button>
    <label class="small">Speed <select data-act="rate" data-key="rate">${[0.75, 1, 1.25].map((r) => `<option value="${r}" ${r === (S.rate || 1) ? 'selected' : ''}>${r}×</option>`).join('')}</select></label>
  </div>
  ${canSpeak ? '' : '<p class="error">This browser can’t read aloud. Try Chrome, Edge or Safari.</p>'}
  <div id="chunks">${chunks(p).map((c, i) => `<p class="chunk${speaking?.index === i ? ' reading' : ''}" id="chunk${i}" lang="${c.lang}" dir="auto">${esc(c.text)}</p>`).join('')}</div>
  <p class="small" style="color:var(--muted)">Read-aloud uses your device’s built-in voice, so it’s free and works offline once the page has loaded.</p>`
}

function simpleView(p) {
  return `<div class="plain">${esc(p.simple)}</div>
  <p class="sub" style="margin-top:0">Tricky words, untangled</p>
  <div class="words">${p.words.map((w) => `<div class="word"><b>${esc(w.word)}</b><div>${esc(w.meaning)}</div>${w.translation ? `<div class="small" style="color:var(--muted)" lang="${p.lang}" dir="auto">${esc(w.translation)}</div>` : ''}</div>`).join('')}</div>`
}

function printView(p) {
  return `<div class="print-only">
    <p>${esc(p.simple)}</p>
    <ul>${p.steps.map((s) => `<li><b>${esc(s.title)}</b> (${esc(s.when)}, ${esc(s.time)}): ${esc(s.detail)}</li>`).join('')}</ul>
    ${p.words.length ? `<p><b>Words:</b> ${p.words.map((w) => `${esc(w.word)}: ${esc(w.meaning)}`).join('; ')}</p>` : ''}
  </div>`
}

/* ---------- Read aloud ---------- */

function speak(index) {
  const list = chunks(S.plan)
  if (index >= list.length) return stopSpeaking()
  const u = new SpeechSynthesisUtterance(list[index].text)
  u.lang = SPEECH_LANG[list[index].lang] || 'en-US'
  u.rate = S.rate || 1
  u.onend = () => { if (speaking) speak(index + 1) }
  speaking = { index }
  speechSynthesis.speak(u)
  if (S.mode === 'listen') renderBody()
}

function stopSpeaking() {
  speaking = null
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  if (S.plan && S.mode === 'listen') renderBody()
}

/* ---------- Share links (the plan travels in the URL, so nothing is stored on a server) ---------- */

function toB64(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64(text) {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}
async function pack(plan) {
  const bytes = new TextEncoder().encode(JSON.stringify(plan))
  if (!('CompressionStream' in window)) return 'j' + toB64(bytes)
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return 'z' + toB64(new Uint8Array(await new Response(stream).arrayBuffer()))
}
async function unpack(code) {
  let bytes = fromB64(code.slice(1))
  if (code[0] === 'z') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    bytes = new Uint8Array(await new Response(stream).arrayBuffer())
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}
function looksLikePlan(p) {
  return p && Array.isArray(p.steps) && p.steps.length && p.visual && VISUAL[p.visual.type] && p.quiz && Array.isArray(p.words) && LEVEL_NAME[p.level]
}

/* ---------- Events ---------- */

$('#result').addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]')
  if (!el || el.tagName === 'INPUT' || el.tagName === 'SELECT') return
  const i = Number(el.dataset.i)
  switch (el.dataset.act) {
    case 'mode':
      if (S.mode === 'listen' && el.dataset.mode !== 'listen') stopSpeaking()
      S.mode = el.dataset.mode
      if (S.mode !== 'steps') S.focus = false
      document.querySelector('[data-act="focus"]').setAttribute('aria-pressed', S.focus)
      renderBody()
      break
    case 'toggle':
      S.done[i] = !S.done[i]
      renderBody()
      break
    case 'next':
      S.done[nextIndex()] = true
      renderBody()
      break
    case 'focus':
      S.focus = !S.focus
      if (S.focus) { stopSpeaking(); S.mode = 'steps' }
      el.setAttribute('aria-pressed', S.focus)
      renderBody()
      break
    case 'bilingual':
      S.bilingual = !S.bilingual
      el.setAttribute('aria-pressed', S.bilingual)
      renderBody()
      break
    case 'side':
      S.side = i
      if (!S.done[0]) S.done[0] = true
      renderBody()
      break
    case 'cell':
      S.mx[i][Number(el.dataset.j)] = !S.mx[i][Number(el.dataset.j)]
      renderBody()
      break
    case 'play':
      if (speaking) stopSpeaking()
      else speak(0)
      break
    case 'quiz': {
      const right = i === S.plan.quiz.answer_index
      $('#quiz-result').innerHTML = right
        ? '<i class="ti ti-check" aria-hidden="true"></i> Yes, that’s it.'
        : '<i class="ti ti-arrow-back-up" aria-hidden="true"></i> Not quite. Look back at the plan and try again.'
      break
    }
    case 'family': {
      const open = el.getAttribute('aria-expanded') !== 'true'
      el.setAttribute('aria-expanded', open)
      $('#note').innerHTML = open
        ? `<div class="note note-te"><div class="small"><i class="ti ti-users" aria-hidden="true"></i> Note for family, in their language</div><p style="margin:4px 0 0" lang="${S.plan.lang}" dir="auto">${esc(S.plan.family_note)}</p></div>`
        : ''
      break
    }
    case 'print':
      window.print()
      break
    case 'share': {
      const url = `${location.origin}${location.pathname}#p=${await pack(S.plan)}`
      let copied = false
      try { await navigator.clipboard.writeText(url); copied = true } catch { /* clipboard blocked: show the link instead */ }
      $('#note').innerHTML = `<div class="note note-soft"><p class="small" style="margin:0 0 6px"><i class="ti ti-link" aria-hidden="true"></i> ${copied ? 'Link copied.' : 'Copy this link.'} Anyone who opens it sees this plan, with no login and no AI cost. Nothing is stored on a server: the plan is inside the link.</p><input type="text" readonly value="${esc(url)}" aria-label="Share link" style="width:100%;font-size:0.8rem" onfocus="this.select()"></div>`
      break
    }
  }
  save()
})

$('#result').addEventListener('change', (e) => {
  const el = e.target
  if (el.dataset.act === 'toggle') {
    S.done[Number(el.dataset.i)] = el.checked
    renderBody()
  } else if (el.dataset.act === 'rate') {
    S.rate = Number(el.value)
  }
  save()
})

$('#result').addEventListener('input', (e) => {
  const el = e.target
  if (el.dataset.act !== 'sec') return
  S.secs[Number(el.dataset.i)] = el.value
  $('#chart').innerHTML = chart()
  save()
})

function updateOnline() { $('#offline').hidden = navigator.onLine }
addEventListener('online', updateOnline)
addEventListener('offline', updateOnline)

/* ---------- Start ---------- */

async function start() {
  applyPrefs()
  updateOnline()
  setLevel('high')
  if (location.hash.startsWith('#p=')) {
    try {
      const plan = await unpack(location.hash.slice(3))
      if (!looksLikePlan(plan)) throw new Error('bad plan')
      loadPlan(plan, true)
      return
    } catch {
      setStatus('That share link looks broken. Ask for a new one, or decode the assignment here.')
    }
  }
  const saved = store.get('ad:last')
  if (saved && looksLikePlan(saved.plan)) {
    S = { ...saved, shared: false }
    setLevel(S.plan.level)
    $('#bubble').textContent = S.plan.help
    render()
  }
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is a bonus, not required */ })
}

start()
