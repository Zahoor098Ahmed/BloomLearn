import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Animal Groups and Adaptations
 * From the client's "Animal Groups and Adaptations: Grade 3 Video-Ready Summaries"
 * (Saudi MOE, Oxford, Cambridge & McGraw Hill curricula).
 * 9 Parts, combining all 83 sentences into 9 cohesive paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_ADAPTATIONS_PARTS: ChapterPart[] = [
  P("Animal life cycles and metamorphosis", "دورات حياة الحيوانات والتحول", 0, "Saudi Animal Life Cycles; Tadpole, chick and beetle metamorphosis"),
  P("Animal adaptations for survival", "تكيف الحيوانات للبقاء", 1, "Saudi Adaptation; Blubber, camouflage, mimicry, hibernation and migration"),
  P("Sorting animals and vertebrates", "تصنيف الحيوانات والفقاريات", 2, "Oxford Module 1; Vertebrates, molluscs, arachnids and mammals"),
  P("How animals move", "كيف تتحرك الحيوانات", 3, "Oxford Module 1; Running, leaping, swimming, slithering and flying"),
  P("Teeth suited to food", "أسنان الحيوانات وغذاؤها", 4, "Oxford Module 6; Sharp canine carnivore teeth and flat molar herbivore teeth"),
  P("Features of six animal groups", "خصائص مجموعات الحيوانات الست", 5, "Cambridge Unit 3; Fish, amphibians, reptiles, birds, mammals and insects"),
  P("Animal group survival and cooperation", "العيش في جماعات والتعاون", 6, "Inspire Animal Group Survival (3-LS2-1); Colonies, schools, packs and herds"),
  P("Survival of organisms in habitats", "بقاء الكائنات الحية في بيئاتها", 7, "Inspire Survival of Organisms (3-LS4-3); Beaks, blubber and colour"),
  P("Adaptations and variations", "التكيف والاختلافات الوراثية", 8, "Inspire Adaptations and Variations (3-LS4-2); Trait variations and camouflage"),
];

