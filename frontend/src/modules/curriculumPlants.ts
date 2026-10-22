import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Plants
 * 11 Parts, each with an educational summary paragraph combining the script's sentences.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_PLANTS_PARTS: ChapterPart[] = [
  P("Plants are alive", "النباتات كائنات حية", 0, "Saudi Living things and their needs; Cambridge 3Bp.01–02; Oxford Module 1"),
  P("The parts of a plant", "أجزاء النبات", 1, "Saudi Plants and their parts; Cambridge 3Bs.01; Oxford Module 3; English NC Year 3"),
  P("Leaves make food", "الأوراق تصنع الغذاء", 2, "Saudi Plants and their parts (photosynthesis); Cambridge 3Bs.01; Oxford Module 3"),
  P("Water travels through a plant", "الماء ينتقل داخل النبات", 3, "English NC Year 3 (water moving in plants); Oxford Module 3; Cambridge 3Bs.01"),
  P("What plants need", "ما تحتاجه النباتات", 4, "Saudi Plants and their parts; Cambridge 3Bp.03; Oxford Module 3; English NC Year 3"),
  P("From seed to seedling", "من البذرة إلى البادرة", 5, "Saudi Plant life cycles; Cambridge 3Bs.01; Oxford Module 3"),
  P("Flowers, pollination, fruits and seeds", "الأزهار والتلقيح والثمار والبذور", 6, "Saudi Plant life cycles; English NC Year 3; Cambridge 3Bs.01"),
  P("How seeds travel", "كيف تنتقل البذور", 7, "English NC Year 3 (seed dispersal); Saudi Plant life cycles"),
  P("The whole plant life cycle", "دورة حياة النبات كاملة", 8, "Saudi Plant life cycles (the peach tree); English NC Year 3"),
  P("Young plants look like their parents", "النباتات الصغيرة تشبه آباءها", 9, "Inspire Plant traits; A Closer Look From parents to young"),
  P("Plants built for where they live", "نباتات تناسب أماكن عيشها", 10, "Saudi Unit 2 adaptation; Inspire Survival of organisms"),
];

