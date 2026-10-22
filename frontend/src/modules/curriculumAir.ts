import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Air and Weather
 * From the client's "Grade 3 Air: Video-Ready Lesson Script"
 * (Saudi MOE, McGraw Hill Science: A Closer Look & Inspire Science, English NC).
 * 11 Parts, combining all 114 sentences into 11 cohesive paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_AIR_PARTS: ChapterPart[] = [
  P("Air is all around us", "الهواء يحيط بنا في كل مكان", 0, "Saudi Elements of weather; Cambridge 3Cm.01; Atmosphere"),
  P("What air is made of", "مما يتكون الهواء؟", 1, "A Closer Look Air; Cambridge 3Cm.02; Nitrogen, oxygen and gases"),
  P("Air takes up space and has mass", "الهواء يشغل حيزاً وله كتلة", 2, "Saudi Matter and measuring; States of matter; Compressed air"),
  P("Living things need air to breathe", "الكائنات الحية تحتاج إلى الهواء", 3, "Saudi Living things; Cambridge 3Bs.03; Lungs, gills and plant pores"),
  P("Moving air: wind and measuring tools", "حركة الهواء: الرياح وأدوات قياسها", 4, "Saudi Elements of weather; A Closer Look Weather; Windsock and vane"),
  P("Weather and weather instruments", "الطقس وأدوات رصده", 5, "Saudi Weather elements; Thermometer, barometer, rain gauge and precipitation"),
  P("Warm air rises: clouds, fog and water cycle", "الهواء الساخن يصعد: السحب والضباب ودورة الماء", 6, "Saudi The water cycle; Evaporation, condensation and rising air"),
  P("Seasons and climate in Saudi Arabia", "المناخ وفصول السنة في المملكة العربية السعودية", 7, "Saudi Climate and seasons; Four seasons and regional climates"),
  P("Dust storms and weather hazards", "العواصف الرملية ومخاطر الطقس والسلامة", 8, "Saudi Weather changes; Sandstorms, lightning, wadis and safety"),
  P("Wind power and air resistance", "طاقة الرياح ومقاومة الهواء", 9, "A Closer Look Air resources; Dumat Al Jandal wind farm; Parachutes"),
  P("Keeping air clean and reducing pollution", "المحافظة على نظافة الهواء والحد من التلوث", 10, "Saudi Protecting resources; Tree planting, clean transport and solar energy"),
];

