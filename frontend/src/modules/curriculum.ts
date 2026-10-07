import type { LanguageCode, SceneGraph } from "../types";
import { parseSceneGraph } from "./sentenceScene";
import { parseMath, parseWordProblem, storyWithoutQuestion } from "./mathScene";

/**
 * School content for Picture Talk: subject → grade (1–5) → chapter → lessons.
 *
 * Chapter topics follow Pakistan's Single National Curriculum (SNC 2020) for
 * Grades 1–5 and the Cambridge Primary curriculum framework (English,
 * Mathematics, Science). The lesson sentences and questions are written for
 * BloomLearn — they are not copied from any textbook (Oxford, Cambridge or
 * board books), so schools should check them against their own book.
 *
 * Each lesson has an English sentence (`say`) that the picture engine draws,
 * and may carry a question / answer. Sentences stay in English because the
 * on-device picture engine reads English, and stick to what it can draw:
 * counts up to 5, one thing + one place ("the cat is under the table"),
 * colours, sizes, actions, body parts, everyday nouns and the science
 * concepts. Math sums ("2 apples + 1 apple", "3 × 2 apples", "10 ÷ 2 candies")
 * are drawn as counting pictures by MathStage (see mathScene.ts). Bigger Math
 * word problems show the things in the story; the question carries the numbers.
 */

export type SubjectId = "english" | "math" | "science";
export type Grade = 1 | 2 | 3 | 4 | 5;
export const GRADES: Grade[] = [1, 2, 3, 4, 5];

type Text = { en: string; ar: string };

export interface Lesson {
  /** English sentence the picture engine draws. */
  say: string;
  /** Optional question shown above the picture (e.g. "2 + 1 = ?"). */
  question?: string;
  /** Answer revealed on tap. */
  answer?: string;
  /**
   * Exact scene for the AI picture, when the sentence alone would draw the
   * wrong thing ("Invertebrates do not have a backbone" → a worm, a snail…).
   * It never paints or labels the answer to the lesson's question.
   */
  draw?: string;
}

export interface Chapter {
  id: string;
  title: Text;
  summary: Text;
  lessons: Lesson[];
}

export interface Subject {
  id: SubjectId;
  title: Text;
  /** Extra words for AI pictures so each subject gets its own kind of image. */
  imageStyle: string;
  grades: Partial<Record<Grade, Chapter[]>>;
}

const say = (...sentences: string[]): Lesson[] => sentences.map((s) => ({ say: s }));
const qa = (sentence: string, question: string, answer: string, draw?: string): Lesson => ({ say: sentence, question, answer, draw });
const sd = (sentence: string, draw: string): Lesson => ({ say: sentence, draw });
const ch = (id: string, en: string, ar: string, sumEn: string, sumAr: string, lessons: Lesson[]): Chapter => ({
  id,
  title: { en, ar },
  summary: { en: sumEn, ar: sumAr },
  lessons,
});

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

const ENGLISH: Subject = {
  id: "english",
  title: { en: "English", ar: "اللغة الإنجليزية" },
  imageStyle: "picture-book illustration for an English lesson that clearly shows every object and where it is",
  grades: {
    1: [
      ch("en1-prepositions", "Prepositions", "حروف الجر", "on · under · inside · behind", "on · under · inside · behind", say(
        "The cat is on the table",
        "The ball is under the chair",
        "The apple is inside the box",
        "The dog is behind the tree",
        "The girl is in front of the house",
        "The book is beside the bag",
        "The bird is above the tree",
      )),
      ch("en1-nouns", "Naming words", "كلمات التسمية", "people · animals · things", "أشخاص · حيوانات · أشياء", [
        qa("A girl", "Is it a person, an animal or a thing?", "A person"),
        qa("A cow", "Is it a person, an animal or a thing?", "An animal"),
        qa("A bag", "Is it a person, an animal or a thing?", "A thing"),
        qa("A teacher", "Is it a person, an animal or a thing?", "A person"),
        qa("A duck", "Is it a person, an animal or a thing?", "An animal"),
      ]),
      ch("en1-colours", "Colours", "الألوان", "red · blue · yellow · green", "red · blue · yellow · green", say(
        "A red apple", "A blue ball", "A yellow star", "A green leaf", "A black cat", "A pink flower", "A purple balloon", "A brown dog",
      )),
      ch("en1-actions", "Action words", "كلمات الأفعال", "running · reading · sleeping", "running · reading · sleeping", say(
        "The boy is running", "The girl is reading", "The dog is sleeping", "The bird is flying", "The fish is swimming", "The baby is crying", "The man is eating",
      )),
      ch("en1-sizes", "Describing words", "كلمات الوصف", "big · small · tiny · huge", "big · small · tiny · huge", say(
        "A big dog", "A small cat", "A big ball", "A small apple", "A huge elephant", "A tiny mouse",
      )),
    ],
    2: [
      ch("en2-prepositions", "Prepositions", "حروف الجر", "Where is it? Short sentences", "أين هو؟ جمل قصيرة", say(
        "The cat is sitting on the mat",
        "The ball is under the bed",
        "The book is inside the bag",
        "The dog is beside the door",
        "The bird is above the house",
        "The boy is behind the car",
        "The girl is in front of the school",
      )),
      ch("en2-plurals", "One and many", "المفرد والجمع", "cat → cats · box → boxes", "cat → cats · box → boxes", [
        qa("Three cats", "One cat, three ___?", "cats"),
        qa("Two boxes", "One box, two ___?", "boxes"),
        qa("Four buses", "One bus, four ___?", "buses"),
        qa("Five stars", "One star, five ___?", "stars"),
        qa("Two babies", "One baby, two ___?", "babies"),
      ]),
      ch("en2-pronouns", "Pronouns", "الضمائر", "he · she · it · they", "he · she · it · they", [
        qa("The boy is running", "___ is running. (he / she)", "He"),
        qa("The girl is reading", "___ is reading. (he / she)", "She"),
        qa("The dog is sleeping", "___ is sleeping. (it / they)", "It"),
        qa("Three birds are flying", "___ are flying. (it / they)", "They"),
        qa("The woman is cooking", "___ is cooking. (he / she)", "She"),
      ]),
      ch("en2-adjectives", "Describing words", "كلمات الوصف", "colour and size words", "كلمات اللون والحجم", [
        qa("A big red ball", "Which two words describe the ball?", "big, red"),
        qa("A small brown dog", "Which two words describe the dog?", "small, brown"),
        qa("A tiny yellow bird", "Which two words describe the bird?", "tiny, yellow"),
        qa("A huge grey elephant", "Which two words describe the elephant?", "huge, grey"),
      ]),
    ],
    3: [
      ch("en3-prepositions", "Prepositions", "حروف الجر", "Colours, numbers and places", "ألوان وأعداد وأماكن", say(
        "Two birds are flying above the tree",
        "The small cat is hiding behind the sofa",
        "A red ball is under the table",
        "The girl is standing in front of the school",
        "Three apples are inside the basket",
        "A brown dog is sitting beside the chair",
      )),
      ch("en3-articles", "Articles: a, an, the", "أدوات التعريف والتنكير", "a ball · an apple · an egg", "a ball · an apple · an egg", [
        qa("An apple", "___ apple (a / an)", "an"),
        qa("A ball", "___ ball (a / an)", "a"),
        qa("An egg", "___ egg (a / an)", "an"),
        qa("An elephant", "___ elephant (a / an)", "an"),
        qa("A kite", "___ kite (a / an)", "a"),
      ]),
      ch("en3-verbs", "Verbs (doing words)", "الأفعال", "Find the action", "ابحث عن الفعل", [
        qa("The girl is swimming", "What is the doing word?", "swimming"),
        qa("The boy is climbing", "What is the doing word?", "climbing"),
        qa("The baby is laughing", "What is the doing word?", "laughing"),
        qa("The man is driving", "What is the doing word?", "driving"),
        qa("The cat is jumping", "What is the doing word?", "jumping"),
      ]),
      ch("en3-comparing", "Comparing adjectives", "المقارنة بالصفات", "big · bigger · biggest", "big · bigger · biggest", [
        qa("A huge elephant", "big, bigger, ___", "biggest"),
        qa("A tiny mouse", "small, smaller, ___", "smallest"),
        qa("A small cat", "small, ___, smallest", "smaller"),
        qa("A big dog", "big, ___, biggest", "bigger"),
      ]),
    ],
    4: [
      ch("en4-prepositions", "Prepositions", "حروف الجر", "Longer sentences with actions", "جمل أطول مع أفعال", say(
        "The brown dog is sleeping under the big tree",
        "A yellow kite is flying above the house",
        "The teacher is standing in front of the desk",
        "Four fish are swimming inside the bowl",
        "The little boy is hiding behind the door",
        "A white cat is sitting on the wall",
      )),
      ch("en4-past", "Simple past tense", "الماضي البسيط", "run → ran · fly → flew", "run → ran · fly → flew", [
        qa("The boy is running", "Past tense of run?", "ran"),
        qa("The bird is flying", "Past tense of fly?", "flew"),
        qa("The girl is eating", "Past tense of eat?", "ate"),
        qa("The baby is sleeping", "Past tense of sleep?", "slept"),
        qa("The man is writing", "Past tense of write?", "wrote"),
      ]),
      ch("en4-adverbs", "Adverbs", "الظروف", "How is it done?", "كيف يُفعل ذلك؟", [
        qa("The turtle is walking slowly", "Which word tells how?", "slowly"),
        qa("The rabbit is running quickly", "Which word tells how?", "quickly"),
        qa("The girl is singing happily", "Which word tells how?", "happily"),
        qa("The baby is sleeping quietly", "Which word tells how?", "quietly"),
      ]),
      ch("en4-collective", "Collective nouns", "أسماء الجموع", "a flock · a herd · a school", "a flock · a herd · a school", [
        qa("Five birds", "A group of birds is a ___ of birds.", "flock"),
        qa("Four cows", "A group of cows is a ___ of cows.", "herd"),
        qa("Five fish", "A group of fish is a ___ of fish.", "school"),
        qa("Five bees", "A group of bees is a ___ of bees.", "swarm"),
        qa("Four sheep", "A group of sheep is a ___ of sheep.", "flock"),
      ]),
    ],
    5: [
      ch("en5-prepositions", "Prepositions", "حروف الجر", "Describe a whole scene", "صِف مشهداً كاملاً", say(
        "The little girl is reading beside the window",
        "Five birds are sitting on the fence",
        "A black cat is hiding inside the box",
        "The boy is riding a bike in front of the house",
        "A white cloud is above the mountain",
        "Two red balloons are flying above the school",
      )),
      ch("en5-tenses", "Present, past and future", "الحاضر والماضي والمستقبل", "reads · read · will read", "reads · read · will read", [
        qa("The girl is reading", "Tomorrow she ___ read. (will / was)", "will"),
        qa("The boy is playing", "Yesterday he ___. (plays / played)", "played"),
        qa("The birds are flying", "Every day they ___. (fly / flew)", "fly"),
        qa("The man is cooking", "Tomorrow he ___ cook. (will / did)", "will"),
      ]),
      ch("en5-opposites", "Opposites (antonyms)", "الأضداد", "big ↔ small · laugh ↔ cry", "big ↔ small · laugh ↔ cry", [
        qa("A big dog", "Opposite of big?", "small"),
        qa("The girl is laughing", "Opposite of laugh?", "cry"),
        qa("The boy is standing", "Opposite of stand?", "sit"),
        qa("A white cat", "Opposite of white?", "black"),
        qa("The door is opening", "Opposite of open?", "close"),
      ]),
      ch("en5-adjectives", "Adjectives in sentences", "الصفات في الجمل", "Find every describing word", "ابحث عن كل كلمات الوصف", [
        qa("A small brown dog is sleeping under the big tree", "Find three describing words.", "small, brown, big"),
        qa("Two red balloons are flying above the school", "Find the colour word.", "red"),
        qa("The little girl is reading beside the window", "Find the describing word.", "little"),
        qa("A white cloud is above the mountain", "Find the describing word.", "white"),
      ]),
    ],
  },
};

