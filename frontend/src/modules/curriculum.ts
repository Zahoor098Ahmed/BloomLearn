import type { LanguageCode } from "../types";

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
const qa = (sentence: string, question: string, answer: string): Lesson => ({ say: sentence, question, answer });
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
        qa("A cake", "A cake is cut into 2 equal parts. Each part is?", "One half (1/2)"),
        qa("A pizza", "A pizza is cut into 4 equal parts. Each part is?", "One quarter (1/4)"),
        qa("A watermelon", "A watermelon is cut into 3 equal parts. Each part is?", "One third (1/3)"),
        qa("Four apples", "Half of 4 apples is?", "2 apples"),
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
        qa("A cake", "Write one half as a decimal.", "0.5"),
        qa("A pizza", "Write one quarter as a decimal.", "0.25"),
        qa("A chocolate", "3/4 of a chocolate bar is eaten. What fraction is left?", "1/4"),
        qa("A bottle", "0.5 litre + 0.5 litre = ?", "1 litre"),
      ]),
      ch("ma4-perimeter", "Perimeter and area", "المحيط والمساحة", "Around and inside a shape", "حول الشكل وداخله", [
        qa("A table", "A table top is 2 m long and 1 m wide. Perimeter?", "6 m"),
        qa("A square", "A square has sides of 5 cm. Perimeter?", "20 cm"),
        qa("A rug", "A rug is 3 m by 2 m. Area?", "6 square metres"),
        qa("A book", "A book cover is 20 cm by 15 cm. Area?", "300 square cm"),
      ]),
      ch("ma4-angles", "Angles", "الزوايا", "right · acute · obtuse", "قائمة · حادة · منفرجة", [
        qa("A clock", "At 3 o'clock the hands make which angle?", "A right angle (90°)"),
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
        qa("A cake", "Half of the cake is what percent?", "50%"),
        qa("A pizza", "One quarter of the pizza is what percent?", "25%"),
        qa("A bag", "A bag costs Rs 200. It is 10% off. How much do you save?", "Rs 20"),
        qa("Five apples", "2 of 5 apples are red. What percent is red?", "40%"),
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
        { say: "Flowering plants have seeds and flowers" },
        { say: "Non-flowering plants do not have seeds and flowers" },
        { say: "A tree" },
        { say: "A flower" },
        { say: "A green leaf" },
      ]),
      ch("sc1-animals", "Animals", "الحيوانات", "Backbones, and how animals move", "العمود الفقري وكيف تتحرك الحيوانات", [
        { say: "Vertebrates have a backbone" },
        { say: "Invertebrates do not have a backbone" },
        qa("A fish is swimming", "How does a fish move?", "It swims"),
        qa("A bird is flying", "How does a bird move?", "It flies"),
        qa("A frog is jumping", "How does a frog move?", "It jumps"),
      ]),
      ch("sc1-body", "My body", "جسمي", "heart · lungs · stomach", "heart · lungs · stomach", [
        qa("Heart", "What pumps blood?", "The heart"),
        qa("Add lungs", "What helps us breathe?", "The lungs"),
        qa("Add stomach", "Where does food go?", "The stomach"),
      ]),
      ch("sc1-sky", "Weather and sky", "الطقس والسماء", "sun · cloud · rain · moon", "sun · cloud · rain · moon", say(
        "The sun is above the tree", "A cloud", "Rain", "Snow", "A rainbow", "The moon", "Three stars",
      )),
    ],
    2: [
      ch("sc2-living", "Living and non-living things", "الكائنات الحية وغير الحية", "Does it grow, eat and breathe?", "هل ينمو ويأكل ويتنفس؟", [
        qa("A dog", "Living or non-living?", "Living"),
        qa("A rock", "Living or non-living?", "Non-living"),
        qa("A tree", "Living or non-living?", "Living"),
        qa("A car", "Living or non-living?", "Non-living"),
        qa("A baby", "Living or non-living?", "Living"),
      ]),
      ch("sc2-plantparts", "Parts of a plant", "أجزاء النبات", "root · stem · leaf · flower", "جذر · ساق · ورقة · زهرة", [
        qa("A green leaf", "Which part makes food for the plant?", "The leaf"),
        qa("A flower", "Which part makes seeds?", "The flower"),
        qa("A tree", "Which part holds the plant up?", "The stem (trunk)"),
        qa("A plant", "Which part takes in water from the soil?", "The root"),
      ]),
      ch("sc2-habitats", "Animal homes", "بيوت الحيوانات", "Where do animals live?", "أين تعيش الحيوانات؟", [
        qa("A fish is swimming", "Where does a fish live?", "In water"),
        qa("A camel", "Where does a camel live?", "In the desert"),
        qa("A penguin", "Where does a penguin live?", "In very cold places"),
        qa("A monkey is climbing", "Where does a monkey live?", "In the forest"),
        qa("A cow", "Where does a cow live?", "On a farm"),
      ]),
      ch("sc2-materials", "Materials", "المواد", "wood · metal · glass · cloth", "خشب · معدن · زجاج · قماش", [
        qa("A chair", "What is a chair often made of?", "Wood"),
        qa("A spoon", "What is a spoon often made of?", "Metal"),
        qa("A glass", "What is a glass made of?", "Glass"),
        qa("A shirt", "What is a shirt made of?", "Cloth"),
      ]),
    ],
    3: [
      ch("sc3-food", "Healthy food", "الغذاء الصحي", "Food that helps us grow", "غذاء يساعدنا على النمو", [
        qa("An apple", "Healthy food or junk food?", "Healthy food"),
        qa("A burger", "Healthy food or junk food?", "Junk food (eat it rarely)"),
        qa("Milk", "Milk makes our ___ and teeth strong.", "bones"),
        qa("A carrot", "Healthy food or junk food?", "Healthy food"),
        qa("Candy", "Too much candy is bad for our ___.", "teeth"),
      ]),
      ch("sc3-matter", "Solids, liquids and gases", "المواد الصلبة والسائلة والغازية", "States of matter", "حالات المادة", [
        qa("A rock", "Solid, liquid or gas?", "Solid"),
        qa("Water", "Solid, liquid or gas?", "Liquid"),
        qa("A balloon", "The air inside a balloon is a ___.", "gas"),
        qa("Snow", "When snow melts it becomes?", "Water (a liquid)"),
      ]),
      ch("sc3-light", "Light and shadows", "الضوء والظلال", "Where light comes from", "من أين يأتي الضوء", [
        qa("The sun is above the tree", "What is our main source of light?", "The Sun"),
        qa("A lamp", "Is a lamp a natural or a man-made light?", "Man-made"),
        qa("The moon", "Does the Moon make its own light?", "No, it reflects sunlight"),
        qa("The boy is standing in front of the wall", "What forms when an object blocks light?", "A shadow"),
      ]),
      ch("sc3-forces", "Push and pull", "الدفع والسحب", "Forces make things move", "القوى تحرك الأشياء", [
        qa("The boy is kicking a ball", "Push or pull?", "Push"),
        qa("The girl is opening the door", "Opening a drawer is a push or a pull?", "Pull"),
        qa("The man is riding a bike", "Pressing the pedal is a push or a pull?", "Push"),
        qa("A kite", "Flying a kite with a string is a push or a pull?", "Pull"),
      ]),
    ],
    4: [
      ch("sc4-classify", "Classifying living things", "تصنيف الكائنات الحية", "Vertebrates and invertebrates", "الفقاريات واللافقاريات", [
        { say: "Vertebrates have a backbone" },
        { say: "Invertebrates do not have a backbone" },
        qa("A butterfly", "How many legs does an insect have?", "6"),
        qa("A spider", "How many legs does a spider have?", "8"),
        qa("A bird", "Is a bird a vertebrate?", "Yes"),
      ]),
      ch("sc4-digestion", "Digestive system", "الجهاز الهضمي", "How food is used", "كيف يُستعمل الطعام", [
        qa("Add stomach", "Where is food mixed with juices?", "In the stomach"),
        qa("The boy is eating", "Where does digestion begin?", "In the mouth"),
        qa("The girl is brushing", "Why should we brush our teeth?", "To keep teeth clean and healthy"),
        qa("An apple", "Which food has fibre that helps digestion?", "Fruit and vegetables"),
      ]),
      ch("sc4-sound", "Sound", "الصوت", "Vibrations we can hear", "اهتزازات نسمعها", [
        qa("A bell", "Sound is made when things ___.", "vibrate"),
        qa("The girl is singing", "What part of the body makes our voice?", "The voice box"),
        qa("A drum", "Hitting a drum harder makes the sound?", "Louder"),
        qa("The boy is listening", "Which organ do we hear with?", "The ear"),
      ]),
      ch("sc4-magnets", "Magnets", "المغناطيس", "Attract and repel", "التجاذب والتنافر", [
        qa("A key", "Will a magnet pull an iron key?", "Yes"),
        qa("A pencil", "Will a magnet pull a wooden pencil?", "No"),
        qa("A spoon", "Will a magnet pull a steel spoon?", "Yes"),
        qa("A magnet", "Two north poles facing each other will?", "Push apart (repel)"),
      ]),
    ],
    5: [
      ch("sc5-heartlungs", "Heart and lungs", "القلب والرئتان", "Circulation and breathing", "الدورة الدموية والتنفس", [
        qa("Heart", "Which organ pumps blood around the body?", "The heart"),
        qa("Add lungs", "Which gas do our lungs take in?", "Oxygen"),
        qa("Add lungs", "Which gas do we breathe out?", "Carbon dioxide"),
        qa("The boy is running", "What happens to your heartbeat when you run?", "It gets faster"),
      ]),
      ch("sc5-electricity", "Electricity", "الكهرباء", "Circuits and safety", "الدوائر والسلامة", [
        qa("A lamp", "What makes a bulb glow?", "Electric current"),
        qa("A phone", "What stores electricity in a phone?", "A battery"),
        qa("A spoon", "Is metal a conductor or an insulator?", "Conductor"),
        qa("A pencil", "Is wood a conductor or an insulator?", "Insulator"),
      ]),
      ch("sc5-space", "The solar system", "المجموعة الشمسية", "Sun, Earth and Moon", "الشمس والأرض والقمر", [
        qa("The sun", "What is at the centre of our solar system?", "The Sun"),
        qa("The moon", "What does the Moon go around?", "The Earth"),
        qa("Three stars", "The Sun is a ___.", "star"),
        qa("A rocket", "How many planets are in our solar system?", "8"),
      ]),
      ch("sc5-environment", "Our environment", "بيئتنا", "Clean air, water and land", "هواء وماء وأرض نظيفة", [
        qa("A tree", "Trees give us which gas?", "Oxygen"),
        qa("A car", "Smoke from cars causes?", "Air pollution"),
        qa("A river", "Throwing rubbish in a river causes?", "Water pollution"),
        qa("The girl is cleaning", "Reduce, reuse and ___.", "recycle"),
      ]),
      ch("sc5-friction", "Forces and friction", "القوى والاحتكاك", "What slows things down", "ما الذي يبطئ الأشياء", [
        qa("The boy is riding a bike", "Which force slows a moving bike?", "Friction"),
        qa("A ball", "A ball rolls farther on grass or on ice?", "On ice (less friction)"),
        qa("A shoe", "Why do shoes have grooves on the bottom?", "To grip the ground (more friction)"),
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
