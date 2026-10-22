import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Water — from the client's "Grade 3 Water: Video-Ready Lesson Script"
 * 10 Parts, each with an educational summary paragraph combining the script's sentences.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_WATER_PARTS: ChapterPart[] = [
  P("Water is everywhere", "الماء في كل مكان", 0, "A Closer Look Earth's features; Saudi Unit 3; English NC Year 4"),
  P("Salt water and fresh water", "الماء المالح والماء العذب", 1, "A Closer Look Air and water resources; Saudi Unit 3"),
  P("Ice, water and water vapour", "الجليد والماء وبخار الماء", 2, "Saudi States of matter; Cambridge 3Cm.01; English NC Year 4"),
  P("The water cycle", "دورة الماء", 3, "Saudi The water cycle; Inspire Weather patterns; English NC Year 4"),
  P("What water does: flowing, floating and dissolving", "خواص الماء: الجريان والطفو والذوبان", 4, "Saudi Matter and measuring it; Cambridge 3Cp.01, 3Cc.01"),
  P("Living things need water", "الكائنات الحية تحتاج إلى الماء", 5, "Saudi Living things and their needs; Cambridge 3Bp.03; Oxford Module 6"),
  P("Water shapes the land", "الماء يشكّل سطح الأرض", 6, "Saudi Unit 3 (weathering and erosion); Inspire Natural hazards"),
  P("Where Saudi Arabia gets its water", "مصادر المياه في المملكة العربية السعودية", 7, "Saudi Unit 3 (water resources); Desalination and groundwater"),
  P("Clean water: filtering and treating", "المياه النظيفة: التنقية والمعالجة", 8, "Oxford Module 6 (filtering water); Cambridge 3Cp.04; Water treatment"),
  P("Saving water", "ترشيد استهلاك المياه", 9, "Saudi Unit 3 (saving resources); Conservation and sustainability"),
];

