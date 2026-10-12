# BloomLearn — Science Curriculum Audit & Expansion Research (Grade 1 to 5)

> **Document Type:** Curriculum Audit, Content Inventory & Expansion Research  
> **Target Subject:** Science (`frontend/src/modules/curriculum.ts`)  
> **Curriculum Standards Referenced:** Single National Curriculum (SNC Pakistan 2020/2023), Cambridge Primary Science (Stages 1–5), Oxford Primary Science  
> **App Target Engine:** BloomLearn Picture Talk (Sentence-to-Image & Speech Recognition Engine)

---

## 1. Executive Summary & Client Feedback Analysis

### Client Feedback:
> *"Chapter ke andar content bohat kam hai. Grade 1 se Grade 5 tak Science ke chapters aur content ki audit do, aur aur chapters / lessons ki research karo."*

### Key Findings of the Audit:
1. **Total Science Chapters:** **21 Chapters** across Grade 1 to Grade 5.
2. **Total Science Lessons:** **103 Lessons** in total.
3. **The Core Problem:**
   - Out of 21 chapters, **19 chapters have ONLY 3 to 5 sentences / questions**!
   - Sirf **Grade 1: My body (`sc1-body`)** mein 15 lessons hain. Baqi almost tamam chapters 3–5 items ke baad khatam ho jaate hain.
   - Ek bacha ya teacher agar chapter open kare toh 45 seconds ke andar pura chapter khatam ho jata hai.
   - Bohot se core primary science topics bilkul missing hain (jaise: Senses, Life Cycles, Water Cycle, Food Chain, Simple Machines, Human Skeleton, Microorganisms, etc.).

---

## 2. Complete Inventory of Existing Science Content (Grade 1 – 5)

Neeche mojooda code (`curriculum.ts`) mein Grade 1 se Grade 5 tak jitne bhi chapters aur unke exact lessons hain, unki tafseel darj hai:

### 🟢 Grade 1 Science (Total: 4 Chapters | 32 Lessons)

| Chapter ID | Title (EN / AR) | Summary | Lessons Count |
|---|---|---|---|
| `sc1-plants` | Plants / النباتات | Flowers, seeds and leaves | 5 lessons |
| `sc1-animals` | Animals / الحيوانات | Backbones, and how animals move | 5 lessons |
| `sc1-body` | My body / جسمي | eyes · ears · hands · heart | 15 lessons |
| `sc1-sky` | Weather and sky / الطقس والسماء | sun · cloud · rain · moon | 7 lessons |

#### Detail of Grade 1 Lessons:
1. **`sc1-plants` (5 lessons):**
   - Lesson 1: *"Flowering plants have seeds and flowers"*
   - Lesson 2: *"Non-flowering plants do not have seeds and flowers"*
   - Lesson 3: *"A tree"*
   - Lesson 4: *"A flower"*
   - Lesson 5: *"A green leaf"*
2. **`sc1-animals` (5 lessons):**
   - Lesson 1: *"Vertebrates have a backbone"*
   - Lesson 2: *"Invertebrates do not have a backbone"*
   - Lesson 3: *"A fish is swimming"* | Q: *How does a fish move?* | A: *It swims*
   - Lesson 4: *"A bird is flying"* | Q: *How does a bird move?* | A: *It flies*
   - Lesson 5: *"A frog is jumping"* | Q: *How does a frog move?* | A: *It jumps*