export const SC3_ADAPTATIONS_LESSONS: Lesson[] = [
  {
    id: "sc3-adapt-001",
    say: "A newborn camel stands on wobbly legs beside its mother, because mammals give birth to live babies. A baby goat drinks warm milk from its mother, as all mammal babies do. A mother hen sits on her hard-shelled eggs in a straw nest to keep them warm. A fluffy chick pecks its way out of its eggshell inside the nest. A mother sea turtle digs a nest in the beach sand and lays soft, leathery reptile eggs. Baby sea turtles hatch from the sand and crawl together toward the waves. A clownfish lays tiny orange eggs on a rock beside its sea anemone in the Red Sea. A frog lays a clump of jelly-covered eggs in a quiet pond. A tadpole wriggles out of its jelly egg and swims with a long, flat tail. A tadpole grows tiny back legs as it swims among the pond weeds. A young frog with a short tail climbs out of the pond onto a rock. A tadpole changes into a frog, and this big change in body shape is called metamorphosis. A soft white beetle larva wriggles through damp soil under a log. A beetle pupa lies still in the soil while its body changes inside. A shiny adult beetle crawls out of the soil and opens its hard wing covers.",
    question: "What is metamorphosis in animal life cycles?",
    answer: "A big change in body shape as an animal grows, like a tadpole into a frog or a larva into a beetle",
    draw: "a split nature scene of animal life cycles: a mother hen warming eggs in a cosy nest, a tadpole turning into a young frog in a clear pond, and baby sea turtles crawling to ocean waves",
    video: "A peaceful time-lapse showing a green tadpole growing tiny legs in a sunlit pond and transforming into a young frog that hops onto a mossy rock.",
  },
  {
    id: "sc3-adapt-002",
    say: "A camel walks on top of soft sand with wide, padded feet, an adaptation for desert life. A camel's long eyelashes keep blowing sand out of its eyes during a sandstorm. A camel stores fat in its big hump to use when food is hard to find. An Arabian oryx's bright white coat reflects the hot desert sunlight and helps it stay cool. A falcon perches on a rock, showing the sharp, hooked beak it uses to eat meat. A sunbird pushes its long, thin beak deep into a flower to sip sweet nectar. A walrus rests on the ice, kept warm by a thick layer of fat called blubber. A sandy-brown hare crouches low on the desert sand and blends right in, which is called camouflage. A harmless hoverfly has yellow and black stripes like a stinging wasp, which is called mimicry. A hedgehog curls up in a cosy burrow and sleeps through the cold winter, which is called hibernation. A flock of storks flies far across the sky to a warmer land for winter, which is called migration.",
    question: "How do adaptations like camouflage and hibernation help animals survive?",
    answer: "They help animals hide, stay warm, find food and survive seasonal changes",
    draw: "a vivid wildlife montage of animal adaptations: a camel with wide padded feet on desert sand, an Arabian oryx with a reflective white coat, and a walrus warm on ice with thick blubber",
    video: "A majestic Arabian oryx with long slender horns walking gracefully across sunny golden dunes, its bright white coat reflecting the bright desert sunlight.",
  },
  {
    id: "sc3-adapt-003",
    say: "A child sorts a pile of toy animals into groups by their legs, wings and fins. A child follows a key of yes-or-no questions to find out which group a spider belongs to. A spider walks across its web on eight jointed legs, because spiders are arachnids. A snail glides along a wet leaf carrying its spiral shell, because snails are molluscs. A crab scuttles sideways along the beach on jointed legs under a hard shell, because crabs are crustaceans. An X-ray picture shows the long backbone inside a horse, because horses are vertebrates. A whale swims beside her calf and feeds it milk, because whales are mammals. A whale rises to the surface to breathe air into its lungs through the blowhole on its head. A fish swims with shining scales and fluttering fins as water flows over its gills. A penguin with black and white feathers guards its hard-shelled egg on land, because penguins are birds. A furry bat hangs upside down in a cave, hugging her baby, because bats are mammals. A duck-billed platypus curls around its eggs in a riverbank burrow, yet the platypus is a mammal. A lizard basks on a warm rock, showing its dry, scaly skin, because lizards are reptiles.",
    question: "What is the difference between vertebrates and invertebrates?",
    answer: "Vertebrates have a backbone inside their body, while invertebrates do not",
    draw: "a classroom science display with animal classification charts showing vertebrates like horses and penguins beside invertebrates like crabs, snails and spiders",
    video: "A mother whale swimming gently beside her calf in deep blue ocean water, rising gracefully to breathe through her blowhole at the glittering surface.",
  },
  {
    id: "sc3-adapt-004",
    say: "A leopard runs fast across the grassland on four strong legs. A kangaroo jumps high on its powerful back legs. A dolphin swims through the waves by beating its strong tail up and down. A snake slides across the sand by curving its long body from side to side. A butterfly flies from flower to flower, flapping its colourful wings.",
    question: "How do different animals use their body parts to move?",
    answer: "They use strong legs to run and jump, tails to swim, bodies to slither, and wings to fly",
    draw: "a dynamic wildlife panorama showing animal movement: a spotted leopard sprinting, a red kangaroo leaping, a dolphin leaping through blue waves, and a colourful butterfly fluttering",
    video: "A sleek playful dolphin leaping out of turquoise waves under a bright sunny sky, splashing cleanly as it beats its powerful tail fin.",
  },
  {
    id: "sc3-adapt-005",
    say: "A lion yawns wide, showing long, pointed canine teeth made for tearing meat. A cow chews grass with wide, flat molar teeth that grind it into a soft mush.",
    question: "How are carnivore teeth and herbivore teeth suited to their food?",
    answer: "Carnivores have sharp pointed canine teeth for tearing meat, while herbivores have flat molars for grinding grass",
    draw: "a side-by-side zoology illustration comparing animal teeth: a lion with sharp canine teeth for meat beside a gentle cow with flat broad molar teeth chewing green grass",
    video: "A gentle cow in a lush green pasture chewing grass calmly in rhythmic circles with its wide flat molar teeth.",
  },
  {
    id: "sc3-adapt-006",
    say: "A child sorts animal picture cards into six groups: fish, amphibians, reptiles, birds, mammals and insects. A fish swims along a river, steering with the fins on its sides and tail. Shiny, overlapping scales cover the body of a fish like tiny tiles. A fish opens its mouth to take in water, and the water flows out over its gills. A frog sits on a lily pad, its smooth, wet skin glistening in the sun. A frog leaps from the pond onto the grassy bank, because amphibians live in water and on land. A frog lays soft, jelly-covered eggs in the water of a pond. A crocodile rests on a riverbank, its back covered in dry, bumpy scales, because crocodiles are reptiles. A lizard lays a small pile of leathery eggs in a hole in warm soil. A parrot spreads its wings, showing bright feathers that cover its whole body. A sparrow cracks open a seed with its short, strong beak. A bird stands on two scaly legs beside its nest of hard-shelled eggs. A rabbit's thick, soft fur keeps it warm on a frosty morning, because rabbits are mammals. A mother dog feeds milk to her puppies curled up in a basket. A newborn elephant calf stands up beside its mother, because most mammals give birth to live young. A ladybird crawls along a leaf on six small legs, because ladybirds are insects. A giant close-up of an ant shows its body made of three parts joined together. A bee waves the two feelers, called antennae, on top of its head. A dragonfly flies over a pond on two pairs of see-through wings.",
    question: "What are the six main animal groups?",
    answer: "Fish, amphibians, reptiles, birds, mammals and insects",
    draw: "a vibrant educational poster of the six animal groups: a clownfish swimming, a green tree frog, a sunning lizard, a colourful scarlet parrot, a soft rabbit, and a red ladybird on a leaf",
    video: "A beautiful green tree frog sitting calmly on a round lily pad, then leaping gracefully through the air into clear pond water with a gentle ripple.",
  },
  {
    id: "sc3-adapt-007",
    say: "Leafcutter ants march in a long line, carrying pieces of leaf back to their colony. Inside a busy hive, honeybees share the work of making honey and caring for young bees. A school of small silver fish swims close together, turning and flashing as one. A school of fish bunches tightly together as a big fish swims past, keeping each fish safer. A pack of wolves runs across the snow together, hunting as a team. A herd of musk oxen stands in a tight circle, with their calves safe in the middle. A prairie dog stands up on its back legs and gives a loud warning call to its group. Emperor penguins huddle close together in a big group to stay warm in an icy wind.",
    question: "Why do animals like ants, bees, fish, wolves and penguins live and work in groups?",
    answer: "Living in groups helps them find food, defend against predators, care for young and stay warm",
    draw: "a dramatic nature montage of animals cooperating in groups: honeybees working inside a golden honeycomb, a school of silver fish swimming together, and penguins huddling in snow",
    video: "A large shimmering school of small silver fish swimming in unison through sunlit ocean water, suddenly swirling together into a tight flashing ball for protection.",
  },
  {
    id: "sc3-adapt-008",
    say: "A polar bear walks easily across the Arctic ice, a habitat where it survives well. A frog stays close to its damp pond, because frogs survive best where there is water. A flamingo dips its curved beak upside down in the water to sift out tiny bits of food. A finch cracks a hard seed with its short, thick beak. A seal glides through icy water, kept warm by a thick layer of fat under its skin. A black beetle warms up quickly on a sunny rock, because dark colours soak up heat.",
    question: "How do body coverings, fat and specialised beaks help organisms survive in their habitats?",
    answer: "They help animals feed, stay warm in cold water or ice, and absorb heat from the sun",
    draw: "a habitat survival scene showing specialized animal features: a white polar bear walking on Arctic ice, pink flamingos sifting water with curved beaks, and a seal swimming smoothly",
    video: "A fluffy white polar bear walking steadily across thick blue-white sea ice, pausing to look around with frosty breath in crisp Arctic sunshine.",
  },
  {
    id: "sc3-adapt-009",
    say: "Giraffes in a herd have necks of different lengths, a variation that lets the tallest reach the highest leaves. A brown rabbit is hard to spot on brown soil, while a white rabbit stands out clearly. On fresh white snow, a white rabbit's camouflage hides it, while a brown rabbit stands out. Finches on the Galápagos Islands have beaks of many shapes, each suited to a different food.",
    question: "What is trait variation, and how does camouflage help animals survive in different seasons?",
    answer: "Variations like neck length or beak shape suit different foods, and camouflage matches an animal's coat to soil or snow",
    draw: "a savanna and woodland scene illustrating animal variation: giraffes of different heights reaching acacia trees, and brown and white rabbits on soil and snow demonstrating seasonal camouflage",
    video: "A herd of elegant giraffes browsing on tall acacia treetops on the savanna, with the tallest giraffe reaching the highest tender green leaves.",
  },
];

export const SC3_ADAPTATIONS: Chapter = {
  id: "sc3-adaptations",
  title: {
    en: "Animal Groups and Adaptations",
    ar: "مجموعات الحيوانات والتكيف",
  },
  summary: {
    en: "Life cycles, animal classifications, group survival, camouflage and adaptations",
    ar: "دورات الحياة وتصنيف الحيوانات والعيش في جماعات والتمويه والتكيف",
  },
  parts: SC3_ADAPTATIONS_PARTS,
  lessons: SC3_ADAPTATIONS_LESSONS,
};