// ---------------------------------------------------------------------------
// Math
// ---------------------------------------------------------------------------

const MATH: Subject = {
  id: "math",
  title: { en: "Math", ar: "الرياضيات" },
  imageStyle: "counting worksheet illustration, each object clearly separated and easy to count, plain white background",
  grades: {
    1: [
      ch("ma1-counting", "Counting 1 to 5", "العد من 1 إلى 5", "How many can you see?", "كم عدداً ترى؟", [
        qa("One apple", "How many apples?", "1"),
        qa("Two balls", "How many balls?", "2"),
        qa("Three stars", "How many stars?", "3"),
        qa("Four birds", "How many birds?", "4"),
        qa("Five flowers", "How many flowers?", "5"),
      ]),
      ch("ma1-adding", "Adding within 5", "الجمع حتى 5", "Put together and count", "اجمع ثم عُدّ", [
        qa("1 ball + 1 ball", "1 + 1 = ?", "2"),
        qa("2 apples + 1 apple", "2 + 1 = ?", "3"),
        qa("2 stars + 2 stars", "2 + 2 = ?", "4"),
        qa("1 car + 3 cars", "1 + 3 = ?", "4"),
        qa("3 fish + 2 fish", "3 + 2 = ?", "5"),
      ]),
      ch("ma1-subtracting", "Taking away within 5", "الطرح حتى 5", "How many are left?", "كم بقي؟", [
        qa("2 cats - 1 cat", "2 − 1 = ?", "1"),
        qa("3 cakes - 2 cakes", "3 − 2 = ?", "1"),
        qa("4 balloons - 1 balloon", "4 − 1 = ?", "3"),
        qa("5 apples - 2 apples", "5 − 2 = ?", "3"),
        qa("5 ducks - 1 duck", "5 − 1 = ?", "4"),
      ]),
      ch("ma1-shapes", "Shapes", "الأشكال", "circle · square · triangle", "circle · square · triangle", [
        qa("A circle", "What shape is this?", "Circle"),
        qa("A square", "What shape is this?", "Square"),
        qa("A triangle", "What shape is this?", "Triangle"),
        qa("A rectangle", "What shape is this?", "Rectangle"),
        qa("A star", "What shape is this?", "Star"),
      ]),
      ch("ma1-compare", "Big and small", "كبير وصغير", "Compare sizes", "قارن الأحجام", [
        qa("A huge elephant", "Big or small?", "Big"),
        qa("A tiny mouse", "Big or small?", "Small"),
        qa("A big ball", "Big or small?", "Big"),
        qa("A small apple", "Big or small?", "Small"),
      ]),
    ],
    2: [
      ch("ma2-addsub", "Adding and subtracting", "الجمع والطرح", "Two-digit word problems", "مسائل كلامية بعددين", [
        qa("Two baskets", "One basket has 23 apples, the other has 14. How many in all?", "37"),
        qa("A bus", "A bus has 45 people. 12 get off. How many are left?", "33"),
        qa("Two boxes", "A box has 30 pencils and another has 25. How many pencils?", "55"),
        qa("Five birds are sitting on the fence", "There were 50 birds. 20 flew away. How many are left?", "30"),
      ]),
      ch("ma2-multiply", "Multiplication", "الضرب", "Equal groups", "مجموعات متساوية", [
        qa("3 × 2 apples", "3 baskets with 2 apples in each. How many apples?", "6"),
        qa("4 × 4 balls", "4 boxes with 4 balls in each. How many balls?", "16"),
        qa("5 × 3 stars", "5 cards with 3 stars on each. How many stars?", "15"),
        qa("2 × 10 crayons", "2 boxes with 10 crayons in each. How many crayons?", "20"),
      ]),
      ch("ma2-divide", "Sharing equally", "القسمة بالتساوي", "Division as sharing", "القسمة كتوزيع", [
        qa("10 ÷ 2 candies", "Share 10 candies between 2 children. How many each?", "5"),
        qa("12 ÷ 4 cookies", "Put 12 cookies on 4 plates equally. How many on each?", "3"),
        qa("15 ÷ 3 balls", "Put 15 balls in 3 boxes equally. How many in each?", "5"),
      ]),
      ch("ma2-time", "Time", "الوقت", "Hours, days and weeks", "الساعات والأيام والأسابيع", [
        qa("A clock", "How many minutes are in one hour?", "60"),
        qa("A clock", "How many hours are in one day?", "24"),
        qa("The sun is above the house", "How many days are in one week?", "7"),
        qa("The moon", "Which comes after Monday?", "Tuesday"),
      ]),
      ch("ma2-money", "Money", "النقود", "Shopping with rupees", "التسوق بالروبية", [
        qa("An apple", "An apple costs Rs 20 and a banana Rs 10. Total?", "Rs 30"),
        qa("A pencil", "You have Rs 50 and buy a pencil for Rs 15. Change?", "Rs 35"),
        qa("Two books", "2 books cost Rs 40 each. Total?", "Rs 80"),
      ]),
    ],
    3: [
      ch("ma3-multdiv", "Multiplication and division", "الضرب والقسمة", "Tables and word problems", "جداول ومسائل كلامية", [
        qa("4 × 8 pencils", "4 boxes with 8 pencils each. How many pencils?", "32"),
        qa("Five baskets", "5 baskets with 9 eggs each. How many eggs?", "45"),
        qa("Three children", "Share 36 marbles among 3 children. How many each?", "12"),
        qa("Four buses", "Each bus carries 40 children. How many in 4 buses?", "160"),
      ]),
      ch("ma3-fractions", "Fractions", "الكسور", "half · third · quarter", "نصف · ثلث · ربع", [
        qa("A cake", "A cake is cut into 2 equal parts. Each part is?", "One half (1/2)", "one round cake cut into 2 equal halves, the two halves slightly apart"),
        qa("A pizza", "A pizza is cut into 4 equal parts. Each part is?", "One quarter (1/4)", "one round pizza cut into 4 equal slices"),
        qa("A watermelon", "A watermelon is cut into 3 equal parts. Each part is?", "One third (1/3)", "one round watermelon cut into 3 equal pieces"),
        qa("Four apples", "Half of 4 apples is?", "2 apples", "exactly four red apples in a row"),
      ]),
      ch("ma3-measure", "Length, mass and capacity", "الطول والكتلة والسعة", "cm · m · kg · litre", "cm · m · kg · litre", [
        qa("A pencil", "Measure a pencil in cm or km?", "cm"),
        qa("A road", "Measure a road in m or km?", "km"),
        qa("A watermelon", "Weigh a watermelon in g or kg?", "kg"),
        qa("A bottle", "Measure the water in a bottle in ml or litres?", "ml / litres"),
      ]),
      ch("ma3-3dshapes", "3D shapes", "الأشكال الثلاثية الأبعاد", "sphere · cube · cylinder · cone", "sphere · cube · cylinder · cone", [
        qa("A ball", "What 3D shape is a ball?", "Sphere"),
        qa("A box", "What 3D shape is a box?", "Cube / cuboid"),
        qa("A cup", "What 3D shape is a cup?", "Cylinder"),
        qa("A hat", "What 3D shape is a party hat?", "Cone"),
      ]),
    ],
    4: [
      ch("ma4-factors", "Factors and multiples", "العوامل والمضاعفات", "Rows, groups and tables", "صفوف ومجموعات وجداول", [
        qa("Four boxes", "12 cakes are packed in 4 boxes equally. How many in each box?", "3 (4 × 3 = 12)"),
        qa("Three baskets", "Is 3 a factor of 12?", "Yes (3 × 4 = 12)"),
        qa("Five stars", "Write the first four multiples of 5.", "5, 10, 15, 20"),
        qa("Two shoes", "Is 15 a multiple of 2?", "No, it is odd"),
      ]),
      ch("ma4-fractions", "Fractions and decimals", "الكسور والأعداد العشرية", "½ = 0.5 · ¼ = 0.25", "½ = 0.5 · ¼ = 0.25", [
        qa("A cake", "Write one half as a decimal.", "0.5", "one round cake cut into 2 equal halves"),
        qa("A pizza", "Write one quarter as a decimal.", "0.25", "one round pizza cut into 4 equal slices"),
        qa("A chocolate", "3/4 of a chocolate bar is eaten. What fraction is left?", "1/4", "one chocolate bar made of 4 equal squares"),
        qa("A bottle", "0.5 litre + 0.5 litre = ?", "1 litre", "two small bottles of water side by side"),
      ]),
      ch("ma4-perimeter", "Perimeter and area", "المحيط والمساحة", "Around and inside a shape", "حول الشكل وداخله", [
        qa("A table", "A table top is 2 m long and 1 m wide. Perimeter?", "6 m"),
        qa("A square", "A square has sides of 5 cm. Perimeter?", "20 cm"),
        qa("A rug", "A rug is 3 m by 2 m. Area?", "6 square metres"),
        qa("A book", "A book cover is 20 cm by 15 cm. Area?", "300 square cm"),
      ]),
      ch("ma4-angles", "Angles", "الزوايا", "right · acute · obtuse", "قائمة · حادة · منفرجة", [
        qa("A clock", "At 3 o'clock the hands make which angle?", "A right angle (90°)", "a round wall clock showing 3 o'clock"),
        qa("A book", "The corner of a book is a ___ angle.", "right"),
        qa("A clock", "An angle smaller than 90° is called?", "Acute"),
        qa("A clock", "An angle bigger than 90° but less than 180° is called?", "Obtuse"),
      ]),
    ],
    5: [
      ch("ma5-hcflcm", "HCF and LCM", "القاسم المشترك الأكبر والمضاعف المشترك الأصغر", "Common factors and multiples", "العوامل والمضاعفات المشتركة", [
        qa("Two baskets", "One basket has 12 apples, the other 18. Largest equal bags without leftovers?", "6 apples (HCF)"),
        qa("A bus", "Buses leave every 4 and 6 minutes. When do they leave together again?", "After 12 minutes (LCM)"),
        qa("Three boxes", "HCF of 8 and 12?", "4"),
        qa("Two bells", "LCM of 3 and 5?", "15"),
      ]),
      ch("ma5-percent", "Decimals and percentages", "الأعداد العشرية والنسب المئوية", "½ = 50% · ¼ = 25%", "½ = 50% · ¼ = 25%", [
        qa("A cake", "Half of the cake is what percent?", "50%", "one round cake cut into 2 equal halves"),
        qa("A pizza", "One quarter of the pizza is what percent?", "25%", "one round pizza cut into 4 equal slices"),
        qa("A bag", "A bag costs Rs 200. It is 10% off. How much do you save?", "Rs 20"),
        qa("Five apples", "2 of 5 apples are red. What percent is red?", "40%", "exactly five apples in a row: 2 red apples and 3 green apples"),
      ]),
      ch("ma5-unitary", "Unitary method", "الطريقة الأحادية", "Find one, then many", "أوجد الواحد ثم الكثير", [
        qa("Five pencils", "5 pencils cost Rs 50. What does 1 pencil cost?", "Rs 10"),
        qa("Four books", "4 books cost Rs 320. What do 3 books cost?", "Rs 240"),
        qa("Three bottles", "3 bottles hold 6 litres. How much do 5 bottles hold?", "10 litres"),
      ]),
      ch("ma5-speed", "Speed, distance and time", "السرعة والمسافة والزمن", "distance = speed × time", "المسافة = السرعة × الزمن", [
        qa("A car", "A car goes 60 km in 1 hour. How far in 3 hours?", "180 km"),
        qa("A train", "A train goes 240 km in 4 hours. Its speed?", "60 km per hour"),
        qa("The boy is riding a bike", "A bike goes 15 km per hour. Time for 45 km?", "3 hours"),
      ]),
    ],
  },
};

