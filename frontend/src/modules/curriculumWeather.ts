import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Weather and Seasons
 * From the client's "Weather and Seasons — Video-Ready Chapter Summary"
 * (Saudi MOE Science 3 Semester 2, McGraw Hill, Cambridge 0097, Oxford).
 * 8 Parts, combining all 84 sentences into 8 paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_WEATHER_PARTS: ChapterPart[] = [
  P("Air and weather", "الهواء والطقس", 0, "Saudi MOE Ch 7 L1; McGraw Hill Ch 7 L1; Oxford Stage 2, Unit 6"),
  P("Measuring and recording weather", "قياس الطقس وتسجيله", 1, "Saudi MOE Ch 7 L1; McGraw Hill (NGSS 3-ESS2-1); Oxford Stages 2 and 4"),
  P("Clouds, rain and the water cycle", "السحب والمطر ودورة الماء", 2, "Saudi MOE Ch 8 L1; McGraw Hill Ch 7 L2; Cambridge Stage 5"),
  P("Severe weather and staying safe", "الطقس القاسي والسلامة", 3, "Saudi MOE Ch 7 L2; McGraw Hill Natural Hazards (NGSS 3-ESS3-1)"),
  P("Climate", "المناخ", 4, "Saudi MOE Ch 8 L2; McGraw Hill Ch 7 L3 (NGSS 3-ESS2-2)"),
  P("The four seasons", "الفصول الأربعة", 5, "Saudi MOE Ch 8 L2; McGraw Hill; Cambridge 5ESs.02; New Oxford Primary Science 3"),
  P("Why seasons happen", "لماذا تحدث الفصول", 6, "McGraw Hill Ch 8 L1; Cambridge Stages 1–5; Oxford"),
  P("Living things through the seasons", "الكائنات الحية خلال الفصول", 7, "Saudi MOE Ch 7 L2; Cambridge 3Bp.03; Oxford Stage 2, Unit 3"),
];

