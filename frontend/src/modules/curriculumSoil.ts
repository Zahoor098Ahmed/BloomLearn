import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Soil and Rocks
 * From the client's "Grade 3 Soil: Video-Ready Lesson Script"
 * (Saudi MOE, McGraw Hill Science: A Closer Look, English NC Year 3).
 * 10 Parts, combining all 81 sentences into 10 cohesive paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_SOIL_PARTS: ChapterPart[] = [
  P("What is soil?", "ما هي التربة؟", 0, "Saudi Soil; A Closer Look Soil; English NC Year 3 (rocks and organic matter)"),
  P("Rocks: where soil comes from", "الصخور ومصدر التربة", 1, "Saudi Unit 3 (minerals and rocks); English NC Year 3; Cambridge 3ESp.01"),
  P("How soil forms and weathering", "كيف تتكون التربة والتجوية", 2, "Saudi Unit 3 (weathering, erosion, humus); A Closer Look Weathering"),
  P("What is inside soil", "مكونات التربة", 3, "Saudi Soil (grains, air, water, humus); A Closer Look Soil layers"),
  P("Types of soil: sand, silt, clay and loam", "أنواع التربة: الرمل والطمي والطين والطفال", 4, "Saudi Soil (differing soils); A Closer Look Variables; English NC Year 3"),
  P("Layers of soil", "طبقات التربة", 5, "A Closer Look Soil (topsoil, subsoil, bedrock); Root depth"),
  P("Living things in soil and decomposers", "الكائنات الحية في التربة والمحللات", 6, "Saudi Soil (living things); Food chains and decomposers; Earthworm tunneling"),
  P("Soil and plant nutrients", "التربة وتغذية النباتات", 7, "Saudi Soil; Plants and their parts; Cambridge 3Bp.03; Compost nutrients"),
  P("Soil in Saudi Arabia", "التربة في المملكة العربية السعودية", 8, "Saudi Unit 3 Earth and its resources; Oases, wadis, Al-Qassim farms and terraces"),
  P("Protecting soil and conservation", "حماية التربة والمحافظة عليها", 9, "Saudi Unit 3 (saving resources); Erosion prevention; Planting trees"),
];

