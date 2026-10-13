/**
 * High-definition ARASAAC pictogram dictionary for AAC communication cards and categories.
 * Maps words, compound phrases, and categories to authentic, standard AAC pictograms
 * matching TouchChat / Avaz / Proloquo tablet AAC boards.
 */

import { dictUrl } from "./imageLibrary";

function arasaac(id: number): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
}

export const AAC_PICTOGRAM_MAP: Record<string, string> = {
  // Category Navigation Tabs (matching tablet photo)
  tools: arasaac(2922), // Hammer
  emotion: arasaac(3250), // Happy child
  attributes: arasaac(4628), // Circles with arrow / distinct
  sentences: arasaac(3345), // Child speaking / conversation
  schools: arasaac(2526), // Blackboard & eraser
  school: arasaac(3082),
  sports: arasaac(3199), // Child kicking soccer ball
  hygiene: arasaac(2443), // Handwashing / washing
  music: arasaac(2417), // Guitar
  core: arasaac(3345), // Communication
  food: arasaac(4610), // Food tray
  people: arasaac(2392), // Family / people
  actions: arasaac(2719), // Running / action
  feelings: arasaac(3250),

  // Schools category words (exact matches from user reference photo)
  teacher: arasaac(2457), // Teacher pointing to chalkboard
  class: arasaac(9814), // Classroom with children at desks
  classroom: arasaac(9814),
  chair: arasaac(3155), // Wooden school chair
  desk: arasaac(2916), // School desk
  recess: arasaac(2859), // Playground / kids playing
  crayons: arasaac(4951), // Crayons in box
  crayon: arasaac(4951),
  crate: arasaac(2526),
  crates: arasaac(2526),
  blocks: arasaac(4921), // Alphabet toy blocks
  "fire drill": arasaac(2592), // Fire alarm bell with sound waves
  "bulletin board": arasaac(2526), // Bulletin board with notes
  "pencil sharpener": arasaac(2553), // Mechanical sharpener
  sharpener: arasaac(2553),
  slide: arasaac(4759), // Playground slide
  swing: arasaac(4608), // Playground swing set
  "sensory table": arasaac(4565), // Sand / sensory table
  pens: arasaac(2282), // Cup of pens
  pen: arasaac(2282),
  "coloured pencils": arasaac(2440), // Row of colored pencils
  "colored pencils": arasaac(2440),
  bookshelf: arasaac(3279), // Bookshelf filled with books
  cafeteria: arasaac(4587), // Cafeteria / canteen
  "main hall": arasaac(3132), // Hall / auditorium
  reception: arasaac(2353), // Front reception desk
  "school store": arasaac(4882), // School store kiosk
  counting: arasaac(2714), // Hand with numbered fingers
  book: arasaac(2450), // Open green book
  learn: arasaac(2387), // Boy reading with idea bulb
  numbers: arasaac(2879), // 1 2 3 numbers
  "flash cards": arasaac(3181), // Flash cards
  crafts: arasaac(2547), // Scissors, glue and paper

  // Sentences category (matching photo top sentence bar)
  "i need help": arasaac(4570), // Child raising hand / help
  help: arasaac(4570),
  in: arasaac(5439), // Child in box / inside
  "i want": arasaac(5441), // Want / desire
  want: arasaac(5441),
  "i feel": arasaac(30197), // Feeling / emotion
  feel: arasaac(30197),
  "can i have": arasaac(7271), // Receiving / asking
  "look at this": arasaac(2474), // Looking / eyes
  look: arasaac(2474),
  "more please": arasaac(5508), // More
  more: arasaac(5508),
  "stop please": arasaac(2499), // Stop sign
  stop: arasaac(2499),
  "go to": arasaac(2432), // Walking / go
  go: arasaac(2432),
  "thank you": arasaac(4740), // Handshake / greeting
  thanks: arasaac(4740),
  yes: arasaac(5583), // Green checkmark / affirmative
  no: arasaac(5525), // Red cross / negative
  "i am": arasaac(2617), // Pointing to self
  "where is": arasaac(3418), // Question mark
  "what is that": arasaac(3418),
  "i like": arasaac(2418), // Thumbs up / like
  like: arasaac(2418),
  "i don't like": arasaac(2245), // Dislike
  "all done": arasaac(15475), // Finish / all done
  done: arasaac(15475),

  // Tools category
  hammer: arasaac(2922),
  scissors: arasaac(2591),
  glue: arasaac(2510),
  pencil: arasaac(2440),
  ruler: arasaac(2815),
  calculator: arasaac(5419),
  tape: arasaac(2325),
  eraser: arasaac(2409),
  paperclip: arasaac(2643),
  backpack: arasaac(2475),
  bag: arasaac(2475),
  notebook: arasaac(7142),
  folder: arasaac(3233),
  tablet: arasaac(2586),
  paintbrush: arasaac(2523),
  clock: arasaac(5561),

  // Emotion category
  happy: arasaac(3250),
  sad: arasaac(2606),
  angry: arasaac(2374),
  excited: arasaac(5903),
  tired: arasaac(2314),
  scared: arasaac(2261),
  calm: arasaac(3299),
  proud: arasaac(4660),
  silly: arasaac(2854),
  frustrated: arasaac(2374),
  loved: arasaac(4558),
  sick: arasaac(3308),
  surprised: arasaac(2574),
  confused: arasaac(2352),
  shy: arasaac(2484),
  hurt: arasaac(2367),

  // Attributes category
  big: arasaac(4658),
  small: arasaac(4716),
  hot: arasaac(2300),
  cold: arasaac(4652),
  fast: arasaac(5306),
  slow: arasaac(4676),
  good: arasaac(4581),
  bad: arasaac(4690),
  clean: arasaac(3351),
  dirty: arasaac(4750),
  loud: arasaac(2647),
  quiet: arasaac(5936),
  soft: arasaac(4578),
  hard: arasaac(4629),
  open: arasaac(4549),
  closed: arasaac(4596),
  up: arasaac(5388),
  down: arasaac(5355),
  out: arasaac(5475),
  same: arasaac(4667),
  different: arasaac(4628),

  // Sports category
  soccer: arasaac(3199),
  football: arasaac(3199),
  basketball: arasaac(5078),
  running: arasaac(2719),
  swimming: arasaac(2889),
  baseball: arasaac(2514),
  tennis: arasaac(3222),
  "jump rope": arasaac(5570),
  dancing: arasaac(2652),
  dance: arasaac(2652),
  playground: arasaac(2859),
  catch: arasaac(2269),
  "ride bike": arasaac(5517),
  bicycle: arasaac(2277),
  bike: arasaac(2277),
  gymnastics: arasaac(3106),
  skateboard: arasaac(2507),
  yoga: arasaac(3299),

  // Hygiene category
  "wash hands": arasaac(2443),
  "brush teeth": arasaac(2326),
  toilet: arasaac(2430),
  shower: arasaac(2370),
  "comb hair": arasaac(2512),
  comb: arasaac(2512),
  "wash face": arasaac(4939),
  "blow nose": arasaac(2887),
  "put on clothes": arasaac(2781),
  clothes: arasaac(2781),
  "drink water": arasaac(2276),
  water: arasaac(2248),
  sleep: arasaac(2369),
  "clean up": arasaac(2658),
  bandage: arasaac(3404),

  // Music category
  sing: arasaac(2315),
  guitar: arasaac(2417),
  piano: arasaac(2521),
  drums: arasaac(2578),
  drum: arasaac(2578),
  listen: arasaac(2381),
  song: arasaac(2315),
  bell: arasaac(5938),
  trumpet: arasaac(2607),
  violin: arasaac(2615),
  headphones: arasaac(5915),

  // Core words
  i: arasaac(2617),
  you: arasaac(2608),
  please: arasaac(4570),
  come: arasaac(2742),
  here: arasaac(5382),
  where: arasaac(3418),

  // Food
  milk: arasaac(2445),
  juice: arasaac(2624),
  apple: arasaac(2462),
  banana: arasaac(2530),
  bread: arasaac(2494),
  cookie: arasaac(2402),
  rice: arasaac(2259),
  chicken: arasaac(2404),
  snack: arasaac(4695),
  pizza: arasaac(2527),
  sandwich: arasaac(2281),
  fries: arasaac(2505),
  fruit: arasaac(4653),
  // "Say It For Me" full-sentence cards — explicit direct matches so the
  // sentence's core meaning wins instead of an unrelated filler word
  // (e.g. "I want to eat" would otherwise match generic "want" before "eat").
  "i want to eat": arasaac(4610), // food tray
  "i want to drink": arasaac(2248), // water/drink
  "i need the bathroom": arasaac(2430), // toilet
  "i am happy": arasaac(3250),
  "i am sad": arasaac(2606),
  "i am in pain": arasaac(2367), // hurt
  "i want to play": arasaac(2859), // playground/recess
  "i am sleepy": arasaac(2314), // tired
  "i want to go outside": arasaac(2859), // playground/recess
  "i love you": arasaac(4558), // loved
  "i am hungry": arasaac(4695), // snack
  "i am thirsty": arasaac(2248), // water/drink
  "thank you very much": arasaac(4740), // thank you
  "please help me": arasaac(4570), // help
  "i don't feel well": arasaac(3308), // sick
  "i want my mom": dictUrl("mother") || arasaac(2392),
  "i want my dad": dictUrl("father") || arasaac(2392),
  "can we go home": arasaac(2317), // house
  "i am scared": arasaac(2261),

  girl: arasaac(27509), // Full body standing girl (ARASAAC 27509)
  boy: arasaac(7176), // Full body standing boy (ARASAAC 7176)
  child: arasaac(7176),
  kid: arasaac(27509),
  student: arasaac(7176),
  pupil: arasaac(7176),
  man: arasaac(4665), // Full body standing man
  woman: arasaac(4703), // Full body standing woman
  father: arasaac(4665),
  mother: arasaac(4703),
  box: arasaac(7054), // Opened cardboard box so objects placed inside look natural
  "cardboard box": arasaac(7054),
  "open box": arasaac(7054),
  "opened cardboard box": arasaac(7054),
  "closed box": arasaac(37948),
  cat: arasaac(2406), // Original cat (ARASAAC 2406)
  dog: arasaac(2517),
  bird: arasaac(2490),
  fish: arasaac(2407),
  horse: arasaac(2408),
  cow: arasaac(2401),
  camel: arasaac(8522), // Camel / dromedary
  penguin: arasaac(2494),
  lion: arasaac(2409),
  monkey: arasaac(2410),
  rabbit: arasaac(2411),
  turtle: arasaac(10241),
  elephant: arasaac(2372),
  mouse: arasaac(2820),
  duck: arasaac(2563),
  snake: arasaac(2568),
  bear: arasaac(2868),
  tiger: arasaac(2590),
  frog: arasaac(2543),
  sheep: arasaac(2489),
  pig: arasaac(2327),
  butterfly: arasaac(2465),
  bee: arasaac(2239),
  eagle: arasaac(2638),
  kangaroo: arasaac(2313),
  whale: arasaac(2268),
  dolphin: arasaac(2732),
  shark: arasaac(2589),
  giraffe: arasaac(2437),
  zebra: arasaac(2324),
  goat: arasaac(2402),
  dinosaur: arasaac(2738),
  hippo: arasaac(2870),
  jellyfish: arasaac(3446),
  crab: arasaac(2672),
  snail: arasaac(2631),
  worm: arasaac(2636),
  owl: arasaac(2429),
  root: arasaac(3148),
  roots: arasaac(3148),
  stem: arasaac(3149),
  seed: arasaac(8689),
  seeds: arasaac(8689),
  plant: arasaac(2828),
  plants: arasaac(2828),
  cactus: arasaac(2975),
  leaves: arasaac(3114),
  soil: arasaac(37339),
  rock: arasaac(6883),
  rocks: arasaac(6883),
  lightning: arasaac(2819),
  thunder: arasaac(2819),
  snowman: arasaac(3131),
  frost: arasaac(3135),
  rainbow: arasaac(2986),
  magnet: arasaac(8138),
  battery: arasaac(8320),
  bulb: arasaac(2285),
  wire: arasaac(7351),
  shadow: arasaac(6649),
  sound: arasaac(27073),
  potato: arasaac(2503),
  potatoes: arasaac(2503),
  tomato: arasaac(2504),
  carrot: arasaac(2505),
  wood: arasaac(2793),
  metal: arasaac(8252),
  plastic: arasaac(7322),
  glass: arasaac(2610),
  door: arasaac(3244),
  honeybee: arasaac(2239),
  woodpecker: arasaac(2490),
  voice: arasaac(2381),
  sunset: arasaac(2798),
  sunlight: arasaac(2798),
  solar: arasaac(2798),
  wooden: arasaac(2793),
  concrete: arasaac(6883),
  aluminium: arasaac(8252),
  nylon: arasaac(5570),
  silk: arasaac(2781),
  woollen: arasaac(2781),
  pan: arasaac(2500),
  glow: arasaac(2285),
  magnetic: arasaac(8138),
  electromagnet: arasaac(8138),
  electric: arasaac(8320),
  doorbell: arasaac(5938),
  friction: arasaac(2339),
  pulling: arasaac(2719),
  pushing: arasaac(2719),
  table: arasaac(3129),
  bed: arasaac(2304),
  house: arasaac(2317),
  tree: arasaac(2256),
  car: arasaac(2339),
  bus: arasaac(2262),
  ball: arasaac(2269),
  balloon: arasaac(2408),
  balloons: arasaac(2408),
  flower: arasaac(3102),
  flowers: arasaac(3102),
  leaf: arasaac(3114),
  star: arasaac(2752),
  stars: arasaac(2752),
  moon: arasaac(2933),
  sun: arasaac(2798),
  cloud: arasaac(2883),
  clouds: arasaac(2883),
  kite: arasaac(2350),
  cake: arasaac(8706),
  cakes: arasaac(8706),
  bottle: arasaac(2288),
  hat: arasaac(2572),
  shoe: arasaac(32922),
  shoes: arasaac(32922),
  cup: arasaac(2582),
  key: arasaac(21851),
  phone: arasaac(36305),
  mat: arasaac(2346),
  wall: arasaac(2860),
  window: arasaac(2611),
  fence: arasaac(6651),

  // Habitats & Environments
  desert: arasaac(2734), // Golden sand dunes with sun
  ocean: arasaac(32699),
  sea: arasaac(2925),
  river: arasaac(2811),
  pond: arasaac(39264),
  forest: arasaac(2666),
  jungle: arasaac(3385),
  farm: arasaac(3337),
  beach: arasaac(2826),
  garden: arasaac(2434),
  mountain: arasaac(2909),
  lake: arasaac(6022),
  arctic: arasaac(7128),
  ice: arasaac(7128),
  snow: arasaac(3135),

  // Action verbs & dynamic subjects (high-pedagogical fidelity)
  crying: arasaac(35881), // Child crying with visible tears
  cry: arasaac(7147),
  "baby crying": arasaac(35881),
  "crying baby": arasaac(35881),
  "crying child": arasaac(35881),
  reading: arasaac(2447), // Child reading book
  read: arasaac(7141),
  "girl reading": arasaac(2447),
  "boy reading": arasaac(7141),
  "reading girl": arasaac(2447),
  "reading boy": arasaac(7141),
  run: arasaac(2719),
  "boy running": arasaac(2719),
  "girl running": arasaac(2719),
  sleeping: arasaac(2369), // Person sleeping peacefully
  "dog sleeping": arasaac(2369),
  "sleeping dog": arasaac(2369),
  "baby sleeping": arasaac(6060),
  flying: arasaac(2478), // Bird in flight with wings outstretched
  fly: arasaac(2478),
  "bird flying": arasaac(2478),
  "flying bird": arasaac(2478),
  swim: arasaac(2889),
  "fish swimming": arasaac(2407),
  "swimming fish": arasaac(2407),
  eating: arasaac(2349), // Person eating
  eat: arasaac(2349),
  "man eating": arasaac(2349),
  "girl eating": arasaac(2349),
  drinking: arasaac(2276), // Drinking glass
  drink: arasaac(2276),
  jumping: arasaac(2804), // Person jumping in air
  jump: arasaac(2804),
  "cat jumping": arasaac(2804),
  walking: arasaac(2432), // Person walking
  walk: arasaac(2432),
  "turtle walking": arasaac(2432),
  singing: arasaac(2315),
  "girl singing": arasaac(2315),
  kicking: arasaac(3199), // Child kicking soccer ball
  kick: arasaac(3199),
  laughing: arasaac(13354),
  laugh: arasaac(13354),
  "baby laughing": arasaac(13354),
  "girl laughing": arasaac(13354),
  smiling: arasaac(13354),
  smile: arasaac(13354),
  writing: arasaac(2380), // Hand writing with pencil
  write: arasaac(2380),
  "man writing": arasaac(2380),
  drawing: arasaac(2523),
  draw: arasaac(2523),
  climbing: arasaac(8226), // Person climbing
  climb: arasaac(8226),
  "boy climbing": arasaac(8226),
  driving: arasaac(2339),
  drive: arasaac(2339),
  "man driving": arasaac(2339),
  washing: arasaac(2443),
  wash: arasaac(2443),
  brushing: arasaac(2326),
  brush: arasaac(2326),
  cooking: arasaac(2547),
  cook: arasaac(2547),
  "woman cooking": arasaac(2547),
  praying: arasaac(3345),
  pray: arasaac(3345),
  hiding: arasaac(2474),
  hide: arasaac(2474),
  looking: arasaac(2474),
  standing: arasaac(27509),
  stand: arasaac(27509),
  sitting: arasaac(3155),
  sit: arasaac(3155),
  fuse: arasaac(27284),
  crescent: arasaac(2840),
  gravity: arasaac(27457),
  ozone: arasaac(32752),
  sonar: arasaac(2470),
  fibre: arasaac(4610),
  tract: arasaac(10077),
  digestive: arasaac(10077),
  capillaries: arasaac(36187),
  capillary: arasaac(36187),
  voltmeter: arasaac(5419),
  meter: arasaac(5419),
  meters: arasaac(5419),
  station: arasaac(2462),
  satellite: arasaac(2462),
  satellites: arasaac(2462),
  mound: arasaac(2831),
  termite: arasaac(2505),
  sneeze: arasaac(31086),
  sneezing: arasaac(31086),
  villi: arasaac(10077),
  peristalsis: arasaac(10077),
  puppy: arasaac(2362),
  kitten: arasaac(2364),
  seedling: arasaac(2838),
  lamb: arasaac(2390),
  calf: arasaac(2388),
  foal: arasaac(2389),
  chick: arasaac(2387),
  duckling: arasaac(2391),
  cub: arasaac(28247),
};