// ---------------------------------------------------------------------------
// Science (SNC: General Knowledge in Grades 1–3, General Science in 4–5)
// ---------------------------------------------------------------------------

const SCIENCE: Subject = {
  id: "science",
  title: { en: "Science", ar: "العلوم" },
  imageStyle: "simple educational science illustration for young children, clear and accurate, plain white background",
  grades: {
    1: [
      ch("sc1-plants", "Plants", "النباتات", "Flowers, seeds and leaves", "الأزهار والبذور والأوراق", [
        sd("Flowering plants have seeds and flowers", "two flowering plants side by side growing in soil: a rose bush with pink flowers, and a tall sunflower whose big brown centre is full of seeds"),
        sd("Non-flowering plants do not have seeds and flowers", "two non-flowering plants side by side: a green fern with long feathery fronds, and a soft cushion of green moss on a grey rock; no flowers, no seeds and no fruit anywhere"),
        sd("A tree", "one big leafy green tree with a brown trunk, standing on a small patch of grass"),
        sd("A flower", "one bright red flower on a green stem with two leaves, growing from a little mound of soil"),
        sd("A green leaf", "one single green leaf with its veins clearly visible"),
      ]),
      ch("sc1-animals", "Animals", "الحيوانات", "Backbones, and how animals move", "العمود الفقري وكيف تتحرك الحيوانات", [
        sd("Vertebrates have a backbone", "four vertebrate animals in a row: a fish, a frog, a bird and a cat; each one has a gentle see-through view along its back showing its backbone as a neat white chain of small bones"),
        sd("Invertebrates do not have a backbone", "four invertebrate animals in a row: an earthworm, a snail, a butterfly and a jellyfish, with soft bodies and no bones"),
        qa("A fish is swimming", "How does a fish move?", "It swims", "an orange fish swimming in clear blue water, its fins and tail moving"),
        qa("A bird is flying", "How does a bird move?", "It flies", "a small bird flying in a blue sky with its wings spread wide"),
        qa("A frog is jumping", "How does a frog move?", "It jumps", "a green frog jumping in mid-air from a lily pad, its back legs stretched out"),
      ]),
      ch("sc1-body", "My body", "جسمي", "eyes · ears · hands · heart", "عيون · آذان · أيدي · قلب", [
        // the parts we use every day first, then the organs inside
        qa("The eyes", "What do we see with?", "Our eyes", "a smiling child pointing to their own eyes"),
        qa("The ears", "What do we hear with?", "Our ears", "a smiling child cupping a hand behind one ear to listen"),
        qa("The nose", "What do we smell with?", "Our nose", "a smiling child smelling a pink flower"),
        qa("The mouth", "What do we eat and talk with?", "Our mouth", "a smiling child with an open happy mouth, about to bite a red apple"),
        qa("The hands", "What do we hold and clap with?", "Our hands", "a smiling child clapping their hands"),
        qa("The feet", "What do we walk and run with?", "Our feet", "a child walking barefoot on soft green grass, feet clearly visible"),
        qa("The teeth", "What do we chew food with?", "Our teeth", "a smiling child showing clean white teeth"),
        qa("The tongue", "What do we taste food with?", "Our tongue", "a happy child licking a strawberry ice cream cone"),
        qa("The hair", "What grows on top of our head?", "Hair", "a smiling child brushing their hair with a hairbrush"),
        qa("The fingers", "How many fingers are on one hand?", "5", "one open child's hand held up, palm facing us"),
        qa("The brain", "What helps us think?", "The brain"),
        qa("The bones", "What makes our body strong and gives it shape?", "Our bones", "a friendly smiling cartoon skeleton waving hello, cute and not scary"),
        qa("The heart", "What pumps blood?", "The heart"),
        qa("The lungs", "What helps us breathe?", "The lungs"),
        qa("The stomach", "Where does food go?", "The stomach"),
      ]),
      ch("sc1-sky", "Weather and sky", "الطقس والسماء", "sun · cloud · rain · moon", "sun · cloud · rain · moon", [
        sd("The sun is above the tree", "a bright yellow sun high in a blue sky, above one green tree standing on grass"),
        sd("A cloud", "one big fluffy white cloud in a clear blue sky"),
        sd("Rain", "rain drops falling from a grey cloud onto green grass, with small puddles on the ground"),
        sd("Snow", "white snowflakes falling on snowy ground with snow-covered pine trees"),
        sd("A rainbow", "a bright rainbow arching across a blue sky after rain, with the sun peeking from a cloud"),
        sd("The moon", "a big round full moon in a dark blue night sky with a few small stars"),
        sd("Three stars", "exactly three bright yellow stars in a dark blue night sky"),
      ]),
    ],
    2: [
      ch("sc2-living", "Living and non-living things", "الكائنات الحية وغير الحية", "Does it grow, eat and breathe?", "هل ينمو ويأكل ويتنفس؟", [
        qa("A dog", "Living or non-living?", "Living", "one friendly brown dog standing on grass"),
        qa("A rock", "Living or non-living?", "Non-living", "one grey rock on the ground"),
        qa("A tree", "Living or non-living?", "Living", "one leafy green tree"),
        qa("A car", "Living or non-living?", "Non-living", "one small red car"),
        qa("A baby", "Living or non-living?", "Living", "one smiling baby sitting on a blanket"),
      ]),
      ch("sc2-plantparts", "Parts of a plant", "أجزاء النبات", "root · stem · leaf · flower", "جذر · ساق · ورقة · زهرة", [
        qa("A green leaf", "Which part makes food for the plant?", "The leaf", "a young plant with several big green leaves"),
        qa("A flower", "Which part makes seeds?", "The flower", "a plant with one big open flower"),
        qa("A tree", "Which part holds the plant up?", "The stem (trunk)", "a tree with a thick, strong brown trunk holding up its branches and leaves"),
        qa("A plant", "Which part takes in water from the soil?", "The root", "a young green plant lifted out of the soil so its roots, stem, leaves and flower can all be seen"),
      ]),
      ch("sc2-habitats", "Animal homes", "بيوت الحيوانات", "Where do animals live?", "أين تعيش الحيوانات؟", [
        qa("A fish is swimming", "Where does a fish live?", "In water", "an orange fish swimming"),
        qa("A camel", "Where does a camel live?", "In the desert", "one camel with a hump, standing on a plain white background"),
        qa("A penguin", "Where does a penguin live?", "In very cold places", "one penguin standing on a plain white background"),
        qa("A monkey is climbing", "Where does a monkey live?", "In the forest", "a brown monkey climbing a tree branch"),
        qa("A cow", "Where does a cow live?", "On a farm", "one black and white cow standing on a plain white background"),
      ]),
      ch("sc2-materials", "Materials", "المواد", "wood · metal · glass · cloth", "خشب · معدن · زجاج · قماش", [
        qa("A chair", "What is a chair often made of?", "Wood", "one wooden chair"),
        qa("A spoon", "What is a spoon often made of?", "Metal", "one shiny silver spoon"),
        qa("A glass", "What is a glass made of?", "Glass", "one clear empty drinking glass"),
        qa("A shirt", "What is a shirt made of?", "Cloth", "one folded blue cotton shirt"),
      ]),
    ],
    3: [
      ch("sc3-food", "Healthy food", "الغذاء الصحي", "Food that helps us grow", "غذاء يساعدنا على النمو", [
        qa("An apple", "Healthy food or junk food?", "Healthy food", "one shiny red apple"),
        qa("A burger", "Healthy food or junk food?", "Junk food (eat it rarely)", "one burger"),
        qa("Milk", "Milk makes our ___ and teeth strong.", "bones", "a glass of white milk next to a milk bottle"),
        qa("A carrot", "Healthy food or junk food?", "Healthy food", "one orange carrot with green leaves"),
        qa("Candy", "Too much candy is bad for our ___.", "teeth", "a few colourful wrapped candies"),
      ]),
      ch("sc3-matter", "Solids, liquids and gases", "المواد الصلبة والسائلة والغازية", "States of matter", "حالات المادة", [
        qa("A rock", "Solid, liquid or gas?", "Solid", "one grey rock"),
        qa("Water", "Solid, liquid or gas?", "Liquid", "clear water being poured from a jug into a glass"),
        qa("A balloon", "The air inside a balloon is a ___.", "gas", "one round red balloon on a string"),
        qa("Snow", "When snow melts it becomes?", "Water (a liquid)", "a small pile of white snow"),
      ]),
      ch("sc3-light", "Light and shadows", "الضوء والظلال", "Where light comes from", "من أين يأتي الضوء", [
        qa("The sun is above the tree", "What is our main source of light?", "The Sun", "a bright sun shining above a tree, sunlight lighting everything"),
        qa("A lamp", "Is a lamp a natural or a man-made light?", "Man-made", "a table lamp that is switched on and glowing"),
        qa("The moon", "Does the Moon make its own light?", "No, it reflects sunlight", "a full moon in a dark night sky"),
        qa("The boy is standing in front of the wall", "What forms when an object blocks light?", "A shadow", "a boy standing in bright sunlight in front of a plain wall"),
      ]),
      ch("sc3-forces", "Push and pull", "الدفع والسحب", "Forces make things move", "القوى تحرك الأشياء", [
        qa("The boy is kicking a ball", "Push or pull?", "Push", "a boy kicking a football with his foot, the ball starting to move"),
        qa("The girl is opening the door", "Opening a drawer is a push or a pull?", "Pull", "a girl holding a door handle and opening the door"),
        qa("The man is riding a bike", "Pressing the pedal is a push or a pull?", "Push", "a man riding a bicycle, his foot on the pedal"),
        qa("A kite", "Flying a kite with a string is a push or a pull?", "Pull", "a child holding the string of a kite flying in the sky"),
      ]),
    ],
    4: [
      ch("sc4-classify", "Classifying living things", "تصنيف الكائنات الحية", "Vertebrates and invertebrates", "الفقاريات واللافقاريات", [
        sd("Vertebrates have a backbone", "four vertebrate animals in a row: a fish, a frog, a bird and a cat; each one has a gentle see-through view along its back showing its backbone as a neat white chain of small bones"),
        sd("Invertebrates do not have a backbone", "four invertebrate animals in a row: an earthworm, a snail, a butterfly and a jellyfish, with soft bodies and no bones"),
        qa("A butterfly", "How many legs does an insect have?", "6", "one butterfly seen from above with its wings open"),
        qa("A spider", "How many legs does a spider have?", "8", "one friendly cartoon spider seen from above"),
        qa("A bird", "Is a bird a vertebrate?", "Yes", "one small bird sitting on a branch"),
      ]),
      ch("sc4-digestion", "Digestive system", "الجهاز الهضمي", "How food is used", "كيف يُستعمل الطعام", [
        qa("The stomach", "Where is food mixed with juices?", "In the stomach"),
        qa("The boy is eating", "Where does digestion begin?", "In the mouth", "a boy eating a sandwich"),
        qa("The girl is brushing her teeth", "Why should we brush our teeth?", "To keep teeth clean and healthy", "a smiling girl brushing her teeth with a toothbrush"),
        qa("An apple", "Which food has fibre that helps digestion?", "Fruit and vegetables", "one red apple"),
      ]),
      ch("sc4-sound", "Sound", "الصوت", "Vibrations we can hear", "اهتزازات نسمعها", [
        qa("A bell", "Sound is made when things ___.", "vibrate", "a golden bell ringing, with small curved lines around it"),
        qa("The girl is singing", "What part of the body makes our voice?", "The voice box", "a girl singing happily with music notes in the air"),
        qa("A drum", "Hitting a drum harder makes the sound?", "Louder", "a child playing a drum with drumsticks"),
        qa("The boy is listening", "Which organ do we hear with?", "The ear", "a boy listening carefully to music"),
      ]),
      ch("sc4-magnets", "Magnets", "المغناطيس", "Attract and repel", "التجاذب والتنافر", [
        qa("A key", "Will a magnet pull an iron key?", "Yes", "a red horseshoe magnet lying near an iron key on a table"),
        qa("A pencil", "Will a magnet pull a wooden pencil?", "No", "a red horseshoe magnet lying near a wooden pencil on a table"),
        qa("A spoon", "Will a magnet pull a steel spoon?", "Yes", "a red horseshoe magnet lying near a steel spoon on a table"),
        qa("A magnet", "Two north poles facing each other will?", "Push apart (repel)", "two bar magnets, each half red and half blue, lying on a table with their red ends facing each other"),
      ]),
    ],
    5: [
      ch("sc5-heartlungs", "Heart and lungs", "القلب والرئتان", "Circulation and breathing", "الدورة الدموية والتنفس", [
        qa("The heart", "Which organ pumps blood around the body?", "The heart"),
        qa("The lungs", "Which gas do our lungs take in?", "Oxygen"),
        qa("The lungs", "Which gas do we breathe out?", "Carbon dioxide"),
        qa("The boy is running", "What happens to your heartbeat when you run?", "It gets faster", "a boy running fast in a park"),
      ]),
      ch("sc5-electricity", "Electricity", "الكهرباء", "Circuits and safety", "الدوائر والسلامة", [
        qa("A lamp", "What makes a bulb glow?", "Electric current", "a glowing light bulb connected by two wires to a battery"),
        qa("A phone", "What stores electricity in a phone?", "A battery", "one smartphone lying on a table"),
        qa("A spoon", "Is metal a conductor or an insulator?", "Conductor", "one shiny metal spoon"),
        qa("A pencil", "Is wood a conductor or an insulator?", "Insulator", "one wooden pencil"),
      ]),
      ch("sc5-space", "The solar system", "المجموعة الشمسية", "Sun, Earth and Moon", "الشمس والأرض والقمر", [
        qa("The sun", "What is at the centre of our solar system?", "The Sun", "the bright glowing sun in dark space"),
        qa("The moon", "What does the Moon go around?", "The Earth", "the grey moon in dark space"),
        qa("Three stars", "The Sun is a ___.", "star", "exactly three bright stars in a dark night sky"),
        qa("A rocket", "How many planets are in our solar system?", "8", "a rocket flying through dark space with stars"),
      ]),
      ch("sc5-environment", "Our environment", "بيئتنا", "Clean air, water and land", "هواء وماء وأرض نظيفة", [
        qa("A tree", "Trees give us which gas?", "Oxygen", "one big leafy green tree in a park"),
        qa("A car", "Smoke from cars causes?", "Air pollution", "a car with grey smoke coming from its exhaust pipe"),
        qa("A river", "Throwing rubbish in a river causes?", "Water pollution", "a river with plastic bottles and rubbish floating in the water"),
        qa("The girl is cleaning", "Reduce, reuse and ___.", "recycle", "a girl picking up litter in a park and putting it into a bin"),
      ]),
      ch("sc5-friction", "Forces and friction", "القوى والاحتكاك", "What slows things down", "ما الذي يبطئ الأشياء", [
        qa("The boy is riding a bike", "Which force slows a moving bike?", "Friction", "a boy riding a bicycle on a road"),
        qa("A ball", "A ball rolls farther on grass or on ice?", "On ice (less friction)", "one football resting between a patch of green grass and a patch of smooth ice"),
        qa("A shoe", "Why do shoes have grooves on the bottom?", "To grip the ground (more friction)", "a sports shoe turned over to show the grooves on its sole"),
      ]),
    ],
  },
};