export const SC3_AIR_LESSONS: Lesson[] = [
  {
    id: "sc3-air-001",
    say: "Air is all around us, even though we cannot see air. We can feel air moving on our skin. Air is a gas, so air spreads out to fill any space. An empty-looking bottle is really full of air. Bubbles show air escaping from a bottle pushed under water. A layer of air called the atmosphere surrounds the whole Earth. The air gets thinner the higher up you go. Moving air is called wind.",
    question: "What is air, and what surrounds the Earth?",
    answer: "Air is an invisible gas that fills spaces and moves as wind, and the atmosphere surrounds the whole Earth",
    draw: "a bright outdoor schoolyard with a smiling child feeling a gentle breeze, while an ethereal cutaway view shows planet Earth enveloped by a glowing blue atmospheric layer",
    video: "A child standing joyfully in an open school yard with arms wide open, feeling the gentle breeze lift their hair as palm fronds sway softly in the background.",
  },
  {
    id: "sc3-air-002",
    say: "Air is a mixture of different gases. Most of the air is a gas called nitrogen. Oxygen is the gas in air that people and animals need to breathe. Air has a small amount of carbon dioxide, which plants use to make food. Air also holds water vapour, an invisible gas made of water. Tiny bits of dust float in the air.",
    question: "What gases make up the air?",
    answer: "Air is a mixture mainly of nitrogen and oxygen, with small amounts of carbon dioxide, water vapour and dust",
    draw: "a colourful science diagram of air composition inside a clear glass flask: blue dots for nitrogen, red dots for oxygen, green dots for carbon dioxide, and sparkling water vapour",
    video: "A magnifying science animation showing colourful glowing gas molecules drifting freely in a beam of warm sunlight, with nitrogen, oxygen and carbon dioxide labelled.",
  },
  {
    id: "sc3-air-003",
    say: "Air takes up space. A paper towel in an upside-down cup stays dry under water because air fills the cup. Air has mass. A blown-up balloon is heavier than an empty balloon. Air can be squashed into a small space. Squashed air pushes outward and keeps a football firm. Air rushing out of a balloon pushes the balloon forward.",
    question: "How do experiments prove that air takes up space and has mass?",
    answer: "A paper towel stays dry in an upside-down cup underwater, and a blown-up balloon is heavier than an empty one",
    draw: "a school science lab experiment: a balance scale dipping lower on the side with a big inflated balloon, and a clear cup pushed underwater with a dry paper towel trapped inside",
    video: "A teacher dipping an inverted clear plastic cup straight down into a water tank, showing the trapped air pocket keeping the dry paper towel at the bottom completely dry.",
  },
  {
    id: "sc3-air-004",
    say: "People and animals breathe air to stay alive. When we breathe in, our lungs take oxygen from the air. When we breathe out, our lungs push out carbon dioxide. Exercise makes us breathe faster to get more oxygen. Fish use gills to take oxygen from water. Dolphins must swim up to the surface to breathe air. An earthworm breathes through its moist skin. Insects breathe through tiny holes along their sides. Plants take in carbon dioxide through tiny holes in their leaves. Plants give out oxygen that people and animals breathe.",
    question: "How do humans, animals and plants use gases in the air?",
    answer: "Humans and animals take in oxygen and give out carbon dioxide, while plants take in carbon dioxide and give out oxygen",
    draw: "a nature cutaway showing breathing in living things: human lungs taking in oxygen, a fish breathing with pink gills, and a green plant leaf releasing tiny oxygen bubbles in sunlight",
    video: "An animated medical chest cutaway showing human lungs expanding with fresh oxygen as a child exercises outdoors in a leafy green park.",
  },
  {
    id: "sc3-air-005",
    say: "Wind is air moving from one place to another. Wind blows when the sun warms some places more than others. On hot days in Jeddah, a cool breeze blows from the sea onto the land. A gentle wind is called a breeze. A strong wind can bend trees and blow sand into the air. A windsock shows which way the wind blows and how strong the wind is. A windsock that sticks straight out means the wind is strong. A wind vane points to the direction the wind is coming from. Winds are named for the direction they come from. An anemometer spins faster when the wind blows harder. Wind carries seeds, dust and smells from place to place.",
    question: "What causes wind, and what instruments measure it?",
    answer: "Uneven warming from the sun causes wind, which is measured by windsocks, wind vanes and anemometers",
    draw: "a windy seaside scene along the Jeddah corniche: palm trees swaying in a sea breeze, a bright orange airport windsock stretching straight out, and a spinning rooftop anemometer",
    video: "An orange and white striped windsock filling firmly with air and pointing straight outward in a strong wind beside a rotating three-cup anemometer.",
  },
  {
    id: "sc3-air-006",
    say: "Weather is what the air outside is like at a certain time and place. Temperature tells how hot or cold the air is. A thermometer measures the temperature of the air. Water that falls from clouds is called precipitation. Rain, snow and hail are all kinds of precipitation. Hail is balls of ice that fall from storm clouds. Snow falls when the air is cold enough for water to freeze. A rain gauge collects and measures rainfall. Clouds are made of tiny drops of water or ice floating in the air. A barometer measures air pressure, which helps forecasters predict the weather. Weather forecasters use measurements to predict tomorrow's weather. Scientists record the weather every day in a table. Weather records show patterns, like hot summers and cooler winters.",
    question: "What instruments do weather forecasters use?",
    answer: "They use thermometers for temperature, barometers for air pressure, and rain gauges for rainfall",
    draw: "a weather station display in a school courtyard: a red liquid outdoor thermometer, a clear rain gauge collecting rainwater, and a dial barometer beside weather symbol charts",
    video: "A close-up of an outdoor weather station showing the red line of a thermometer rising on a sunny morning, beside a calibrated glass cylinder rain gauge.",
  },
  {
    id: "sc3-air-007",
    say: "Warm air rises because warm air is lighter than the cool air around it. A hot-air balloon rises when the air inside the balloon is heated. Storks and eagles glide upward on rising warm air. The sun warms the sea, and seawater evaporates into the air as water vapour. Rising air carries water vapour high into the sky, where the vapour cools. Cooling water vapour condenses into tiny drops that make clouds. Fog is a cloud that forms close to the ground. Tiny cloud drops join into bigger drops that fall as rain. Rainwater flows into wadis, soaks into the ground and runs toward the sea. The water cycle moves water from the sea to the air to the land and back again.",
    question: "How do evaporation and condensation in the water cycle form clouds and rain?",
    answer: "Warm air carries evaporated water vapour high into the sky where it cools, condenses into clouds, and falls as rain",
    draw: "the complete water cycle over a scenic mountain and desert landscape: seawater evaporating under the sun, rising into puffy white clouds, rain falling over mountains, and streams filling a wadi",
    video: "A majestic hot-air balloon floating upwards above sandstone cliffs at sunrise, as warm shimmering air lifts it gently into a clear morning sky.",
  },
  {
    id: "sc3-air-008",
    say: "Climate is the usual weather of a place over many years. Weather changes from day to day, but climate stays much the same. A year has four seasons: spring, summer, autumn and winter. Summer is the hottest season because the sun shines more directly. Summer days in Riyadh are very hot and dry. Winter in Saudi Arabia is cooler, and some nights are cold. Snow sometimes falls on the mountains near Tabuk in winter. In most of Saudi Arabia, rain falls mainly in winter and spring. The Asir mountains get more rain than most of Saudi Arabia. Jeddah's air feels humid because the air holds lots of water vapour. The area around the North Pole has a cold climate with ice all year. A rainforest has a hot, wet climate with rain almost every day.",
    question: "What is the difference between weather and climate?",
    answer: "Weather changes day to day, while climate is the usual weather pattern of a region over many years",
    draw: "a four-season collage showing climate variations: a sunny hot desert summer in Riyadh, green mist and rain over the terraced Asir mountains, and rare snow on the peaks of Tabuk",
    video: "A beautiful cinematic montage showing the climate of Saudi Arabia: bright hot sunshine over Riyadh skyline, followed by misty rain over lush green terraced hills in Asir.",
  },
  {
    id: "sc3-air-009",
    say: "A sandstorm happens when strong winds lift sand and dust into the air. A sandstorm turns the sky brown and makes it hard to see. During a sandstorm, stay indoors and close the windows. A mask over the nose and mouth helps keep dust out when going outside. A thunderstorm brings heavy rain, lightning and thunder. Lightning is a giant spark of electricity from a storm cloud. Lightning heats the air so fast that the air makes a loud boom called thunder. During a thunderstorm, stay inside a building or a car. Heavy rain can quickly fill dry wadis with fast-flowing water. Never walk or drive into a flooded wadi. A snowstorm brings strong winds and heavy snow. A tornado is a spinning column of air that reaches down from a storm cloud. A hurricane is a huge spinning storm that forms over warm oceans. Weather forecasters warn people before dangerous storms arrive. A lightning rod carries lightning safely into the ground and protects a building. Rows of trees slow down strong winds and blowing sand. Dams and storm drains help keep flood water away from homes.",
    question: "What safety steps should people follow during sandstorms and thunderstorms?",
    answer: "Stay indoors, close windows, wear a face mask outside, stay in buildings or cars, and never enter flooded wadis",
    draw: "storm safety and weather precautions: a child wearing a protective face mask indoors looking through a sealed window at a sandstorm, and a tall building safely grounded with a lightning rod",
    video: "Viewed from a safe warm indoor window, a wall of dusty brown desert sandstorm sweeping across the horizon while family members safely close and seal window latches.",
  },
  {
    id: "sc3-air-010",
    say: "Air is a natural resource that people use every day. Wind is a renewable resource, because the wind never runs out. Wind turbines use moving air to make electricity. Saudi Arabia has a large wind farm at Dumat Al Jandal. Wind fills the sails of a dhow and pushes the boat across the sea. Wind lifts a kite high into the sky. Wind helps wet clothes dry faster. Air pushes against moving objects, and this push is called air resistance. A parachute catches lots of air, so a parachute falls slowly. A flat sheet of paper falls more slowly than a crumpled paper ball.",
    question: "How do humans use wind energy, and what is air resistance?",
    answer: "People use wind to generate electricity with turbines, sail dhow boats and fly kites, and air resistance slows falling objects like parachutes",
    draw: "clean wind energy and air resistance: giant white wind turbines turning gracefully at Dumat Al Jandal, a traditional wooden dhow with full sails, and a bright red parachute floating gently",
    video: "A breathtaking drone shot of the Dumat Al Jandal wind farm, showing tall sleek wind turbines spinning steadily against a clear blue desert sky to generate clean electricity.",
  },
  {
    id: "sc3-air-011",
    say: "Polluted air has smoke, dust or harmful gases mixed into it. Smoke from cars and factories makes the air dirty. Dirty air can make it harder for people to breathe. Burning rubbish fills the air with smoke, so rubbish belongs in a bin. Trees clean the air by trapping dust and giving out oxygen. Saudi Arabia is planting billions of trees to make the air cleaner and the land greener. Walking, cycling and taking the metro make less pollution than driving. Solar panels make electricity without smoke. Switching off lights saves electricity and means less smoke from power stations. Clean air keeps people, animals and plants healthy.",
    question: "How can we reduce air pollution and keep air clean?",
    answer: "By planting trees, using public transport, generating clean solar energy, saving electricity, and avoiding burning rubbish",
    draw: "a vision of a clean green city: Riyadh Metro gliding smoothly, leafy green trees lining walkways, children cycling happily under a crystal clear blue sky with solar panels on rooftops",
    video: "Children riding bicycles along a tree-lined city path under a bright clean blue sky, with a modern sleek electric metro train passing quietly in the background.",
  },
];

export const SC3_AIR: Chapter = {
  id: "sc3-air",
  title: {
    en: "Air and Weather",
    ar: "الهواء والطقس",
  },
  summary: {
    en: "Properties of air, breathing, wind, weather instruments, climate, storms and clean air",
    ar: "خصائص الهواء والتنفس والرياح وأدوات الطقس والمناخ والعواصف والهواء النقي",
  },
  parts: SC3_AIR_PARTS,
  lessons: SC3_AIR_LESSONS,
};
