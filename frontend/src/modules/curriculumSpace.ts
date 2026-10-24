import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Earth, Sun and Moon
 * From the client's "Earth, Sun and Moon — Video-Ready Chapter Summary"
 * (Saudi MOE Grade 4, Cambridge Stage 3, Oxford Grade 3, McGraw Hill).
 * 5 Parts, combining all 75 sentences into 5 paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_SPACE_PARTS: ChapterPart[] = [
  P("The Sun", "الشمس", 0, "Cambridge Stage 1 (review); Oxford Grade 3; Saudi MOE Grade 4, Chapter 7"),
  P("The spinning Earth: day, night and shadows", "دوران الأرض: الليل والنهار والظلال", 1, "Saudi MOE Grade 4; Oxford Grade 3; Cambridge Stages 2–4"),
  P("Earth's trip around the Sun: a year and the seasons", "دوران الأرض حول الشمس: السنة والفصول", 2, "Saudi MOE Grade 4; Oxford Grade 3; Cambridge Stage 5"),
  P("The Moon: orbit, light, surface and phases", "القمر: مداره وضوؤه وسطحه وأطواره", 3, "Cambridge Stage 3; Oxford Grade 3; Saudi MOE Grade 4"),
  P("Sun, Earth and Moon together", "الشمس والأرض والقمر معًا", 4, "Cambridge Stages 3–4; Saudi MOE Grade 4 (eclipses, solar system); Oxford Grade 3"),
];