export const SUBJECT_LIST: Subject[] = [ENGLISH, MATH, SCIENCE];

export function subjectById(id: SubjectId): Subject {
  return SUBJECT_LIST.find((s) => s.id === id) ?? ENGLISH;
}

export function chaptersFor(subject: Subject, grade: Grade): Chapter[] {
  return subject.grades[grade] ?? [];
}

export function chapterById(id: string): { subject: Subject; grade: Grade; chapter: Chapter } | null {
  for (const subject of SUBJECT_LIST) {
    for (const grade of GRADES) {
      const chapter = subject.grades[grade]?.find((c) => c.id === id);
      if (chapter) return { subject, grade, chapter };
    }
  }
  return null;
}

export function chapterCount(subject: Subject): number {
  return GRADES.reduce((n, g) => n + chaptersFor(subject, g).length, 0);
}

export function lessonCount(subject: Subject): number {
  return GRADES.reduce((n, g) => n + chaptersFor(subject, g).reduce((m, c) => m + c.lessons.length, 0), 0);
}

export function label(text: Text, lang: LanguageCode): string {
  return lang === "ar-SA" ? text.ar : text.en;
}

export interface ChapterValidation {
  valid: boolean;
  reason?: string;
  hint?: string;
  suggestions?: string[];
}

export function isPrepositionChapter(chapterId: string): boolean {
  return chapterId.toLowerCase().includes("preposition");
}

