import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Light — from the client's "Grade 3 Light: Video-Ready Lesson Script"
 * 10 Parts, each with an educational summary paragraph combining the script's sentences.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_LIGHT_PARTS: ChapterPart[] = [
  P("We need light to see", "نحتاج إلى الضوء لنرى", 0, "Saudi Light (seeing in dark); English NC Year 3; Oxford Module 5"),
  P("Where light comes from", "مصادر الضوء", 1, "Saudi Light (sources of light); A Closer Look Light; English NC Year 3"),
  P("Light travels in straight lines", "الضوء يسير في خطوط مستقيمة", 2, "Saudi Light (straight lines); A Closer Look Light; English NC Year 6"),
  P("Transparent, translucent and opaque", "الأجسام الشفافة وشبه الشفافة والمعتمة", 3, "Saudi Light; Cambridge 3Ps.01; English NC Year 3"),
  P("Shadows", "الظلال", 4, "Saudi Light (shadows); Cambridge 3Ps.02–03; English NC Year 3"),
  P("Reflection: light bounces", "الانعكاس: ارتداد الضوء", 5, "Saudi Light (reflection, mirrors); English NC Year 3"),
  P("Refraction: light bends", "الانكسار: انحناء الضوء", 6, "Saudi Light (refraction through water and glass); Lenses"),
  P("The colours in light", "ألوان الضوء", 7, "Saudi Light (prism, spectrum, colours); A Closer Look Light"),
  P("Our eyes, and staying safe in sunlight", "أعيننا والسلامة من أشعة الشمس", 8, "Saudi Light (the pupil); English NC Year 3 (eye safety); Oxford Module 5"),
  P("Using light", "استخدامات الضوء في حياتنا", 9, "Saudi Light; Solar panels, optical fibres and energy saving"),
];