export const SC3_WEATHER_LESSONS: Lesson[] = [
  {
    id: "sc3-weather-001",
    say: "From space, a thin blue layer of air called the atmosphere wraps around the Earth. A girl blows air into a balloon, and the balloon grows big and round. Wind is moving air, and the wind sways the green leaves of a palm tree. Weather is what the air is like in one place, such as a sunny morning in Riyadh. On a sunny day, bright sunshine warms a family having a picnic in the park. On a cloudy day, thick grey clouds cover the sky above the city. On a rainy day, raindrops splash into puddles and drum on open umbrellas. On a windy day, the wind bends tall palm trees and blows a flag straight out. On a foggy morning, thick white fog covers the green mountains around Abha. In a few hours, a clear blue sky fills with dark clouds as the weather changes.",
    question: "What is weather?",
    answer: "Weather is what the air is like in one place at one time, such as a sunny morning in Riyadh",
    draw: "four kinds of weather side by side: a sunny picnic in a park, thick grey clouds over a city, rain splashing on open umbrellas, and wind bending tall palm trees",
    video: "A family has a picnic in bright sunshine in a park; then grey clouds slowly roll across the sky as the weather changes.",
  },
  {
    id: "sc3-weather-002",
    say: "A small weather station in the desert holds a thermometer, a wind vane and a rain gauge. A thermometer measures temperature, which tells how hot or cold the air is. On a hot summer afternoon, the red liquid inside a thermometer rises high. On a cold winter night, the red liquid inside a thermometer drops low. A wind sock fills with moving air and points the way the wind is blowing. The arrow of a wind vane turns to point towards the direction the wind comes from. The cups of an anemometer spin faster and faster as the wind blows harder. A rain gauge on a school roof collects rain to show how much rain fell. Every morning, a boy draws a sun, cloud or rain symbol on the class weather chart. A weather satellite circles high above the Earth and takes pictures of the clouds below. A meteorologist on television points to a weather map to forecast tomorrow's weather.",
    question: "What does a thermometer measure?",
    answer: "A thermometer measures temperature, which tells how hot or cold the air is",
    draw: "a small desert weather station with a thermometer, a wind vane, an anemometer with spinning cups and a rain gauge, under a blue sky",
    video: "The red liquid inside an outdoor thermometer rises slowly in the afternoon sun; then the cups of an anemometer spin faster in the wind.",
  },
  {
    id: "sc3-weather-003",
    say: "The hot Sun warms the Red Sea, and some seawater evaporates into the air as water vapour. A puddle in the schoolyard shrinks in the hot sunshine as the water evaporates. Wet soil in a garden dries in the sunshine as water evaporates from the ground. High in the cool sky, water vapour condenses into tiny drops that form a white cloud. On a hot day, tiny water drops condense on the outside of a cold glass of juice. Fog is a cloud that touches the ground, like the fog on a mountain road near Abha. Tiny drops in a dark cloud join together into heavy raindrops that fall to the ground. On a very cold day, precipitation falls from the clouds as soft white snowflakes. During a storm, small balls of ice called hail bounce across the green grass. When the air warms above 0 °C, the snow on the ground melts into water. After rain, water flows through a wadi into the sea, where the Sun warms the water again. The water cycle carries water from the sea up to the clouds and back down again.",
    question: "What is the water cycle?",
    answer: "The water cycle carries water from the sea up to the clouds as water vapour and back down again as rain",
    draw: "the water cycle over the Red Sea: the Sun warming the sea, water vapour rising into white clouds, rain falling on mountains and water flowing back through a wadi to the sea",
    video: "Sunlight sparkles on the Red Sea as faint vapour rises; it gathers into a white cloud and rain falls on the mountains and flows back to the sea.",
  },
  {
    id: "sc3-weather-004",
    say: "Severe weather often begins with a strong wind and a few drops of light rain. A thunderstorm brings heavy rain, bright flashes of lightning and rumbling thunder over the city. A family watches a thunderstorm safely from inside the house, away from the windows. A lightning rod on a tall tower carries lightning safely down into the ground. A sandstorm pushes a huge wall of dust and sand across the desert. During a sandstorm, people stay indoors and close the windows to keep the dust out. Seen from space, a hurricane is a giant spinning storm over the warm ocean. Far across an empty field, a tornado's spinning funnel of wind reaches down from a dark cloud. A snowstorm blows thick snow sideways as people walk slowly in warm coats. After heavy rain, fast flood water rushes through a wadi while a family watches from high ground. Workers build a strong wall beside a wadi to keep flood water away from homes. A father puts charged batteries in a radio so the family can hear storm news.",
    question: "How do people stay safe in a thunderstorm or a sandstorm?",
    answer: "People stay indoors away from the windows, close the windows to keep the dust out, and listen for storm news",
    draw: "a family safely indoors watching a thunderstorm through a window, a lightning rod on a tall tower, and a sandstorm rolling across the distant desert",
    video: "From inside a calm house, a family watches dark clouds and a distant flash of lightning over the city, standing away from the window.",
  },
  {
    id: "sc3-weather-005",
    say: "Climate is the usual weather of a place over many years, like Riyadh's hot, dry climate. A weather scientist records the weather every day for many years to learn a place's climate. A rainforest has a hot, wet climate, with rain falling on tall green trees almost every day. The Arctic has a cold, icy climate, where polar bears walk across frozen sea ice. A teacher points to the equator on a globe, where lands get strong sunlight and stay warm. Abha sits high in the mountains, so winter in Abha is cool and misty. Jazan lies low beside the Red Sea, so winter in Jazan stays warm and sunny. Jeddah lies beside the Red Sea, so the air in Jeddah often feels warm and humid.",
    question: "What is climate?",
    answer: "Climate is the usual weather of a place over many years, like Riyadh's hot, dry climate",
    draw: "climates of the world: a hot dry Saudi desert, a wet green rainforest, a cold icy Arctic with a polar bear, and a teacher pointing to the equator on a globe",
    video: "A teacher points to the equator on a classroom globe; then the scene moves from a hot dry Riyadh street to a misty mountain road near Abha.",
  },
  {
    id: "sc3-weather-006",
    say: "One tree in a park changes through the four seasons: spring, summer, autumn, then winter. In spring, warm days and fresh rain make tiny flowers bloom across the desert. In summer, the hot Sun shines high above Riyadh, and the road shimmers in the heat. In autumn, also called fall, the air cools and yellow leaves drift down from the trees. In winter, cold winds blow, and snow sometimes covers Jabal Al-Lawz mountain near Tabuk. Every year, winter turns back into spring, and the four seasons start again. Children colour a bar graph showing that summer days in Riyadh are much hotter than winter days. In the African savanna, the rainy season turns dry brown grass bright green.",
    question: "What are the four seasons?",
    answer: "The four seasons are spring, summer, autumn and winter, and they start again every year",
    draw: "one tree in a park shown four times: spring flowers, summer sunshine, yellow autumn leaves falling, and a snowy winter with Jabal Al-Lawz in the distance",
    video: "One tree in a park changes slowly through spring blossoms, bright summer sun, falling yellow autumn leaves and a cold winter wind.",
  },
  {
    id: "sc3-weather-007",
    say: "The Sun is a star that gives the Earth light and heat. The Sun seems to cross the sky, rising in the east and setting in the west. A teacher spins a globe on its axis beside a lamp to show day and night. A palm tree's shadow shrinks from long in the early morning to short at noon. A girl walks a globe once around a lamp, like the Earth's yearly orbit around the Sun. The Earth's axis is tilted, just like the leaning globe on a classroom desk. When Saudi Arabia's half of the Earth leans towards the Sun, strong direct sunlight brings summer. When Saudi Arabia's half of the Earth leans away from the Sun, weaker slanted sunlight brings winter. At noon in summer, the Sun shines almost straight overhead in Riyadh, and shadows are very short. At noon in winter, the Sun stays lower in the sky, and shadows stretch longer. Summer days are longer, so the sky is still bright when children walk home in the evening. Winter days are shorter, so the sky is already dark when children walk home in the evening.",
    question: "Why does Saudi Arabia have summer?",
    answer: "Saudi Arabia's half of the Earth leans towards the Sun, so strong direct sunlight brings summer",
    draw: "a classroom model of the seasons: a girl walking a tilted globe around a bright lamp, with the northern half leaning towards the lamp for summer",
    video: "A girl walks a tilted classroom globe slowly around a bright lamp, the globe always leaning the same way, to show the Earth's yearly orbit.",
  },
  {
    id: "sc3-weather-008",
    say: "A date palm needs hot weather, bright sunlight and water to grow sweet dates. In spring, new green leaves and flowers grow on the bare branches of a tree. In autumn, flocks of birds fly south over Saudi Arabia to spend the winter in Africa. In cold winters, a brown bear hibernates in a cave and sleeps until spring. In winter, an Arctic fox grows thick white fur to stay warm in the snow. In summer, an Arabian oryx rests in the shade during the hottest part of the day. In a sandstorm, a camel shuts its eyes and nostrils while its long eyelashes block the sand. On hot summer days, people in Riyadh wear light, loose clothes and drink plenty of water. On a sunny day, a girl wears a sun hat and sunscreen to protect her skin. On a rainy day, children wear raincoats and carry umbrellas to stay dry. On cool winter evenings, a family wears warm jackets and sits around a campfire in the desert.",
    question: "How do animals and people change what they do in the seasons?",
    answer: "Birds fly south, a bear hibernates, an Arctic fox grows thick fur, and people wear light clothes in summer and warm jackets in winter",
    draw: "living things through the seasons: a date palm heavy with dates, storks flying south, a brown bear sleeping in a cave, and a family in warm jackets around a desert campfire",
    video: "An Arabian oryx rests calmly in the shade on a hot summer day; then a family in warm jackets sits around a small campfire on a cool desert evening.",
  },
];

export const SC3_WEATHER: Chapter = {
  id: "sc3-weather",
  title: { en: "Weather and Seasons", ar: "الطقس والفصول" },
  summary: {
    en: "Weather, weather tools, the water cycle, storms and safety, climate, the four seasons and why they happen",
    ar: "الطقس وأدواته ودورة الماء والعواصف والسلامة والمناخ والفصول الأربعة وسبب حدوثها",
  },
  parts: SC3_WEATHER_PARTS,
  lessons: SC3_WEATHER_LESSONS,
};