export const PREPOSITION_WORDS = [
  "in front of", "on top of", "next to", "close to", "far from",
  "under", "underneath", "below", "beneath", "on", "above", "over",
  "behind", "beside", "near", "inside", "in", "between",
];

// --- what each chapter is about ---------------------------------------------
//
// A chapter only makes pictures that fit its topic: in English Grade 1
// "Prepositions" a sentence has to say where something is, in Science "Magnets"
// it has to be about magnets or the things they pull, and so on. Each rule also
// says what kind of picture the chapter wants, which shapes the AI prompt.

type PictureKind = "position" | "colour" | "action" | "size" | "count" | "describe" | "thing" | "shape" | "clock" | "science";

interface ChapterRule {
  kind: PictureKind;
  /** What the chapter accepts, finishing "This chapter only makes pictures of …". */
  about: string;
  test: (sentence: string) => boolean;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** true when the sentence uses any of the words (or their plural). */
const anyWord = (list: string[]) => {
  const re = new RegExp(`\\b(${list.map(escapeRe).join("|")})(s|es)?\\b`, "i");
  return (s: string) => re.test(s);
};
const either = (...tests: ((s: string) => boolean)[]) => (s: string) => tests.some((t) => t(s));

const COLOURS = ["red", "blue", "yellow", "green", "black", "white", "pink", "purple", "brown", "orange", "grey", "gray", "gold", "silver"];
const SIZES = ["big", "small", "tiny", "huge", "large", "little", "tall", "short", "long", "giant", "bigger", "biggest", "smaller", "smallest"];
const DESCRIBING = [
  ...COLOURS, ...SIZES, "old", "new", "happy", "sad", "fat", "thin", "hot", "cold", "soft", "hard", "fast", "slow",
  "beautiful", "pretty", "clean", "dirty", "wet", "dry", "heavy", "light", "round", "square", "sweet", "kind", "brave",
];
const ACTION_WORDS = [
  "running", "reading", "sleeping", "flying", "swimming", "crying", "eating", "jumping", "walking", "playing", "dancing",
  "climbing", "singing", "cooking", "cleaning", "laughing", "standing", "sitting", "writing", "drawing", "driving",
  "riding", "kicking", "throwing", "catching", "drinking", "washing", "brushing", "hiding", "smiling", "listening",
];
const ANIMALS = [
  "animal", "cat", "kitten", "dog", "puppy", "bird", "fish", "rabbit", "frog", "bear", "lion", "tiger", "elephant", "monkey",
  "horse", "cow", "pig", "sheep", "goat", "duck", "hen", "chicken", "mouse", "mice", "snake", "turtle", "tortoise", "butterfly",
  "bee", "ant", "spider", "owl", "penguin", "camel", "giraffe", "zebra", "whale", "shark", "dolphin", "octopus", "snail",
  "worm", "earthworm", "jellyfish", "crab", "starfish", "insect", "beetle", "ladybird", "lizard", "crocodile", "parrot",
  "eagle", "deer", "fox", "wolf", "squirrel", "kangaroo", "bat", "donkey", "vertebrate", "invertebrate", "backbone",
];
const PLANT_WORDS = [
  "plant", "tree", "flower", "leaf", "leaves", "seed", "root", "stem", "trunk", "branch", "branches", "grass", "fern", "moss",
  "fruit", "bush", "bushes", "cactus", "petal", "bud", "flowering", "rose", "sunflower", "vegetable",
];
const BODY_WORDS = [
  "body", "heart", "lung", "lungs", "stomach", "brain", "kidney", "liver", "bone", "bones", "skeleton", "muscle", "blood",
  "chest", "mouth", "teeth", "tooth", "tongue", "nose", "ear", "eye", "skin", "breathe", "breathing", "intestine",
  "head", "hair", "neck", "shoulder", "arm", "elbow", "hand", "finger", "tummy", "leg", "knee", "foot", "feet", "toe",
];
const ORGANS = ["heart", "lungs", "lung", "stomach", "brain", "kidney", "kidneys", "liver", "intestines", "skeleton", "bones"];
const FOODS = [
  "food", "apple", "banana", "mango", "orange", "grape", "carrot", "potato", "tomato", "milk", "egg", "bread", "rice",
  "burger", "pizza", "candy", "candies", "chocolate", "chips", "meat", "chicken", "fish", "juice", "water", "cake",
  "biscuit", "yogurt", "cheese", "vegetable", "fruit", "salad", "sandwich", "ice cream", "soup", "lentils",
];

const NUMBER = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+";
const MANY = "two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+";
const COUNT_RE = new RegExp(`\\b(${NUMBER})\\s+[a-z]{2,}`, "i");
const MANY_RE = new RegExp(`\\b(${MANY})\\s+[a-z]{2,}`, "i");
const PREP_RE = new RegExp(
  `\\b(${[...PREPOSITION_WORDS].sort((a, b) => b.length - a.length).map(escapeRe).join("|")})\\s+` +
    `(the|a|an|my|your|his|her|its|our|their|this|that|some)\\s+[a-z]`,
  "i",
);
const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

const hasCount = (s: string) => COUNT_RE.test(s);
const hasMany = (s: string) => MANY_RE.test(s);
const hasPosition = (s: string) => PREP_RE.test(s);
const hasAction = either((s) => /\b(is|are|am|was|were)\s+[a-z]{2,}ing\b/i.test(s), anyWord(ACTION_WORDS));
/** One short naming phrase ("a girl", "a red bus"), not a whole sentence. */
const isNamingPhrase = (s: string) => wordCount(s) <= 4 && !/\b(is|are|am|was|were|has|have)\b/i.test(s);
const mathOp = (...ops: string[]) => (s: string) => {
  const m = parseMath(s);
  return !!m && ops.includes(m.op);
};
const anyMath = (s: string) => !!(parseMath(s) || parseWordProblem(s));

const POSITION_RULE: ChapterRule = {
  kind: "position",
  about: "sentences that say where something is (on, under, inside, behind, in front of, beside, above)",
  test: hasPosition,
};
const ACTION_RULE: ChapterRule = { kind: "action", about: "someone doing something (\"The boy is running\")", test: hasAction };
const SIZE_RULE: ChapterRule = { kind: "size", about: "things with a size word (big, small, tiny, huge)", test: anyWord(SIZES) };
const MANY_RULE: ChapterRule = { kind: "count", about: "more than one thing (\"Three cats\", \"Five birds\")", test: hasMany };
const DESCRIBE_RULE: ChapterRule = {
  kind: "describe",
  about: "things with describing words (colour, size, feelings)",
  test: anyWord(DESCRIBING),
};
const science = (about: string, words: string[], extra?: (s: string) => boolean): ChapterRule => ({
  kind: "science",
  about,
  test: extra ? either(anyWord(words), extra) : anyWord(words),
});

const CHAPTER_RULES: Record<string, ChapterRule> = {
  // English
  "en1-nouns": { kind: "thing", about: "one naming word — a person, an animal or a thing (\"A girl\", \"A cow\")", test: isNamingPhrase },
  "en1-colours": { kind: "colour", about: "things with a colour word (red, blue, yellow, green…)", test: anyWord(COLOURS) },
  "en1-actions": ACTION_RULE,
  "en1-sizes": SIZE_RULE,
  "en2-plurals": MANY_RULE,
  "en2-pronouns": ACTION_RULE,
  "en2-adjectives": DESCRIBE_RULE,
  "en3-articles": {
    kind: "thing",
    about: "one thing with a, an or the (\"An apple\", \"A kite\")",
    test: (s) => /^(a|an|the)\s+[a-z]+/i.test(s.trim()) && isNamingPhrase(s),
  },
  "en3-verbs": ACTION_RULE,
  "en3-comparing": SIZE_RULE,
  "en4-past": ACTION_RULE,
  "en4-adverbs": {
    kind: "action",
    about: "an action and how it is done (\"The turtle is walking slowly\")",
    test: (s) => hasAction(s) && /\b[a-z]{3,}ly\b/i.test(s),
  },
  "en4-collective": MANY_RULE,
  "en5-tenses": ACTION_RULE,
  "en5-opposites": {
    kind: "describe",
    about: "a describing word or an action that has an opposite (big, laughing, opening…)",
    test: either(anyWord(DESCRIBING), hasAction, anyWord(["open", "close", "up", "down", "full", "empty"])),
  },
  "en5-adjectives": DESCRIBE_RULE,

  // Math
  "ma1-counting": { kind: "count", about: "a number of things (\"Three stars\", \"5 apples\")", test: hasCount },
  "ma1-adding": { kind: "count", about: "adding sums (\"2 apples + 1 apple\")", test: either(mathOp("+"), (s) => !!parseWordProblem(s)) },
  "ma1-subtracting": { kind: "count", about: "taking-away sums (\"5 apples - 2 apples\")", test: either(mathOp("-"), (s) => !!parseWordProblem(s)) },
  "ma1-shapes": {
    kind: "shape",
    about: "flat shapes (circle, square, triangle, rectangle, star…)",
    test: anyWord(["circle", "square", "triangle", "rectangle", "star", "oval", "heart", "diamond", "pentagon", "hexagon", "shape"]),
  },
  "ma1-compare": SIZE_RULE,
  "ma2-addsub": { kind: "count", about: "adding and taking away (sums, story problems, groups of things)", test: either(mathOp("+", "-"), anyMath, hasCount) },
  "ma2-multiply": { kind: "count", about: "equal groups (\"3 × 2 apples\")", test: either(mathOp("×"), hasCount) },
  "ma2-divide": { kind: "count", about: "sharing equally (\"10 ÷ 2 candies\")", test: either(mathOp("÷"), hasCount) },
  "ma2-time": {
    kind: "clock",
    about: "clocks, days and the time (clock, watch, sun, moon, morning, night…)",
    test: anyWord(["clock", "watch", "time", "hour", "minute", "day", "week", "month", "sun", "moon", "morning", "night", "calendar", "alarm"]),
  },
  "ma2-money": {
    kind: "thing",
    about: "money and things to buy (coins, notes, a pencil, an apple…)",
    test: either(anyWord(["money", "coin", "note", "rupee", "price", "shop", "wallet", "purse"]), isNamingPhrase),
  },
  "ma3-multdiv": { kind: "count", about: "groups of things to multiply or share", test: either(mathOp("×", "÷"), anyMath, hasCount) },
  "ma3-fractions": {
    kind: "count",
    about: "things cut into equal parts (a cake, a pizza, half, quarter…)",
    test: either(anyWord(["half", "halves", "quarter", "third", "fraction", "slice", "piece", "part", ...FOODS]), hasCount),
  },
  "ma3-measure": {
    kind: "thing",
    about: "things to measure, weigh or fill (a pencil, a road, a bottle…)",
    test: either(anyWord(["ruler", "scale", "metre", "meter", "cm", "kg", "gram", "litre", "liter", "long", "heavy", "tall"]), isNamingPhrase),
  },
  "ma3-3dshapes": {
    kind: "shape",
    about: "3D shapes and things shaped like them (sphere, cube, cylinder, cone, ball, box…)",
    test: anyWord(["sphere", "cube", "cuboid", "cylinder", "cone", "pyramid", "ball", "box", "cup", "hat", "dice", "can", "tin", "globe"]),
  },
  "ma4-factors": { kind: "count", about: "groups and rows of things", test: either(hasCount, anyMath) },
  "ma4-fractions": {
    kind: "count",
    about: "things cut into equal parts (a cake, a pizza, a chocolate bar…)",
    test: either(anyWord(["half", "halves", "quarter", "third", "fraction", "slice", "piece", "part", "bottle", ...FOODS]), hasCount),
  },
  "ma4-perimeter": {
    kind: "shape",
    about: "flat things with sides (a table, a rug, a book, a square…)",
    test: anyWord(["square", "rectangle", "triangle", "table", "rug", "carpet", "mat", "book", "field", "garden", "room", "door", "window", "frame", "tile", "floor", "wall", "park"]),
  },
  "ma4-angles": {
    kind: "clock",
    about: "angles and corners (a clock, a book, a door, a triangle…)",
    test: anyWord(["clock", "angle", "corner", "triangle", "square", "book", "door", "scissors", "ruler", "roof", "ramp"]),
  },
  "ma5-hcflcm": { kind: "count", about: "groups of things to share or match up", test: either(hasCount, anyMath, anyWord(["bus", "bell", "basket", "box"])) },
  "ma5-percent": {
    kind: "count",
    about: "parts of a whole (a cake, a pizza, a bag on sale…)",
    test: either(anyWord(["half", "quarter", "percent", "sale", "bag", ...FOODS]), hasCount),
  },
  "ma5-unitary": { kind: "count", about: "a number of things to buy or fill (\"Five pencils\", \"Four books\")", test: either(hasCount, anyMath) },
  "ma5-speed": {
    kind: "thing",
    about: "things that move and travel (a car, a train, a bike…)",
    test: anyWord(["car", "train", "bus", "bike", "bicycle", "plane", "aeroplane", "boat", "ship", "runner", "road", "track", "motorbike", "riding", "driving", "running"]),
  },

  // Science
  "sc1-plants": science("plants and their parts (tree, flower, leaf, seed, fern…)", PLANT_WORDS),
  "sc1-animals": science("animals and how they move", ANIMALS),
  "sc1-body": science("the body and its organs (heart, lungs, stomach…)", BODY_WORDS),
  "sc1-sky": science("the sky and the weather (sun, cloud, rain, snow, moon, stars…)", ["sun", "moon", "star", "cloud", "rain", "snow", "rainbow", "sky", "wind", "storm", "lightning", "weather", "sunny", "rainy"]),
  "sc2-living": science("living and non-living things (a dog, a rock, a tree, a car…)", [...ANIMALS, ...PLANT_WORDS], isNamingPhrase),
  "sc2-plantparts": science("the parts of a plant (root, stem, leaf, flower)", PLANT_WORDS),
  "sc2-habitats": science("animals and where they live", [...ANIMALS, "desert", "forest", "jungle", "sea", "ocean", "pond", "river", "farm", "nest", "burrow", "cave", "ice", "hive"]),
  "sc2-materials": science("things and what they are made of (wood, metal, glass, cloth…)", ["wood", "wooden", "metal", "glass", "plastic", "cloth", "paper", "rubber", "stone", "cotton", "wool", "steel", "iron"], isNamingPhrase),
  "sc3-food": science("food (fruit, vegetables, milk, junk food…)", FOODS),
  "sc3-matter": science("solids, liquids and gases (rock, water, ice, air, steam…)", ["rock", "stone", "water", "ice", "snow", "steam", "air", "gas", "liquid", "solid", "balloon", "juice", "milk", "oil", "smoke", "bubble", "melting", "boiling"]),
  "sc3-light": science("light and shadows (sun, lamp, torch, candle, shadow…)", ["sun", "lamp", "torch", "candle", "moon", "light", "shadow", "bulb", "fire", "star", "sunlight", "wall"]),
  "sc3-forces": science("pushing and pulling", ["push", "pull", "pushing", "pulling", "kick", "kicking", "door", "opening", "closing", "ball", "cart", "pram", "bike", "pedal", "kite", "swing", "rope", "drawer", "lifting", "throwing"]),
  "sc4-classify": science("animals and their groups (vertebrates, insects, spiders…)", ANIMALS),
  "sc4-digestion": science("food and digestion (stomach, mouth, teeth, eating…)", [...BODY_WORDS, ...FOODS, "eating", "chewing", "brushing", "toothbrush", "digestion"]),
  "sc4-sound": science("sounds and how we hear them", ["bell", "drum", "guitar", "piano", "flute", "whistle", "singing", "listening", "ear", "music", "sound", "loud", "quiet", "clap", "clapping", "speaker", "phone", "radio", "vibrate", "noise"]),
  "sc4-magnets": science("magnets and the things they pull or don't pull", ["magnet", "magnetic", "key", "spoon", "pin", "nail", "coin", "pencil", "iron", "steel", "clip", "paperclip", "fridge", "compass", "attract", "repel"]),
  "sc5-heartlungs": science("the heart, the lungs and exercise", [...BODY_WORDS, "running", "exercise", "jumping", "swimming", "oxygen"]),
  "sc5-electricity": science("electricity and the things that use it", ["lamp", "bulb", "battery", "phone", "wire", "switch", "plug", "fan", "torch", "tv", "television", "computer", "circuit", "socket", "spoon", "pencil", "electricity"]),
  "sc5-space": science("the sun, the moon, the planets and space", ["sun", "moon", "earth", "star", "planet", "rocket", "astronaut", "mars", "jupiter", "saturn", "comet", "space", "sky", "orbit", "satellite"]),
  "sc5-environment": science("our environment (trees, pollution, rubbish, recycling…)", ["tree", "car", "river", "smoke", "rubbish", "trash", "litter", "recycle", "recycling", "bin", "factory", "plastic", "air", "pollution", "garden", "park", "cleaning", "planting"]),
  "sc5-friction": science("friction and things that slow down or grip", ["bike", "bicycle", "ball", "shoe", "ice", "grass", "road", "slide", "brake", "tyre", "tire", "riding", "sliding", "rolling", "rubbing", "floor"]),
};

function ruleFor(chapterId: string): ChapterRule | null {
  if (isPrepositionChapter(chapterId)) return POSITION_RULE;
  return CHAPTER_RULES[chapterId] ?? null;
}

/** The chapter lesson this sentence is, if any (case and full stops ignored). */
function lessonFor(chapterId: string, sentence: string): Lesson | null {
  const course = chapterById(chapterId);
  const clean = sentence.trim().toLowerCase().replace(/[.!?]+$/, "");
  return (
    course?.chapter.lessons.find(
      (l) => l.say.toLowerCase() === clean || (!!l.question && l.question.toLowerCase().trim() === clean),
    ) ?? null
  );
}

/**
 * Whether a sentence belongs to the active chapter. Its own lessons always do;
 * anything else has to fit the chapter's topic — in English Grade 1
 * "Prepositions" only sentences that say where something is are drawn.
 */
export function validateChapterSentence(chapterId: string, sentence: string): ChapterValidation {
  const clean = sentence.trim().toLowerCase();
  if (!clean) return { valid: false, reason: "Please enter or speak a sentence first." };

  const course = chapterById(chapterId);
  if (!course) return { valid: true };
  if (lessonFor(chapterId, clean)) return { valid: true };

  const { subject, grade, chapter } = course;
  if (subject.id !== "math" && anyMath(clean)) {
    return {
      valid: false,
      reason: `Math questions belong in Mathematics! This chapter is ${subject.title.en} (${chapter.title.en}).`,
      hint: "Please switch to the Mathematics subject from 'Switch Chapter' to solve math sums and word problems.",
      suggestions: ["Switch Chapter", "Mathematics"],
    };
  }

  const rule = ruleFor(chapterId);
  if (!rule || rule.test(clean)) return { valid: true };

  const examples = chapter.lessons.slice(0, 3).map((l) => l.say);
  return {
    valid: false,
    reason: `${chapter.title.en} (${subject.title.en} · Grade ${grade}) only makes pictures of ${rule.about}.`,
    hint: `Try: ${examples.map((e) => `"${e}"`).join(" or ")}.`,
    suggestions: examples,
  };
}

// --- AI picture prompt --------------------------------------------------------

const NO_TEXT = "Absolutely no text, no letters, no words, no labels, no watermark.";
const BASE_STYLE =
  "Calm, simple children's picture-book illustration for a primary school lesson: soft cheerful colours, clean outlines, " +
  "plain light background with no clutter, the main subjects large, centred and fully in view.";

const NUMBER_NAMES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function plural(noun: string): string {
  if (/(fish|sheep|deer|mice|people|children)$/.test(noun)) return noun;
  if (/[^aeiou]y$/.test(noun)) return noun.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/.test(noun)) return noun + "es";
  return noun + "s";
}