export const SC3_LIGHT_LESSONS: Lesson[] = [
  {
    id: "sc3-light-001",
    say: "We need light to see things. Dark is when there is no light. In complete darkness, our eyes cannot see anything. We see an object when light bounces off the object into our eyes. Cats see well in dim light, but cats cannot see in total darkness. The Moon shines at night because sunlight bounces off the Moon. Light is a kind of energy that we sense with our eyes. Light travels faster than anything else.",
    question: "Why do we need light to see objects?",
    answer: "We see an object when light bounces off it into our eyes",
    draw: "a child switching on a warm desk lamp in a dim bedroom, instantly revealing colourful toys, books and drawings on the desk",
    video: "A dark windowless room where a lamp is switched on, immediately illuminating a child reading comfortably at a desk.",
  },
  {
    id: "sc3-light-002",
    say: "A light source is something that gives out its own light. The sun is our biggest natural light source. Stars are light sources very far away in space. Fire gives out light as well as heat. Electric lamps, torches and screens are light sources made by people. Some animals, like fireflies, make their own light. The Moon is not a light source, because the Moon only reflects sunlight. A mirror is not a light source, because a mirror only reflects light. Shiny sequins sparkle only when light shines on them.",
    question: "What is our biggest natural light source?",
    answer: "The sun is our biggest natural light source",
    draw: "a collection of light sources: a brilliant golden sun shining over a landscape, a warm crackling campfire at dusk, and a glowing table lamp",
    video: "A glowing sunrise over Riyadh rooftops, a campfire with golden flames at night, and electric torches casting bright beams in the dark.",
  },
  {
    id: "sc3-light-003",
    say: "Light travels from its source in straight lines. A torch beam shines in a straight line. Light does not bend around corners by itself. Light passes through holes in three cards when the holes are lined up. Moving one card out of line blocks the light. Light from the sun takes about eight minutes to reach Earth.",
    question: "How does light travel from its source?",
    answer: "Light travels in straight lines and does not bend around corners by itself",
    draw: "a flashlight beam cutting straight across a dark dusty room, shining through three lined-up holes in cardboard cards onto a far wall",
    video: "Sunbeams streaming in straight golden lines through gaps in a palm-frond roof, and a torch beam travelling straight through cards in a row.",
  },
  {
    id: "sc3-light-004",
    say: "Transparent materials let almost all light pass through. Clear glass, clean water and air are transparent. Translucent materials let some light through, but things behind them look blurry. Frosted glass, tissue paper and wax paper are translucent. Opaque materials block light completely. Wood, metal, stone and cardboard are opaque. Opaque objects make shadows. A torch test shows which materials let light through. Curtains made of thick, opaque cloth keep a bedroom dark in the morning.",
    question: "What is the difference between transparent and opaque materials?",
    answer: "Transparent materials let light pass through clearly, while opaque materials block light completely and make shadows",
    draw: "three window frames side by side: one with crystal-clear transparent glass, one with soft blurry frosted translucent glass, and one with a solid opaque wooden shutter",
    video: "A torch light test: shining light easily through clear glass, partially through translucent wax paper, and completely blocked by a solid wooden board.",
  },
  {
    id: "sc3-light-005",
    say: "A shadow forms when an opaque object blocks light. A shadow is a dark area where the light cannot reach. A shadow has the same outline as the object blocking the light. A shadow is always on the side of the object away from the light. Moving an object closer to a light makes its shadow bigger. Moving an object further from a light makes its shadow smaller. Shadow puppets use hands or cut-out shapes to make shadow pictures. Shadows outside are long in the early morning and the evening. Shadows are shortest at midday, when the sun is high in the sky. Shadows move during the day as the sun moves across the sky. A sundial uses a shadow to show the time.",
    question: "When does a shadow form?",
    answer: "A shadow forms when an opaque object blocks light from reaching a surface",
    draw: "a child standing in early morning desert sunlight casting a long dark shadow on golden sand, with shadow puppet bird shapes on a wall nearby",
    video: "Hands in front of a lamp making flying bird shadow puppets on a white wall, and time-lapse of a palm tree shadow moving across the desert sand.",
  },
  {
    id: "sc3-light-006",
    say: "Reflection is when light bounces off a surface. Smooth, shiny surfaces like mirrors reflect light best. We see ourselves in a mirror because the mirror reflects light back to our eyes. A mirror swaps left and right, so a raised right hand looks like a left hand. Writing looks backwards in a mirror. Car mirrors help drivers see what is behind them. Calm water in a pool reflects the palm trees above it. Reflective strips on school bags shine brightly in car headlights. Rough, dark surfaces reflect very little light.",
    question: "What is reflection?",
    answer: "Reflection is when light bounces off a smooth shiny surface like a mirror or calm water",
    draw: "a child smiling into a clean bathroom mirror while light bounces back to their eyes, and tall green date palms perfectly mirrored in a still oasis pool",
    video: "A torch beam bouncing off a shiny mirror at an angle, and car mirrors showing moving vehicles safely approaching from behind.",
  },
  {
    id: "sc3-light-007",
    say: "Refraction is when light bends as it passes from air into water or glass. A straw in a glass of water looks broken because light bends. A coin hidden in an empty bowl can appear when water is poured in. A magnifying glass bends light to make things look bigger. Glasses have curved lenses that bend light to help people see clearly. A water drop can bend light and make things behind it look bigger.",
    question: "Why does a straight straw look bent or broken in a glass of water?",
    answer: "Because of refraction, which is the bending of light as it passes from air into water",
    draw: "a clear glass tumbler filled with water showing a red drinking straw appearing bent at the water surface, beside a magnifying glass enlarging green leaf veins",
    video: "Water poured into an empty bowl causing a hidden coin to magically come into view as light refracts over the bowl rim.",
  },
  {
    id: "sc3-light-008",
    say: "White sunlight is made of many colours mixed together. A prism splits white light into a band of colours called a spectrum. The colours of the spectrum are red, orange, yellow, green, blue, indigo and violet. A rainbow appears when sunlight shines through raindrops. A fine spray of water on a sunny day can make a small rainbow. A green leaf looks green because the leaf reflects green light. A banana looks yellow because the banana reflects yellow light. A white shirt reflects all the colours, and a black shirt soaks them all up. Black things get hotter in the sun because they soak up more light.",
    question: "What does a glass prism do to white light?",
    answer: "A prism splits white light into a spectrum of seven colours: red, orange, yellow, green, blue, indigo and violet",
    draw: "a triangular glass prism splitting a bright beam of white sunlight into a vibrant rainbow spectrum on a wall, and a natural rainbow arching over a desert valley",
    video: "A beam of white light entering a glass prism and fanning out into vibrant rainbow colours, followed by a rainbow forming in fine water mist on a sunny day.",
  },
  {
    id: "sc3-light-009",
    say: "Light enters the eye through a small black opening called the pupil. The pupil gets smaller in bright light and bigger in dim light. A lens inside the eye focuses light into a clear picture. A nerve carries messages from the eye to the brain, and the brain makes the picture. Never look straight at the sun, because sunlight can damage your eyes. Sunglasses protect the eyes from bright sunlight. A hat with a brim shades the eyes from the sun. Never shine a torch or a laser into anyone's eyes. Reading in good light keeps the eyes comfortable.",
    question: "Why should we wear sunglasses and a hat on sunny days?",
    answer: "To protect our eyes and pupils from harsh direct sunlight and UV rays",
    draw: "a close-up illustration of the human eye showing the dark round pupil adjusting to light, and a smiling child wearing dark protective sunglasses at a sunny beach",
    video: "A pupil shrinking when a room light turns on, and children wearing sun hats and dark sunglasses playing safely outside on a bright sunny afternoon.",
  },
  {
    id: "sc3-light-010",
    say: "Plants need light to grow and make their food. Solar panels turn sunlight into electricity. Street lights help people see safely at night. A lighthouse shines a bright beam to guide ships at night. Traffic lights use red, yellow and green lights to tell drivers what to do. A camera lets light in to make a photograph. Light can carry messages along thin glass threads called optical fibres. Switching off lights we do not need saves energy.",
    question: "How do solar panels use light energy?",
    answer: "Solar panels absorb sunlight and turn it into clean electricity",
    draw: "rows of modern blue solar panels shining in bright desert sunshine, beside a tall coastal lighthouse casting a revolving beam across the dark night sea",
    video: "Solar farms harvesting bright sunlight in the desert, city streetlights turning on at dusk, and a lighthouse guiding ships through the night sea.",
  },
];

export const SC3_LIGHT: Chapter = {
  id: "sc3-light",
  title: { en: "Light", ar: "الضوء" },
  summary: { en: "Sources of light, shadows, reflection and refraction", ar: "مصادر الضوء والظلال والانعكاس والانكسار والألوان" },
  lessons: SC3_LIGHT_LESSONS,
  parts: SC3_LIGHT_PARTS,
};