3. **`sc1-body` (15 lessons):**
   - The eyes (*What do we see with?* -> *Our eyes*)
   - The ears (*What do we hear with?* -> *Our ears*)
   - The nose (*What do we smell with?* -> *Our nose*)
   - The mouth (*What do we eat and talk with?* -> *Our mouth*)
   - The hands (*What do we hold and clap with?* -> *Our hands*)
   - The feet (*What do we walk and run with?* -> *Our feet*)
   - The teeth (*What do we chew food with?* -> *Our teeth*)
   - The tongue (*What do we taste food with?* -> *Our tongue*)
   - The hair (*What grows on top of our head?* -> *Hair*)
   - The fingers (*How many fingers are on one hand?* -> *5*)
   - The brain (*What helps us think?* -> *The brain*)
   - The bones (*What makes our body strong and gives it shape?* -> *Our bones*)
   - The heart (*What pumps blood?* -> *The heart*)
   - The lungs (*What helps us breathe?* -> *The lungs*)
   - The stomach (*Where does food go?* -> *The stomach*)
4. **`sc1-sky` (7 lessons):**
   - Lesson 1: *"The sun is above the tree"*
   - Lesson 2: *"A cloud"*
   - Lesson 3: *"Rain"*
   - Lesson 4: *"Snow"*
   - Lesson 5: *"A rainbow"*
   - Lesson 6: *"The moon"*
   - Lesson 7: *"Three stars"*

---

### 🟡 Grade 2 Science (Total: 4 Chapters | 18 Lessons)

| Chapter ID | Title (EN / AR) | Summary | Lessons Count |
|---|---|---|---|
| `sc2-living` | Living and non-living things / الكائنات الحية وغير الحية | Does it grow, eat and breathe? | 5 lessons |
| `sc2-plantparts` | Parts of a plant / أجزاء النبات | root · stem · leaf · flower | 4 lessons |
| `sc2-habitats` | Animal homes / بيوت الحيوانات | Where do animals live? | 5 lessons |
| `sc2-materials` | Materials / المواد | wood · metal · glass · cloth | 4 lessons |

#### Detail of Grade 2 Lessons:
1. **`sc2-living` (5 lessons):**
   - *"A dog"* | Q: *Living or non-living?* | A: *Living*
   - *"A rock"* | Q: *Living or non-living?* | A: *Non-living*
   - *"A tree"* | Q: *Living or non-living?* | A: *Living*
   - *"A car"* | Q: *Living or non-living?* | A: *Non-living*
   - *"A baby"* | Q: *Living or non-living?* | A: *Living*
2. **`sc2-plantparts` (4 lessons):**
   - *"A green leaf"* | Q: *Which part makes food for the plant?* | A: *The leaf*
   - *"A flower"* | Q: *Which part makes seeds?* | A: *The flower*
   - *"A tree"* | Q: *Which part holds the plant up?* | A: *The stem (trunk)*
   - *"A plant"* | Q: *Which part takes in water from the soil?* | A: *The root*
3. **`sc2-habitats` (5 lessons):**
   - *"A fish is swimming"* | Q: *Where does a fish live?* | A: *In water*
   - *"A camel"* | Q: *Where does a camel live?* | A: *In the desert*
   - *"A penguin"* | Q: *Where does a penguin live?* | A: *In very cold places*
   - *"A monkey is climbing"* | Q: *Where does a monkey live?* | A: *In the forest*
   - *"A cow"* | Q: *Where does a cow live?* | A: *On a farm*
4. **`sc2-materials` (4 lessons):**
   - *"A chair"* | Q: *What is a chair often made of?* | A: *Wood*
   - *"A spoon"* | Q: *What is a spoon often made of?* | A: *Metal*
   - *"A glass"* | Q: *What is a glass made of?* | A: *Glass*
   - *"A shirt"* | Q: *What is a shirt made of?* | A: *Cloth*

---

### 🟠 Grade 3 Science (Total: 4 Chapters | 17 Lessons)

| Chapter ID | Title (EN / AR) | Summary | Lessons Count |
|---|---|---|---|
| `sc3-food` | Healthy food / الغذاء الصحي | Food that helps us grow | 5 lessons |
| `sc3-matter` | Solids, liquids and gases / المواد الصلبة والسائلة والغازية | States of matter | 4 lessons |
| `sc3-light` | Light and shadows / الضوء والظلال | Where light comes from | 4 lessons |
| `sc3-forces` | Push and pull / الدفع والسحب | Forces make things move | 4 lessons |

