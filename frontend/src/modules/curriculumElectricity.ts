import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Electricity and Magnetism
 * From the client's "Electricity and Magnetism — Grade 3 Video-Ready Summary"
 * (Saudi MOE, Oxford, Cambridge 3Pe.01–03, McGraw Hill Inspire Science).
 * 7 Parts plus the chapter recap: all 80 sentences in 8 paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_ELECTRICITY_PARTS: ChapterPart[] = [
  P("Electricity in daily life", "الكهرباء في حياتنا اليومية", 0, "Saudi MOE"),
  P("Static electricity and lightning", "الكهرباء الساكنة والبرق", 1, "McGraw Hill; Saudi MOE"),
  P("Simple circuits", "الدوائر الكهربائية البسيطة", 2, "Saudi MOE; Oxford as Stage 2 review"),
  P("Conductors and insulators", "الموصلات والعوازل", 3, "Saudi MOE (to confirm)"),
  P("Magnets", "المغانط", 4, "Cambridge 3Pe.01–03; Oxford; McGraw Hill"),
  P("Magnetic force, compasses and electromagnets", "القوة المغناطيسية والبوصلة والمغناطيس الكهربائي", 5, "McGraw Hill; Cambridge and Oxford for sentences 1–4"),
  P("Electricity safety", "السلامة من الكهرباء", 6, "Saudi MOE (to confirm); safe habits for every child"),
  P("Chapter recap", "مراجعة الفصل", 7, "End-of-chapter review of Parts 1–7"),
];

