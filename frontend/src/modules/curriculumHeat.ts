import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Heat — from the client's "Grade 3 Heat: Video-Ready Lesson Script"
 * (Thermal energy, heat sources, temperature, heat transfer, conductors, insulators, sun heat, safety).
 * 9 Parts, each combining its sentences into an educational summary paragraph lesson.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_HEAT_PARTS: ChapterPart[] = [
  P("What is heat?", "ما هي الحرارة؟", 0, "A Closer Look Heat (thermal energy); Saudi Unit 5 (heat conduction, temperature)"),
  P("Where heat comes from", "مصادر الحرارة", 1, "A Closer Look Heat and Work and energy; Saudi Unit 4 (sun) and Unit 6 (electricity)"),
  P("Temperature and thermometers", "درجة الحرارة ومقاييسها", 2, "Saudi Matter and measuring it; Elements of weather; English NC Year 4; Oxford Module 5"),
  P("Heat moves from hot to cold", "انتقال الحرارة من الساخن إلى البارد", 3, "A Closer Look Heat (conduction, convection, radiation); Saudi Units 4 & 5"),
  P("Conductors and insulators", "المواد الموصلة والمواد العازلة", 4, "A Closer Look Heat (conductors and insulators); Saudi Unit 5; Oxford Module 2"),
  P("Heating and cooling change materials", "أثر التسخين والتبريد على المواد", 5, "A Closer Look Heat and Changes of state; Saudi Physical and Chemical changes"),
  P("Keeping warm and keeping cool", "الحفاظ على الدفء والبرودة", 6, "A Closer Look Heat; Oxford Module 2 (insulators); Saudi Climate and seasons"),
  P("Heat from the sun", "حرارة الشمس واستخداماتها", 7, "Saudi Unit 4 (sunlight warms the land) and Climate; Solar energy and safety"),
  P("Staying safe around heat", "السلامة عند التعامل مع الحرارة", 8, "Safety for primary school science; A Closer Look Heat; Avoiding burns and sun safety"),
];

