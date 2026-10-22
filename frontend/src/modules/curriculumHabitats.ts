import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Habitats and Environments — from the client's "Habitats and Environments — Grade 3 Video-Ready Summaries"
 * (Ecosystems, adaptations, living things changing environments, changes affecting living things).
 * 4 Parts, each combining its sentences into an educational summary paragraph lesson.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_HABITATS_PARTS: ChapterPart[] = [
  P("Desert and water ecosystems", "النظام البيئي في الصحراء والماء", 0, "Saudi MOE Unit 2, Ch. 3 Lesson 1 (ecosystems, producers, consumers, decomposers)"),
  P("How animals adapt to their habitats", "تكيف الكائنات الحية في بيئاتها", 1, "Saudi MOE Unit 2, Ch. 3 Lesson 2 (camouflage, desert adaptations, migration, hibernation)"),
  P("Living things change their environments", "المخلوقات الحية تغير بيئاتها", 2, "Saudi MOE Unit 2, Ch. 4 Lesson 1 (beaver dams, earthworms, human impact, recycling)"),
  P("Changes that affect living things", "تغيرات تؤثر في المخلوقات الحية", 3, "Saudi MOE Unit 2, Ch. 4 Lesson 2 (drought, floods, fires, endangered species, fossils)"),
];

export const SC3_HABITATS_LESSONS: Lesson[] = [
  {
    id: "sc3-habitats-001",
    say: "A desert ecosystem has living things, like camels and trees, and non-living things, like sand and rocks. A green acacia tree is a producer because it uses sunlight to make its own food. A camel is a consumer because it eats the leaves of an acacia tree. A sand gazelle is a herbivore that eats only plants, like desert grass. A falcon is a carnivore that soars over the desert, looking for animals to eat. A family eats rice, vegetables and chicken, showing that people are omnivores who eat plants and animals. A tall heron wades through a pond, hunting for frogs and fish to eat. Mushrooms and tiny bacteria are decomposers that break fallen leaves down into soil.",
    question: "What makes up an ecosystem and what are producers and consumers?",
    answer: "Living and non-living things; plants are producers and animals are consumers",
    draw: "a rich desert ecosystem showing a leafy green acacia tree, a grazing sand gazelle, a graceful camel, and a soaring falcon under open blue skies",
    video: "A panoramic camera movement across a vibrant desert oasis: an acacia tree basking in sunlight, gazelles grazing on desert grass, and a falcon gliding high above.",
  },
  {
    id: "sc3-habitats-002",
    say: "A camel's hump stores fat, an adaptation that helps the camel cross the desert for days. A camel's long eyelashes and closing nostrils keep out blowing sand in a sandstorm. A desert hare's long ears help it hear danger and let extra heat escape. An acacia tree sends long roots deep under the sand to reach water. A sand-colored lizard lies still on the sand, using camouflage to hide from birds. A fish takes in oxygen from the water through its gills. A water lily's wide, flat leaves float on a pond to catch the sunlight. Storks migrate, flying in large flocks to warmer lands before winter. A hedgehog hibernates, sleeping curled up in a nest of leaves all winter.",
    question: "What is an adaptation and how does it help living things?",
    answer: "An adaptation is a body part or behavior that helps plants and animals survive in their habitat",
    draw: "a collection of adapted desert animals: a camel with long eyelashes, a desert hare with large ears, and a camouflaged sand lizard blending with golden dunes",
    video: "A close-up of a camel closing its nostrils during a desert breeze, followed by a sand-coloured lizard blending seamlessly into the warm desert sand.",
  },
  {
    id: "sc3-habitats-003",
    say: "A beaver builds a dam of sticks that turns a flowing stream into a pond. Earthworms dig tunnels that let air and water reach plant roots in the soil. Tree roots grow into the cracks of a rock and slowly split the rock apart. People cut down trees to build a road, and birds fly off to find new homes. Smoke from factories and cars pollutes the air that people and animals breathe. Two goats push and compete for the last patch of green grass on a dry hill. Children sort paper, plastic and cans into recycling bins to protect the environment. Volunteers plant young trees that will clean the air and shelter birds.",
    question: "How do animals and people change their environments?",
    answer: "Beavers build dams, earthworms loosen soil, and people can pollute or protect nature",
    draw: "a community park showing environmental care: children sorting items into coloured recycling bins and volunteers planting young saplings in rich brown soil",
    video: "Children placing paper and clean plastic into recycling bins, while volunteer gardeners carefully water newly planted saplings to green their local community.",
  },
  {
    id: "sc3-habitats-004",
    say: "During a long drought, a riverbed dries up and its mud cracks in the hot sun. A herd of gazelles walks far across dry land to find water during a drought. Heavy rain floods a wadi, and muddy water rushes over the nearby fields. A forest fire burns the trees on a mountain, and birds fly away to safety. Small green shoots push up through the black ground a few months after a fire. Too many sheep graze one field until only bare, dusty ground is left. Wind blows sand over old farmland, slowly turning green fields into desert. An endangered Arabian leopard rests on a rocky mountain ledge, one of only a few left. A dinosaur skeleton stands in a museum, because dinosaurs died out and are extinct.",
    question: "What happens when habitats face droughts, floods, or fires?",
    answer: "Animals move to find water, some become endangered or extinct, and new plants sprout after fires",
    draw: "a dramatic natural landscape showing seasonal changes: a rocky mountain ledge with an Arabian leopard, and small green shoots sprouting on recovering land",
    video: "A herd of gazelles journeying towards a freshwater pool in a rocky valley, followed by time-lapse of resilient green shoots pushing through dry earth.",
  },
];

export const SC3_HABITATS: Chapter = {
  id: "sc3-habitats",
  title: {
    en: "Habitats and Environments",
    ar: "البيئات والمواطن",
  },
  summary: {
    en: "Ecosystems, animal adaptations, environmental changes, protection and endangered species",
    ar: "الأنظمة البيئية وتكيف الكائنات الحية وتغيرات البيئة وحمايتها",
  },
  parts: SC3_HABITATS_PARTS,
  lessons: SC3_HABITATS_LESSONS,
};

