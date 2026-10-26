// Example plans in exactly the shape /api/decode returns. They let anyone try
// the app with no AI call, and they keep the demo working offline. All
// learner details are made up.
export const SAMPLES = {
  prek: {
    assignment:
      'Draw a picture of your family. Tell a grown-up one thing each person likes to do. Bring your picture to show-and-tell on Monday.',
    plan: {
      level: 'prek', lang: 'es', kind: 'project', title: 'My family picture',
      help: 'Big pictures and short words. Do this together with a grown-up.',
      simple: 'Draw your family. Color it. Tell a grown-up what everyone likes. Bring it on Monday.',
      steps: [
        { icon: 'pencil', title: 'Draw your family', detail: 'Everyone who lives with you.', time: '10 min', when: 'Fri', home: 'Dibuja a tu familia: a todos los que viven contigo.' },
        { icon: 'palette', title: 'Color it in', detail: 'Pick your favorite colors.', time: '10 min', when: 'Sat', home: 'Coloréalo con tus colores favoritos.' },
        { icon: 'message-circle', title: 'Tell a grown-up', detail: 'What does each person like to do?', time: '5 min', when: 'Sun', home: 'Cuéntale a un adulto qué le gusta hacer a cada persona.' },
        { icon: 'backpack', title: 'Bring it to school', detail: 'Put it in your backpack.', time: '1 min', when: 'Mon', home: 'Guárdalo en tu mochila para llevarlo a la escuela.' },
      ],
      words: [{ word: 'show-and-tell', meaning: 'you show your picture and talk about it', translation: 'mostrar y contar' }],
      quiz: { question: 'What do you do first?', options: ['Draw', 'Bring it to school'], answer_index: 0 },
      family_note: 'Esta semana su hijo dibujará a su familia y contará algo que le gusta a cada persona. Ayúdele a hablar de su dibujo y a guardarlo en la mochila para el lunes.',
      visual: { type: 'road', shape: ['Your family picture', 'You talk about it', 'Your class listens'], argument: null, experiment: null, matrix: null },
    },
  },
  elem: {
    assignment:
      'Read pages 30–45 of your class book. Write 3 sentences about how the main character feels and why. Draw one picture to go with it. Due Thursday.',
    plan: {
      level: 'elem', lang: 'es', kind: 'reading', title: 'How does the character feel?',
      help: 'Short steps with pictures, so you always know what comes next.',
      simple: 'Read pages 30 to 45. Write 3 sentences about how the main character feels and why. Draw one picture. Hand it in on Thursday.',
      steps: [
        { icon: 'book', title: 'Read pages 30–45', detail: 'Take a break halfway.', time: '20 min', when: 'Mon', home: 'Lee las páginas 30 a 45 y descansa a la mitad.' },
        { icon: 'mood-smile', title: 'Find the feelings', detail: 'How does the character feel? Why?', time: '10 min', when: 'Tue', home: 'Busca cómo se siente el personaje y por qué.' },
        { icon: 'pencil', title: 'Write 3 sentences', detail: 'Say the feeling, then say "because…".', time: '15 min', when: 'Wed', home: 'Escribe 3 oraciones: el sentimiento y "porque…".' },
        { icon: 'photo', title: 'Draw a picture', detail: 'Show a moment from the pages.', time: '15 min', when: 'Wed', home: 'Dibuja un momento de esas páginas.' },
        { icon: 'backpack', title: 'Hand it in', detail: 'It is due Thursday.', time: '1 min', when: 'Thu', home: 'Entrégalo el jueves.' },
      ],
      words: [
        { word: 'main character', meaning: 'the person or animal the story is mostly about', translation: 'personaje principal' },
        { word: 'why', meaning: 'the reason something happens', translation: 'por qué' },
      ],
      quiz: { question: 'How many sentences do you write?', options: ['3', '10'], answer_index: 0 },
      family_note: 'Su hijo debe leer las páginas 30 a 45 y escribir 3 oraciones sobre cómo se siente el personaje principal, más un dibujo. Tarda unos 60 minutos en total y se entrega el jueves.',
      visual: { type: 'road', shape: ['Sentence 1: the feeling', 'Sentence 2: because…', 'Sentence 3: what happens next', 'Your picture'], argument: null, experiment: null, matrix: null },
    },
  },
  mid: {
    assignment:
      'Lab report: Test how water temperature affects how fast sugar dissolves. Include a hypothesis, materials, procedure, data table, and conclusion. Due Wednesday.',
    plan: {
      level: 'mid', lang: 'es', kind: 'experiment', title: 'Sugar and water lab',
      help: 'Each step says what to do and why that part of a lab report matters.',
      simple: 'Do an experiment: does hotter water dissolve sugar faster? Write down your guess, what you used, what you did, your results in a table, and what you learned. Due Wednesday.',
      steps: [
        { icon: 'bulb', title: 'Write your hypothesis', detail: 'An "If… then…" guess, so you can check it later.', time: '10 min', when: 'Fri', home: 'Escribe tu hipótesis con "Si… entonces…" para comprobarla después.' },
        { icon: 'checklist', title: 'List your materials', detail: 'Cups, sugar, thermometer, timer, so someone could repeat it.', time: '5 min', when: 'Fri', home: 'Haz la lista de materiales para que otra persona pueda repetirlo.' },
        { icon: 'player-play', title: 'Run the test', detail: 'Time the sugar in cold, warm and hot water. Change only the temperature.', time: '30 min', when: 'Sat', home: 'Mide el tiempo en agua fría, tibia y caliente; cambia solo la temperatura.' },
        { icon: 'table', title: 'Fill in the data table', detail: 'Temperature next to seconds, so the pattern is easy to see.', time: '15 min', when: 'Sun', home: 'Anota la temperatura y los segundos en una tabla.' },
        { icon: 'notes', title: 'Write the conclusion', detail: 'Was your guess right? Use your numbers to explain.', time: '20 min', when: 'Wed', home: 'Escribe la conclusión usando tus números.' },
      ],
      words: [
        { word: 'hypothesis', meaning: 'a smart guess you can test', translation: 'hipótesis' },
        { word: 'procedure', meaning: 'the steps you followed', translation: 'procedimiento' },
        { word: 'dissolve', meaning: 'mix into water until you can’t see it', translation: 'disolver' },
      ],
      quiz: { question: 'What part comes first?', options: ['Conclusion', 'Hypothesis'], answer_index: 1 },
      family_note: 'Este fin de semana su hijo hará un experimento con azúcar y agua (unos 30 minutos). Necesita 3 vasos, azúcar y agua caliente con supervisión. El informe se entrega el miércoles.',
      visual: {
        type: 'experiment', shape: ['Hypothesis', 'Materials', 'Procedure', 'Data table', 'Conclusion'], argument: null, matrix: null,
        experiment: { conditions: [{ label: 'Cold water', detail: 'about 10°C' }, { label: 'Warm water', detail: 'about 40°C' }, { label: 'Hot water', detail: 'about 70°C' }], measure: 'Time to dissolve', unit: 'seconds', max: 600 },
      },
    },
  },
  high: {
    assignment:
      'Compose a 750-word argumentative essay evaluating the extent to which the Industrial Revolution’s socioeconomic ramifications outweighed its technological benefits. Substantiate your thesis with a minimum of three primary sources, formatted in MLA. Submit via Canvas by 11:59 PM Friday, Nov 14.',
    plan: {
      level: 'high', lang: 'es', kind: 'essay', title: 'Industrial Revolution essay',
      help: 'A day-by-day plan plus a blueprint for your argument.',
      simple: 'Write an essay of about 750 words (around 5 paragraphs). Pick a side: did the Industrial Revolution hurt people more than its new technology helped? Back it up with at least 3 sources written at the time. List your sources in MLA format. Upload to Canvas by 11:59 PM Friday, Nov 14.',
      steps: [
        { icon: 'scale', title: 'Pick your side', detail: 'More harmful to people, or more helpful because of new technology?', time: '15 min', when: 'Mon', home: 'Elige tu postura: ¿más daño a las personas o más beneficios?' },
        { icon: 'books', title: 'Find 3 primary sources', detail: 'Testimony, reports or letters written at the time.', time: '45 min', when: 'Tue', home: 'Busca 3 fuentes primarias escritas en esa época.' },
        { icon: 'list-tree', title: 'Outline', detail: 'Claim, three reasons, and a counterargument.', time: '20 min', when: 'Wed', home: 'Haz un esquema: tesis, tres razones y un contraargumento.' },
        { icon: 'pencil', title: 'Draft about 750 words', detail: 'Follow the word budget so no part runs long.', time: '2 sessions', when: 'Thu', home: 'Escribe unas 750 palabras siguiendo el reparto.' },
        { icon: 'upload', title: 'Cite and submit', detail: 'MLA works cited, then upload to Canvas by 11:59 PM.', time: '20 min', when: 'Fri', home: 'Cita en formato MLA y súbelo a Canvas antes de las 11:59 p. m.' },
      ],
      words: [
        { word: 'argumentative', meaning: 'you pick a side and prove it', translation: 'argumentativo' },
        { word: 'socioeconomic ramifications', meaning: 'effects on people’s lives, jobs and money', translation: 'consecuencias socioeconómicas' },
        { word: 'substantiate', meaning: 'back up with evidence', translation: 'fundamentar' },
        { word: 'primary source', meaning: 'something made at the time, like a letter or report', translation: 'fuente primaria' },
        { word: 'MLA', meaning: 'a set of rules for listing your sources', translation: 'formato MLA' },
      ],
      quiz: { question: 'What do you do first?', options: ['Write the essay', 'Pick a side'], answer_index: 1 },
      family_note: 'Su estudiante tiene un ensayo de historia de unas 750 palabras que se entrega el viernes 14 de noviembre antes de la medianoche. Preguntarle a mitad de semana qué postura eligió es una buena forma de apoyarle.',
      visual: {
        type: 'argument', shape: ['Intro + claim', 'Reason 1', 'Reason 2', 'Reason 3', 'Counterargument', 'Conclusion'], experiment: null, matrix: null,
        argument: {
          sides: [
            {
              label: 'Harms outweighed benefits', claim: 'The Industrial Revolution’s human costs outweighed its technological gains.',
              reasons: [
                { point: 'Children worked long, dangerous factory shifts', evidence: 'Testimony given to the Sadler Committee (1832)' },
                { point: 'Crowded cities spread disease', evidence: 'Edwin Chadwick’s report on sanitary conditions (1842)' },
                { point: 'Workers earned little for brutal hours', evidence: 'Friedrich Engels, The Condition of the Working Class in England (1845)' },
              ],
              counter: 'Others point to cheaper goods and railways. Grant it, then show who paid the price.',
            },
            {
              label: 'Benefits outweighed harms', claim: 'The Industrial Revolution’s technological gains outweighed its human costs.',
              reasons: [
                { point: 'Factory goods became affordable for ordinary families', evidence: 'Newspaper advertisements and price lists from the period' },
                { point: 'Railways connected towns, jobs and markets', evidence: 'Newspaper accounts of the Liverpool and Manchester Railway opening (1830)' },
                { point: 'Over time, wages and living standards rose', evidence: 'Letters or diaries from workers who moved to the cities' },
              ],
              counter: 'Others point to child labor and slums. Grant it, then show how reforms and growth followed.',
            },
          ],
          word_budget: [{ part: 'Intro + claim', words: 100 }, { part: 'Reason 1', words: 170 }, { part: 'Reason 2', words: 170 }, { part: 'Reason 3', words: 170 }, { part: 'Counter', words: 70 }, { part: 'Conclusion', words: 70 }],
        },
      },
    },
  },
  col: {
    assignment:
      'Write a 2,000-word literature review synthesizing peer-reviewed research on remote learning outcomes since 2020. Minimum 8 sources, APA 7. Annotated bibliography due Nov 10; final review due Nov 24.',
    plan: {
      level: 'col', lang: 'es', kind: 'research', title: 'Remote learning literature review',
      help: 'Milestones and a research strategy, with less hand-holding.',
      simple: 'Read at least 8 peer-reviewed studies on online learning since 2020. Explain what they show together, grouped by topic, in about 2,000 words using APA 7. Hand in your annotated source list on Nov 10 and the finished review on Nov 24.',
      steps: [
        { icon: 'search', title: 'Search the databases', detail: 'Pick 3–4 keywords and filter to 2020 onward.', time: '2 hrs', when: 'Week 1', home: 'Busca en bases de datos con 3–4 palabras clave desde 2020.' },
        { icon: 'files', title: 'Shortlist 8+ studies', detail: 'Skim abstracts and keep the strongest.', time: '2 hrs', when: 'Week 1', home: 'Selecciona al menos 8 estudios leyendo los resúmenes.' },
        { icon: 'notes', title: 'Write the annotated bibliography', detail: 'A summary and why it matters, for each source.', time: '4 hrs', when: 'Nov 10', home: 'Escribe la bibliografía comentada: resumen y relevancia de cada fuente.' },
        { icon: 'git-merge', title: 'Group sources into themes', detail: 'Where do studies agree, and where do they clash?', time: '2 hrs', when: 'Week 3', home: 'Agrupa las fuentes por temas: acuerdos y desacuerdos.' },
        { icon: 'pencil', title: 'Draft the review', detail: 'Organize by theme, not one paper at a time.', time: '6 hrs', when: 'Week 3', home: 'Redacta la revisión organizada por temas.' },
        { icon: 'upload', title: 'Check APA and submit', detail: 'References, headings and in-text citations.', time: '1 hr', when: 'Nov 24', home: 'Revisa el formato APA y entrégalo.' },
      ],
      words: [
        { word: 'synthesizing', meaning: 'combining findings into one bigger picture', translation: 'sintetizar' },
        { word: 'peer-reviewed', meaning: 'checked by other experts before it was published', translation: 'revisado por pares' },
        { word: 'annotated bibliography', meaning: 'a source list with a short note on each one', translation: 'bibliografía comentada' },
      ],
      quiz: { question: 'How should you organize the review?', options: ['One paper at a time', 'By theme'], answer_index: 1 },
      family_note: 'Hay dos fechas: la bibliografía comentada el 10 de noviembre y la revisión final de 2.000 palabras el 24 de noviembre.',
      visual: {
        type: 'matrix', shape: ['Intro and scope', 'Theme 1', 'Theme 2', 'Theme 3', 'Gaps and conclusion'], argument: null, experiment: null,
        matrix: { themes: ['Engagement', 'Achievement gaps', 'Well-being'], min_sources: 8 },
      },
    },
  },
}