export const SC3_WATER_LESSONS: Lesson[] = [
  {
    id: "sc3-water-001",
    say: "Water covers most of the Earth's surface. Most of Earth's water is in the oceans and seas. Rivers, lakes and streams hold water on land. Some of Earth's water is frozen as ice near the North and South Poles. Some water is hidden underground in the gaps between rocks. Water is also in the air as invisible water vapour. Clouds are made of tiny drops of water. A wadi is a dry valley that fills with water after heavy rain. An oasis is a green place in the desert where water comes up from underground.",
    question: "What covers most of the Earth's surface?",
    answer: "Water covers most of the Earth's surface in oceans, rivers, ice, underground and clouds",
    draw: "a panoramic view of planet Earth floating in deep blue space showing vast blue oceans, snowy polar ice caps, and green continents with winding rivers",
    video: "Earth spins slowly in space, its blue oceans much bigger than its land, transitioning to rivers and clouds.",
  },
  {
    id: "sc3-water-002",
    say: "Seawater is salty, so people cannot drink seawater. The Red Sea and the Arabian Gulf are full of salt water. Fresh water has very little salt, so people can drink fresh water. Only a small part of Earth's water is fresh water. Most fresh water is frozen in ice or hidden underground. Rivers and lakes hold only a tiny part of Earth's fresh water. Salt water holds people up more than fresh water, so floating is easier in the sea.",
    question: "Why can people drink fresh water but not seawater?",
    answer: "Because seawater is salty, while fresh water has very little salt",
    draw: "a clear glass of pure drinking water sitting on a table beside a scenic view of the deep blue Red Sea waves under sunny skies",
    video: "A split screen comparing a glass of clear drinkable fresh water with the salty turquoise waters of the Red Sea.",
  },
  {
    id: "sc3-water-003",
    say: "Water can be a solid, a liquid or a gas. Ice is solid water, and ice keeps its own shape. Liquid water flows and takes the shape of its container. Water vapour is water in the form of an invisible gas. Water freezes into ice at 0 degrees Celsius. Ice melts into water when it warms above 0 degrees Celsius. Water boils at 100 degrees Celsius. Boiling water quickly turns into water vapour. Water vapour turns back into drops of water when it touches something cold. Ice floats because ice is lighter than the same amount of water. Water takes up more space when it freezes, so a frozen bottle of water bulges.",
    question: "What are the three states of water?",
    answer: "Solid ice, liquid water and gas water vapour",
    draw: "three forms of water shown together: clear ice cubes on a plate, a glass of liquid water, and rising steam from a warm teapot",
    video: "Ice cubes in a glass of water with steam rising from a kettle side by side, each clearly showing a different state of matter.",
  },
  {
    id: "sc3-water-004",
    say: "The water cycle is water moving between the sea, the sky and the land, again and again. The sun heats the water in seas, lakes and puddles. Heated water evaporates and rises into the air as water vapour. Water vapour cools high in the sky and condenses into tiny drops. Billions of tiny drops together make a cloud. The drops in a cloud join together and grow heavy. Heavy drops fall as rain, or as snow and hail when the air is very cold. Rainwater runs into wadis, rivers and the sea. Some rainwater soaks into the ground and becomes groundwater. The water in your glass has travelled around the water cycle many times.",
    question: "What is the water cycle?",
    answer: "Water moving between the sea, the sky and the land, again and again",
    draw: "a complete water cycle illustration with curved circular arrows showing evaporation from the sea, cloud formation in the sky, and rainfall flowing into a wadi",
    video: "An animated water cycle: sunshine warming the sea, vapour rising into clouds, rain falling over mountains, and rivers flowing back to the ocean.",
  },
  {
    id: "sc3-water-005",
    say: "Water flows downhill from high places to low places. Still water settles with a flat top. A wooden block floats on water, and a stone sinks. A big ship floats because its shape pushes aside lots of water. A ball of clay sinks, but the same clay shaped like a boat floats. Sugar dissolves in water and seems to disappear. Salt dissolves in water too, and the water then tastes salty. Sugar dissolves faster in warm water than in cold water. Sand does not dissolve in water. Oil does not mix with water, so oil floats on top. A sponge soaks up water because a sponge is absorbent. Waterproof materials, like plastic, keep water out. Water helps us clean things by washing dirt away.",
    question: "Why does a wooden block float while a stone sinks in water?",
    answer: "A wooden block is lighter and floats, while a dense heavy stone sinks",
    draw: "a clear water tank with a floating wooden block and a sunken stone at the bottom, while a spoonful of sugar dissolves smoothly in a nearby glass",
    video: "Demonstration of water properties: wood floating, stone sinking, sugar dissolving in water, and water trickling downhill into a level bowl.",
  },
  {
    id: "sc3-water-006",
    say: "All living things need water to stay alive. More than half of your body is water. We lose water when we sweat and breathe, so we must drink water every day. On hot days, people need to drink more water. Plant roots soak up water from the soil. Water travels up a plant's stem to the leaves. A plant without water wilts and droops. A camel can go many days without drinking water. Fish and many other animals live in water. Frogs lay their eggs in water.",
    question: "Why do all living things need to drink or absorb water?",
    answer: "All living things need water to stay alive, grow and keep their bodies working properly",
    draw: "a child drinking fresh water from a reusable bottle, beside a camel drinking at a desert water trough and healthy green plants in a garden",
    video: "A peaceful montage of life needing water: a child sipping water, a desert camel drinking at an oasis, and green roots soaking moisture from soil.",
  },
  {
    id: "sc3-water-007",
    say: "Moving water slowly wears away rock and soil. Breaking rock into smaller pieces is called weathering. Carrying rock pieces away to a new place is called erosion. Rivers carry sand and mud downstream and drop them in new places. Over a very long time, flowing water can carve deep valleys. Waves crash on the coast and slowly shape the shore. Rain on dry desert ground can run off fast and cause a flash flood. Never play in or cross a flooded wadi. Plant roots hold soil in place and stop rain washing the soil away.",
    question: "What is erosion?",
    answer: "Carrying rock pieces and soil away to a new place by moving water or wind",
    draw: "a deep natural canyon carved by a rushing river with layered rock walls, and sea waves washing over smooth stones on a rocky shore",
    video: "Time-lapse of flowing river water carving rock into smooth canyon walls, and rainwater washing soil into a desert wadi.",
  },
  {
    id: "sc3-water-008",
    say: "Saudi Arabia has no rivers that flow all year. Much of Saudi Arabia's drinking water comes from the sea. Removing salt from seawater to make fresh water is called desalination. Saudi Arabia makes more desalinated water than any other country. Wells pump water up from deep underground. Some groundwater under the desert is thousands of years old. Dams catch rainwater in wadis so the water can be stored and used. Long pipes carry fresh water from the coast to cities far inland, like Riyadh. Water from a kitchen tap has often travelled a long way.",
    question: "What is desalination?",
    answer: "Removing salt from seawater to make fresh drinking water",
    draw: "a modern desalination plant along the Saudi coast taking in seawater through large pipes and producing clean fresh water for cities",
    video: "A modern coastal desalination plant by the Red Sea, followed by deep oasis water wells and long pipelines carrying water across the desert.",
  },
  {
    id: "sc3-water-009",
    say: "Clean water is safe to drink, but dirty water can make people sick. Dirty water can carry germs too small to see. A filter lets water pass through and traps dirt. A simple filter can be made from gravel, sand and cloth. Filtered water looks clearer but can still have germs, so never drink it. Water treatment plants clean water before it reaches our homes. Boiling water kills many germs. Letting salt water evaporate leaves the salt behind. Rubbish and oil spills make seas and beaches dirty.",
    question: "How do water filters help clean dirty water?",
    answer: "A filter lets clean water pass through while trapping dirt and particles",
    draw: "a transparent water filter showing layers of gravel, sand, and cloth trapping muddy sediment so clear water drips out into a clean beaker",
    video: "Children layering gravel, sand, and cloth to filter cloudy water into clear liquid, and an adult boiling water to kill germs.",
  },
  {
    id: "sc3-water-010",
    say: "Fresh water is precious, so we must not waste water. Turning off the tap while brushing your teeth saves water. A short shower uses less water than a full bath. Fixing a dripping tap stops water being wasted. Watering plants in the early morning saves water, because less water evaporates. Drip irrigation gives each plant only the water it needs. Washing a car with a bucket uses less water than washing it with a hose. Water used to rinse fruit can be reused to water plants. Saudi Arabia has a national programme that helps families save water. Every drop of water saved helps people, animals and plants.",
    question: "Name one easy way to save water at home every day.",
    answer: "Turning off the tap while brushing your teeth and taking shorter showers",
    draw: "a child turning off a bathroom tap while brushing teeth, and thin drip irrigation tubes watering lush green date palms in a sunlit orchard",
    video: "Practical water saving: a child turning off the tap while brushing teeth, and efficient drip irrigation watering a row of date palms.",
  },
];

export const SC3_WATER: Chapter = {
  id: "sc3-water",
  title: { en: "Water", ar: "الماء" },
  summary: { en: "Water cycle, states of water, uses and conservation", ar: "دورة الماء وحالاته وخصائصه وترشيد استهلاكه" },
  lessons: SC3_WATER_LESSONS,
  parts: SC3_WATER_PARTS,
};