/**
 * Get authentic vector pictogram URL for any AAC card, button or category.
 * Prioritizes high-definition ARASAAC pictograms, falls back to dictionary or word extraction.
 */
export function getPictogramUrl(label: string): string | null {
  if (!label) return null;
  const lower = label.toLowerCase().trim();

  // 1. Direct match in curated AAC pictogram map
  if (AAC_PICTOGRAM_MAP[lower]) return AAC_PICTOGRAM_MAP[lower];

  // 2. Exact match in bundled ARASAAC 14,800 dictionary
  const dictHit = dictUrl(lower);
  if (dictHit) return dictHit;

  // 3. Try singular form
  if (lower.endsWith("ies") && lower.length > 4) {
    const s = lower.slice(0, -3) + "y";
    if (AAC_PICTOGRAM_MAP[s]) return AAC_PICTOGRAM_MAP[s];
    const hit = dictUrl(s);
    if (hit) return hit;
  }
  if (lower.endsWith("es") && lower.length > 3) {
    const s = lower.slice(0, -2);
    if (AAC_PICTOGRAM_MAP[s]) return AAC_PICTOGRAM_MAP[s];
    const hit = dictUrl(s);
    if (hit) return hit;
  }
  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) {
    const s = lower.slice(0, -1);
    if (AAC_PICTOGRAM_MAP[s]) return AAC_PICTOGRAM_MAP[s];
    const hit = dictUrl(s);
    if (hit) return hit;
  }

  // 4. Try base verb form if ending in -ing (e.g. crying -> cry, sleeping -> sleep)
  if (lower.endsWith("ing") && lower.length > 5) {
    const stems = [lower.slice(0, -3), lower.slice(0, -3) + "e"];
    if (lower[lower.length - 4] === lower[lower.length - 5]) stems.push(lower.slice(0, -4)); // running -> run
    for (const stem of stems) {
      if (AAC_PICTOGRAM_MAP[stem]) return AAC_PICTOGRAM_MAP[stem];
      const stemHit = dictUrl(stem);
      if (stemHit) return stemHit;
    }
  }

  // 5. Try individual meaningful words from a multi-word phrase
  const words = lower.split(/[\s,·\-_]+/).filter((w) => w.length > 2);
  for (const w of words) {
    if (AAC_PICTOGRAM_MAP[w]) return AAC_PICTOGRAM_MAP[w];
    const hit = dictUrl(w);
    if (hit) return hit;
  }

  return null;
}