#### Detail of Grade 3 Lessons:
1. **`sc3-food` (5 lessons):**
   - *"An apple"* | Q: *Healthy food or junk food?* | A: *Healthy food*
   - *"A burger"* | Q: *Healthy food or junk food?* | A: *Junk food (eat it rarely)*
   - *"Milk"* | Q: *Milk makes our ___ and teeth strong.* | A: *bones*
   - *"A carrot"* | Q: *Healthy food or junk food?* | A: *Healthy food*
   - *"Candy"* | Q: *Too much candy is bad for our ___.* | A: *teeth*
2. **`sc3-matter` (4 lessons):**
   - *"A rock"* | Q: *Solid, liquid or gas?* | A: *Solid*
   - *"Water"* | Q: *Solid, liquid or gas?* | A: *Liquid*
   - *"A balloon"* | Q: *The air inside a balloon is a ___.* | A: *gas*
   - *"Snow"* | Q: *When snow melts it becomes?* | A: *Water (a liquid)*
3. **`sc3-light` (4 lessons):**
   - *"The sun is above the tree"* | Q: *What is our main source of light?* | A: *The Sun*
   - *"A lamp"* | Q: *Is a lamp a natural or a man-made light?* | A: *Man-made*
   - *"The moon"* | Q: *Does the Moon make its own light?* | A: *No, it reflects sunlight*
   - *"The boy is standing in front of the wall"* | Q: *What forms when an object blocks light?* | A: *A shadow*
4. **`sc3-forces` (4 lessons):**
   - *"The boy is kicking a ball"* | Q: *Push or pull?* | A: *Push*
   - *"The girl is opening the door"* | Q: *Opening a drawer is a push or a pull?* | A: *Pull*
   - *"The man is riding a bike"* | Q: *Pressing the pedal is a push or a pull?* | A: *Push*
   - *"A kite"* | Q: *Flying a kite with a string is a push or a pull?* | A: *Pull*

---

### 🔵 Grade 4 Science (Total: 4 Chapters | 17 Lessons)

| Chapter ID | Title (EN / AR) | Summary | Lessons Count |
|---|---|---|---|
| `sc4-classify` | Classifying living things / تصنيف الكائنات الحية | Vertebrates and invertebrates | 5 lessons |
| `sc4-digestion` | Digestive system / الجهاز الهضمي | How food is used | 4 lessons |
| `sc4-sound` | Sound / الصوت | Vibrations we can hear | 4 lessons |
| `sc4-magnets` | Magnets / المغناطيس | Attract and repel | 4 lessons |

#### Detail of Grade 4 Lessons:
1. **`sc4-classify` (5 lessons):**
   - *"Vertebrates have a backbone"*
   - *"Invertebrates do not have a backbone"*
   - *"A butterfly"* | Q: *How many legs does an insect have?* | A: *6*
   - *"A spider"* | Q: *How many legs does a spider have?* | A: *8*
   - *"A bird"* | Q: *Is a bird a vertebrate?* | A: *Yes*
2. **`sc4-digestion` (4 lessons):**
   - *"The stomach"* | Q: *Where is food mixed with juices?* | A: *In the stomach*
   - *"The boy is eating"* | Q: *Where does digestion begin?* | A: *In the mouth*
   - *"The girl is brushing her teeth"* | Q: *Why should we brush our teeth?* | A: *To keep teeth clean and healthy*
   - *"An apple"* | Q: *Which food has fibre that helps digestion?* | A: *Fruit and vegetables*
3. **`sc4-sound` (4 lessons):**
   - *"A bell"* | Q: *Sound is made when things ___.* | A: *vibrate*
   - *"The girl is singing"* | Q: *What part of the body makes our voice?* | A: *The voice box*
   - *"A drum"* | Q: *Hitting a drum harder makes the sound?* | A: *Louder*
   - *"The boy is listening"* | Q: *Which organ do we hear with?* | A: *The ear*