export const SC3_PLANTS_LESSONS: Lesson[] = [
  {
    id: "sc3-plants-001",
    say: "A plant is a living thing. A bean plant grows taller every day. A plant needs water and air to stay alive. A plant makes its own food, but a camel must find and eat its food. A date palm makes seeds, and a camel has a calf. A young sunflower turns to follow the sun across the sky. A leaf is made of tiny cells that you can see with a microscope. A wooden chair was once part of a living tree. A rock was never alive.",
    question: "Is a plant a living thing, and what does it need to stay alive?",
    answer: "A plant is a living thing that needs water and air to stay alive",
    draw: "a vibrant green bean plant growing tall in a flowerpot on a sunny windowsill, with a golden sunflower turning towards the sun in the background",
    video: "A green bean plant in a pot on a sunny windowsill, its leaves moving gently in a soft breeze as a sunflower turns towards the sun.",
  },
  {
    id: "sc3-plants-002",
    say: "Most plants have roots, stems and leaves. Plant roots grow down into the dark soil. Roots hold the plant firmly in the ground so wind cannot blow it over. Roots take in water and minerals from the soil. Plant roots are covered in tiny root hairs that drink up water. The stem holds the plant upright towards the sunlight. Water travels up inside the stem to the leaves. Green leaves catch sunlight to make food for the plant. Flowers make pollen and seeds so new plants can grow. Some plants make delicious fruits that hold seeds inside. Many plants lose their leaves in winter and grow new leaves in spring.",
    question: "What are the main parts of a plant?",
    answer: "Roots, stems, leaves, flowers and fruits",
    draw: "a complete botanical cross-section of a healthy flowering plant showing roots spreading in soil, strong green stem, open leaves, and colourful bloom",
    video: "An animated botanical tour of a flourishing plant: roots absorbing moisture from soil, water climbing the stem, and broad green leaves catching sunlight.",
  },
  {
    id: "sc3-plants-003",
    say: "Green leaves are the food factories of a plant. Chlorophyll is the green colour in leaves that catches sunlight. Leaves take in carbon dioxide gas from the air through tiny holes called stomata. Using sunlight, water and carbon dioxide, leaves make sugar. Making food using sunlight is called photosynthesis. Photosynthesis gives off clean oxygen gas into the air. People and animals breathe the oxygen that plants make. Extra sugar is stored in roots, stems, seeds and fruits for later.",
    question: "What is the process of making food using sunlight called?",
    answer: "Photosynthesis",
    draw: "a broad vibrant green leaf bathed in golden morning sunlight showing intricate leaf veins and tiny stomata releasing fresh oxygen bubbles",
    video: "A close-up of a sunlit green leaf: sunlight sparkles on the surface, carbon dioxide enters tiny stomata pores, and oxygen drifts into the fresh air.",
  },
  {
    id: "sc3-plants-004",
    say: "Water in the soil enters the roots. Long thin tubes called xylem carry water up through the stem. Water travels from the stem into the veins of each leaf. A celery stalk placed in red water turns red all the way to its leaves. Some water evaporates from leaves into the air through stomata. Water evaporating from leaves pulls more water up from the roots, like drinking through a straw.",
    question: "What carries water up through the stem to the leaves?",
    answer: "Long thin tubes called xylem",
    draw: "a transparent cross-section of a plant stem showing clear blue water travelling upward through tubes into leaf veins like a natural straw",
    video: "A celery stalk in red-coloured water showing red liquid rising through microscopic stem tubes all the way into green leaf veins.",
  },
  {
    id: "sc3-plants-005",
    say: "Plants need light, water, air, warmth and room to grow. A plant kept in a dark cupboard turns yellow and weak. A plant left without water wilts and droops. A watered plant stands up straight and proud again. Desert plants need very little water to survive. Plants need warmth to grow well, which is why more plants grow in spring than in winter. Seeds will not sprout if the soil is too cold. Plants need minerals from the soil to grow strong and healthy. Fertilisers give plants extra minerals when the soil is poor. Plants need space so their leaves can reach the light. When plants grow too close together, they fight for light and water. Weeding a garden gives vegetables more room, water and light. Gardeners prune dead branches so healthy branches can grow better. Healthy soil has earthworms that loosen the soil and help roots breathe. Compost made of old leaves and fruit peels makes garden soil rich.",
    question: "What five things do plants need to grow healthy and strong?",
    answer: "Light, water, air, warmth and room to grow",
    draw: "a thriving garden bed bathed in warm sunlight with well-watered plants, dark rich compost soil with earthworms, and ample space between leafy stems",
    video: "A flourishing vegetable garden: healthy green plants receiving gentle watering under warm sunlight in nutrient-rich compost soil.",
  },
  {
    id: "sc3-plants-006",
    say: "A seed has a hard outer coat that protects it. Inside every seed is a tiny baby plant waiting to grow. A seed also holds stored food to feed the baby plant before it has leaves. When a seed gets water and warmth, it swells and its coat cracks open. Sprouting into a new plant is called germination. The root always grows downward first, searching for water. The shoot grows upward, pushing through the soil towards the light. Once the shoot reaches the sunlight, tiny green seed leaves unfold. As soon as green leaves open, the young plant starts making its own food. A very young plant with its first leaves is called a seedling. Seeds do not need light to sprout under the soil, but they do need water and warmth. Bean seeds wrapped in moist cotton wool will sprout in a warm room.",
    question: "What is it called when a seed sprouts into a new plant?",
    answer: "Germination",
    draw: "a cutaway sequence of a bean seed sprouting: the hard coat cracking, white root anchoring downward, and a green shoot rising up towards the sun",
    video: "Time-lapse of a bean seed germinating: moisture cracks the outer coat, a root burrows downward, and a green shoot pushes upward into the light.",
  },
  {
    id: "sc3-plants-007",
    say: "Flowers are the parts of a plant that make seeds. Colourful petals and sweet nectar attract bees, butterflies and birds. Pollen is a yellow powder made inside the flower. Bees carry yellow pollen from one flower to another flower. Moving pollen from flower to flower is called pollination. Wind also blows pollen between grass and tree flowers. Date palms in Saudi Arabia are often pollinated by hand by farmers. After pollination, the flower's petals dry up and fall off. The base of the flower swells into a fruit that holds the new seeds. An apple is a fruit that protects brown apple seeds inside its core. A date is a sweet fruit that protects a single hard date seed inside. A tomato is a fruit because it has seeds inside. Watermelons and pumpkins are giant fruits packed with seeds.",
    question: "What is pollination?",
    answer: "Moving pollen from one flower to another flower",
    draw: "a bright yellow sunflower with a honeybee covered in golden pollen hovering above, and ripe red apples on a branch nearby",
    video: "A honeybee covered in powdery yellow pollen sipping sweet nectar from a flower, then buzzing towards another blossom to pollinate it.",
  },
  {
    id: "sc3-plants-008",
    say: "Plants spread their seeds far away so the new plants have room to grow. Spreading seeds far from the parent plant is called seed dispersal. Fluffy dandelion seeds fly on the wind like tiny parachutes. Maple seeds spin through the air like tiny helicopter wings. Animals eat sweet fruits and drop the seeds far away in their waste. Burdock seeds have tiny hooks that stick to animal fur and clothes. Coconut seeds float across the ocean to sprout on distant sandy shores.",
    question: "How do dandelion seeds travel through the air?",
    answer: "They fly on the wind like tiny parachutes",
    draw: "a fluffy white dandelion head with parachute-like seeds blowing away in a gentle breeze across a grassy meadow",
    video: "A child blowing a round dandelion clock: dozens of fluffy white parachute seeds drift gracefully away across a sunny green meadow.",
  },
  {
    id: "sc3-plants-009",
    say: "A life cycle shows how a living thing starts, grows, reproduces and dies. A peach tree begins as a hard peach seed in the ground. The peach seed sprouts roots and a shoot to become a seedling. Over years, the seedling grows into a tall woody tree. In spring, the peach tree blooms with pink flowers. Bees pollinate the pink peach flowers. The pollinated flowers grow into sweet juicy peaches with hard seeds inside. When peaches fall, their seeds can sprout into new peach trees. The plant life cycle starts all over again with the new seed. Annual plants, like sunflowers, complete their whole life cycle in one year. Perennial plants, like date palms and olive trees, live for many years.",
    question: "What does a life cycle show?",
    answer: "How a living thing starts, grows, reproduces and dies",
    draw: "a circular life cycle diagram of a fruit tree: seed in soil, small green sprout, blossoming tree with pink flowers, and ripe juicy fruit with seeds",
    video: "A graceful animation of a peach tree life cycle: from a sprouting seed to a flowering tree in spring, ripening sweet peaches, and falling seeds.",
  },
  {
    id: "sc3-plants-010",
    say: "A date palm seed always grows into a date palm tree, never into a rose bush. A seedling inherits traits, like leaf shape and flower colour, from its parents. Sunflowers from the same parent can have slightly different heights. A plant with more light and water grows bigger than its sister plant in poor soil. Both inherited traits and the environment shape how a plant grows. Farmers choose seeds from the sweetest date palms to plant new crops.",
    question: "What determines how a plant grows?",
    answer: "Both inherited traits and the environment",
    draw: "a row of young date palm seedlings growing beside tall mature parent date palms in an oasis showing identical frond shapes",
    video: "A comparison of young date palm seedlings growing next to towering mature date palms in an oasis, inheriting their characteristic long fronds.",
  },
  {
    id: "sc3-plants-011",
    say: "Different plants are adapted to different habitats. A samr tree's long roots reach water deep under the desert sand. A samr tree has tiny leaves that lose very little water. Sharp thorns help protect a samr tree from hungry animals. A prickly pear cactus stores water in its thick, flat stems. Mangrove trees grow in salty seawater along the Red Sea coast. Mangrove roots poke up out of the mud to take in air. A rice plant would dry up and die in the desert. Each kind of plant grows best in the kind of place it is suited to.",
    question: "How is a desert cactus adapted to its dry environment?",
    answer: "It stores water in its thick flat stems and has protective thorns",
    draw: "a desert landscape with a spiky green cactus and a hardy samr tree growing firmly in golden sand under bright sunny skies",
    video: "A scenic sweep across contrasting Saudi plants: a prickly pear cactus storing water in Taif desert, and green mangrove trees thriving in Red Sea coastal water.",
  },
];

export const SC3_PLANTS: Chapter = {
  id: "sc3-plants",
  title: { en: "Plants", ar: "النباتات" },
  summary: { en: "Plant parts, needs, life cycles and seeds", ar: "أجزاء النبات واحتياجاته ودورة حياته والبذور" },
  lessons: SC3_PLANTS_LESSONS,
  parts: SC3_PLANTS_PARTS,
};