export const SC3_ELECTRICITY_LESSONS: Lesson[] = [
  {
    id: "sc3-electricity-001",
    say: "A girl presses a light switch, and the ceiling lights in her bedroom turn on. Electricity is a form of energy that makes a lamp glow, a fan spin and a television play. A power station makes electricity that travels along thick cables on tall towers to a city. An adult plugs a toaster into a wall socket, and electricity flows into the toaster. A desk lamp changes electricity into light that shines on a child's homework. An electric kettle changes electricity into heat, and the water inside bubbles and steams. An electric fan changes electricity into motion, and its spinning blades cool a boy's face. A small radio changes electricity into sound, and a family listens to a story together. A battery inside a toy car gives the car electricity, and the car drives across the floor.",
    question: "What is electricity, and what can it change into?",
    answer: "Electricity is a form of energy that changes into light in a lamp, heat in a kettle, motion in a fan and sound in a radio",
    draw: "a bright family home where a desk lamp glows, a fan spins, a kettle steams, a radio plays and a toy car with a battery drives across the floor",
    video: "A girl presses a light switch and her bedroom ceiling lights turn on; then a desk lamp glows, a fan spins gently and a kettle steams in a calm kitchen.",
  },
  {
    id: "sc3-electricity-002",
    say: "A boy rubs a balloon on his hair, and his hair lifts up toward the balloon. Rubbing a balloon on hair moves tiny electric charges from the hair onto the balloon. A rubbed balloon and a child's hair pull toward each other because they carry opposite charges. Two rubbed balloons hanging on strings swing apart because both balloons carry the same charge. A rubbed balloon sticks to a classroom wall, held in place by static electricity. A rubbed plastic comb held above a table makes tiny pieces of paper jump up to the comb. A boy walks across a carpet, touches a metal door handle and sees one tiny spark jump. Lightning is a giant spark of static electricity that jumps between a storm cloud and the ground.",
    question: "What happens when a boy rubs a balloon on his hair?",
    answer: "Tiny electric charges move onto the balloon, so the balloon and the hair pull toward each other with static electricity",
    draw: "a smiling boy rubbing a red balloon on his hair so his hair lifts up toward it, a second balloon stuck to a classroom wall, and a distant lightning bolt through a window",
    video: "A boy rubs a balloon on his hair and slowly lifts it away as his hair rises toward the balloon; then the balloon sticks to a classroom wall.",
  },
  {
    id: "sc3-electricity-003",
    say: "On a classroom table, a rubbed balloon holds static electricity and a battery circuit carries current electricity. A simple electric circuit on a desk joins a battery, two wires and a light bulb in one loop. In a science animation, glowing dots move along the wires to show electric current flowing around a circuit. A light bulb glows brightly when two wires connect it to both ends of a battery. A girl unclips one wire from a battery, and the light bulb in the circuit goes dark. A circuit joined all the way around is a closed circuit, and its light bulb glows. A circuit with a gap in its wire is an open circuit, and its light bulb stays dark. A classroom circuit switch has a small metal lever that opens and closes a gap in the circuit. A boy presses a circuit switch down, the circuit closes, and the light bulb lights up. A boy lifts a circuit switch up, the circuit opens, and the light bulb goes dark. A battery, wires and a small motor make a circuit that spins a paper propeller. A flashlight holds batteries, a switch and a light bulb in one circuit inside its case.",
    question: "When does the light bulb in a circuit glow?",
    answer: "The light bulb glows in a closed circuit, when the battery, wires and switch are joined all the way around in one loop",
    draw: "a simple classroom circuit on a desk: a battery, two wires, a switch and a glowing light bulb joined in one loop, with glowing dots moving along the wires",
    video: "A boy presses a circuit switch down and the light bulb lights up; he lifts the switch and the bulb goes dark, while glowing dots show the current moving around the loop.",
  },
  {
    id: "sc3-electricity-004",
    say: "A girl places a metal spoon across a gap in a circuit, and the light bulb glows. Shiny copper inside a wire is a good electrical conductor that carries electricity easily. A boy places a plastic ruler across a gap in a circuit, and the light bulb stays dark. Plastic blocks electricity, so a plastic ruler is an electrical insulator. Wood, rubber, glass and plastic are electrical insulators that block electricity. A wire has a copper conductor inside and a plastic insulator coat around the outside. An electrician wears thick rubber gloves because rubber blocks electricity from reaching the hands. Children test a key, a coin, an eraser and a wooden block in a circuit to sort conductors from insulators.",
    question: "What is the difference between an electrical conductor and an electrical insulator?",
    answer: "A conductor like a metal spoon or copper carries electricity, while an insulator like plastic, rubber or wood blocks electricity",
    draw: "a circuit test on a classroom table: a metal spoon across the gap makes the light bulb glow, a plastic ruler across the gap keeps it dark, and a cut wire shows copper inside a plastic coat",
    video: "A girl places a metal spoon across the gap in a circuit and the light bulb glows; then a boy swaps in a plastic ruler and the bulb stays dark.",
  },
  {
    id: "sc3-electricity-005",
    say: "A red horseshoe magnet pulls metal paper clips across a wooden table. A magnet attracts a steel paper clip, and the paper clip jumps onto the magnet. A magnet slides past a wooden block, a plastic cup and a rubber eraser, and all three stay still. A magnet slides past an aluminum drink can and a copper pipe, and both metals stay still. Iron and steel are magnetic metals, while aluminum, copper and gold are non-magnetic metals. A bar magnet has a red end called the north pole and a blue end called the south pole. Iron filings sprinkled near a bar magnet gather thickly at both poles, where the pull is strongest. Two bar magnets push apart when their red north poles face each other. Two bar magnets push apart when their blue south poles face each other. A red north pole and a blue south pole snap together when two bar magnets come close. Matching poles of two magnets push apart, and different poles pull together. A toy car with a magnet on top rolls away when another magnet's matching pole comes near.",
    question: "Which metals does a magnet attract, and what do the poles of two magnets do?",
    answer: "A magnet attracts iron and steel; matching poles push apart and different poles pull together",
    draw: "a red horseshoe magnet pulling steel paper clips across a wooden table, beside two bar magnets with red north and blue south poles snapping together",
    video: "A red horseshoe magnet slides over a wooden table and steel paper clips jump onto it, while a plastic cup and a wooden block stay still.",
  },
  {
    id: "sc3-electricity-006",
    say: "A paper clip on a thread floats in midair, pulled up by a magnet just above the clip. A boy moves a magnet slowly toward a paper clip, and the paper clip jumps across the last small gap. A magnet under a sheet of paper drags a paper clip across the top of the paper. A fridge magnet holds a child's drawing on the refrigerator door. Two magnets stacked together lift a longer chain of paper clips than one magnet alone. Iron filings sprinkled on paper over a bar magnet form curved lines that show the magnetic field. A compass needle is a tiny magnet that turns to point north. Earth behaves like a giant magnet, so a hiker's compass needle swings to point north. A magnetic latch holds a cupboard door shut until a child pulls the door open. A magnet on a garden gate snaps the gate shut against a metal post. An electromagnet made from an iron nail, coiled wire and a battery picks up paper clips. A teacher unclips the battery from an electromagnet holding paper clips, and the clips drop onto the desk. A giant electromagnet on a crane lifts scrap metal at a recycling yard.",
    question: "Why does a compass needle point north?",
    answer: "A compass needle is a tiny magnet, and Earth behaves like a giant magnet, so the needle turns to point north",
    draw: "a hiker holding a compass whose needle points north, iron filings forming curved lines around a bar magnet, and a crane electromagnet lifting scrap metal",
    video: "A paper clip on a thread floats in midair under a magnet; then a hiker's compass needle swings slowly and settles pointing north.",
  },
  {
    id: "sc3-electricity-007",
    say: "Water carries electricity, so a girl dries her wet hands before she switches on a lamp. An adult unplugs a lamp by gripping the plastic plug firmly. A girl asks an adult to plug in her tablet charger at a wall socket. Wall-socket electricity is very strong, so adults look after plugs, sockets and cables at home. Children build school circuits with small batteries, which are safe to use in experiments. A boy shows his mother a lamp cable with a cracked cover, and she unplugs the lamp. Children fly kites in an open park, far away from overhead power lines. During a thunderstorm, a family waits safely indoors until the lightning has passed.",
    question: "How do children stay safe around electricity?",
    answer: "Children dry their wet hands, ask an adult to handle plugs and sockets, and fly kites far away from power lines",
    draw: "electricity safety at home: a girl drying her hands with a towel before touching a lamp switch, a parent holding a plastic plug, and children flying kites in an open park",
    video: "A girl dries her wet hands on a towel before switching on a lamp; then children fly kites in a wide open park far from any power lines.",
  },
  {
    id: "sc3-electricity-008",
    say: "Electricity is energy that lights lamps, spins fans and powers toys around the house. Static electricity builds up on a rubbed balloon and makes the balloon stick to a wall. Current electricity flows around a closed circuit of a battery, wires, a switch and a light bulb. Metals are electrical conductors, while plastic, rubber and wood are electrical insulators. Magnets attract iron and steel objects, such as nails and paper clips. A bar magnet has two ends called poles: a north pole and a south pole. Two magnets pull together when different poles meet and push apart when matching poles meet. A magnet pulls a paper clip through a sheet of paper and across a small gap of air. A compass needle points north because Earth behaves like a giant magnet. Children stay safe by drying their hands, asking adults to handle plugs and flying kites far from power lines.",
    question: "What does current electricity flow around?",
    answer: "Current electricity flows around a closed circuit of a battery, wires, a switch and a light bulb",
    draw: "a recap board: a glowing circuit with a battery and light bulb, a balloon stuck to a wall, a bar magnet holding paper clips and a compass pointing north",
    video: "A calm montage: a lamp glows, a balloon sticks to a wall, a circuit's light bulb lights up and a magnet lifts a chain of paper clips.",
  },
];

export const SC3_ELECTRICITY: Chapter = {
  id: "sc3-electricity",
  title: { en: "Electricity and Magnetism", ar: "الكهرباء والمغناطيسية" },
  summary: {
    en: "Electricity at home, static electricity, circuits, conductors, magnets, compasses and safety",
    ar: "الكهرباء في البيت والكهرباء الساكنة والدوائر والموصلات والمغانط والبوصلة والسلامة",
  },
  parts: SC3_ELECTRICITY_PARTS,
  lessons: SC3_ELECTRICITY_LESSONS,
};