4. **`sc4-magnets` (4 lessons):**
   - *"A key"* | Q: *Will a magnet pull an iron key?* | A: *Yes*
   - *"A pencil"* | Q: *Will a magnet pull a wooden pencil?* | A: *No*
   - *"A spoon"* | Q: *Will a magnet pull a steel spoon?* | A: *Yes*
   - *"A magnet"* | Q: *Two north poles facing each other will?* | A: *Push apart (repel)*

---

### 🟣 Grade 5 Science (Total: 5 Chapters | 19 Lessons)

| Chapter ID | Title (EN / AR) | Summary | Lessons Count |
|---|---|---|---|
| `sc5-heartlungs` | Heart and lungs / القلب والرئتان | Circulation and breathing | 4 lessons |
| `sc5-electricity` | Electricity / الكهرباء | Circuits and safety | 4 lessons |
| `sc5-space` | The solar system / المجموعة الشمسية | Sun, Earth and Moon | 4 lessons |
| `sc5-environment` | Our environment / بيئتنا | Clean air, water and land | 4 lessons |
| `sc5-friction` | Forces and friction / القوى والاحتكاك | What slows things down | 3 lessons |

#### Detail of Grade 5 Lessons:
1. **`sc5-heartlungs` (4 lessons):**
   - *"The heart"* | Q: *Which organ pumps blood around the body?* | A: *The heart*
   - *"The lungs"* | Q: *Which gas do our lungs take in?* | A: *Oxygen*
   - *"The lungs"* | Q: *Which gas do we breathe out?* | A: *Carbon dioxide*
   - *"The boy is running"* | Q: *What happens to your heartbeat when you run?* | A: *It gets faster*
2. **`sc5-electricity` (4 lessons):**
   - *"A lamp"* | Q: *What makes a bulb glow?* | A: *Electric current*
   - *"A phone"* | Q: *What stores electricity in a phone?* | A: *A battery*
   - *"A spoon"* | Q: *Is metal a conductor or an insulator?* | A: *Conductor*
   - *"A pencil"* | Q: *Is wood a conductor or an insulator?* | A: *Insulator*
3. **`sc5-space` (4 lessons):**
   - *"The sun"* | Q: *What is at the centre of our solar system?* | A: *The Sun*
   - *"The moon"* | Q: *What does the Moon go around?* | A: *The Earth*
   - *"Three stars"* | Q: *The Sun is a ___.* | A: *star*
   - *"A rocket"* | Q: *How many planets are in our solar system?* | A: *8*
4. **`sc5-environment` (4 lessons):**
   - *"A tree"* | Q: *Trees give us which gas?* | A: *Oxygen*
   - *"A car"* | Q: *Smoke from cars causes?* | A: *Air pollution*
   - *"A river"* | Q: *Throwing rubbish in a river causes?* | A: *Water pollution*
   - *"The girl is cleaning"* | Q: *Reduce, reuse and ___.* | A: *recycle*
5. **`sc5-friction` (3 lessons):**
   - *"The boy is riding a bike"* | Q: *Which force slows a moving bike?* | A: *Friction*
   - *"A ball"* | Q: *A ball rolls farther on grass or on ice?* | A: *On ice (less friction)*
   - *"A shoe"* | Q: *Why do shoes have grooves on the bottom?* | A: *To grip the ground (more friction)*

---

## 3. Curriculum Gap Analysis & Missing Topics (Research)

Comparison with standard primary curricula (Pakistan Single National Curriculum SNC, Cambridge Primary Science Framework 0097, and Oxford Progressive Science):

### Missing Topics by Grade:

