# Assignment Decoder

> A learner wants to start their homework, but the instructions are dense, full of unfamiliar words, and assume one way of learning.

Assignment Decoder turns a confusing assignment into a plan a student can actually start. The student picks their grade level and home language, pastes the assignment, and chooses the format that works for them today:

- **Picture map / visual view.** The view depends on age and assignment type: a picture road for young children, an experiment view with a live graph for labs, an argument blueprint with a word budget for essays, and a synthesis matrix for literature reviews.
- **Bite-size steps.** A checklist with time estimates, plus a **Focus** mode that shows one step at a time.
- **Listen.** The plan read aloud with the device's built-in voice, at adjustable speed.
- **Simple words.** The assignment in plain language, with tricky words explained and translated.

It explains the task and never does the task: it won't write the essay or answer the questions.

## Four doorways

| Doorway | What it does |
| --- | --- |
| Language | Tricky words translated into 10 home languages, an optional bilingual view of every step, read-aloud in the home language, and a note for family written in their language |
| Ability | Focus mode, read-aloud, an easy-read font (Atkinson Hyperlegible) with wider spacing, high contrast, adjustable text size, full keyboard use, and reduced motion |
| Connectivity | Works offline after the first visit (service worker). The last plan is saved on the device, and there's a one-page printable checklist |
| Cost | Free, with no login or app install. A teacher can decode once and share a link; the plan is stored inside the link itself, so students who open it need no AI call, no account and no server |

## Run it locally

You need Node 20 or newer.

```bash
npm install
cp .env.example .env   # then add your Anthropic API key to .env
npm run dev            # http://localhost:5173
```

Without an API key the app runs in demo mode: the **Try an example** button shows a complete plan for each grade level, and live decoding is turned off.

## Deploy

The app is a static site in `public/` plus one serverless function, `api/decode.js`. To deploy it on Vercel, import the GitHub repo, set `ANTHROPIC_API_KEY` in the project's environment variables, and deploy. No build step is needed.

## How it works

`api/decode.js` validates the input, then asks Claude (`claude-opus-5-5`) for a plan in a fixed JSON shape (`lib/schema.js`) using structured outputs. The instructions are in `lib/prompt.js`. The server then pins any unexpected values (icons, visual type) to ones the page can render. The page (`public/app.js`) is plain JavaScript with no framework, and it escapes all model text before showing it.

Privacy: the app asks students not to paste personal details, stores nothing on a server, and logs only counts and timings, never assignment text.

## What was built during AccessED Hacks

Everything in this repository was created during the event (Oct 17 – Nov 20, 2026).

## Credits and AI assistance

- AI assistance: the code was written with help from Claude Code. The running app uses the Claude API to decode assignments.
- [Tabler Icons](https://tabler.io/icons) (MIT)
- [Nunito](https://fonts.google.com/specimen/Nunito) and [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) via Google Fonts (SIL Open Font License)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) and [Zod](https://zod.dev)
- The example assignments and learners are made up.

## Testing so far, and limits

Checked so far: every format at every grade level using the built-in examples, share links, demo mode, and layout at 375px phone width with no sideways scrolling.

Not yet tested: a keyboard-only pass, a screen-reader pass (VoiceOver or NVDA), dark mode and high contrast on real devices, live decoding with a real API key, testing with real students, and accuracy of translations in every language. AI plans can contain mistakes, and evidence ideas for essays must be checked before they're cited. Read-aloud voices depend on the device.

## License

MIT
