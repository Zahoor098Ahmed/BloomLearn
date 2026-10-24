import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Fossils
 * From the client's "Fossils — Video-Ready Chapter Summary"
 * (Saudi MOE, McGraw Hill Science: A Closer Look, Cambridge 3ESp.01–02, Oxford).
 * 6 Parts, combining all 52 sentences into 6 paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_FOSSILS_PARTS: ChapterPart[] = [
  P("What a fossil is", "ما الأحفورة؟", 0, "Saudi MOE Lesson 2; Cambridge 3ESp.02; Oxford Stage 3"),
  P("How a fossil forms", "كيف تتكون الأحفورة", 1, "Saudi MOE; McGraw Hill Ch 6 L3; Cambridge 6ESp.02"),
  P("Types of fossils", "أنواع الأحافير", 2, "Saudi MOE (imprints, moulds, casts, amber, tar, ice); Cambridge 3ESp.02"),
  P("What fossils tell us", "ماذا تخبرنا الأحافير", 3, "Saudi MOE; McGraw Hill Ch 4 L3 Living Things of the Past"),
  P("Fossil hunters at work", "علماء الأحافير في العمل", 4, "McGraw Hill Ch 4 L3"),
  P("Fossil fuels", "الوقود الأحفوري", 5, "Saudi MOE; McGraw Hill Ch 6 L3; Cambridge 3ESp.01"),
];

