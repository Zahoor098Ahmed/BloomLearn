import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Scientific Investigation and Data
 * From the client's "Scientific Investigation and Data: Video-Ready Chapter Summary"
 * (Saudi MOE, Oxford, Cambridge 3TWS objectives, McGraw Hill / NGSS practices).
 * 6 Parts plus the recap: all 77 sentences in 7 paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_INVESTIGATION_PARTS: ChapterPart[] = [
  P("What scientists do", "ماذا يفعل العلماء", 0, "Cambridge 3TWSp.01, 3TWSp.03; NGSS asking questions and predicting"),
  P("Five ways to investigate, and the fair test", "خمس طرق للاستقصاء والاختبار العادل", 1, "Cambridge 3TWSp.02, 3TWSc.01, 3TWSc.05; NGSS planning fair tests"),
  P("Planning safely", "التخطيط الآمن", 2, "Cambridge 3TWSc.02–04, 3TWSp.04; NGSS choosing tools"),
  P("Collecting and recording data", "جمع البيانات وتسجيلها", 3, "Cambridge 3TWSc.06; NGSS making observations and measurements"),
  P("Presenting data", "عرض البيانات", 4, "Cambridge 3TWSa.04, 3TWSm.01–03; NGSS bar graphs, pictographs and models"),
  P("Analysing data and drawing a conclusion", "تحليل البيانات والوصول إلى استنتاج", 5, "Cambridge 3TWSa.01–03, 3TWSc.05; NGSS using evidence"),
  P("Recap", "مراجعة", 6, "The investigation steps in order"),
];

