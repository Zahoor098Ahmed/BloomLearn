import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Food Chains — from the client's "Food Chains — Grade 3 Video-Ready Summaries"
 * (Saudi MOE Unit 2, Cambridge Stage 3 Unit 4, Oxford Book 3, McGraw Hill Chapter 3).
 * 4 Parts, each combining its sentences into an educational summary paragraph lesson.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_FOODCHAINS_PARTS: ChapterPart[] = [
  P("Ecosystems and where living things live", "الأنظمة البيئية ومواطن الكائنات الحية", 0, "Saudi MOE Unit 2, Ch. 3; McGraw Hill Ch. 3 (pond, tree, desert ecosystems)"),
  P("Producers, consumers and decomposers", "المنتجات والمستهلكات والمحللات", 1, "Saudi MOE Unit 2, Ch. 3; Cambridge Stage 3 (plants make food, animals consume, decomposers)"),
  P("Food chains on land and in water", "السلاسل الغذائية في اليابسة والماء", 2, "Cambridge 3Be.01; Saudi Unit 2; McGraw Hill (energy flow from sun to predators)"),
  P("Food webs, predators and prey", "الشبكات الغذائية والافتراس", 3, "Saudi Unit 2; McGraw Hill (connecting food chains, predators and prey survival)"),
];

export const SC3_FOODCHAINS_LESSONS: Lesson[] = [
  {
    id: "sc3-foodchains-001",
    say: "A pond ecosystem has frogs, fish and plants living together with water, soil and sunlight. An old tree trunk is a small ecosystem where beetles, ants and moss live together. A desert is a large ecosystem where camels, lizards and plants share the sand and sun. Puddle ecosystems can be tiny places where small insects skate across the water. The ocean is a huge ecosystem full of fish, whales and seaweed. Living things in an ecosystem depend on each other to survive.",
    question: "What is an ecosystem and what lives inside it?",
    answer: "An ecosystem is a community where living plants and animals interact with non-living water, soil and sunlight",
    draw: "a clear view of a freshwater pond ecosystem: green water lilies, swimming fish, a frog resting on a stone, and soft sunlight filtering through reeds",
    video: "A peaceful nature documentary view of a clear pond ecosystem: a frog on a lily pad, small fish gliding beneath the surface, and dragonflies darting over reeds.",
  },
  {
    id: "sc3-foodchains-002",
    say: "The Sun shines on green grass, giving the grass energy to make its own food. Green plants and seaweed are producers because they make their own food using sunlight. A grasshopper is a consumer that chews green grass to get energy. A rabbit is a herbivore that nibbles crunchy plants in a sunny field. A cat and a hawk are carnivores that hunt other animals for meat. A chicken is an omnivore that pecks at seeds and snaps up small insects. Mushrooms, earthworms and bacteria are decomposers that break down dead leaves and return nutrients to the soil.",
    question: "What are producers, consumers and decomposers?",
    answer: "Plants are producers, animals are consumers, and mushrooms and bacteria are decomposers",
    draw: "a sunny meadow showing a feeding cycle: sunlit green grass (producer), a grazing white rabbit (consumer), and mushrooms growing near rich dark soil (decomposers)",
    video: "Warm sunlight illuminating green field grass, a rabbit grazing peacefully on clover, and fallen leaves breaking down naturally into fertile soil.",
  },
  {
    id: "sc3-foodchains-003",
    say: "Every food chain starts with a green plant, because plants get their energy from the Sun. A caterpillar munches a green leaf, so energy passes from the plant to the caterpillar. A frog sits on a leaf and snaps up a caterpillar. A hawk circles above a pond, hunting for a frog or a snake. An eagle soars high above the grassland, watching for small animals below. In the sea, small fish nibble seaweed growing on rocks in shallow water. A humpback whale swims through a huge shoal of small fish in the open ocean. Each arrow in a food chain points from the food to the animal that eats it.",
    question: "How does energy flow through a food chain?",
    answer: "Energy flows from the Sun to green plants, then to plant-eating consumers, and then to predators",
    draw: "an illustrated four-step nature food chain: bright sun shining on a green leaf, a green caterpillar nibbling the leaf, a small songbird on a branch, and a soaring hawk",
    video: "A smooth animation showing the food chain path: sunlight to a green plant, a caterpillar feeding on a leaf, and a bird observing from a leafy tree branch.",
  },
  {
    id: "sc3-foodchains-004",
    say: "A predator is an animal that hunts other animals for food, like a hawk or a fox. Prey is an animal that is hunted for food, like a mouse scurrying into its burrow. When many food chains link together in an ecosystem, they form a food web. A fox hunts both rabbits and mice, linking two food chains into one web. Mice, rabbits and grasshoppers all eat the same grass. A pond with very few frogs fills with clouds of buzzing insects. A hungry heron flies to another pond when food is scarce. All living things in a food web are connected.",
    question: "What is a food web, and what is the difference between a predator and prey?",
    answer: "A food web is many connected food chains; predators hunt other animals and prey are hunted",
    draw: "a grassland habitat showing interconnected food web members: field mice, rabbits, grasshoppers on grass, and a red fox watching from a grassy knoll",
    video: "A wide cinematic view across a golden savanna meadow showing multiple animals linked in a natural food web under the golden afternoon sky.",
  },
];

export const SC3_FOODCHAINS: Chapter = {
  id: "sc3-foodchains",
  title: {
    en: "Food Chains",
    ar: "السلاسل الغذائية",
  },
  summary: {
    en: "Ecosystems, producers, consumers, decomposers, energy flow and food webs",
    ar: "الأنظمة البيئية والمنتجات والمستهلكات والمحللات وتدفق الطاقة والشبكات الغذائية",
  },
  parts: SC3_FOODCHAINS_PARTS,
  lessons: SC3_FOODCHAINS_LESSONS,
};