export const SC3_FOSSILS_LESSONS: Lesson[] = [
  {
    id: "sc3-fossils-001",
    say: "A fossil is what is left of a plant or animal that lived long ago. Every fossil comes from something that was once alive. Fossils can be bones, shells, teeth, leaves or footprints. Most fossils are found inside layers of rock.",
    question: "What is a fossil, and where are most fossils found?",
    answer: "A fossil is what is left of a plant or animal that lived long ago, and most fossils are found inside layers of rock",
    draw: "a hand holding a grey stone with the spiral shape of an ancient sea shell, beside a wooden table with a dinosaur bone, a shark tooth, a leaf print and a stone footprint",
    video: "Close-up of a hand holding a grey stone with the spiral shape of an ancient sea shell in it, in soft daylight; then a tall striped cliff with a shell fossil in one layer.",
  },
  {
    id: "sc3-fossils-002",
    say: "A silver fish dies and sinks to the bottom of the sea. Soft mud and sand quickly cover the silver fish. The soft body of the silver fish slowly disappears, and the bones remain. A hard shell lasts much longer in the mud than a soft worm. Layer after layer of mud and sand piles up over the fish skeleton. Mud and sand that settle in layers are called sediment. Layers of mud and sand press together and slowly harden into rock. Rock made from hardened sediment is called sedimentary rock. Water carrying tiny minerals slowly turns the bones of the silver fish into stone. Turning bones into stone takes a very long time, often millions of years. Over time, the old sea floor rises up and becomes dry land. Wind and rain wear away the rock until the fossil of the silver fish appears.",
    question: "How does a fish become a fossil?",
    answer: "Mud and sand cover the fish, the layers of sediment harden into rock, and minerals slowly turn the bones into stone",
    draw: "a cross-section of the sea floor: a white fish skeleton lying under coloured layers of mud and sand that harden into striped sedimentary rock",
    video: "Underwater, a large silver fish drifts slowly down and lies still on the muddy sea floor; mud and sand gently settle over it in thin layers that harden into rock.",
  },
  {
    id: "sc3-fossils-003",
    say: "Some fossils are remains, the real bones, teeth or shells of a living thing. An imprint is the shape a leaf presses into soft mud. The mud with the leaf imprint dries and hardens into rock. A shell buried in rock slowly dissolves and leaves a shell-shaped hole. The empty, shell-shaped hole in the rock is called a mould. Minerals fill the mould and harden into a stone copy of the shell, called a cast. An insect trapped in sticky tree sap can become a fossil in amber. The tree sap hardens into golden amber with the whole insect inside. A woolly mammoth frozen in ice keeps its fur, skin and bones. Sticky black tar can keep animal bones safe for thousands of years.",
    question: "What are an imprint, a mould and a cast?",
    answer: "An imprint is the shape a leaf presses into mud, a mould is a shell-shaped hole in rock, and a cast is a stone copy of the shell",
    draw: "types of fossils side by side: a fern leaf imprint in grey stone, a rock split open to show a shell mould and its stone cast, and a golden piece of amber with a tiny fly inside",
    video: "A green fern leaf lies on soft grey mud, then lifts away leaving a perfect print; then a clear golden piece of amber is held up to sunlight with a tiny fly inside.",
  },
  {
    id: "sc3-fossils-004",
    say: "Fossils show what plants and animals looked like long ago. Sharp, pointed fossil teeth show that an animal ate meat. Flat, wide fossil teeth show that an animal ate plants. A fossil fish in the desert shows that a sea once covered the land. Fossils in deeper rock layers are usually older than fossils in higher layers. A fossil horseshoe crab looks much like a horseshoe crab alive today. When a place changes very quickly, some kinds of animals can die out. Dinosaurs died out long ago and are now extinct. People learn about dinosaurs today by studying dinosaur fossils.",
    question: "What can fossil teeth tell us about an animal?",
    answer: "Sharp, pointed fossil teeth show an animal ate meat, and flat, wide teeth show it ate plants",
    draw: "a museum hall where children look up at a giant dinosaur skeleton, with a sharp meat-eater's fossil tooth and a flat plant-eater's fossil tooth on display",
    video: "A stone dinosaur skeleton in a bright museum slowly turns into a living green dinosaur walking through a fern forest, while children watch in wonder.",
  },
  {
    id: "sc3-fossils-005",
    say: "Scientists who study fossils are called palaeontologists. A palaeontologist chips away rock around a fossil with small tools. A soft brush sweeps dust and sand off the fossil bone. The palaeontologist writes notes and takes photos of the fossil in the ground. In the museum, scientists join the fossil bones into a whole skeleton. Scientists compare fossils with living animals to learn how ancient animals lived.",
    question: "What do palaeontologists do?",
    answer: "Palaeontologists study fossils: they chip away rock, brush the fossil bone clean, take notes and photos, and join bones into a skeleton",
    draw: "a palaeontologist in a wide sun hat and blue shirt kneeling at a rocky dig site, brushing sand off a dinosaur bone with a soft brush, a magnifying glass beside them",
    video: "A palaeontologist in a wide sun hat gently taps a small chisel to free a stone bone, then sweeps the sand away with a soft paintbrush.",
  },
  {
    id: "sc3-fossils-006",
    say: "Coal, oil and natural gas are called fossil fuels. Fossil fuels formed from plants and animals that lived millions of years ago. Coal formed from giant swamp plants buried under mud for millions of years. Oil and natural gas formed from tiny sea plants and animals buried under the sea floor. Oil and natural gas lie deep underground, trapped inside rocks. Oil wells pump oil up from deep under the desert. Cars and planes burn fuel made from oil to move. Power stations burn coal or gas to make electricity for homes. Fossil fuels are non-renewable because new fossil fuels take millions of years to form. Sunlight, wind and flowing water give renewable energy every day. A child switches off the lights when leaving a room to save energy.",
    question: "Why are fossil fuels non-renewable?",
    answer: "Fossil fuels like coal, oil and natural gas are non-renewable because new fossil fuels take millions of years to form",
    draw: "an oil pump jack nodding in a sunny Saudi desert, a lump of black coal and a blue gas flame, beside shining solar panels and wind turbines for renewable energy",
    video: "An oil pump jack nods up and down in a sunny sandy desert; then a girl switches off her bedroom light as she leaves and the room goes dim.",
  },
];

export const SC3_FOSSILS: Chapter = {
  id: "sc3-fossils",
  title: { en: "Fossils", ar: "الأحافير" },
  summary: {
    en: "What fossils are, how they form, types of fossils, what they tell us, fossil hunters and fossil fuels",
    ar: "ما الأحافير وكيف تتكون وأنواعها وماذا تخبرنا وعلماء الأحافير والوقود الأحفوري",
  },
  parts: SC3_FOSSILS_PARTS,
  lessons: SC3_FOSSILS_LESSONS,
};