export const SC3_HEAT_LESSONS: Lesson[] = [
  {
    id: "sc3-heat-001",
    say: "Heat is a kind of energy that makes things warm. Heat energy is also called thermal energy. Everything is made of tiny pieces that are always moving. When something gets hotter, its tiny pieces move faster. Heat always moves from a warmer thing to a cooler thing. A hot drink cools down as its heat moves into the air. A cold drink warms up as heat from the air moves into the drink. Ice feels cold because heat moves from your hand into the ice.",
    question: "What is heat, and in which direction does heat always move?",
    answer: "Heat is thermal energy, and it always moves from a warmer thing to a cooler thing",
    draw: "a kitchen table showing thermal energy in action: a steaming ceramic mug of hot tea cooling down, alongside a tall glass of icy juice with cold water droplets forming on the glass",
    video: "A close-up of steam gently rising from a hot cup of tea into the cooler morning air, while tiny arrows illustrate heat flowing from the warm cup into the surrounding room.",
  },
  {
    id: "sc3-heat-002",
    say: "The sun is Earth's biggest source of heat. Sunlight warms the land, the sea and the air. Burning fuel, like wood or gas, gives off heat. Electricity makes heat in an oven, an iron and a heater. Rubbing your hands together makes them warm. Rubbing two things together makes heat because of friction. Our bodies make heat from the food we eat. Running makes your body warmer. An old-style light bulb gives off heat as well as light.",
    question: "What are some common sources of heat energy?",
    answer: "The sun, burning fuel, electricity, friction from rubbing, and our own bodies",
    draw: "a bright landscape showing sources of heat: golden sunshine over dunes, an adult cooking over a clean gas camping stove, and a child rubbing cold hands together",
    video: "The golden sun rising over the desert sand, transitioning to an adult turning on an oven with glowing heating elements, and a child rubbing hands together for warmth.",
  },
  {
    id: "sc3-heat-003",
    say: "Temperature tells how hot or cold something is. A thermometer measures temperature. Temperature is measured in degrees Celsius, written °C. The liquid inside a thermometer rises when the thermometer gets warmer. Water freezes at 0 °C and boils at 100 °C. A healthy person's body temperature is about 37 °C. A summer day in Riyadh can reach 45 °C. Our skin can feel warm or cold, but a thermometer gives an exact number. After holding ice, cool water can feel warm to your hand.",
    question: "What tool measures temperature and what is normal human body temperature?",
    answer: "A thermometer measures temperature, and a healthy person is about 37 °C",
    draw: "a science classroom bench with two thermometers: one in a beaker of icy water reading 0 °C and another in a warm water bath with red liquid rising",
    video: "A child placing a thermometer into warm water, watching the red liquid line steadily climb up the Celsius scale to show an exact temperature reading.",
  },
  {
    id: "sc3-heat-004",
    say: "Heat moves through things that touch each other. Heat moving through touching things is called conduction. A pan on a stove heats up from the bottom first. Warm air and warm water rise, and cooler air and water sink. Heat moving around in air or water is called convection. The sun's heat reaches Earth across empty space. Heat that travels as rays, like sunlight, is called radiation. A campfire warms your face even when you are not touching the fire. Dark colours soak up more of the sun's heat than light colours. White clothes stay cooler in the sun because white reflects sunlight.",
    question: "What are the three ways heat moves?",
    answer: "Conduction through touching, convection in air or water, and radiation as rays",
    draw: "a three-part visual diagram showing conduction in a metal spoon handle, convection currents in a heated pot of water, and solar radiation shining through space",
    video: "An educational visual illustrating heat transfer: warm colours creeping up a metal spoon, swirling warm water rising in a pot, and sunbeams travelling across space.",
  },
  {
    id: "sc3-heat-005",
    say: "A conductor is a material that lets heat move through it easily. Metals, like iron, copper and aluminium, are good conductors of heat. An insulator is a material that slows down the movement of heat. Wood, plastic, wool, cloth and air are good insulators. A dot of butter on a metal spoon melts before one on a wooden spoon. Pot handles are made of insulators so people can hold them safely. Oven gloves are made of thick cloth that protects hands from heat. A thermos flask keeps tea hot because its double wall stops heat escaping. A cool box keeps food cold because its walls slow down heat coming in. A fair test can show which material keeps a drink warm the longest.",
    question: "What is the difference between a heat conductor and an insulator?",
    answer: "Conductors like metal carry heat easily, while insulators like wood and plastic slow heat down",
    draw: "a kitchen counter showing heat conductors and insulators: a shiny metal cooking pot with a heatproof black plastic handle, a wooden spoon, and thick fabric oven gloves",
    video: "A fair test experiment: butter melting quickly on a conductive metal spoon standing in hot water, while butter on an insulating wooden spoon stays firm.",
  },
  {
    id: "sc3-heat-006",
    say: "Heating can melt a solid into a liquid. Cooling can freeze a liquid into a solid. Heat makes water evaporate faster. Cooling water vapour turns the vapour back into liquid water. Most materials get a little bigger when they are heated. Warm air takes up more space, so a balloon left in the sun grows a little. Heat can cook food and change it into something new. An egg changes from runny to firm when it is cooked. A cooked egg can never be turned back into a raw egg. Melted chocolate hardens again when it cools. Burning changes wood into ash and smoke.",
    question: "How does heat change different materials?",
    answer: "Heat can melt solids, expand materials, and cook or burn things into new materials",
    draw: "a kitchen counter demonstrating physical and chemical changes from heat: melting ice cubes, bread baking golden in an oven, and an egg cooking in a pan",
    video: "A time-lapse of dough expanding into a golden loaf of bread in a warm oven, alongside an ice lolly melting under gentle warmth.",
  },
  {
    id: "sc3-heat-007",
    say: "Warm clothes trap air close to the body and keep heat in. A wool blanket keeps people warm on a cold night. Loose, light clothes help people stay cool on hot days. A hat shades the head from the hot sun. Shade from trees and buildings keeps people cooler. Old Saudi houses had thick mud walls to keep the rooms inside cool. Wooden lattice windows in old Jeddah houses let breezes cool the rooms. An air conditioner moves heat from inside a room to the outside. A fan cools people by moving air across their skin. Sweating cools the body as sweat evaporates from the skin.",
    question: "How do clothes, buildings and our bodies keep us cool or warm?",
    answer: "Wool traps heat, light clothes and shade keep us cool, and sweating cools our skin",
    draw: "a traditional Saudi heritage house in Diriyah with thick insulating mud walls and an arched courtyard providing cool shade from the afternoon sun",
    video: "Children playing happily under the cool shade of a leafy tree on a sunny day, wearing light white cotton thobes and wide hats.",
  },
  {
    id: "sc3-heat-008",
    say: "The sun shines strongly over Saudi Arabia for most of the year. Desert sand gets very hot in the midday sun. The desert cools down quickly at night after the sun sets. The sea warms up more slowly than the land. Solar water heaters use sunlight to warm water for homes. A solar cooker uses shiny surfaces to focus sunlight and cook food. Solar panels turn sunlight into electricity. A car parked in the sun gets very hot inside. Never leave a child or a pet inside a parked car.",
    question: "How do people use the sun's heat, and why can parked cars be dangerous?",
    answer: "We use solar heaters, cookers, and solar panels; parked cars trap dangerous heat",
    draw: "a modern desert solar energy park with rows of photovoltaic solar panels gleaming under bright blue skies, with golden sand dunes in the background",
    video: "Solar panels absorbing bright desert sunlight to generate clean electricity, followed by a reminder diagram showing sunshades on a car windscreen.",
  },
  {
    id: "sc3-heat-009",
    say: "Hot things can burn the skin. Ask an adult before touching anything on a stove or in an oven. Steam from a kettle is hot enough to burn. Turning pot handles inward stops pots being knocked off the stove. Cool a small burn under cool running water and tell an adult. Drinking plenty of water on hot days keeps the body healthy. On very hot days, play outside in the cooler morning or evening. Sunscreen and shade protect the skin from sunburn. Feeling dizzy and very hot in the sun means moving to shade and drinking water. Matches and lighters are only for adults.",
    question: "What should you do to stay safe around heat and hot sun?",
    answer: "Never touch hot stoves, drink water in the sun, use sunscreen, and cool burns with water",
    draw: "a home kitchen showing heat safety: pot handles turned inward away from the stove edge, an adult helping a child, and a glass of cool drinking water",
    video: "An adult demonstrating kitchen safety: turning pot handles safely inward, while a child drinks fresh water in the shade under a beach umbrella.",
  },
];

export const SC3_HEAT: Chapter = {
  id: "sc3-heat",
  title: {
    en: "Heat",
    ar: "الحرارة",
  },
  summary: {
    en: "Thermal energy, temperature, heat transfer, conductors, insulators and solar energy",
    ar: "الطاقة الحرارية ودرجة الحرارة وانتقال الحرارة والمواد العازلة والطاقة الشمسية",
  },
  parts: SC3_HEAT_PARTS,
  lessons: SC3_HEAT_LESSONS,
};