| Grade | Current BloomLearn Topics | Missing Essential Topics (Curriculum Standards) |
|---|---|---|
| **Grade 1** | Plants, Animals, Body Parts, Weather/Sky | **The 5 Senses**, **Day & Night / Seasons**, **Keeping Clean & Healthy (Hygiene)**, **Animal Offspring / Babies** |
| **Grade 2** | Living/Non-Living, Plant Parts, Habitats, Materials | **Plant Life Cycle / Seed Germination**, **Animal Life Cycles (Frog, Butterfly)**, **Heat & Cold (Temperature)**, **Water Uses & Sources** |
| **Grade 3** | Healthy Food, States of Matter, Light & Shadows, Push/Pull | **The Water Cycle**, **Properties of Materials (Transparent/Opaque)**, **Plant Needs (Sunlight, Soil, Air)**, **Habitats & Adaptations** |
| **Grade 4** | Classifying Living Things, Digestion, Sound, Magnets | **Ecosystems & Food Chains**, **Changes of State (Boiling, Melting, Freezing)**, **Human Teeth & Oral Care**, **Simple Machines (Levers, Pulleys, Wheels)** |
| **Grade 5** | Heart/Lungs, Electricity, Solar System, Environment, Friction | **Skeletal & Muscular System**, **Microorganisms (Good & Bad Germs)**, **Energy Forms (Solar, Wind, Sound, Heat)**, **Earth's Layers, Rocks & Soil** |

---

## 4. Strategic Content Expansion Roadmap

Hum 2 steps mein content ko 3x to 4x rich aur engaging bana sakte hain:
1. **Existing Chapters Expansion:** Har chapter mein 3–4 lessons ke bajaye **8 se 10 lessons** karna (with interactive Q&A and image descriptions).
2. **New Chapters Addition:** Har Grade mein **2 se 3 naye high-value chapters** add karna jo curriculum standards se 100% align hon.

---

### Phase 1: Expanding Existing Chapters (Immediate Wins)

#### Grade 1 Expansions:
- **`sc1-plants`**: Add:
  - *"A cactus"* (Q: *Where does a cactus grow?* -> *In the desert*)
  - *"A tomato plant"* (Q: *Do tomatoes grow on a plant?* -> *Yes*)
  - *"Roots grow under the ground"* (Q: *Where do roots grow?* -> *Under the ground*)
  - *"Seeds grow into new plants"* (Q: *What do seeds grow into?* -> *Plants*)
- **`sc1-animals`**: Add:
  - *"A horse is running"* (Q: *How does a horse move?* -> *It runs / gallops*)
  - *"A snake is sliding"* (Q: *Does a snake have legs?* -> *No*)
  - *"A duck is swimming in the pond"* (Q: *Where is the duck?* -> *In the pond*)
  - *"A puppy is a baby dog"* (Q: *What is a baby dog called?* -> *A puppy*)
  - *"A kitten is a baby cat"* (Q: *What is a baby cat called?* -> *A kitten*)

#### Grade 2 Expansions:
- **`sc2-plantparts`**: Add:
  - *"A trunk"* (Q: *What is the thick stem of a tree called?* -> *Trunk*)
  - *"Green leaves need sunlight"* (Q: *What gives plants green colour and energy?* -> *Sunlight*)
  - *"A seed in the soil"* (Q: *What needs water to sprout?* -> *A seed*)
  - *"A red apple on the branch"* (Q: *Which part holds seeds inside?* -> *Fruit*)
- **`sc2-materials`**: Add:
  - *"A plastic bottle"* (Q: *What is the bottle made of?* -> *Plastic*)
  - *"A brick wall"* (Q: *What is a brick made of?* -> *Clay / stone*)
  - *"A rubber tire"* (Q: *What is a tire made of?* -> *Rubber*)
  - *"A paper notebook"* (Q: *What is paper made from?* -> *Trees / wood*)
- **`sc2-habitats`**: Add:
  - *"A bird is in the nest"* (Q: *Where do birds lay eggs?* -> *In a nest*)
  - *"A bee is on the honeycomb"* (Q: *Where do bees make honey?* -> *In a beehive*)
  - *"A rabbit in a burrow"* (Q: *Where do rabbits live underground?* -> *In a burrow*)
  - *"A lion in a den"* (Q: *Where does a lion sleep?* -> *In a den*)

