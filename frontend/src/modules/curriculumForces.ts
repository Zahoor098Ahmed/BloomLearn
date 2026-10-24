import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Forces, Motion and Friction
 * From the client's "Forces, Motion and Friction — Grade 3 Video-Ready Summary"
 * (Saudi MOE Grade 4, Oxford Stage 3, Cambridge 3Pf.01–04, McGraw Hill Inspire Science).
 * 7 Parts, combining all 75 sentences into 7 paragraph lessons.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_FORCES_PARTS: ChapterPart[] = [
  P("Position and motion", "الموقع والحركة", 0, "Saudi MOE G4 L1; McGraw Hill L1 (3-PS2-2)"),
  P("Forces are pushes and pulls", "القوة دفع أو سحب", 1, "Saudi MOE L1; Oxford Pushes and pulls; McGraw Hill L2 (3-PS2-1)"),
  P("What forces do", "ماذا تفعل القوى", 2, "Saudi MOE L1–L2; Oxford Module 4; McGraw Hill L2"),
  P("Measuring forces", "قياس القوى", 3, "Saudi MOE L1–L2; Oxford Make a forcemeter; Cambridge 3Pf.01"),
  P("Gravity and weight", "الجاذبية والوزن", 4, "Saudi MOE L1–L2; Cambridge 3Pf.02; McGraw Hill L2"),
  P("Friction", "الاحتكاك", 5, "Saudi MOE L1–L2; Oxford surfaces and grip; Cambridge 3Pf.03–04"),
  P("Speed, acceleration and inertia", "السرعة والتسارع والقصور الذاتي", 6, "Saudi MOE Grade 4 extension"),
];

