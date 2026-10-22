import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Matter — from the client's "Grade 3 Matter: Video-Ready Lesson Script"
 * 10 Parts, each with an educational summary paragraph combining the script's sentences.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_MATTER_PARTS: ChapterPart[] = [
  P("What is matter?", "ما هي المادة؟", 0, "Saudi Matter and measuring it; Cambridge 3Cm.01; English NC Year 1"),
  P("Describing matter by its properties", "وصف المادة بخصائصها", 1, "Saudi Matter and measuring it; Cambridge 3Cp.01; Oxford Module 2"),
  P("Measuring matter", "قياس المادة", 2, "Saudi Matter and measuring it; A Closer Look Measuring matter"),
  P("Solids, liquids and gases", "المواد الصلبة والسائلة والغازية", 3, "Saudi States of matter; Cambridge 3Cm.01; English NC Year 4"),
  P("Heating and cooling: melting and freezing", "التسخين والتبريد: الانصهار والتجمد", 4, "Saudi Physical changes; A Closer Look Changes of state"),
  P("Evaporation, condensation and the water cycle", "التبخر والتكثف ودورة الماء", 5, "English NC Year 4; Saudi Physical changes; Changes of state"),
  P("Choosing the right material for a job", "اختيار المادة المناسبة للعمل", 6, "Oxford Module 2; English NC Year 2; Insulators and conductors"),
  P("Magnetic materials", "المواد المغناطيسية", 7, "Cambridge 3Pe.01–03; Oxford Module 2; Magnets and poles"),
  P("Mixing, dissolving and separating", "الخلط والذوبان وفصل المخاليط", 8, "Cambridge 3Cm.02, 3Cc.01; Filtering and dissolving solutions"),
  P("Physical and chemical changes", "التغيرات الفيزيائية والكيميائية", 9, "Saudi Physical and Chemical changes; Reversible vs irreversible"),
];