export const SC3_SOIL_LESSONS: Lesson[] = [
  {
    id: "sc3-soil-001",
    say: "Soil is the loose top layer of the ground where plants grow. Soil is a mixture of tiny rock pieces, minerals, water, air and rotted plants. Soil covers much of the land on Earth. It takes hundreds of years to make a thin layer of soil. Soil gives plants a place to grow their roots. Many animals make their homes in soil. People grow most of their food in soil.",
    question: "What is soil made of, and why is it important?",
    answer: "Soil is a mixture of tiny rock pieces, minerals, water, air and rotted plants where plants grow roots and people grow food",
    draw: "a warm garden scene showing rich dark topsoil with leafy green vegetable plants, healthy spreading roots, and a child examining a handful of fertile crumbly soil",
    video: "A child gently scooping up a handful of dark crumbly garden soil, showing tiny pebbles, moist earth and green plant roots growing peacefully.",
  },
  {
    id: "sc3-soil-002",
    say: "Rocks are hard natural solids found all over the Earth. Rocks are made of minerals. Minerals have different colours, shapes and shine. Some rocks are hard, like granite, and some are soft, like chalk. Some rocks let water soak in, and some do not. Sandstone is made of sand grains pressed together over a very long time. Some rocks form when hot melted rock cools down and hardens. Saudi Arabia has huge fields of black lava rock called harrats. People use rocks to build houses, roads and walls. Useful materials like metals and oil come from rocks underground.",
    question: "Where does soil come from, and what are rocks made of?",
    answer: "Soil comes from rocks, and rocks are made of minerals",
    draw: "a geology display of different rocks and minerals: pink and grey granite crystals, layers of golden sandstone cliffs, soft white chalk, and dark basalt lava stone",
    video: "A slow scenic pan across majestic golden sandstone cliffs and rocky mountain peaks under bright desert skies, zooming into sparkling mineral grains in granite.",
  },
  {
    id: "sc3-soil-003",
    say: "Soil forms when rocks slowly break into tiny pieces. Breaking rocks into smaller pieces is called weathering. Rain, wind, heat and cold all help break rocks apart. Plant roots can grow into cracks and split rocks open. Dead leaves and plants rot and mix into the soil. Rotted plant and animal remains in soil are called humus. Humus makes soil dark and rich, so plants grow well. Wind and water carry soil from one place to another.",
    question: "What is weathering, and what is humus?",
    answer: "Weathering is breaking rocks into smaller pieces, and humus is dark rotted plant and animal remains",
    draw: "an educational diagram of rock weathering: rain and wind cracking a large boulder, tree roots splitting stone, and fallen leaves rotting into rich dark brown humus",
    video: "A time-lapse showing a tree root slowly expanding inside a rock crack until the stone splits, while autumn leaves crumble into dark rich humus.",
  },
  {
    id: "sc3-soil-004",
    say: "Soil has tiny pieces of rock of many different sizes. Sand grains are the biggest grains in soil and feel gritty. Silt grains are smaller and feel smooth and soft. Clay grains are the tiniest and feel sticky when wet. Soil has air in the spaces between its grains. Soil holds water that plant roots take in. Shaking soil with water in a jar makes the soil settle into layers. In the jar, heavy stones settle first and light humus floats on top.",
    question: "What are the three main rock grain sizes in soil?",
    answer: "Sand grains are the biggest and gritty, silt grains are smaller and smooth, and clay grains are the tiniest and sticky",
    draw: "a clear glass science jar showing separated soil layers: stones and sand at the bottom, smooth silt in the middle, clay above, clear water, and dark humus floating on top",
    video: "A clear glass jar filled with soil and water being shaken, then left to settle as distinct horizontal layers of gravel, sand, silt and dark floating humus appear.",
  },
  {
    id: "sc3-soil-005",
    say: "Soils differ in colour, in texture and in how much humus they hold. Texture is how a soil feels, from gritty to smooth to sticky. Sandy soil has big grains and lets water drain through quickly. Clay soil has tiny grains and holds water for a long time. Clay soil can be shaped into pots and bricks. Loam is a mix of sand, silt, clay and humus that is best for growing plants. Dark soil is often rich in humus. A fair test can show which soil holds the most water. Red desert sand gets its colour from iron minerals.",
    question: "Which type of soil is best for growing plants, and why?",
    answer: "Loam is best because it is a balanced mix of sand, silt, clay and humus that holds water and nutrients well",
    draw: "three glass funnels comparing soil drainage in a school lab: yellow sandy soil draining quickly, sticky red clay holding water, and dark rich loam growing a healthy green seedling",
    video: "Water being poured equally into three funnels containing sand, clay and rich loam soil, showing water draining quickly through sand while loam retains the perfect moisture.",
  },
  {
    id: "sc3-soil-006",
    say: "Digging deep shows that the ground has layers. Topsoil is the dark top layer, full of humus, roots and living things. Subsoil lies under the topsoil and has more rock pieces and less humus. Bedrock is the solid rock deep under the soil. Most plant roots grow in the topsoil. Some tree roots reach deep into the subsoil to find water.",
    question: "What are the three main layers of soil?",
    answer: "Topsoil on top, subsoil in the middle, and solid bedrock underneath",
    draw: "a cross-section cutaway diagram of Earth's ground layers: dark fertile topsoil with earthworms and grass roots, lighter orange-brown subsoil with tree roots, and grey solid bedrock below",
    video: "An animated cutaway moving down through the ground, highlighting the dark organic topsoil, the rocky subsoil layer, down to solid grey bedrock.",
  },
  {
    id: "sc3-soil-007",
    say: "A handful of soil holds many tiny living things. Earthworms dig tunnels that let air and water into the soil. Earthworms eat dead leaves and leave behind waste that makes soil rich. Ants carry soil up from underground when they build their nests. Fungi and bacteria break down dead plants and animals into humus. Living things that break down dead material are called decomposers. Beetles and woodlice live in soil and help break down dead leaves. Plant roots hold the soil together.",
    question: "How do earthworms and decomposers help the soil?",
    answer: "Earthworms tunnel to let air and water in, while decomposers break down dead leaves and animals into rich humus",
    draw: "an underground cutaway view of lively soil biology: earthworms creating aeration tunnels, an ant nest chamber, tiny mushrooms decomposing fallen wood, and healthy plant root networks",
    video: "An underground camera view showing a healthy earthworm gliding through dark soil, creating open air tunnels that allow rainwater to soak in gently.",
  },
  {
    id: "sc3-soil-008",
    say: "Plants take water and nutrients from the soil through their roots. Nutrients are materials in soil that help plants grow strong. Plants grow better in rich soil than in poor sand. Farmers add compost to soil to put nutrients back. Compost is made from rotting fruit peels, leaves and grass. Watering plants too much can wash nutrients out of the soil. Some plants, like cacti, grow well in sandy soil. Rice grows best in wet, muddy soil.",
    question: "What do plant roots take from soil, and how do farmers add nutrients?",
    answer: "Roots take water and nutrients, and farmers add compost made from rotting peels, leaves and grass",
    draw: "a vibrant garden plot showing a farmer spreading dark rich organic compost around flourishing rows of green tomato plants, with a healthy compost bin in the background",
    video: "A gardener mixing dark rich compost made of fruit peels and dry leaves into garden beds, followed by healthy green tomato plants flourishing in the enriched soil.",
  },
  {
    id: "sc3-soil-009",
    say: "Much of Saudi Arabia is covered by sand and rocky desert. Desert sand has little humus, so few plants grow in it. Oases have richer soil and water, so date palms grow well there. Farms in Al-Qassim grow dates, wheat and vegetables. Round fields are watered by long sprinklers that turn slowly in a circle. Farmers in the Asir mountains build terraces to stop soil washing down the slopes. Floodwater can leave rich soil behind on the floor of a wadi. Saudi farmers improve desert soil with compost and drip watering.",
    question: "How do farmers in Saudi Arabia grow crops and protect soil on mountain slopes?",
    answer: "They build stone terraces on slopes to stop erosion, and use compost and drip watering in oases and desert farms",
    draw: "a panoramic view of Saudi agriculture: green date palm oases in the desert, circular green wheat pivot fields in Al-Qassim, and stepped stone agricultural terraces in the Asir mountains",
    video: "An aerial view of lush green date palm groves in the Al-Ahsa oasis, followed by green circular crops watered by rotating center-pivot sprinklers against golden desert sands.",
  },
  {
    id: "sc3-soil-010",
    say: "Soil is precious because soil takes so long to form. Wind and rain can carry away soil that has no plants to hold it. Planting trees and grass protects soil from wind and water. Saudi Arabia is planting billions of trees to protect its land. Terraces on hills slow rainwater down and keep soil in place. Rubbish and chemicals can poison soil. Putting rubbish in bins and recycling keeps soil clean. Compost bins turn food scraps into rich soil instead of rubbish. Healthy soil grows the food we eat every day.",
    question: "Why is soil conservation important, and how can people protect soil?",
    answer: "Soil takes hundreds of years to form, and planting trees, terracing slopes, recycling rubbish and using compost protect it",
    draw: "a cheerful environmental conservation scene: schoolchildren planting young green saplings along a gentle hillside, using compost mulch, and placing recyclables into tidy blue bins",
    video: "Children smiling as they plant a young green tree sapling into fertile soil on a school field, patting the earth gently and watering the roots to protect the land from wind.",
  },
];

export const SC3_SOIL: Chapter = {
  id: "sc3-soil",
  title: {
    en: "Soil and Rocks",
    ar: "التربة والصخور",
  },
  summary: {
    en: "Soil composition, rock types, weathering, layers of soil and soil conservation",
    ar: "مكونات التربة وأنواع الصخور والتجوية وطبقات التربة وحمايتها",
  },
  parts: SC3_SOIL_PARTS,
  lessons: SC3_SOIL_LESSONS,
};