/** How each position looks, so the picture can't be read any other way. */
/** `sv` is the subject and its verb: "one ball is", "two birds are flying". */
function positionScene(sv: string, rel: string, ref: string): string {
  switch (rel) {
    case "on":
      return `${sv} on top of ${ref}, resting on its top surface, clearly on it and not beside it`;
    case "under":
      return `${sv} underneath ${ref}, on the floor below it, with ${ref} clearly over the top of it`;
    case "above":
      return `${sv} up in the air above ${ref}, clearly higher than it with empty space between them`;
    case "behind":
      return `${sv} behind ${ref}: ${ref} is in front and partly hides it, so only part of it peeks out from behind`;
    case "in front of":
      return `${sv} in front of ${ref}, closer to the viewer, with ${ref} clearly behind it and fully visible`;
    case "beside":
      return `${sv} right next to ${ref}, side by side on the same ground, not touching or overlapping`;
    case "inside":
      return `${sv} inside ${ref}, which is open so you can clearly see it sitting in it, not floating`;
    case "between":
      return `${sv} between two ${plural(ref.replace(/^the /, ""))}, one on each side`;
    default:
      return `${sv} ${rel} ${ref}`;
  }
}

/** What the picture should show for this sentence, before the shared style. */
function sceneFor(chapterId: string, kind: PictureKind | null, clean: string, graph: SceneGraph): string {
  // math sums and story problems: the exact number of things, never the numbers
  if (chapterId.startsWith("ma")) {
    const math = parseMath(clean);
    if (math) {
      const one = math.object || "item";
      const many = plural(one);
      switch (math.op) {
        case "+":
          return `Exactly ${math.a} colorful ${plural(one)} on the left and ${math.b} colorful ${many} on the right, making ${math.result} ${many} in all, side by side on a plain white surface`;
        case "-":
          return `Exactly ${math.a} colorful ${many} on a plain white surface, with ${math.b} of them separated and moved a little away to take away, leaving ${math.result} ${many} together`;
        case "×":
          return `Exactly ${math.a} neat groups, each holding exactly ${math.b} ${many}, in a tidy row`;
        case "÷":
          return `Exactly ${math.a} ${many} shared equally into ${math.b} groups, with ${math.result} ${many} in each group`;
      }
    }
    if (parseWordProblem(clean)) return `A storybook scene of: "${storyWithoutQuestion(clean)}", showing exactly the number of things the story says`;
  }

  if (kind === "position") {
    const s = graph.subject;
    const r = graph.reference;
    if (graph.relation && s && r) {
      const what = `${s.color ? s.color + " " : ""}${s.size && s.size !== "normal" ? s.size + " " : ""}${s.count > 1 ? plural(s.type) : s.type}`;
      const sv = `${s.count > 1 ? `${NUMBER_NAMES[s.count] ?? s.count} ${what} are` : `one ${what} is`}${s.action ? ` ${s.action}` : ""}`;
      return `${positionScene(sv, graph.relation, `the ${r.type}`)}. Both the ${s.type} and the ${r.type} are large and fully visible together`;
    }
    return `"${clean}" — every object in the sentence large and fully visible, and its position exactly as the sentence says`;
  }

  if (kind === "science") {
    const organ = ORGANS.find((o) => new RegExp(`\\b${o}\\b`, "i").test(clean));
    if (organ) {
      const where = /stomach|intestine|liver|kidney/.test(organ) ? "tummy" : /brain/.test(organ) ? "head" : "chest";
      return `A friendly, smiling child seen from the front, with a gentle see-through window on the ${where} showing the ${organ} in the right place, simple and cute, not scary, no blood`;
    }
  }

  if (kind === "shape") {
    const shape = clean.replace(/^(a|an|the)\s+/i, "");
    return `One large ${shape}, bold and brightly coloured, centred on a plain white background, with a perfectly accurate outline`;
  }

  return `"${clean}"`;
}