export const SC3_MATTER_LESSONS: Lesson[] = [
  {
    id: "sc3-matter-001",
    say: "Matter is anything that takes up space and has mass. A rock, a glass of water and the air in a balloon are all matter. Air is matter, even though we cannot see air. Light and sound are not matter, because they do not take up space or have mass. Every object is made of a material, like wood, metal, plastic or glass. The same kind of object can be made from different materials. All matter is made of tiny pieces far too small to see. Elements are the simplest kinds of matter, like gold, iron and oxygen. Elements join together to make all the other kinds of matter.",
    question: "What is matter, and what is it made of?",
    answer: "Matter is anything that takes up space and has mass, made of tiny pieces",
    draw: "a classroom table showing three states of matter: a solid grey stone, a clear glass filled with pure water, and a bright red balloon filled with air",
    video: "A close-up of a science table displaying a solid rock, a glass of water, and an air-filled red balloon, clearly illustrating that matter takes up space.",
  },
  {
    id: "sc3-matter-002",
    say: "A property is something you can observe about matter, like its colour or shape. We use our senses to observe the properties of matter. A rock feels hard, and a sponge feels soft. A metal spoon is shiny, and a wooden spoon is dull. Sandpaper feels rough, and glass feels smooth. A rubber hose bends easily, but a stone does not bend. A wooden block floats in water, and a stone sinks. Heat passes through metal more quickly than through plastic. We can see through clear glass, but not through wood. Scientists sort materials into groups by their properties.",
    question: "How do we observe the properties of matter?",
    answer: "We use our senses to observe properties like colour, hardness and texture",
    draw: "a collection of everyday objects on a wooden desk: a hard grey pebble, a soft yellow kitchen sponge, a shiny silver spoon, and smooth clear glass",
    video: "A child gently testing the properties of materials: pressing a soft sponge, touching a hard stone, and shining light on a reflective metal spoon.",
  },
  {
    id: "sc3-matter-003",
    say: "Mass is how much matter is in an object. A pan balance compares the mass of two objects. On a pan balance, the side that goes down holds the object with more mass. Scientists measure mass in grams and kilograms. Volume is how much space matter takes up. A measuring cup shows the volume of a liquid in millilitres. Dropping a stone into water makes the water level rise. The water level rises by the same amount as the volume of the stone dropped in. A ruler measures length in centimetres. A thermometer measures temperature in degrees Celsius. Scientists use the same units so everyone gets the same measurement.",
    question: "What tools measure mass, volume, length and temperature?",
    answer: "A balance for mass, a measuring cup for volume, a ruler for length, and a thermometer for temperature",
    draw: "a neat school science lab with a brass pan balance weighing an apple, a glass measuring cylinder with blue liquid, a wooden ruler, and a thermometer",
    video: "A pan balance balancing with an apple on one side, alongside a graduated measuring cylinder showing water level rising as a pebble is gently lowered.",
  },
  {
    id: "sc3-matter-004",
    say: "Matter can be a solid, a liquid or a gas. A solid keeps its own shape and size. Rocks, ice cubes and wooden blocks are solids. A liquid takes the shape of its container. A liquid keeps the same volume when it is poured into a new container. Liquids flow and can be poured. A gas spreads out to fill any container. The scent of bakhoor spreads through a whole room as a gas. Air from a burst balloon spreads out in all directions. Most gases, like air, are invisible. A gas can be squashed into a smaller space, but a solid block cannot. Sand can be poured, but each grain of sand is a tiny solid.",
    question: "What are the three states of matter and how do they behave?",
    answer: "Solids keep their shape, liquids flow to take container shape, and gases spread to fill any space",
    draw: "three clear containers side by side: one with solid wooden blocks, one with orange juice pouring into a glass, and one with colourful floating balloons full of gas",
    video: "Demonstrating the three states: solid ice cubes resting in a bowl, liquid water flowing into a beaker, and steam and air filling an inflated balloon.",
  },
  {
    id: "sc3-matter-005",
    say: "Heating or cooling can change matter from one state to another. Melting is when a solid turns into a liquid. Ice melts when it warms above 0 degrees Celsius. Freezing is when a liquid turns into a solid. Water freezes into ice at 0 degrees Celsius. Chocolate melts in a warm hand and goes hard again in the fridge. Candle wax melts when heated and hardens as it cools. Melting and freezing can be undone, so the material stays the same.",
    question: "What happens when a solid is heated and a liquid is cooled?",
    answer: "Heating melts a solid into a liquid, and cooling freezes a liquid into a solid",
    draw: "a kitchen counter showing a melting ice cube turning to a pool of water under gentle warmth, and a lit beeswax candle with liquid wax pooling around the wick",
    video: "A time-lapse of an ice cube slowly melting into clear liquid water, followed by liquid candle wax cooling and solidifying.",
  },
  {
    id: "sc3-matter-006",
    say: "Evaporation is when a liquid turns into a gas. Water evaporates faster on a hot day than on a cold day. Evaporated water becomes an invisible gas called water vapour. Boiling water bubbles as it quickly turns into water vapour. Condensation is when a gas turns into a liquid. Water vapour in the air condenses into drops on a cold glass. The sun warms the sea, and seawater evaporates into the air. Water vapour cools high in the sky and condenses into clouds. Water falls from clouds as rain and flows back toward the sea. The water cycle is water moving round and round between sea, sky and land.",
    question: "What are evaporation and condensation?",
    answer: "Evaporation turns liquid into gas, and condensation turns gas into liquid",
    draw: "a steaming tea kettle with gentle white vapour rising towards a cold glass lid, where tiny glistening condensation droplets form and drip down",
    video: "Steam rising gently from a warm kettle, hitting a cool surface and condensing into clear glistening water drops that trickle down.",
  },
  {
    id: "sc3-matter-007",
    say: "People choose materials for a job by their properties. Windows are made of glass because we can see through glass. A raincoat is made of waterproof material that keeps water out. A sponge soaks up spills because a sponge is absorbent. Cooking pots are made of metal because metal heats up quickly. Pot handles are made of plastic or wood because these materials stay cool. An insulator is a material that slows down heat moving through it. A thermos flask keeps Arabic coffee hot for hours. Shoes have rubber soles so we do not slip. A teapot made of chocolate would melt, so chocolate is the wrong material for a teapot.",
    question: "Why do we choose different materials for different jobs?",
    answer: "Because each material has properties like being waterproof, strong, or a heat insulator",
    draw: "a workshop bench showcasing everyday materials: a clear glass window pane, a bright yellow waterproof raincoat, a metal cooking pot with a heatproof wooden handle, and rubber-soled shoes",
    video: "Testing various everyday materials: pouring water over a waterproof fabric where drops bead off, and showing a metal pot with a cool wooden handle.",
  },
  {
    id: "sc3-matter-008",
    say: "A magnet pulls some metal objects toward it. Iron and steel are magnetic materials. Many metals are not magnetic, like aluminium, copper and gold. Wood, plastic, glass and paper are not magnetic. Every magnet has a north pole and a south pole. Opposite poles attract and pull two magnets together. The same poles repel and push two magnets apart. A magnet can pull through paper, water and even a thin tabletop. A compass needle is a small magnet that points north. Magnets separate steel cans from aluminium cans for recycling.",
    question: "Which metals are magnetic, and how do magnet poles behave?",
    answer: "Iron and steel are magnetic; opposite poles attract and similar poles repel",
    draw: "a shiny red-and-blue horseshoe magnet on a school desk, attracting shiny steel paperclips and nails, next to a compass pointing north and non-magnetic wooden blocks",
    video: "A horseshoe magnet attracting steel paperclips through a piece of card, demonstrating magnetic attraction and poles repelling and attracting.",
  },
  {
    id: "sc3-matter-009",
    say: "A mixture is two or more materials mixed together. Each material in a mixture keeps its own properties. Sugar dissolves in tea and seems to disappear. Dissolved sugar is still in the tea, because the tea tastes sweet. Sand does not dissolve in water. A filter separates sand from water. A sieve lets small grains through and holds big pieces back. A magnet can pull iron filings out of a mixture with sand. Some mixtures can be separated by hand, like picking small stones out of lentils. Salt can be taken back out of salt water by letting the water evaporate. People collect sea salt by letting seawater dry in shallow ponds.",
    question: "How can mixtures and solutions be separated?",
    answer: "By filtering, sieving, using magnets, evaporation, or sorting by hand",
    draw: "a kitchen science bench with a glass funnel lined with filter paper separating sandy water into clean drips, a metal sieve with rice and beans, and a bowl of salt water evaporating in sunlight",
    video: "Pouring a mixture of sand and water through a filter funnel to produce clear liquid, while a magnet pulls iron filings out of dry sand.",
  },
  {
    id: "sc3-matter-010",
    say: "A physical change changes how matter looks, but not what the matter is. Tearing, bending, cutting and folding are physical changes. Squashing modelling clay into a new shape is a physical change. A potter shapes soft clay into a pot. Melting, freezing and evaporating are physical changes too. A chemical change makes a new material with new properties. Baking turns runny cake batter into a soft, spongy cake. Milk that goes sour has changed into a new material. An iron nail left in wet air slowly rusts. Rust is a new material that forms when iron, water and air react. Burning wood is a chemical change that makes ash and smoke. Most chemical changes cannot be undone. Digestion is a chemical change that breaks food into simpler materials. Leaves use sunlight to change water and air into sugar, which is a chemical change.",
    question: "What is the difference between a physical change and a chemical change?",
    answer: "A physical change changes appearance without making a new material, while a chemical change creates a new material",
    draw: "a two-part split comparison: on one side, brightly coloured modelling clay being shaped and folded (physical change); on the other, a golden freshly baked sponge cake and a rusty iron nail (chemical change)",
    video: "A split demonstration: folding a colourful origami paper and shaping clay on one side, and cake batter rising into golden sponge cake in an oven on the other.",
  },
];

export const SC3_MATTER: Chapter = {
  id: "sc3-matter",
  title: {
    en: "Matter",
    ar: "المادة",
  },
  summary: {
    en: "States of matter, properties, changes, magnets and materials",
    ar: "حالات المادة وخصائصها وتغيراتها والمغناطيس والمواد",
  },
  parts: SC3_MATTER_PARTS,
  lessons: SC3_MATTER_LESSONS,
};
