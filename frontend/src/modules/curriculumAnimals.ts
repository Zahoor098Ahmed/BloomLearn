import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Animals — from the client's "Grade 3 Animals: Video-Ready Lesson Script"
 * (14 parts covering Saudi MOE, McGraw Hill, Cambridge, Oxford and English NC).
 * 14 Parts, each combining its sentences into an educational summary paragraph lesson.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_ANIMALS_PARTS: ChapterPart[] = [
  P("Animals are alive", "الحيوانات كائنات حية", 0, "Saudi Living things; Cambridge 3Bp.01–02; Oxford Module 1; English NC Year 3"),
  P("Animal bodies: coverings, parts and movement", "أجسام الحيوانات وأغطيتها وحركتها", 1, "A Closer Look Animals and their parts; Oxford Module 1; Cambridge 3Bs.02"),
  P("Skeletons and muscles", "الهياكل العظمية والعضلات", 2, "English NC Year 3; Oxford Book 4; Cambridge 3Bs.02"),
  P("Animal groups", "مجموعات الحيوانات", 3, "Cambridge 3Bs.02; A Closer Look; Oxford Module 1 (vertebrates and invertebrates)"),
  P("Using a key to name an animal", "استخدام مفاتيح التصنيف لتسمية الحيوان", 4, "Oxford Module 1 (classification keys); English NC Year 4"),
  P("Insects change as they grow", "تحول الحشرات ودورة حياتها", 5, "Saudi Animal life cycles; Cambridge 3Bp.04; Metamorphosis"),
  P("Frogs, fish, reptiles and birds grow up", "نمو البرمائيات والأسماك والزواحف والطيور", 6, "Saudi Animal life cycles; Cambridge 3Bp.04; English NC Year 5"),
  P("Mammals and humans grow up", "نمو الثدييات والإنسان", 7, "Saudi Animal life cycles; Cambridge 3Bp.04; Oxford Module 1"),
  P("Young animals look like their parents", "صغار الحيوانات تشبه آباءها", 8, "Inspire Animal traits and variations; A Closer Look From parents to young"),
  P("What animals eat: food chains, predators and prey", "غذاء الحيوانات: السلاسل الغذائية والافتراس", 9, "Saudi Food chains and food webs; Cambridge 3Be.01; English NC Year 4"),
  P("Living in groups", "العيش في جماعات", 10, "Inspire Animal group survival (3-LS2-1); Herd and pack cooperation"),
  P("Adaptation and camouflage", "التكيف والتمويه", 11, "Saudi Adaptation; Inspire Survival of organisms; Camouflage"),
  P("Humans are animals too", "الإنسان كائن حي", 12, "Cambridge 3Bs.03 (organs); Oxford Modules 5 & 6; Senses, teeth and nutrition"),
  P("Animals in a changing world", "الحيوانات في بيئة متغيرة", 13, "Saudi Changes in environments; Fossils, conservation and endangered species"),
];

