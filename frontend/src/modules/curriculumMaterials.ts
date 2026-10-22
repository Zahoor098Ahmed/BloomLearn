import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Materials — from the client's "Material Properties: Grade 3 Video-Ready Summaries"
 * (Saudi MOE Unit 5, Oxford Stage 3 Module 2, Cambridge Stage 3 Units 6 & 8, McGraw Hill Chapter 9).
 * 5 Parts, each combining its sentences into an educational summary paragraph lesson.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_MATERIALS_PARTS: ChapterPart[] = [
  P("Material properties", "خصائص المواد: الصلابة والنعومة والمرونة", 0, "Oxford Module 2 Materials (properties: hard, soft, shiny, rough, smooth, brittle, bouncy)"),
  P("Just right for the job", "اختيار المادة المناسبة للعمل", 1, "Oxford Module 2 Materials (just right for the job: waterproof, insulators, absorbent)"),
  P("Magnets and magnetic materials", "المغناطيس والمواد المغناطيسية", 2, "Oxford Module 2 & Cambridge Unit 8 (magnets, poles, compass, magnetic and non-magnetic metals)"),
  P("Separating mixtures", "فصل المخاليط", 3, "Cambridge Unit 6 (separating mixtures: sieving, filtering, magnetic separation, dissolving)"),
  P("Observing and measuring materials", "ملاحظة المواد وقياسها", 4, "Saudi MOE Unit 5 & McGraw Hill (mass, volume, length, temperature, floating and sinking)"),
];

export const SC3_MATERIALS_LESSONS: Lesson[] = [
  {
    id: "sc3-materials-001",
    say: "A child pushes on a soft cushion, and the cushion squashes down under her hand. A child knocks on a hard wooden door, and the door stays firm. A shiny metal bowl reflects the light from a torch and sparkles. A child runs her fingers over a rough rock that feels bumpy and scratchy. A child runs her fingers across a smooth mirror that feels flat and slippery. Sunlight shines straight through a transparent glass window into the classroom. A glass vase slips off a shelf and cracks into pieces, because glass is brittle. Strong bricks hold up the heavy walls of a house. A rubber ball bounces high off the playground floor, because rubber is bouncy.",
    question: "What are some properties of materials?",
    answer: "Materials can be soft, hard, shiny, rough, smooth, transparent, brittle, strong, or bouncy",
    draw: "a classroom table showing objects with different material properties: a soft squishy cushion, a shiny metal bowl, a smooth mirror, a rough stone, and a bouncy rubber ball",
    video: "A child testing material properties: pressing a soft cushion, knocking on a hard wooden door, shining light on a shiny metal bowl, and bouncing a rubber ball.",
  },
  {
    id: "sc3-materials-002",
    say: "A metal pan is hard and strong, so it can sit on a hot stove. Soft, bendy fabric makes a warm blanket that wraps around a sleeping child. A plastic cup holds water without leaking, because plastic is waterproof. A thick felt coat keeps a child warm, because felt is a good insulator. A cloth soaks up spilled juice from the table, because fabric is absorbent. A paper windscreen on a toy car tears in the rain, so paper is the wrong material for the job. People choose materials that are just right for each job.",
    question: "Why do we choose different materials for different jobs?",
    answer: "Because each material has properties like being waterproof, strong, or a heat insulator",
    draw: "a workshop table with everyday useful objects: a strong metal pan, a soft wool blanket, a waterproof plastic bottle, and an absorbent cloth",
    video: "Testing everyday materials: water beading off a waterproof plastic sheet, and an adult lifting a metal pan with a cool heat-insulated handle.",
  },
  {
    id: "sc3-materials-003",
    say: "A fridge magnet sticks to the steel door of a fridge. A magnet pulls a steel paper clip, while a wooden pencil stays still on the desk. Two magnets snap together when a north pole meets a south pole. Two magnets push apart when two north poles face each other. A compass needle swings round and points north. A magnet picks up steel paper clips, while plastic and wooden objects stay still on the table. A magnet slides past an aluminium can, which stays still, because aluminium is a metal that magnets do not pull. Opposite poles attract and the same poles repel.",
    question: "What do magnets attract, and how do their poles behave?",
    answer: "Magnets attract iron and steel; north and south poles attract, while like poles repel",
    draw: "a red and blue bar magnet attracting shiny steel paperclips, next to a compass pointing north and a non-magnetic wooden pencil",
    video: "A magnet attracting steel paperclips and snapping together with another magnet north-to-south, then repelling north-to-north.",
  },
  {
    id: "sc3-materials-004",
    say: "Dry rice and dried brown beans are stirred together in a bowl to make a mixture. In the rice and bean mixture, the rice stays small and white and the beans stay big and brown. A sieve lets the small rice grains fall through its holes and keeps the big beans on top. A magnet sweeps over a mix of sand and iron filings and pulls out only the iron. Sandy water is poured through a paper filter, and the sand stays behind in the paper. Sugar dissolves and disappears from view when stirred into warm water, but the sugar is still in the water.",
    question: "How can different mixtures be separated?",
    answer: "Using a sieve for different sizes, a magnet for iron, and a filter for sand and water",
    draw: "a science laboratory table with a bowl of rice and beans, a sieve separating grains, a filter funnel with sandy water, and a magnet lifting iron filings",
    video: "Shaking a sieve to separate rice from beans, and pouring sandy water through filter paper into a beaker of clean water.",
  },
  {
    id: "sc3-materials-005",
    say: "A wooden block, a glass marble and a rubber ball each take up space, so each one is matter. A child lines up buttons by colour, shape and size, three properties she can see. A wooden chair, a plastic cup, a rubber tyre and a metal key are made of different materials. A child places a rock on a pan balance to measure its mass. Water is poured into a measuring cup to find its volume, the space it takes up. A child lays a ruler beside a pencil to measure its length in centimetres. A thermometer standing in a glass of hot tea shows a high temperature. Two children measure the same table with metre sticks and get the same answer, because metres are standard units. A wooden block floats on top of the water, while a metal nail sinks to the bottom. A metal spoon in hot soup warms all the way up its handle, because metal carries heat well.",
    question: "What tools do we use to measure materials, and what is floating and sinking?",
    answer: "A balance measures mass, a cup measures volume, a ruler measures length, and wood floats while metal sinks",
    draw: "a neat science table with a wooden block floating in a glass bowl of water while a metal nail rests at the bottom, alongside a pan balance, a ruler, and a thermometer",
    video: "A child dropping a wooden block that floats on water and a metal nail that sinks, then measuring an object's mass on a balance.",
  },
];

export const SC3_MATERIALS: Chapter = {
  id: "sc3-materials",
  title: {
    en: "Materials",
    ar: "المواد وخصائصها",
  },
  summary: {
    en: "Material properties, choosing materials, magnets, mixtures and measuring",
    ar: "خصائص المواد واختيارها والمغناطيس وفصل المخاليط وقياسها",
  },
  parts: SC3_MATERIALS_PARTS,
  lessons: SC3_MATERIALS_LESSONS,
};