#### Grade 3 Expansions:
- **`sc3-matter`**: Add:
  - *"Ice is frozen water"* (Q: *Is ice a solid or liquid?* -> *Solid*)
  - *"Steam rises from the kettle"* (Q: *Is steam a liquid or gas?* -> *Gas*)
  - *"Juice in a cup"* (Q: *Does liquid take the shape of its container?* -> *Yes*)
  - *"Air in the football"* (Q: *What fills the inside of a football?* -> *Air (gas)*)
- **`sc3-light`**: Add:
  - *"A glowing torch"* (Q: *Does a torch need a battery to give light?* -> *Yes*)
  - *"A mirror"* (Q: *What reflects light back to our eyes?* -> *A mirror*)
  - *"A dark room"* (Q: *Can we see without light?* -> *No*)
  - *"A long shadow in the evening"* (Q: *When are shadows longer?* -> *In the morning and evening*)
- **`sc3-forces`**: Add:
  - *"Pulling a wagon"* (Q: *Pulling a wagon moves it towards or away from you?* -> *Towards you*)
  - *"Pushing a swing"* (Q: *Pushing a swing makes it go?* -> *Higher and forward*)
  - *"Catching a ball"* (Q: *What force stops a moving ball with your hands?* -> *A push / grab*)
  - *"Dropping an apple"* (Q: *What pulls the apple down to the ground?* -> *Gravity*)

#### Grade 4 Expansions:
- **`sc4-digestion`**: Add:
  - *"The teeth chew food into small pieces"* (Q: *What grinds food in our mouth?* -> *Teeth*)
  - *"Drinking clean water"* (Q: *Why does our body need water?* -> *To digest food and stay healthy*)
  - *"The intestines absorb nutrients"* (Q: *Where are food nutrients absorbed?* -> *In the intestines*)
  - *"Saliva softens food"* (Q: *What liquid in the mouth softens food?* -> *Saliva*)
- **`sc4-magnets`**: Add:
  - *"A horseshoe magnet attracts iron paperclips"* (Q: *Do paperclips stick to magnets?* -> *Yes*)
  - *"Opposite poles attract"* (Q: *North and South poles will?* -> *Attract / pull together*)
  - *"A magnet cannot pull gold or silver"* (Q: *Does a magnet pull all metals?* -> *No, only magnetic metals like iron*)
  - *"A compass points North"* (Q: *Which magnetic tool shows direction?* -> *A compass*)
- **`sc4-sound`**: Add:
  - *"Plucking a guitar string"* (Q: *What vibrates to make sound on a guitar?* -> *The string*)
  - *"Sound travels through air, water and solids"* (Q: *Can sound travel through water?* -> *Yes*)
  - *"Whispering quietly"* (Q: *Is a whisper loud or quiet?* -> *Quiet*)
  - *"Covering our ears from loud noise"* (Q: *Can very loud sounds hurt our ears?* -> *Yes*)

#### Grade 5 Expansions:
- **`sc5-electricity`**: Add:
  - *"A complete closed circuit"* (Q: *Does electricity flow in an open or closed circuit?* -> *Closed circuit*)
  - *"An electric switch turns the light on and off"* (Q: *What opens and closes a circuit?* -> *A switch*)
  - *"Plastic covers electrical wires for safety"* (Q: *Why are wires covered with plastic?* -> *Plastic is an insulator*)
  - *"Never touch switches with wet hands"* (Q: *Why avoid water near electricity?* -> *Water conducts electricity*)