/** Extra guidance each kind of chapter needs, so the lesson point is what you see first. */
const KIND_FOCUS: Record<PictureKind, string> = {
  position: "The position is the lesson: make it impossible to misread.",
  colour: "The colour word is the lesson: that colour is bright and strong on the object; the rest of the picture is soft and neutral.",
  action: "The action is the lesson: the character is clearly in the middle of doing it, with an expressive pose.",
  size: "The size is the lesson: make it obvious, next to an everyday object for scale.",
  count: "Show exactly the number of things the sentence says, each one separate and easy to count. No numbers or math symbols.",
  describe: "Every describing word in the sentence (colour, size, feeling) is clearly visible.",
  thing: "One single, instantly recognisable object or person, filling most of the picture.",
  shape: "Only the shape or object named, with no other objects.",
  clock: "If a clock is shown, its face is simple and its hands are easy to read.",
  science: "Scientifically accurate but friendly, like a children's science textbook.",
};

/**
 * Builds the AI picture prompt for a sentence in a chapter: the lesson's own
 * `draw` scene when it has one, otherwise a scene built from the sentence, plus
 * what the chapter needs the child to notice (the position, the colour, the
 * exact count…). Uppercase lesson words are avoided — image models tend to
 * paint them as text.
 */
export function getChapterImagePrompt(chapterId: string, sentence: string, inputGraph?: SceneGraph): string {
  const clean = sentence.trim().replace(/[.!]+$/, "");
  const graph = inputGraph ?? parseSceneGraph(clean);
  const course = chapterById(chapterId);
  const rule = ruleFor(chapterId);
  const kind = rule?.kind ?? null;

  const lesson = lessonFor(chapterId, clean);
  const scene = lesson?.draw ?? sceneFor(chapterId, kind, clean, graph);
  // "HCF and LCM" would be painted as letters, so such titles use the chapter summary
  const title = course && (/\b[A-Z]{3,}\b/.test(course.chapter.title.en) ? course.chapter.summary.en.toLowerCase() : course.chapter.title.en);
  const topic = course ? `For a Grade ${course.grade} ${course.subject.title.en} lesson on ${title}.` : "";
  const focus = kind ? KIND_FOCUS[kind] : "";

  return [`${scene}.`, topic, focus, BASE_STYLE, NO_TEXT].filter(Boolean).join(" ");
}