export const SC3_INVESTIGATION_LESSONS: Lesson[] = [
  {
    id: "sc3-investigation-001",
    say: "Sara and Omar sit at the science table, ready to work like scientists. Sara observes a bean seed with her eyes, nose and fingers. Omar looks at a bean seed through a magnifying glass. Omar asks a question: do bean seeds need water to sprout? A seed sprouts when a tiny white root pushes out of the seed. A test with real seeds can answer Omar's scientific question. Sara asks which flower is prettiest, but no test can answer that question. Sara predicts that seeds without water will not sprout, because plants need water. Omar predicts that all the seeds will sprout, because seeds have food inside. Sara and Omar say their predictions out loud before the test begins.",
    question: "What question does Omar ask, and what does Sara predict?",
    answer: "Omar asks if bean seeds need water to sprout, and Sara predicts that seeds without water will not sprout",
    draw: "a bright primary-school science room: Sara with a dark ponytail and green cardigan observing a bean seed, and Omar in a blue polo shirt looking at a bean seed through a magnifying glass",
    video: "Omar looks closely at a bean seed through a magnifying glass while Sara gently holds another bean seed in her fingers at the science table.",
  },
  {
    id: "sc3-investigation-002",
    say: "Ms. Noura shows five picture cards, one for each way scientists investigate. Sara reads a library book about seeds to research an answer. Omar photographs a bean plant every morning to observe changes over time. Sara sorts seeds into big and small groups to classify the seeds. Omar looks for a pattern: do bigger seeds grow longer roots? Sara and Omar plan a fair test to find out if seeds need water. Omar sets up two clear cups that are exactly the same. Each cup holds cotton wool and ten bean seeds. Sara pours water onto the cotton wool in the first cup only. The second cup of seeds stays dry. Water is the only thing that changes, so water is the variable. Everything else stays the same: the cups, the seeds and the warm windowsill. Changing only one thing makes Sara and Omar's test a fair test. Ten seeds in each cup make the result easier to trust than one seed.",
    question: "What makes Sara and Omar's test a fair test?",
    answer: "Changing only one thing, the water, makes it a fair test, while the cups, the seeds and the windowsill stay the same",
    draw: "two identical clear cups on a sunny windowsill, each with cotton wool and ten bean seeds; Sara pours water into the first cup only while the second cup stays dry",
    video: "Sara pours a little water onto the cotton wool in the first clear cup of bean seeds, while the second identical cup beside it stays dry.",
  },
  {
    id: "sc3-investigation-003",
    say: "Ms. Noura sets out a ruler, a measuring jug, a thermometer and a timer. Omar chooses the measuring jug to measure water for the seeds. Sara leaves the timer on the table, because counting seeds needs no timer. Each morning, Sara measures 20 millilitres of water in the measuring jug. Omar reads the thermometer to check that both cups stay equally warm. The ruler shows centimetres, the jug shows millilitres, and the thermometer shows degrees Celsius. Omar's hand span and Ms. Noura's hand span are different sizes. A ruler in centimetres gives everyone the same answer, so Sara uses a ruler. Ms. Noura explains the safety rules before the test begins. Sara wipes up spilled water so nobody slips. Omar never eats seeds used in science, because some seeds can make people sick. Sara and Omar wash their hands with soap after touching the seeds.",
    question: "Why does Sara use a ruler instead of a hand span?",
    answer: "A ruler in centimetres gives everyone the same answer, but hand spans are different sizes",
    draw: "science equipment on a table: a ruler, a measuring jug, a thermometer and a timer, with Ms. Noura in a white lab coat and navy headscarf explaining the safety rules",
    video: "Ms. Noura sets a ruler, a measuring jug, a thermometer and a timer on the table; then Sara carefully measures water in the measuring jug.",
  },
  {
    id: "sc3-investigation-004",
    say: "Every morning, Sara counts the sprouted seeds in each cup. Omar makes one tally mark for each sprouted seed. The counts and observations that Sara and Omar collect are called data. Sara writes the counts in a results table with one column for each cup. On day one, no seeds have sprouted in either cup. On day three, five seeds have sprouted in the cup with water. On day five, nine seeds have sprouted in the cup with water. On day five, the seeds in the dry cup still look hard and dry. Omar draws a labelled diagram of a sprouted seed and its root. The longest root measures three centimetres on Omar's ruler. Sara writes the data down straight away, so nothing is forgotten.",
    question: "What are data, and how many seeds sprouted in the cup with water by day five?",
    answer: "Data are the counts and observations Sara and Omar collect, and nine seeds sprouted in the cup with water by day five",
    draw: "a results table and tally marks beside two cups: sprouted bean seeds with tiny white roots in the cup with water, and hard dry seeds in the dry cup",
    video: "Sara counts the sprouted bean seeds in the cup with water, and Omar draws one tally mark for each seed on his paper.",
  },
  {
    id: "sc3-investigation-005",
    say: "Sara makes a bar chart on squared paper to show the data. Each bar on Sara's bar chart stands for one cup of seeds. On Sara's bar chart, a taller bar means more seeds sprouted. The bar for the cup with water reaches nine. The dry cup has no bar, because zero seeds sprouted. Omar makes a pictograph with one seed picture for each sprouted seed. Omar's drawing of a sprouting seed is a model called a diagram. Sara makes a clay model of a sprouting seed that everyone can touch. Models help Sara and Omar show how a seed sprouts.",
    question: "What does a taller bar on Sara's bar chart mean?",
    answer: "A taller bar means more seeds sprouted",
    draw: "a simple bar chart on squared paper with one tall bar of nine for the cup with water and no bar for the dry cup, beside a pictograph of seeds and a clay seed model",
    video: "Sara colours one tall bar on squared paper while Omar presses a small clay model of a sprouting seed and shows it to the class.",
  },
  {
    id: "sc3-investigation-006",
    say: "Sara and Omar look at the bar chart to find a pattern. The pattern is clear: seeds with water sprout, and dry seeds do not. Each day, more seeds sprout in the cup with water. Sara's prediction matches the data, so the data support Sara's prediction. Omar's prediction does not match the data, and that is okay in science. Omar smiles, because a wrong prediction still helps scientists learn. The conclusion answers Omar's question: bean seeds need water to sprout. Seeds have food inside, but bean seeds still need water to sprout. Another group gets the same result, so the class trusts the conclusion more. Sara checks the library book, and the book agrees with the conclusion. Omar plans to measure every root next time, not only the longest root. Sara and Omar share their bar chart and conclusion with the class. Omar asks a new question: do bean seeds need light to sprout?",
    question: "What is the conclusion of Sara and Omar's test?",
    answer: "The conclusion is that bean seeds need water to sprout",
    draw: "Sara and Omar standing in front of the class sharing their bar chart, a cup of sprouted bean seeds on the table and a library book about seeds",
    video: "Sara and Omar hold up their bar chart and share their conclusion with the class while Omar smiles.",
  },
  {
    id: "sc3-investigation-007",
    say: "Omar asks a question that a test can answer. Sara makes a prediction before the test begins. Sara and Omar's fair test changes only the water. Omar measures with a jug, a ruler and a thermometer. Sara records the data in a results table. Sara's bar chart shows the data as bars that are easy to compare. Sara and Omar find a pattern and write a conclusion. Every conclusion gives Sara and Omar a new question to investigate.",
    question: "What are the steps of an investigation?",
    answer: "Ask a question, make a prediction, do a fair test, measure, record the data, make a bar chart, find a pattern and write a conclusion",
    draw: "a friendly step-by-step poster of an investigation: a question mark, a prediction, two cups for a fair test, a ruler, a results table, a bar chart and a conclusion",
    video: "A calm montage of Sara and Omar's investigation: asking a question, watering one cup of seeds, counting sprouts and sharing their bar chart.",
  },
];

export const SC3_INVESTIGATION: Chapter = {
  id: "sc3-investigation",
  title: { en: "Scientific Investigation and Data", ar: "الاستقصاء العلمي والبيانات" },
  summary: {
    en: "Questions, predictions, fair tests, measuring safely, recording data, bar charts and conclusions",
    ar: "الأسئلة والتوقعات والاختبار العادل والقياس الآمن وتسجيل البيانات والأعمدة البيانية والاستنتاجات",
  },
  parts: SC3_INVESTIGATION_PARTS,
  lessons: SC3_INVESTIGATION_LESSONS,
};
