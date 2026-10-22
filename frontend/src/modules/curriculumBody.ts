import type { Chapter, ChapterPart, Lesson } from "./curriculum";

/**
 * Grade 3 Science · Human Body and Senses — from the client's "Grade 3 Human Body and Senses: Video-Ready Lesson Script"
 * (Skeletons and protection, muscles and movement, the 5 senses, teeth and dental care, nutrition and healthy living).
 * 5 Parts, each combining its sentences into an educational summary paragraph lesson.
 */

const P = (en: string, ar: string, from: number, serves: string): ChapterPart => ({ title: { en, ar }, from, serves });

export const SC3_BODY_PARTS: ChapterPart[] = [
  P("The skeleton and bones", "الهيكل العظمي والعظام", 0, "Saudi Unit 1; Cambridge 3Bs.02 (skeletons and protection); English NC Year 3 (animals and humans)"),
  P("Muscles and movement", "العضلات والحركة", 1, "Saudi Unit 1; Cambridge 3Bs.02 (muscles and movement); Oxford Module 1"),
  P("The five senses", "الحواس الخمس", 2, "Saudi Living things; Cambridge 3Bp.01; English NC Year 3 (sensory organs)"),
  P("Teeth and oral health", "الأسنان وصحة الفم", 3, "Oxford Module 1 (teeth types and dental care); English NC Year 4; Dentist clinic scenes"),
  P("Healthy nutrition and caring for our body", "التغذية الصحية والعناية بالجسم", 4, "Saudi Unit 1; Balanced family meals, hygiene and growth"),
];

export const SC3_BODY_LESSONS: Lesson[] = [
  {
    id: "sc3-body-001",
    say: "The human skeleton is made of hard, strong bones inside the body. The skeleton supports our body so we can stand up tall and straight. Without bones, our body would be soft like jelly. The hard skull surrounds and protects our delicate brain. The ribcage wraps around our chest to protect our heart and lungs. The long spine runs down our back and lets us bend, twist and turn. A child has smaller bones that grow longer and stronger each year. Drinking milk and eating healthy food gives our bones calcium to stay strong.",
    question: "What does the skeleton do and what protects the brain and heart?",
    answer: "The skeleton supports the body, the skull protects the brain, and the ribs protect the heart and lungs",
    draw: "a clear anatomical outline of a child's body showing the friendly labelled skeleton with skull, ribcage, spine, and arm and leg bones",
    video: "An animated view showing the human skeleton inside a child's body outline: the skull protecting the brain, ribs guarding the heart, and spine bending gracefully.",
  },
  {
    id: "sc3-body-002",
    say: "Muscles are attached to bones to help our body move. When we run and jump on the playground, our muscles do the hard work. Muscles work in pairs by pulling on bones, but muscles never push. When one muscle contracts and gets shorter, it bends our arm. When the other muscle contracts, it pulls our arm straight again. Strong heart muscle pumps blood day and night without stopping. Regular exercise makes our muscles, heart and lungs stronger. Stretching after playing keeps our muscles flexible and healthy.",
    question: "How do muscles help our bones move?",
    answer: "Muscles work in pairs by contracting and pulling on bones",
    draw: "two cheerful children running and playing on a school playground, with an inset diagram showing arm muscles bending and straightening",
    video: "A child running across a sunny playground, with a clear cutaway showing leg and arm muscles contracting and pulling bones to create movement.",
  },
  {
    id: "sc3-body-003",
    say: "We learn about the world around us using our five senses. Our eyes sense light, shapes and bright colours so we can see. Our ears detect sounds, music and voices from near and far. Our nose smells fresh flowers, warm bread and warning smells like smoke. Our tongue has tiny taste buds that taste sweet, salty, sour and bitter flavours. Our skin covers our whole body and feels touch, warmth, cold and texture. The brain receives messages from all five senses and helps us understand them.",
    question: "What are the five senses and their organs?",
    answer: "Eyes for sight, ears for hearing, nose for smell, tongue for taste, and skin for touch",
    draw: "a child in a bright classroom observing nature: looking through a magnifying glass, listening to a bell, smelling a flower, tasting an apple, and touching a soft leaf",
    video: "A child exploring with the senses: looking at colourful drawings, listening to a chime, smelling fragrant mint, and feeling smooth pebbles.",
  },
  {
    id: "sc3-body-004",
    say: "Teeth help us bite, chew and break down our food. Sharp front incisors cut food into small pieces. Pointed canine teeth tear chewy food. Flat back molars grind and crush food so we can swallow safely. Young children have twenty milk teeth that fall out as thirty-two adult teeth grow in. Visiting the dentist's clinic helps keep our teeth and gums healthy. Brushing teeth twice every day with fluoride toothpaste washes away food and germs. Limiting sugary snacks and sticky sweets prevents tooth decay and cavities.",
    question: "What are the different types of teeth and how do we keep them healthy?",
    answer: "Incisors cut, canines tear, and molars grind food; brushing twice daily keeps them healthy",
    draw: "a friendly dental clinic showing a cheerful child smiling with clean white teeth, next to a diagram of incisors, canines, and molars",
    video: "A friendly dentist showing a child how to brush all sides of teeth in gentle circles, followed by a sparkling smile.",
  },
  {
    id: "sc3-body-005",
    say: "Our body needs good care, healthy nutrition and rest to grow strong. Eating a balanced meal of rice, chicken, fresh vegetables, dates and laban gives us energy. Drinking plenty of clean water every day keeps our body hydrated and cool. Washing our hands with soap and water before meals washes away harmful germs. Getting ten hours of restful sleep every night helps our body repair itself and helps our brain learn. Taking care of our body every day keeps us active, happy and healthy.",
    question: "What does our body need to stay strong, healthy and active?",
    answer: "A balanced diet, plenty of water, clean hygiene, daily exercise, and good sleep",
    draw: "a welcoming family dinner table with bowls of rice, roasted chicken, fresh salad, dates, and cool glasses of laban and water",
    video: "A family enjoying a wholesome meal together with dates and laban, followed by a child washing hands thoroughly with soap at a clean sink.",
  },
];

export const SC3_BODY: Chapter = {
  id: "sc3-body",
  title: {
    en: "Human Body and Senses",
    ar: "جسم الإنسان والحواس",
  },
  summary: {
    en: "Skeleton, muscles, five senses, teeth and healthy habits",
    ar: "الهيكل العظمي والعضلات والحواس الخمس والأسنان والعناية بالجسم",
  },
  parts: SC3_BODY_PARTS,
  lessons: SC3_BODY_LESSONS,
};