export const SC3_FORCES_LESSONS: Lesson[] = [
  {
    id: "sc3-forces-001",
    say: "A red ball rests on top of a table, and that spot is the ball's position. A cat sleeps under a chair, next to a green rug. A girl stands to the left of a tree, and a boy stands to its right. A boy finds his school bag by a big tree, using the tree as a reference point. A toy car rolls from the door to the window, and this change in position is motion. A girl measures the distance from the door to the window with a tape measure. A train moves along a straight track in a straight line. A merry-go-round turns round and round in a circle. A rabbit hops across a field in a zigzag path. A girl on a swing moves back and forth in the same pattern again and again. Two children on a see-saw go up and down, one after the other. A marble rolls back and forth inside a round bowl. A boy watches a swing move back and forth and predicts where the swing will go next. A cheetah runs across the grass at a very high speed. A tortoise walks slowly across the grass at a very low speed. Two children run the same distance, and the faster child reaches the finish line first.",
    question: "What is motion?",
    answer: "Motion is a change in position, like a toy car rolling from the door to the window",
    draw: "a sunny playground showing motion: a train on a straight track, a merry-go-round turning in a circle, a girl on a swing moving back and forth and a cheetah running fast",
    video: "A toy car rolls slowly from the door to the window across a bright room; then a girl swings back and forth on a playground swing.",
  },
  {
    id: "sc3-forces-002",
    say: "A girl pushes a shopping trolley, and the trolley rolls away from her. A boy pulls a wagon by its handle, and the wagon rolls toward him. A boy pushes a door shut, and the door moves away from him. A girl pulls a drawer open, and the drawer moves toward her. A boy kicks a football across the field, and his kick is a push force. A horse pulls a cart along a sandy road, and the horse's pull is a force. A girl in a wheelchair pushes on her wheels, and the wheelchair rolls forward. A tow truck pulls a heavy car using a large force. A girl picks up a light feather using a very small force. A girl gives a ball a gentle push, and the ball rolls a short way. A girl gives a ball a hard push, and the ball rolls a long way. A boy pushes a toy car to the left, and the car rolls in that direction.",
    question: "What is a force?",
    answer: "A force is a push or a pull, and every force has a size and a direction",
    draw: "pushes and pulls: a girl pushing a shopping trolley away from her, a boy pulling a red wagon toward him by its handle, and a horse pulling a cart on a sandy road",
    video: "A girl pushes a shopping trolley and it rolls away from her; then a boy pulls a red wagon by its handle and it rolls toward him.",
  },
  {
    id: "sc3-forces-003",
    say: "A boy pushes a toy car that is standing still, and the car starts moving. A girl pedals her bicycle harder, and the bicycle speeds up. A boy squeezes his bicycle brakes, and the bicycle slows down. A goalkeeper catches a rolling football, and the ball stops. A tennis player hits the ball back over the net, and the ball changes direction. A football sits still on the grass until a boy kicks the football. A ball keeps rolling across the floor until a girl's hand stops the ball. Two equal teams pull a tug-of-war rope, and the rope stays still with balanced forces. Two boys push a box from opposite sides equally hard, and the box does not move. One tug-of-war team pulls harder, and the rope moves toward that team with unbalanced forces. A girl squashes a ball of clay flat, and the clay changes shape. A boy stretches a rubber band with his fingers, and the band gets longer. A girl twists a roll of play dough into a spiral shape.",
    question: "What can a force do to an object?",
    answer: "A force can make an object start moving, speed up, slow down, stop, change direction or change shape",
    draw: "a tug-of-war between two teams on a school field, a goalkeeper catching a football, and a girl squashing a ball of clay flat",
    video: "Two equal teams pull a tug-of-war rope and it stays still; then one team pulls harder and the rope slowly moves toward them.",
  },
  {
    id: "sc3-forces-004",
    say: "A girl hooks her school bag onto a spring scale called a forcemeter. A bag pulls down on a spring forcemeter, and the pointer slides along the number scale. A boy hangs a book on a spring forcemeter and reads 5 newtons on the scale. A small apple hanging on a spring forcemeter pulls with about 1 newton. Two spring forcemeters hang side by side, and the one holding a heavy bag stretches further. A girl pulls a wooden block across a table with a spring forcemeter to measure the pull.",
    question: "What measures a force, and in what unit?",
    answer: "A forcemeter, a spring scale, measures a force in newtons",
    draw: "a classroom forcemeter (spring scale) hanging from a hook with a school bag pulling it down, the pointer on the number scale, and a small apple on a second forcemeter",
    video: "A girl hooks her school bag onto a spring forcemeter and the pointer slides slowly down the number scale.",
  },
  {
    id: "sc3-forces-005",
    say: "An apple falls from a tree to the ground because gravity pulls the apple down. A boy throws a ball up into the air, and gravity pulls the ball back down. A ball falls from a girl's open hand, and gravity pulls the ball down without touching it. A teacher sticks figures around a globe to show gravity pulls toward the Earth's centre. Gravity pulls a rice bag down on a spring forcemeter, and that pull is its weight. A leaf falls more slowly than an apple because air pushes up against the wide, light leaf. An astronaut bounces high on the Moon, where gravity is weaker than on Earth.",
    question: "Why does an apple fall from a tree to the ground?",
    answer: "Gravity pulls the apple down toward the Earth's centre",
    draw: "a red apple falling from a green tree to the ground, a boy throwing a ball up into the air, and an astronaut bouncing high on the grey Moon",
    video: "A red apple drops slowly from a tree branch onto the grass; then a boy throws a ball up and it falls back into his hands.",
  },
  {
    id: "sc3-forces-006",
    say: "A wooden block rubs across sandpaper, and the force between the two rubbing surfaces is friction. A book slides across a table, then slows down and stops because of friction. A boy pushes a box across a rough carpet, and friction makes the box hard to move. A toy car rolls a long way across a smooth wooden floor, with little friction. A toy car rolls only a short way across a rough carpet, with more friction. Children test how far a toy car rolls from a ramp onto different surfaces. An ice skater glides a long way across smooth ice because there is very little friction. Bumpy rubber soles grip the ground, and friction stops a girl from slipping as she runs. Bicycle brakes rub against the wheel, and friction slows the bicycle down. A girl walks slowly across a wet, slippery floor because water makes friction smaller. Wheels let a man pull a heavy suitcase easily, because rolling makes less friction than sliding. A man oils a squeaky bicycle chain so that the chain moves smoothly with less friction. A boy rubs his hands together quickly on a cold day, and friction makes his hands warm.",
    question: "What is friction, and which surface makes more friction?",
    answer: "Friction is the force between two rubbing surfaces, and a rough surface like carpet makes more friction than a smooth one",
    draw: "a friction test: a toy car rolling down a ramp far across a smooth wooden floor and only a short way across a rough carpet, with an ice skater gliding in the corner",
    video: "Children let a toy car roll down a ramp; it travels far across a smooth wooden floor, then only a short way across a rough carpet.",
  },
  {
    id: "sc3-forces-007",
    say: "A boy runs 50 metres in 10 seconds, so his speed is 5 metres every second. A car drives west toward the setting sun at 50 kilometres an hour, which is its velocity. A bicycle goes faster and faster down a gentle hill, and the change in speed is acceleration. A car at a steady speed still accelerates around a bend, because its direction changes. A girl quickly pulls paper from under a bowl, and inertia keeps the bowl in place. When a car brakes, inertia keeps a boy's body moving, and his seat belt holds him. A girl pushes a football and a bowling ball equally hard, and the football rolls farther. A heavy bowling ball has more mass, so a man must push harder to roll it.",
    question: "What is acceleration?",
    answer: "Acceleration is a change in speed or direction, like a bicycle going faster and faster down a hill",
    draw: "a boy running 50 metres on a school track, a bicycle speeding down a gentle hill, and a car driving west toward the setting sun",
    video: "A bicycle rolls faster and faster down a gentle hill; then a girl quickly pulls a sheet of paper from under a bowl and the bowl stays in place.",
  },
];

export const SC3_FORCES: Chapter = {
  id: "sc3-forces",
  title: { en: "Forces, Motion and Friction", ar: "القوى والحركة والاحتكاك" },
  summary: {
    en: "Position and motion, pushes and pulls, measuring forces, gravity, friction and speed",
    ar: "الموقع والحركة والدفع والسحب وقياس القوى والجاذبية والاحتكاك والسرعة",
  },
  parts: SC3_FORCES_PARTS,
  lessons: SC3_FORCES_LESSONS,
};