export const SC3_SPACE_LESSONS: Lesson[] = [
  {
    id: "sc3-space-001",
    say: "The Sun is a star: a giant ball of hot, glowing gas. The Sun is the star closest to Earth, so it looks bigger and brighter than other stars. The Sun gives the Earth light and warmth every day. The Sun is so huge that more than a million Earths could fit inside it. From Earth, the giant Sun looks small because it is very far away. Every star in the night sky is a ball of hot gas, much farther away than the Sun. Groups of stars make patterns in the night sky called constellations. Always look away from the bright Sun to keep your eyes safe.",
    question: "What is the Sun, and why does it look bigger than other stars?",
    answer: "The Sun is a star, a giant ball of hot glowing gas, and it looks bigger because it is the star closest to Earth",
    draw: "the glowing Sun as a giant ball of hot gas beside a tiny Earth, with a starry night sky and a constellation pattern in the corner",
    video: "A slow pan across the glowing surface of the Sun, then out to a tiny Earth, then a calm starry night sky over the desert where stars join into a constellation.",
  },
  {
    id: "sc3-space-002",
    say: "The Earth is shaped like a giant ball, called a sphere. The Earth spins like a top around an imaginary line called its axis. The Earth's axis runs through the North Pole and the South Pole. The Earth makes one full spin every 24 hours, which is one day. The half of the Earth facing the Sun has day, and the other half has night. As the Earth spins, each place turns from day into night and back into day. When it is noon in Riyadh, it is midnight on the opposite side of the Earth. The spinning Earth makes the Sun seem to move across the sky. Each morning, the Sun seems to rise in the east. Each evening, the Sun seems to set in the west. A shadow forms when an object blocks sunlight. Early in the morning, the low eastern Sun stretches a tree's shadow long toward the west. At midday, the Sun is high in the sky and a tree's shadow is short. Late in the afternoon, the low western Sun stretches a tree's shadow long toward the east. A sundial uses the Sun's moving shadow to show the time of day. Stars are in the sky during the day too, but bright sunlight hides them.",
    question: "Why do we have day and night?",
    answer: "The Earth spins on its axis once every 24 hours, so the half facing the Sun has day and the other half has night",
    draw: "the Earth spinning on a tilted axis line through the North and South Poles, one half lit by the Sun and the other half dark, with a palm tree and its shadow below",
    video: "The Earth turns slowly while the Sun stays still, one half lit and one half in night; then a palm tree's shadow shrinks from long in the morning to short at noon.",
  },
  {
    id: "sc3-space-003",
    say: "While the Earth spins, it also travels in a big loop around the Sun. The path the Earth follows around the Sun is called its orbit. The Earth's orbit is almost a perfect circle, just slightly oval. The Earth takes about 365 days, which is one year, to circle the Sun once. Seen from above the North Pole, the Earth circles the Sun anticlockwise. The Earth's axis is tilted, like a spinning top leaning to one side. All year long, the Earth's axis keeps leaning in the same direction in space. When the northern half of the Earth tilts toward the Sun, Saudi Arabia has summer. In summer, sunlight shines down more directly and days are longer, so the weather is hotter. When the northern half of the Earth tilts away from the Sun, Saudi Arabia has winter. In winter, sunlight arrives at a slant and days are shorter, so the weather is cooler. In spring and autumn, the Sun shines equally on the northern and southern halves of the Earth. The tilt of the Earth's axis causes the four seasons. When Saudi Arabia has summer, Australia, in the southern half of the Earth, has winter.",
    question: "How long does the Earth take to circle the Sun, and what causes the seasons?",
    answer: "The Earth takes about 365 days, one year, to orbit the Sun, and the tilt of the Earth's axis causes the four seasons",
    draw: "the Earth travelling on a nearly circular orbit around the Sun, its tilted axis leaning the same way at four points, labelled summer, autumn, winter and spring",
    video: "Seen from above, the Earth travels anticlockwise around a still Sun on a nearly circular path, its tilted axis always leaning the same way through the four seasons.",
  },
  {
    id: "sc3-space-004",
    say: "The Moon is a ball of rock, shaped like a sphere. The Moon is much smaller than the Earth: about 50 Moons could fit inside the Earth. The Moon travels around the Earth along a path called an orbit. The Moon is the Earth's natural satellite, an object that orbits a bigger object. The Moon takes about one month to travel once around the Earth. The Earth and the Moon travel around the Sun together. The Moon shines because sunlight bounces off its grey, rocky surface. The Moon's surface is covered with dust and bowl-shaped holes called craters. The Moon is a dry, airless world of grey rock and dust where nothing grows. Astronauts on the Moon wear spacesuits that give them air to breathe. Night after night, the Moon seems to change shape; these shapes are called phases. The Sun always lights up one half of the Moon. As the Moon orbits the Earth, we see different amounts of its sunlit half. At new moon, the Moon's sunlit half faces away from the Earth, so the Moon looks dark. A few days after new moon, a thin crescent moon glows in the evening sky. The first thin crescent after new moon marks the start of each Hijri month. At first quarter, the Moon looks like a bright half circle. A gibbous moon shows more than half of a bright circle. At full moon, the whole sunlit half faces the Earth, so the Moon looks like a bright circle. After full moon, the lit part shrinks night by night: gibbous, last quarter, then a thin crescent. The Moon goes through all its phases in about 29 and a half days. Like the Sun, the Moon seems to rise in the east and set in the west.",
    question: "Why does the Moon shine, and what are its phases?",
    answer: "The Moon shines because sunlight bounces off its rocky surface, and its phases are the changing shapes we see as it orbits the Earth",
    draw: "the grey cratered Moon orbiting the Earth, with a row of moon phases below: new moon, crescent, first quarter, gibbous and full moon",
    video: "An astronaut in a spacesuit and helmet walks on the grey cratered Moon under a black sky; then the Moon's phases grow night by night from a thin crescent to a full moon.",
  },
  {
    id: "sc3-space-005",
    say: "The Sun, the Earth and the Moon are all shaped like spheres. Of the three, the Sun is the biggest and the Moon is the smallest. In a model, the Earth is a pea, the Moon a mustard seed and the Sun a gym ball. With a pea-sized Earth, the Moon sits a ruler's length away and the Sun a football field away. A solar eclipse happens when the Moon passes between the Sun and the Earth. During a total solar eclipse, the Moon hides the Sun and daytime turns dark for minutes. People watch a solar eclipse only through special eclipse glasses. A lunar eclipse happens when the Earth passes between the Sun and the Moon. During a lunar eclipse, the Earth's shadow covers the full moon and can turn it dark red. A lunar eclipse is safe to watch with just your eyes. The Sun sits at the centre of our solar system. Eight planets travel around the Sun, and the Earth is the third planet from the Sun. Man-made satellites orbit the Earth and send back pictures of weather and space. Astronomers study the Sun, the Moon, the planets and the stars with telescopes. Each day the Earth spins, each month the Moon circles Earth, each year Earth circles the Sun.",
    question: "What is a solar eclipse, and which of the three is the biggest?",
    answer: "A solar eclipse happens when the Moon passes between the Sun and the Earth, and the Sun is the biggest of the three",
    draw: "the solar system with the Sun at the centre and eight planets on circular orbits, the Earth third from the Sun, and a telescope pointing at the sky",
    video: "The Moon slides slowly in front of the Sun during a solar eclipse while a family watches through special eclipse glasses; then the camera pulls back to the eight planets circling the Sun.",
  },
];

export const SC3_SPACE: Chapter = {
  id: "sc3-space",
  title: { en: "Earth, Sun and Moon", ar: "الأرض والشمس والقمر" },
  summary: {
    en: "The Sun and stars, day and night, the year and seasons, Moon phases, eclipses and the solar system",
    ar: "الشمس والنجوم والليل والنهار والسنة والفصول وأطوار القمر والكسوف والخسوف والنظام الشمسي",
  },
  parts: SC3_SPACE_PARTS,
  lessons: SC3_SPACE_LESSONS,
};