- **`sc5-space`**: Add:
  - *"Planet Earth is the third planet from the Sun"* (Q: *Which planet do we live on?* -> *Earth*)
  - *"The Earth spins to cause day and night"* (Q: *What causes day and night?* -> *Earth's rotation / spin*)
  - *"A telescope looks at distant stars"* (Q: *What instrument do scientists use to see planets?* -> *A telescope*)
  - *"Mars is called the Red Planet"* (Q: *Which planet is called the Red Planet?* -> *Mars*)
- **`sc5-friction`**: Add:
  - *"Rubbing hands together makes warmth"* (Q: *What produces heat when you rub your hands?* -> *Friction*)
  - *"Oil reduces friction on bike chains"* (Q: *Why do we put oil on bicycle chains?* -> *To reduce friction*)
  - *"Car tyres on a wet road slide more easily"* (Q: *Does water on a road reduce or increase tyre grip?* -> *Reduces grip*)

---

### Phase 2: Recommended New Chapters by Grade

Har grade mein naye chapters shamil karne se syllabus complete ho jayega aur bacho ke liye mukammal learning journey banegi:

#### 1. Grade 1: New Recommended Chapters
1. **`sc1-senses` — The Five Senses (الحواس الخمس):**
   - Sight (eyes), Hearing (ears), Smell (nose), Taste (tongue), Touch (skin/hands).
   - Lessons:
     - *"I see colours with my eyes"*
     - *"I hear the bell with my ears"*
     - *"I smell sweet flowers with my nose"*
     - *"I taste sweet honey with my tongue"*
     - *"I feel soft fur with my fingers"*
2. **`sc1-daynight` — Day, Night and Seasons (النهار والليل والفصول):**
   - Sun in daytime, Moon and stars at night, Summer and Winter.
   - Lessons:
     - *"The sun shines bright in the day"*
     - *"The stars shine at night"*
     - *"Summer is warm and sunny"*
     - *"Winter is cold with snow"*
     - *"Spring brings green grass and flowers"*

#### 2. Grade 2: New Recommended Chapters
1. **`sc2-lifecycles` — Plant & Animal Life Cycles (دورات الحياة):**
   - Seed to plant, Caterpillar to butterfly, Tadpole to frog.
   - Lessons:
     - *"A tiny seed sprouts into a green seedling"*
     - *"A caterpillar turns into a beautiful butterfly"*
     - *"A tadpole grows into a jumping frog"*
     - *"An egg hatches into a fluffy chick"*
     - *"A baby calf drinks milk from its mother cow"*
2. **`sc2-water` — Water and Its Uses (الماء واستخداماته):**
   - Clean drinking water, washing, rain, rivers, saving water.
   - Lessons:
     - *"We drink clean water every day"*
     - *"Plants need water to stay alive"*
     - *"Rain fills rivers and lakes"*
     - *"Turn off the tap to save water"*

#### 3. Grade 3: New Recommended Chapters
1. **`sc3-watercycle` — The Water Cycle (دورة الماء):**
   - Evaporation, Condensation, Precipitation, Collection.
   - Lessons:
     - *"The sun heats water into invisible water vapour"* (Evaporation)
     - *"Water vapour cools into fluffy clouds"* (Condensation)
     - *"Rain falls from heavy grey clouds"* (Precipitation)
     - *"Rainwater flows into rivers and oceans"* (Collection)
2. **`sc3-matprops` — Properties of Materials (خصائص المواد):**
   - Transparent vs Opaque, Flexible vs Rigid, Waterproof vs Absorbent.
   - Lessons:
     - *"Glass windows are transparent so light passes through"*
     - *"A wooden door is opaque and blocks light"*
     - *"A rubber band is flexible and stretches"*
     - *"An umbrella is waterproof and keeps rain away"*
     - *"A cotton towel absorbs water"*

#### 4. Grade 4: New Recommended Chapters
1. **`sc4-foodchains` — Food Chains & Ecosystems (السلاسل الغذائية):**
   - Producers (Plants), Herbivores, Carnivores, Predators.
   - Lessons:
     - *"Green plants make food from sunlight (Producers)"*
     - *"A rabbit eats green grass (Herbivore)"*
     - *"A fox hunts the rabbit (Carnivore / Predator)"*
     - *"Every food chain starts with the sun and plants"*
     - *"An owl hunts mice at night"*
2. **`sc4-machines` — Simple Machines (الآلات البسيطة):**
   - Lever, Pulley, Ramp / Inclined plane, Wheel and axle.
   - Lessons:
     - *"A seesaw is a simple lever"*
     - *"A ramp helps push heavy boxes up easily"*
     - *"A flagpole uses a pulley to lift the flag"*
     - *"Wheels help a heavy cart roll smoothly"*
     - *"Scissors are levers that cut paper"*

#### 5. Grade 5: New Recommended Chapters
1. **`sc5-skeleton` — Skeletal and Muscular Systems (الهيكل العظمي والعضلات):**
   - 206 bones, Skull protects brain, Ribcage protects heart/lungs, Muscles contract and pull.
   - Lessons:
     - *"The skull protects our soft brain"*
     - *"The ribcage protects the heart and lungs"*
     - *"Muscles work in pairs to pull bones and move"*
     - *"Calcium from milk makes our bones strong"*
     - *"Joints let our elbows and knees bend"*
2. **`sc5-germs` — Microorganisms & Health (الكائنات الحية الدقيقة):**
   - Tiny microbes, Helpful bacteria (yogurt), Harmful germs (disease), Washing hands with soap.
   - Lessons:
     - *"Microorganisms are tiny living things seen under a microscope"*
     - *"Good bacteria help turn milk into delicious yogurt"*
     - *"Harmful germs make us sick with a cold or cough"*
     - *"Washing hands with soap washes germs away"*
     - *"Vaccines protect our bodies from dangerous viruses"*
3. **`sc5-energy` — Forms of Energy (أشكال الطاقة):**
   - Solar energy, Wind energy, Kinetic (movement) energy, Heat energy.
   - Lessons:
     - *"Solar panels convert sunlight into electricity"*
     - *"Wind turbines turn wind into clean power"*
     - *"A moving car has kinetic energy"*
     - *"Fire produces light and heat energy"*
     - *"Plants store chemical energy from the sun"*

---

## 5. Summary Table: Current vs Proposed Curriculum

| Grade | Current Chapters | Current Lessons | Proposed Chapters | Proposed Lessons |
|---|:---:|:---:|:---:|:---:|
| **Grade 1** | 4 | 32 | **6 chapters** (+2 new) | **50+ lessons** |
| **Grade 2** | 4 | 18 | **6 chapters** (+2 new) | **50+ lessons** |
| **Grade 3** | 4 | 17 | **6 chapters** (+2 new) | **50+ lessons** |
| **Grade 4** | 4 | 17 | **6 chapters** (+2 new) | **50+ lessons** |
| **Grade 5** | 5 | 19 | **8 chapters** (+3 new) | **65+ lessons** |
| **TOTAL** | **21 Chapters** | **103 Lessons** | **32 Chapters** | **265+ Lessons** |

---

## 6. Technical Implementation Note for BloomLearn

Jab ye naye chapters aur lessons code mein add kiye jayenge, toh:
1. `curriculum.ts` mein `SCIENCE.grades` ke andar naye chapters add honge.
2. `CHAPTER_RULES` aur science vocabulary arrays (`ANIMALS`, `PLANT_WORDS`, `BODY_WORDS`, `FOODS` waghera) mein naye words (jaise: `microscope`, `skeleton`, `energy`, `solar`, `lever`, `ramp`, `senses`) add kiye jayenge taake sentence validation fail na ho.
3. Har lesson ke sath child-friendly `draw` prompt diya jayega taake OpenAI / Pollinations image engine accurate educational illustration generate kare (bina Kisi text ya watermark ke).

---
*Report prepared for BloomLearn Client Review & Curriculum Engineering.*