export const SC3_ANIMALS_LESSONS: Lesson[] = [
  {
    id: "sc3-animals-001",
    say: "An animal is a living thing. A baby chick grows bigger every week into a young hen. Animals need food, water and air to stay alive. Animals cannot make their own food, so animals must find and eat food. Animals need shelter to stay safe from heat, cold and danger. Animals move to find food, water and safety. Animals make young of their own kind. Animals use their senses to notice changes around them. A seashell on the beach was once part of a living sea animal.",
    question: "What do animals need to stay alive, and can they make their own food?",
    answer: "Animals need food, water, air and shelter; they cannot make their own food and must find it",
    draw: "a peaceful desert oasis showing animals living naturally: a camel drinking from clear water, a hen with a fluffy chick, and a desert hare in cool burrow shelter",
    video: "A majestic camel walking across golden sand dunes in the morning light, stopping by a fresh water trough to drink peacefully.",
  },
  {
    id: "sc3-animals-002",
    say: "Animals have body parts that help them live in their habitats. Thick fur keeps a camel warm on cold desert nights. Feathers cover a falcon's body and help it fly smoothly. Dry scales cover the skin of a spiny-tailed lizard. A hamour grouper has scales and fins for swimming in the sea. A frog has smooth, moist skin. A crab has a hard outer shell that protects its soft body. Birds flap their wings to fly into the sky. Fish swish their tails and fins to swim through blue water. A horned viper moves by sliding sideways across the sand. A jerboa hops on its long back legs across the dunes. A falcon has a sharp, hooked beak for tearing meat.",
    question: "What are some different body coverings animals have?",
    answer: "Animals have fur, feathers, dry scales, moist skin, or hard protective shells",
    draw: "a multi-panel animal study showing diverse body coverings: thick camel fur, colourful falcon feathers, shiny fish scales, and a sturdy crab shell",
    video: "A close-up of a falcon spreading its strong feathered wings in the desert sun, followed by a grouper swimming gracefully using its fins.",
  },
  {
    id: "sc3-animals-003",
    say: "Humans and many animals have a skeleton of bones inside their bodies. A skeleton holds the body up and gives the body its shape. The skull is a hard case of bone that protects the brain. The ribs protect the heart and lungs. Muscles pull on bones to make the body move. Arm muscles work in pairs: one muscle bends the arm and another straightens the arm. A camel's long leg bones help the camel take long steps. Insects and crabs have a hard skeleton on the outside of their bodies called an exoskeleton. An earthworm has no bones at all and stretches through the soil.",
    question: "What does an internal skeleton do and what protects the brain?",
    answer: "The skeleton supports the body and helps it move; the hard skull protects the brain",
    draw: "an anatomical visual showing the bones inside a human body and a walking camel, highlighting the skull, ribs, and leg bones",
    video: "An X-ray style animation showing bone movement inside a walking child, and an arm muscle contracting to pull the forearm upward.",
  },
  {
    id: "sc3-animals-004",
    say: "Scientists sort animals into groups by looking at their bodies. Vertebrates are animals with a backbone inside their body. Invertebrates are animals without a backbone. Fish live in water, breathe with gills and have scales and fins. Amphibians have moist skin, and most start life in water before living on land. Reptiles have dry, scaly skin, and most reptiles lay eggs on land. Birds have feathers, wings and a beak, and all birds lay eggs. Mammals have hair or fur and feed their babies milk. Insects have six legs and three body parts. Spiders and scorpions have eight legs, so they are not insects. Humans and bats are mammals, a whale shark is a fish, and a sea turtle is a reptile.",
    question: "What is the difference between a vertebrate and an invertebrate?",
    answer: "Vertebrates have a backbone inside their body, while invertebrates do not have a backbone",
    draw: "an animal kingdom classification chart showing a fish, a green frog, a spiny-tailed lizard, a falcon, and a mother camel with her calf",
    video: "A scientist sorting animal picture cards into groups: mammals, birds, reptiles, amphibians, fish, and invertebrates like insects.",
  },
  {
    id: "sc3-animals-005",
    say: "A key asks yes-or-no questions to help name an animal. The first key question asks: does the animal have a backbone? The next key question asks: does the animal have feathers? An animal with a backbone and feathers is a bird. A key ends when only one animal is left on the branch. Children can use a classification key to name the animals they find in a school garden.",
    question: "How does a classification key help scientists name an animal?",
    answer: "A key asks a series of yes-or-no questions about body features until one animal remains",
    draw: "a school science garden with children using clipboards and an illustrated branching classification chart to identify birds, lizards, and insects",
    video: "A branching chart lighting up step-by-step: 'Does it have a backbone? Yes' -> 'Does it have feathers? Yes' -> leading to a falcon.",
  },
  {
    id: "sc3-animals-006",
    say: "A butterfly starts life as a tiny egg on a leaf. A caterpillar hatches from a butterfly egg as the larva stage. A caterpillar eats green leaves and grows very fast, shedding its tight skin. A full-grown caterpillar becomes a pupa inside a hard case called a chrysalis. Inside a chrysalis, the caterpillar's body changes into a butterfly. A butterfly comes out of the chrysalis and dries its colourful wings. An adult butterfly lays eggs, and the life cycle starts again. A big change in body shape as an animal grows is called metamorphosis. A beetle also grows through egg, larva, pupa and adult, while a locust hatches as a hopper.",
    question: "What are the four stages of butterfly metamorphosis?",
    answer: "Egg, larva (caterpillar), pupa (chrysalis), and adult butterfly",
    draw: "a four-stage botanical life cycle circular diagram showing a tiny egg on a leaf, a munching caterpillar, a jade-green chrysalis, and an emerging swallowtail butterfly",
    video: "A magical time-lapse of a caterpillar forming a green chrysalis, followed by a beautiful butterfly unfolding its new wings in the sunlight.",
  },
  {
    id: "sc3-animals-007",
    say: "A frog lays a cluster of eggs called frogspawn in water. A tadpole hatches from a frog egg, lives in water and breathes with gills. A tadpole grows back legs first, then front legs. A froglet has four legs and a short tail before becoming an adult frog with lungs. A hamour grouper lays many tiny eggs in the sea that hatch into baby fish. A green sea turtle crawls onto a beach at night to lay round eggs in the sand. Baby sea turtles hatch and crawl to the sea. A young lizard hatches looking like a small adult lizard. A falcon sits on its eggs in a cliff nest until fluffy chicks hatch covered in down.",
    question: "How do frogs and sea turtles begin their lives?",
    answer: "Frogs begin as eggs that hatch into swimming tadpoles, and sea turtles hatch from eggs buried in sand",
    draw: "a freshwater pond bank showing frog life cycle stages: jelly-like frogspawn, a swimming tadpole with back legs, a froglet, and a mature green frog on a lily pad",
    video: "A close-up of tiny tadpoles wriggling out of jelly eggs in fresh water, followed by a baby sea turtle crawling toward moonlit ocean waves.",
  },
  {
    id: "sc3-animals-008",
    say: "Most mammal babies grow inside their mother's body before they are born. A camel calf can stand and walk soon after the calf is born. A camel calf drinks its mother's milk and grows into an adult camel over several years. An adult camel can have a calf of its own, and the life cycle starts again. A human life cycle goes baby, child, teenager, adult. A human baby drinks milk and needs adults to care for the baby. Children grow taller and learn new skills every year. A newborn kitten's eyes stay closed for about one week. All animals are born or hatch, grow, can have young, and in the end die.",
    question: "How do mammal babies start life, and what is the human life cycle?",
    answer: "Mammal babies are born alive and drink milk; the human cycle goes baby, child, teenager, adult",
    draw: "a life cycle montage: a mother camel nuzzling her newborn wobbly calf on desert sand, and a photographic family timeline from baby to adult",
    video: "A newborn camel calf standing up on its long legs beside its mother and drinking milk in a gentle desert morning scene.",
  },
  {
    id: "sc3-animals-009",
    say: "Young animals look like their parents. A trait is a feature an animal gets from its parents, like fur colour or ear shape. Kittens from the same mother can have different fur colours and patterns. Small differences between animals of the same kind are called variation. A faster gazelle has a better chance of escaping a hungry wolf. A lizard whose colour matches the sand is harder for a falcon to spot. Flamingos turn pink from the food they eat.",
    question: "What is an inherited trait and what is variation?",
    answer: "A trait is a feature passed from parents, and variation means small differences between animals of the same kind",
    draw: "a mother Najdi sheep with two playful lambs showing slight variations in face markings and wool texture, standing in green pasture",
    video: "A mother camel and her young calf walking together side by side, clearly showing matching fur colour, hump shape, and long legs.",
  },
  {
    id: "sc3-animals-010",
    say: "Animals that eat only plants are called herbivores, like camels and gazelles. Animals that eat only other animals are called carnivores, like falcons and lions. Animals that eat both plants and animals are called omnivores, like houbara bustards and people. Plants are producers because plants make their own food from sunlight. Animals are consumers because animals must eat other living things. A food chain shows what eats what, starting with a plant. A predator is an animal that hunts other animals for food, and prey is the animal hunted. Decomposers break down dead plants and animals and return nutrients to the soil.",
    question: "What are herbivores, carnivores, and omnivores?",
    answer: "Herbivores eat only plants, carnivores eat only other animals, and omnivores eat both",
    draw: "a comparison of animal eaters: a grazing desert gazelle (herbivore), a soaring hunting falcon (carnivore), and an omnivorous houbara bustard pecking at seeds and beetles",
    video: "An Arabian sand gazelle grazing quietly on desert grasses, contrasting with a falcon watching keenly from high atop a rocky desert outcrop.",
  },
  {
    id: "sc3-animals-011",
    say: "Some animals live in groups to stay safe and find food. In a herd of Arabian oryx, many eyes watch together for danger. Honeybees live together in a colony and share the hive work. A honeybee dances to tell other bees where to find sweet flowers. Small fish swim close together in a shimmering school to confuse predators. Hamadryas baboons live in large troops in the mountains of western Saudi Arabia. Baboons in a troop groom each other and warn each other of danger. Wolves in a pack work together to hunt across the desert.",
    question: "Why do some animals live in herds, troops or schools?",
    answer: "Living in groups helps animals stay safe from predators and find food more easily",
    draw: "a majestic herd of white Arabian oryx grazing together on the open desert plain, with several alert lookouts watching the horizon",
    video: "A shimmering silver school of fish moving harmoniously as one body in blue ocean water, turning instantly to evade a passing predator.",
  },
  {
    id: "sc3-animals-012",
    say: "An adaptation is a body part or behaviour that helps an animal survive where it lives. A camel's wide, padded feet stop the camel sinking into soft sand. Long eyelashes and closing nostrils keep blowing sand out of a camel's eyes and nose. A camel's hump stores fat to provide energy for long journeys. A sand fox has big ears that let heat escape from its body. Many desert animals rest in cool burrows by day and come out at night. Camouflage is a colour or pattern that helps an animal hide. A horned viper buries itself in sand so only its horns and eyes peek out. Cuttlefish in the Red Sea change colour to match rocks. Storks migrate to warmer lands before winter.",
    question: "What are some desert adaptations of the camel and sand fox?",
    answer: "Camels have wide feet, closing nostrils and humps; sand foxes have large ears to release heat",
    draw: "a detailed desert adaptation illustration: a camel with wide padded feet on sand, a sand fox with big ears, and a camouflaged desert horned viper",
    video: "Close-up of a camel's wide foot stepping firmly onto soft desert sand without sinking, showing its remarkable natural adaptation.",
  },
  {
    id: "sc3-animals-013",
    say: "The brain controls everything the body does by sending soft signals to arms and legs. The heart pumps blood all around the body day and night. The lungs take in air and oxygen when a person breathes in. The stomach and intestines break down swallowed food and pass nutrients into the blood. Humans have five senses: sight, hearing, smell, taste and touch. Front incisors cut food, canines tear food, and molars chew food. Brushing teeth twice a day keeps teeth healthy. A balanced diet of rice, chicken, vegetables, fruit, dates and laban gives energy. Exercise makes the heart beat faster and keeps the body strong.",
    question: "How do human body organs and senses work together?",
    answer: "The brain directs the body, the heart pumps blood, lungs bring oxygen, and senses provide information",
    draw: "a clear diagram showing a child's body outline with glowing brain, heart, lungs, and stomach, surrounded by five senses icons",
    video: "An animated medical cutaway view of a child's chest showing the heart beating rhythmically and lungs expanding during normal breathing.",
  },
  {
    id: "sc3-animals-014",
    say: "Earthworms dig tunnels that loosen and mix the soil, and beavers cut down trees to build dams across rivers. People change the land when they build roads, farms and cities. A long drought dries up wadi pools that animals need. When a habitat changes, some animals move to a new place to survive. Floating plastic bags in the sea harm sea turtles. An animal is endangered when very few of its kind are left, like the Arabian leopard. An animal is extinct when none of its kind are left anywhere, like dinosaurs. Nature reserves give wild animals like the Arabian oryx a safe place to live and graze. Fossils are the remains or prints of ancient animals preserved in rock. Children can help animals by keeping beaches clean and planting trees.",
    question: "What is the difference between an endangered animal and an extinct animal?",
    answer: "Endangered animals have very few left, while extinct animals like dinosaurs have none left anywhere",
    draw: "a nature reserve panorama with Arabian oryx grazing safely, and a scientist discovering an ancient shell fossil embedded in desert rock",
    video: "A peaceful view of protected Arabian oryx running freely in a protected nature reserve, showing successful conservation efforts.",
  },
];

export const SC3_ANIMALS: Chapter = {
  id: "sc3-animals",
  title: {
    en: "Animals",
    ar: "الحيوانات",
  },
  summary: {
    en: "Animal life, body coverings, skeletons, groups, life cycles, adaptations and conservation",
    ar: "حياة الحيوانات وأغطية أجسامها وهياكلها ومجموعاتها ودورات حياتها وتكيفها وحمايتها",
  },
  parts: SC3_ANIMALS_PARTS,
  lessons: SC3_ANIMALS_LESSONS,
};