/** Flattened list of all curriculum chapters for easy selection */
export function getAllChapters(): { subject: Subject; grade: Grade; chapter: Chapter }[] {
  const result: { subject: Subject; grade: Grade; chapter: Chapter }[] = [];
  for (const subject of SUBJECT_LIST) {
    for (const grade of GRADES) {
      const chapters = chaptersFor(subject, grade);
      for (const chapter of chapters) {
        result.push({ subject, grade, chapter });
      }
    }
  }
  return result;
}

export interface SpeechChallenge {
  prompt: string;
  targetText: string;
  hint: string;
}

/**
 * Speech therapy contrast activity generator:
 * Suggests the next natural minimal pair / spatial contrast challenge:
 * e.g., "The cat is on the table" -> "Now can you say: The cat is under the table?"
 */
export function getNextChallenge(sentence: string): SpeechChallenge | null {
  const clean = sentence.trim();
  if (clean.length < 3) return null;

  // 1. Math contrast challenge ("2 pencil + 1 pencil" -> "2 pencil + 2 pencil")
  const math = parseMath(clean);
  if (math) {
    if (math.op === "+") {
      const nextB = math.b >= 4 ? 1 : math.b + 1;
      const target = `${math.a} ${math.object} + ${nextB} ${math.object}`;
      return {
        prompt: `Great addition! Can you say:`,
        targetText: target,
        hint: target,
      };
    } else if (math.op === "-") {
      const nextB = math.b >= math.a ? 1 : math.b + 1;
      const target = `${math.a} ${math.object} - ${nextB} ${math.object}`;
      return {
        prompt: `Great subtraction! Can you say:`,
        targetText: target,
        hint: target,
      };
    }
  }

  // 2. Preposition contrast activities
  const lower = clean.toLowerCase();
  if (/\b(on top of|on)\b/.test(lower)) {
    return {
      prompt: `Great! Now can you say where it hides underneath?`,
      targetText: clean.replace(/\b(on top of|on)\b/i, "under"),
      hint: "under",
    };
  }
  if (/\b(under|underneath|below)\b/.test(lower)) {
    return {
      prompt: `Super! Now can you say what is behind?`,
      targetText: clean.replace(/\b(under|underneath|below)\b/i, "behind"),
      hint: "behind",
    };
  }
  if (/\bbehind\b/.test(lower)) {
    return {
      prompt: `Awesome! Now try saying beside / next to:`,
      targetText: clean.replace(/\bbehind\b/i, "next to"),
      hint: "next to",
    };
  }
  if (/\b(next to|beside|near)\b/.test(lower)) {
    return {
      prompt: `Excellent! Now try saying in front of:`,
      targetText: clean.replace(/\b(next to|beside|near)\b/i, "in front of"),
      hint: "in front of",
    };
  }
  if (/\bin front of\b/.test(lower)) {
    return {
      prompt: `Can you say on top of:`,
      targetText: clean.replace(/\bin front of\b/i, "on"),
      hint: "on",
    };
  }

  // 3. Colours contrast
  if (/\b(red)\b/i.test(lower)) return { prompt: "Now try changing the colour to blue:", targetText: clean.replace(/\bred\b/i, "blue"), hint: "blue" };
  if (/\b(blue)\b/i.test(lower)) return { prompt: "Now try changing the colour to green:", targetText: clean.replace(/\bblue\b/i, "green"), hint: "green" };
  if (/\b(green)\b/i.test(lower)) return { prompt: "Now try changing the colour to yellow:", targetText: clean.replace(/\bgreen\b/i, "yellow"), hint: "yellow" };

  // 4. Actions contrast
  if (/\b(sleeping)\b/i.test(lower)) return { prompt: "Now wake it up and say running:", targetText: clean.replace(/\bsleeping\b/i, "running"), hint: "running" };
  if (/\b(running)\b/i.test(lower)) return { prompt: "Now try saying jumping:", targetText: clean.replace(/\brunning\b/i, "jumping"), hint: "jumping" };

  return null;
}

