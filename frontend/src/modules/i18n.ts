import { I18nManager } from 'react-native';
import type { Language, LanguageCode } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', rtl: true, flag: '🇸🇦' },
];

export type TKey =
  | 'save'
  | 'cancel'
  | 'back'
  | 'hello'
  | 'talk'
  | 'of'
  | 'spExample1'
  | 'spExample2'
  | 'spExample3'
  | 'spExample4'
  | 'spExample5'
  | 'spNoPollinationsToken'
  | 'spEngineSlow'
  | 'spNoAiEngine'
  | 'spCouldNotMake'
  | 'spEngineTooLong'
  | 'spEngineNoResponse'
  | 'spSpeakKeyboardTitle'
  | 'spSpeakKeyboardMsg'
  | 'spDidntCatchTitle'
  | 'spTryAgainType'
  | 'spBadgeLibrary'
  | 'spBadgeLibraryNew'
  | 'spBadgeLibraryAi'
  | 'spBadgeInstant'
  | 'spHeaderTitle'
  | 'spHeaderSubWithLib'
  | 'spHeaderSubSavedSuffix'
  | 'spHeaderSubDefault'
  | 'spUnderstanding'
  | 'spMakingPicture'
  | 'spKeepTalkingOn'
  | 'spStartOver'
  | 'spRedraw'
  | 'spRealPicture'
  | 'spMicHintAgent'
  | 'spMicHintNoAgent'
  | 'spInstantScene'
  | 'spMakeFullPicture'
  | 'spUnderstoodWell'
  | 'spPartlyUnderstood'
  | 'spUnderstoodSuffix'
  | 'spTypeSentencePlaceholder'
  | 'spListeningTapStop'
  | 'spTurningSpeechToText'
  | 'spSpeakSentence'
  | 'spKeyboardMicHint2'
  | 'spReadAloud'
  | 'spClear'
  | 'spTrySentence'
  | 'spScienceConcepts'
  | 'spBigHint'
  | 'spFlowerLabel'
  | 'spSeedsLabel'
  | 'spFlowerAbsent'
  | 'spSeedsAbsent'
  | 'spBackboneHighlighted'
  | 'spNoBackbone'
  | 'scEmptyHint'
  | 'ssBodyTitle'
  | 'ssAnatomyHint'
  | 'ssEmptyHint'
  | 'tabHome'
  | 'tabTalk'
  | 'wlTagline'
  | 'wlStart'
  | 'hmGoodMorning'
  | 'hmGoodAfternoon'
  | 'hmGoodEvening'
  | 'hmHeroBtn'
  | 'hmSetupTitle'
  | 'hmSetupBody'
  | 'hmSetupBtn'
  | 'stTitle'
  | 'stLanguage'
  | 'stRestartTitle'
  | 'stRtlNote'
  | 'stVoice'
  | 'stReadAloud'
  | 'stAutoSpeak'
  | 'stSpeed'
  | 'stSlow'
  | 'stNormal'
  | 'stFast'
  | 'stTestVoice'
  | 'stTestPhrase'
  | 'stAi'
  | 'stAiSub'
  | 'stOpenai'
  | 'stOpenaiSub'
  | 'stGroq'
  | 'stGroqSub'
  | 'stPollinations'
  | 'stPollinationsSub'
  | 'stServer'
  | 'stServerSub'
  | 'stServerUrl'
  | 'stServerToken'
  | 'stNotSet'
  | 'stFromBuild'
  | 'stRemove'
  | 'stGetKey'
  | 'stStatusVoice'
  | 'stStatusAgent'
  | 'stStatusDrawing'
  | 'stLibrary'
  | 'stDownload'
  | 'stDownloading'
  | 'stDownloaded'
  | 'stClearLibrary'
  | 'stClearLibraryMsg'
  | 'stData'
  | 'stPrivacy'
  | 'stClearHistory'
  | 'stClearHistoryMsg'
  | 'stResetSettings'
  | 'stResetSettingsMsg'
  | 'stAbout'
  | 'stHelp'
  | 'stVersion'
  | 'stAboutBody'
  | 'stCredits'
  | 'hpTitle'
  | 'hpSub'
  | 'hpStep1Title'
  | 'hpStep1Body'
  | 'hpStep2Title'
  | 'hpStep2Body'
  | 'hpStep3Title'
  | 'hpStep3Body'
  | 'hpStep4Title'
  | 'hpStep4Body'
  | 'hpWorksWith'
  | 'hpWorksWithBody'
  | 'hpNeedsTitle'
  | 'hpNeedsBody'
  | 'stConfirm'
  | 'lnSlide2Title'
  | 'lnSlide2Sub'
  | 'lnSlide3Title'
  | 'lnSlide3Sub'
  | 'lnSlide4Title'
  | 'lnSlide4Sub'
  | 'lnTrust'
  | 'tabProgress'
  | 'prBadges'
  | 'bdStreak3'
  | 'pgDefaultTitle'
  | 'pgEnterPasscodeSub'
  | 'pgWrongPasscode'
  | 'pgCreatePasscodeSub'
  | 'pgConfirmPasscodeSub'
  | 'pgPasscodeMismatch'
  | 'stParent'
  | 'stLock'
  | 'stChangePin'
  | 'stLockInfo'
  | 'stUnlockMsg'
  | 'stPinTitle'
  | 'stPinBody'
  | 'stPinInvalid'
  | 'stPrivacyTitle'
  | 'stSaveHistory'
  | 'stPrivacyPolicy'
  | 'stResetProgress'
  | 'stResetProgressMsg'
  | 'pvIntro'
  | 'pvKeepTitle'
  | 'pvKeepBody'
  | 'pvSendTitle'
  | 'pvSendBody'
  | 'pvNeverTitle'
  | 'pvNeverBody'
  | 'pvChildTitle'
  | 'pvChildBody'
  | 'pvControlTitle'
  | 'pvControlBody'
  | 'prStreakShort'
  | 'hmLocal'
  | 'stLibrarySub'
  | 'hrKicker'
  | 'hrTitle'
  | 'hrBody'
  | 'hrHow'
  | 'hmSubjects'
  | 'hmSubjectMeta'
  | 'sbChooseGrade'
  | 'sbGrade'
  | 'sbChapters'
  | 'sbLessonsDone'
  | 'sbComingSoon'
  | 'sbEnglishBlurb'
  | 'sbMathBlurb'
  | 'sbScienceBlurb'
  | 'lsLessonOf'
  | 'lsPrevious'
  | 'lsNext'
  | 'lsShowAnswer'
  | 'lsAnswer'
  | 'lsAllLessons'
  | 'sbSource'
  | 'prReportTitle'
  | 'prReportSub'
  | 'prComplete'
  | 'prLessonsDone'
  | 'prChaptersDone'
  | 'prToday'
  | 'prThisWeekShort'
  | 'prContinue'
  | 'prBySubject'
  | 'prSubjectLine'
  | 'prLessonsWeek'
  | 'prReportNote'
  | 'prShareReport'
  | 'bdFirstLesson'
  | 'bdFirstChapter'
  | 'bdTenLessons'
  | 'bdFiftyLessons'
  | 'bdAllSubjects'
  | 'bdGradeOne'
  | 'bdStreak7'
  | 'lsTapToSee'
  | 'lsPrevShort'
  | 'lsNextShort'
  | 'spStoryDrawing'
  | 'spStoryNeedsEngine'
  | 'spStoryFailed'
  | 'faTitle'
  | 'faSubtitle'
  | 'faScanning'
  | 'faRecognized'
  | 'faAccuracy'
  | 'faDoctorPlan'
  | 'faNoMatch'
  | 'faSwitchChild'
  | 'faAddChild'
  | 'faManageKids'
  | 'faManualSelect'
  | 'faStartLearning'
  | 'faEnrollFace'
  | 'faCapturePhoto'
  | 'faSamplesCaptured'
  | 'faPrescription'
  | 'faDoctorNotes'
  | 'faAssignedSubjects'
  | 'faAssignedGrade'
  | 'faDailyGoal'
  | 'faChildName'
  | 'faAge'
  | 'faSavedProfile'
  | 'faHoldStill'
  | 'faLookingForFace';

type TMap = Record<TKey, string>;
type AllTranslations = { 'en-US': TMap } & Partial<Record<LanguageCode, Partial<TMap>>>;

const T: AllTranslations = {
  'en-US': {
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    hello: 'Hello',
    scEmptyHint: 'Say or type a sentence — the picture builds as you talk.',
    ssBodyTitle: 'Parts of the body',
    ssAnatomyHint: 'Say "heart", "add lungs", "add stomach"… to build the diagram.',
    ssEmptyHint: 'Say an object — "table", then "cat above the table", then "open the cat\'s eyes".',
    talk: 'Talk',
    of: 'of',
    spExample1: 'The black cat is under the table', spExample2: 'A small brown dog is behind the big tree',
    spExample3: 'Three red apples are in the basket', spExample4: 'The blue bird is above the house',
    spExample5: 'The girl is sitting on the chair',
    spNoPollinationsToken: "Real pictures need a free Pollinations token — add one in Settings. The built scene is shown for now.",
    spEngineSlow: 'The picture engine is slow — the built scene is still shown.',
    spNoAiEngine: "AI pictures need an OpenAI key, the BloomLearn server or a free Pollinations token — add one in Settings. The instant scene and picture library still work.",
    spCouldNotMake: 'Could not make the picture.',
    spEngineTooLong: 'The picture engine is taking too long. Showing the instant scene — tap AI to try again.',
    spEngineNoResponse: 'The picture engine did not respond. Tap AI to try again.',
    spSpeakKeyboardTitle: 'Speak with the keyboard',
    spSpeakKeyboardMsg: 'Tap the text box and use the microphone on your keyboard — the picture updates as you talk.',
    spDidntCatchTitle: "Didn't catch that", spTryAgainType: 'Try again or type it.',
    spBadgeLibrary: 'Library', spBadgeLibraryNew: 'Library · new', spBadgeLibraryAi: 'Library · AI', spBadgeInstant: 'Instant',
    spHeaderTitle: 'Picture Talk', spHeaderSubWithLib: 'Picture library: {words} words · {books} from books{saved}',
    spHeaderSubSavedSuffix: ' · {n} saved', spHeaderSubDefault: 'Say or type a sentence — the picture builds as you talk',
    spUnderstanding: 'Understanding…', spMakingPicture: 'Making the picture…',
    spKeepTalkingOn: 'Keep-talking mode ON', spStartOver: 'Start over', spRedraw: 'Redraw', spRealPicture: 'Real picture',
    spMicHintAgent: 'Speak naturally — the {agent} agent understands full sentences. "cat under the table", "a girl is crying next to the mosque", "move the book behind the chair", "remove the cat". "Real picture" turns the whole scene into one AI drawing.',
    spMicHintNoAgent: "One change at a time: \"table\" · \"cat under the table\" · \"open the cat's eyes\" · \"a girl is crying\". Add a free Groq key in Settings to understand free speech.",
    spInstantScene: 'Instant scene', spMakeFullPicture: 'Make full picture with AI',
    spUnderstoodWell: 'Understood well', spPartlyUnderstood: 'Partly understood',
    spUnderstoodSuffix: '· {pct}% — tap "AI" for anything the instant scene can\'t draw.',
    spTypeSentencePlaceholder: 'Type a sentence, or tap the mic on your keyboard…',
    spListeningTapStop: 'Listening… tap to stop', spTurningSpeechToText: 'Turning speech into text…', spSpeakSentence: 'Speak a sentence',
    spKeyboardMicHint2: "Or tap the text box and use your keyboard's microphone — the picture updates word by word.",
    spReadAloud: 'Read aloud', spClear: 'Clear', spTrySentence: 'Try a sentence', spScienceConcepts: 'Science concepts',
    spBigHint: "The instant scene works offline and is always the base. \"AI\" draws a real picture when an engine is set up in Settings. Understood: colours, sizes (small / big), counts, things ({things}…), actions (running, sitting…), positions (under, on, above, behind, in front of, beside, inside), objects ({objects}…).",
    spFlowerLabel: 'Flower', spSeedsLabel: 'Seeds', spFlowerAbsent: 'no flower', spSeedsAbsent: 'no seeds',
    spBackboneHighlighted: 'Backbone highlighted', spNoBackbone: 'No backbone',
    tabHome: "Home",
    tabTalk: "Talk",
    wlTagline: "Speak a sentence. See it as a picture.",
    wlStart: "Get started",
    hmGoodMorning: "Good morning",
    hmGoodAfternoon: "Good afternoon",
    hmGoodEvening: "Good evening",
    hmHeroBtn: "Start talking",
    hmSetupTitle: "Turn on voice on this phone",
    hmSetupBody: "Turning speech into text on a phone needs an OpenAI key or a BloomLearn server. Add one in Settings — or use your keyboard's microphone.",
    hmSetupBtn: "Open Settings",
    stTitle: "Settings",
    stLanguage: "Language",
    stRestartTitle: "Restart needed",
    stRtlNote: "Close and reopen the app to switch the layout direction.",
    stVoice: "Voice & sound",
    stReadAloud: "Read aloud",
    stAutoSpeak: "Read aloud after I speak",
    stSpeed: "Speaking speed",
    stSlow: "Slow",
    stNormal: "Normal",
    stFast: "Fast",
    stTestVoice: "Test voice",
    stTestPhrase: "Hello! I am BloomLearn. Say a sentence and I will draw it.",
    stAi: "AI & voice engines",
    stAiSub: "All optional. Keys are saved only on this device.",
    stOpenai: "OpenAI key",
    stOpenaiSub: "Voice-to-text on phones and sharper AI pictures",
    stGroq: "Groq key (free)",
    stGroqSub: "Understands free speech in Keep-talking mode",
    stPollinations: "Pollinations token (free)",
    stPollinationsSub: "Free AI drawing for \"Real picture\"",
    stServer: "BloomLearn server",
    stServerSub: "Keeps the OpenAI key off the phone",
    stServerUrl: "Server URL",
    stServerToken: "Server token",
    stNotSet: "Not set",
    stFromBuild: "From app build",
    stRemove: "Remove",
    stGetKey: "Get a key",
    stStatusVoice: "Voice to text",
    stStatusAgent: "Free speech",
    stStatusDrawing: "AI pictures",
    stLibrary: "Picture library",
    stDownload: "Download more pictures",
    stDownloading: "Downloading…",
    stDownloaded: "Picture library updated",
    stClearLibrary: "Clear picture library",
    stClearLibraryMsg: "All saved pictures, including your AI pictures, will be deleted from this device.",
    stData: "History & data",
    stPrivacy: "Settings, sentences and pictures stay on this device. A sentence is sent to an AI service only when you have set up its key.",
    stClearHistory: "Clear sentence history",
    stClearHistoryMsg: "All saved sentences will be removed.",
    stResetSettings: "Reset settings",
    stResetSettingsMsg: "Language, voice and keys go back to default.",
    stAbout: "About",
    stHelp: "How to use",
    stVersion: "Version {v}",
    stAboutBody: "BloomLearn turns what you say into pictures, to help children learn words, sentences and positions.",
    stCredits: "Pictograms: ARASAAC (CC BY-NC-SA) and OpenSymbols. Book pictures: Global Digital Library.",
    hpTitle: "How to use",
    hpSub: "Four easy steps",
    hpStep1Title: "Tap the microphone",
    hpStep1Body: "Open Talk and tap \"Speak a sentence\". You can also type in the box.",
    hpStep2Title: "Say a sentence",
    hpStep2Body: "Try \"The black cat is under the table\". The picture builds as you talk.",
    hpStep3Title: "Keep talking",
    hpStep3Body: "Add more: \"a bird above the table\", \"make the cat big\", \"remove the bird\". Say \"start over\" to begin again.",
    hpStep4Title: "Make a real picture",
    hpStep4Body: "Tap \"Real picture\" to turn the scene into one AI drawing. It is saved in My Pictures.",
    hpWorksWith: "What BloomLearn understands",
    hpWorksWithBody: "English sentences with colours, sizes (small, big), counts (three apples), things and animals, actions (running, sitting) and positions: under, on, above, behind, in front of, beside, inside. With a Groq key it understands almost anything you say.",
    hpNeedsTitle: "What needs internet",
    hpNeedsBody: "The instant scene works offline. New library pictures, AI pictures and voice-to-text need internet. On a phone, voice-to-text also needs an OpenAI key or a BloomLearn server (Settings).",
    stConfirm: "Yes, delete",
    lnSlide2Title: "Speak a sentence",
    lnSlide2Sub: "Tap the microphone and say anything — \"The black cat is under the table\".",
    lnSlide3Title: "Watch it build",
    lnSlide3Sub: "The picture builds as you talk. Keep talking to add, move or remove things.",
    lnSlide4Title: "Hear it and learn",
    lnSlide4Sub: "Sentences are read aloud, so children learn words, colours and positions.",
    lnTrust: "Made for children, parents and teachers",
    tabProgress: "Progress",
    prBadges: "Badges",
    bdStreak3: "3-day streak",
    pgDefaultTitle: "Parent area",
    pgEnterPasscodeSub: "Enter the 4-digit passcode",
    pgWrongPasscode: "Wrong passcode — try again",
    pgCreatePasscodeSub: "Create a 4-digit parent passcode to protect this area",
    pgConfirmPasscodeSub: "Enter the same 4 digits again to confirm",
    pgPasscodeMismatch: "Those didn't match — let's try again",
    stParent: "Parent",
    stLock: "Lock settings with a passcode",
    stChangePin: "Change passcode",
    stLockInfo: "When the lock is on, a parent must enter the 4-digit passcode to open Settings, so a child can't change keys, language or data.",
    stUnlockMsg: "Turn off the lock? Anyone will be able to open Settings.",
    stPinTitle: "Parent passcode",
    stPinBody: "Choose 4 digits. You will need them to open Settings.",
    stPinInvalid: "Enter exactly 4 digits.",
    stPrivacyTitle: "Privacy",
    stSaveHistory: "Save sentence history",
    stPrivacyPolicy: "Privacy policy",
    stResetProgress: "Reset progress",
    stResetProgressMsg: "All progress, levels and badges will start again from zero.",
    pvIntro: "BloomLearn is made for children. It has no accounts, no ads and no tracking. This page explains what the app keeps and what can leave the device.",
    pvKeepTitle: "What stays on this device",
    pvKeepBody: "Your settings, sentence history, progress and badges, saved pictures, the parent passcode and any keys you add. Nothing is uploaded to a BloomLearn account — there isn't one.",
    pvSendTitle: "What can leave the device",
    pvSendBody: "To find pictures, single words (like \"cat\") are looked up in the free ARASAAC and OpenSymbols libraries. Only if a parent adds a key or server in Settings: the voice recording goes to OpenAI to turn it into text, and the sentence goes to OpenAI, Groq or Pollinations to understand it or draw it.",
    pvNeverTitle: "What we never do",
    pvNeverBody: "No ads, no analytics, no tracking, no selling or sharing of data, and no contact with the child from outside the app.",
    pvChildTitle: "For parents",
    pvChildBody: "Use BloomLearn together with your child. Turn on the parent lock so only you can change keys, language and data.",
    pvControlTitle: "You are in control",
    pvControlBody: "In Settings you can stop saving history, clear history, reset progress, clear the picture library and remove every key. Uninstalling the app deletes everything.",
    prStreakShort: "Day streak",
    hmLocal: "Your practice is saved only on this device",
    stLibrarySub: "{n} pictures saved on this device",
    hrKicker: "Picture Talk",
    hrTitle: "Speak. See. Learn.",
    hrBody: "Say a sentence and watch it turn into a picture — then learn English, Math and Science the same way.",
    hrHow: "How it works",
    hmSubjects: "Subjects",
    hmSubjectMeta: "Grades 1–5 · {n} chapters",
    sbChooseGrade: "Choose a grade",
    sbGrade: "Grade {n}",
    sbChapters: "Chapters",
    sbLessonsDone: "{n} of {m} lessons",
    sbComingSoon: "Chapters for Grade {n} are coming soon.",
    sbEnglishBlurb: "Words, colours and where things are — with a picture for every sentence.",
    sbMathBlurb: "Numbers, shapes and word problems — with a picture for every question.",
    sbScienceBlurb: "Living things, your body, materials, forces and space.",
    lsLessonOf: "Lesson {i} of {n}",
    lsPrevious: "Previous lesson",
    lsNext: "Next lesson",
    lsShowAnswer: "Show answer",
    lsAnswer: "Answer",
    lsAllLessons: "All lessons in this chapter",
    sbSource: "Chapter topics follow Pakistan's Single National Curriculum (2020) and the Cambridge Primary curriculum. Lessons are written for BloomLearn, not copied from any textbook — check them with your school book.",
    prReportTitle: "Learning report",
    prReportSub: "How your child is doing in English, Math and Science.",
    prComplete: "done",
    prLessonsDone: "Lessons done",
    prChaptersDone: "Chapters finished",
    prToday: "Lessons today",
    prThisWeekShort: "This week",
    prContinue: "Continue learning",
    prBySubject: "By subject",
    prSubjectLine: "{n} of {m} lessons · {c} of {ct} chapters",
    prLessonsWeek: "Lessons this week",
    prReportNote: "A lesson counts as done when your child opens it in a chapter. This is a practice summary from this device, not a school grade or a test.",
    prShareReport: "Share report",
    bdFirstLesson: "First lesson",
    bdFirstChapter: "First chapter",
    bdTenLessons: "10 lessons",
    bdFiftyLessons: "50 lessons",
    bdAllSubjects: "All 3 subjects",
    bdGradeOne: "Grade 1 subject done",
    bdStreak7: "7-day streak",
    lsTapToSee: "Tap ? to see the answer",
    lsPrevShort: "Previous",
    lsNextShort: "Next lesson",
    spStoryDrawing: "Drawing the story…",
    spStoryNeedsEngine: "A real picture of the story needs an AI engine — add a free Pollinations token or an OpenAI key in Settings. The counting picture below always works.",
    spStoryFailed: "Could not draw the story right now. The counting picture below still shows the sum.",
    faTitle: "Who is learning today?",
    faSubtitle: "Look at the camera to scan face",
    faScanning: "Scanning face…",
    faRecognized: "Face recognized!",
    faAccuracy: "Accuracy: {n}%",
    faDoctorPlan: "Doctor's Plan",
    faNoMatch: "Face not recognized. Please align inside the oval or select child manually.",
    faSwitchChild: "Switch Child",
    faAddChild: "Add Child",
    faManageKids: "Manage Children & Doctor Plans",
    faManualSelect: "Select Profile with PIN",
    faStartLearning: "Start Learning",
    faEnrollFace: "Enroll Face",
    faCapturePhoto: "Take Photo",
    faSamplesCaptured: "{n} of 3 samples captured",
    faPrescription: "Doctor Prescription",
    faDoctorNotes: "Doctor's Clinical Notes",
    faAssignedSubjects: "Assigned Subjects",
    faAssignedGrade: "Assigned Grade",
    faDailyGoal: "Daily Sentence Goal",
    faChildName: "Child's Name",
    faAge: "Age",
    faSavedProfile: "Child profile saved",
    faHoldStill: "Align your face in the oval and hold still",
    faLookingForFace: "Looking for face…",
  },
  'ar-SA': {
    save: 'حفظ',
    cancel: 'إلغاء',
    back: 'رجوع',
    hello: 'مرحبا',
    scEmptyHint: 'قل أو اكتب جملة — تُبنى الصورة أثناء حديثك.',
    ssBodyTitle: 'أجزاء الجسم',
    ssAnatomyHint: 'قل "قلب"، "أضف الرئتين"، "أضف المعدة"... لبناء الرسم التوضيحي.',
    ssEmptyHint: 'قل شيئًا — "طاولة"، ثم "قطة فوق الطاولة"، ثم "افتح عيني القطة".',
    talk: 'تحدث',
    of: 'من',
    spExample1: 'القطة السوداء تحت الطاولة', spExample2: 'كلب بني صغير خلف الشجرة الكبيرة',
    spExample3: 'ثلاث تفاحات حمراء في السلة', spExample4: 'الطائر الأزرق فوق البيت',
    spExample5: 'الفتاة جالسة على الكرسي',
    spEngineSlow: 'محرك الصور بطيء — لا يزال المشهد المبني معروضاً.',
    spCouldNotMake: 'تعذر إنشاء الصورة.',
    spEngineTooLong: 'محرك الصور يستغرق وقتاً طويلاً. يتم عرض المشهد الفوري — اضغط على AI للمحاولة مرة أخرى.',
    spEngineNoResponse: 'لم يستجب محرك الصور. اضغط على AI للمحاولة مرة أخرى.',
    spSpeakKeyboardTitle: 'تحدث باستخدام لوحة المفاتيح',
    spSpeakKeyboardMsg: 'اضغط على مربع النص واستخدم الميكروفون في لوحة المفاتيح — تتحدث الصورة أثناء كلامك.',
    spDidntCatchTitle: 'لم أفهم ذلك', spTryAgainType: 'حاول مرة أخرى أو اكتبها.',
    spBadgeLibrary: 'المكتبة', spBadgeLibraryNew: 'المكتبة · جديد', spBadgeLibraryAi: 'المكتبة · AI', spBadgeInstant: 'فوري',
    spHeaderTitle: 'الصورة والكلام', spHeaderSubWithLib: 'مكتبة الصور: {words} كلمة · {books} من الكتب{saved}',
    spHeaderSubSavedSuffix: ' · {n} محفوظ', spHeaderSubDefault: 'قل أو اكتب جملة — تُبنى الصورة أثناء حديثك',
    spUnderstanding: 'جارٍ الفهم…', spMakingPicture: 'جارٍ إنشاء الصورة…',
    spKeepTalkingOn: 'وضع الاستمرار بالحديث مفعّل', spStartOver: 'البدء من جديد', spRedraw: 'إعادة الرسم', spRealPicture: 'صورة حقيقية',
    spMicHintAgent: 'تحدث بشكل طبيعي — يفهم وكيل {agent} الجُمل الكاملة. "قطة تحت الطاولة"، "فتاة تبكي بجانب المسجد"، "حرّك الكتاب خلف الكرسي"، "أزل القطة". "صورة حقيقية" تحوّل المشهد كله إلى رسمة واحدة بالذكاء الاصطناعي.',
    spInstantScene: 'مشهد فوري', spMakeFullPicture: 'إنشاء صورة كاملة بالذكاء الاصطناعي',
    spUnderstoodWell: 'مفهوم جيداً', spPartlyUnderstood: 'مفهوم جزئياً',
    spUnderstoodSuffix: '· {pct}% — اضغط "AI" لأي شيء لا يستطيع المشهد الفوري رسمه.',
    spTypeSentencePlaceholder: 'اكتب جملة، أو اضغط على الميكروفون في لوحة المفاتيح…',
    spListeningTapStop: 'أستمع… اضغط للتوقف', spTurningSpeechToText: 'جارٍ تحويل الكلام إلى نص…', spSpeakSentence: 'انطق جملة',
    spKeyboardMicHint2: 'أو اضغط على مربع النص واستخدم ميكروفون لوحة المفاتيح — تتحدث الصورة كلمة بكلمة.',
    spReadAloud: 'اقرأ بصوت عالٍ', spClear: 'مسح', spTrySentence: 'جرّب جملة', spScienceConcepts: 'مفاهيم علمية',
    spFlowerLabel: 'زهرة', spSeedsLabel: 'بذور', spFlowerAbsent: 'بلا زهرة', spSeedsAbsent: 'بلا بذور',
    spBackboneHighlighted: 'العمود الفقري مميز', spNoBackbone: 'بلا عمود فقري',
    spNoPollinationsToken: "الصور الحقيقية تحتاج إلى رمز Pollinations مجاني — أضفه في الإعدادات. يُعرض المشهد المبني الآن.",
    spNoAiEngine: "صور الذكاء الاصطناعي تحتاج إلى مفتاح OpenAI أو خادم BloomLearn أو رمز Pollinations مجاني — أضفه في الإعدادات. المشهد الفوري ومكتبة الصور يعملان دائماً.",
    spMicHintNoAgent: "تغيير واحد في كل مرة: \"table\" · \"cat under the table\" · \"open the cat's eyes\" · \"a girl is crying\". أضف مفتاح Groq مجاني في الإعدادات لفهم الكلام الحر.",
    spBigHint: "المشهد الفوري يعمل دون اتصال وهو الأساس دائماً. يرسم \"AI\" صورة حقيقية عند إعداد محرك في الإعدادات. يفهم: الألوان، الأحجام (small / big)، الأعداد، الأشياء ({things}…)، الأفعال (running, sitting…)، الأماكن (under, on, above, behind, in front of, beside, inside)، الأغراض ({objects}…).",
    tabHome: "الرئيسية",
    tabTalk: "تحدث",
    wlTagline: "قل جملة. شاهدها صورة.",
    wlStart: "ابدأ الآن",
    hmGoodMorning: "صباح الخير",
    hmGoodAfternoon: "مساء الخير",
    hmGoodEvening: "مساء الخير",
    hmHeroBtn: "ابدأ الكلام",
    hmSetupTitle: "شغّل الصوت على هذا الهاتف",
    hmSetupBody: "تحويل الكلام إلى نص على الهاتف يحتاج إلى مفتاح OpenAI أو خادم BloomLearn. أضفه في الإعدادات — أو استخدم ميكروفون لوحة المفاتيح.",
    hmSetupBtn: "افتح الإعدادات",
    stTitle: "الإعدادات",
    stLanguage: "اللغة",
    stRestartTitle: "أعد فتح التطبيق",
    stRtlNote: "أغلق التطبيق وافتحه من جديد لتغيير اتجاه الكتابة.",
    stVoice: "الصوت",
    stReadAloud: "القراءة بصوت عالٍ",
    stAutoSpeak: "اقرأ الجملة بعد أن أتكلم",
    stSpeed: "سرعة الكلام",
    stSlow: "بطيء",
    stNormal: "عادي",
    stFast: "سريع",
    stTestVoice: "جرّب الصوت",
    stTestPhrase: "مرحباً! أنا BloomLearn. قل جملة وسأرسمها.",
    stAi: "محركات الذكاء الاصطناعي والصوت",
    stAiSub: "كلها اختيارية. تُحفظ المفاتيح على هذا الجهاز فقط.",
    stOpenai: "مفتاح OpenAI",
    stOpenaiSub: "تحويل الكلام إلى نص على الهاتف وصور أوضح بالذكاء الاصطناعي",
    stGroq: "مفتاح Groq (مجاني)",
    stGroqSub: "يفهم الكلام الحر في وضع الاستمرار بالحديث",
    stPollinations: "رمز Pollinations (مجاني)",
    stPollinationsSub: "رسم مجاني بالذكاء الاصطناعي لـ \"صورة حقيقية\"",
    stServer: "خادم BloomLearn",
    stServerSub: "يبقي مفتاح OpenAI خارج الهاتف",
    stServerUrl: "عنوان الخادم",
    stServerToken: "رمز الخادم",
    stNotSet: "غير مضبوط",
    stFromBuild: "من إعداد التطبيق",
    stRemove: "إزالة",
    stGetKey: "احصل على مفتاح",
    stStatusVoice: "الكلام إلى نص",
    stStatusAgent: "الكلام الحر",
    stStatusDrawing: "صور الذكاء الاصطناعي",
    stLibrary: "مكتبة الصور",
    stDownload: "تنزيل المزيد من الصور",
    stDownloading: "جارٍ التنزيل…",
    stDownloaded: "تم تحديث مكتبة الصور",
    stClearLibrary: "مسح مكتبة الصور",
    stClearLibraryMsg: "ستُحذف كل الصور المحفوظة، ومنها صور الذكاء الاصطناعي، من هذا الجهاز.",
    stData: "البيانات",
    stPrivacy: "الإعدادات والجمل والتقدم تبقى على هذا الجهاز. تُرسل الجملة إلى خدمة ذكاء اصطناعي فقط عند إضافة مفتاحها.",
    stClearHistory: "مسح سجل الجمل",
    stClearHistoryMsg: "ستُحذف كل الجمل المحفوظة.",
    stResetSettings: "إعادة ضبط الإعدادات",
    stResetSettingsMsg: "تعود اللغة والصوت والمفاتيح إلى الوضع الافتراضي.",
    stAbout: "حول التطبيق",
    stHelp: "طريقة الاستخدام",
    stVersion: "الإصدار {v}",
    stAboutBody: "يحوّل BloomLearn ما تقوله إلى صور، ليساعد الأطفال على تعلم الكلمات والجمل والأماكن.",
    stCredits: "الرموز المصورة: ARASAAC (CC BY-NC-SA) وOpenSymbols. صور الكتب: Global Digital Library.",
    stConfirm: "نعم، احذف",
    hpTitle: "طريقة الاستخدام",
    hpSub: "أربع خطوات سهلة",
    hpStep1Title: "اضغط على الميكروفون",
    hpStep1Body: "افتح \"تحدث\" واضغط \"انطق جملة\". يمكنك أيضاً الكتابة في المربع.",
    hpStep2Title: "قل جملة",
    hpStep2Body: "جرّب \"The black cat is under the table\". تُبنى الصورة أثناء حديثك.",
    hpStep3Title: "استمر في الكلام",
    hpStep3Body: "أضف المزيد: \"a bird above the table\"، \"make the cat big\"، \"remove the bird\". قل \"start over\" للبدء من جديد.",
    hpStep4Title: "اصنع صورة حقيقية",
    hpStep4Body: "اضغط \"صورة حقيقية\" لتحويل المشهد إلى رسمة واحدة بالذكاء الاصطناعي.",
    hpWorksWith: "ما الذي يفهمه BloomLearn",
    hpWorksWithBody: "جمل إنجليزية فيها ألوان وأحجام (small, big) وأعداد (three apples) وأشياء وحيوانات وأفعال (running, sitting) وأماكن: under, on, above, behind, in front of, beside, inside. مع مفتاح Groq يفهم تقريباً أي شيء تقوله.",
    hpNeedsTitle: "ما الذي يحتاج إلى الإنترنت",
    hpNeedsBody: "المشهد الفوري يعمل دون اتصال. الصور الجديدة من المكتبة وصور الذكاء الاصطناعي وتحويل الكلام إلى نص تحتاج إلى الإنترنت. على الهاتف، يحتاج تحويل الكلام إلى نص أيضاً إلى مفتاح OpenAI أو خادم BloomLearn (الإعدادات).",
    lnSlide2Title: "قل جملة",
    lnSlide2Sub: "اضغط على الميكروفون وقل أي شيء — \"The black cat is under the table\".",
    lnSlide3Title: "شاهدها تُبنى",
    lnSlide3Sub: "تُبنى الصورة أثناء حديثك. استمر في الكلام لتضيف الأشياء أو تحركها أو تزيلها.",
    lnSlide4Title: "استمع وتعلّم",
    lnSlide4Sub: "تُقرأ الجمل بصوت عالٍ، فيتعلم الأطفال الكلمات والألوان والأماكن.",
    lnTrust: "صُمم للأطفال والأهل والمعلمين",
    tabProgress: "التقدم",
    prBadges: "الشارات",
    bdStreak3: "3 أيام متتالية",
    pgDefaultTitle: "منطقة الوالدين",
    pgEnterPasscodeSub: "أدخل رمز المرور المكوّن من 4 أرقام",
    pgWrongPasscode: "رمز مرور خاطئ — حاول مرة أخرى",
    pgCreatePasscodeSub: "أنشئ رمز مرور من 4 أرقام لحماية هذه المنطقة",
    pgConfirmPasscodeSub: "أدخل نفس الأرقام الأربعة مرة أخرى للتأكيد",
    pgPasscodeMismatch: "الرمزان غير متطابقين — حاول مرة أخرى",
    stParent: "الوالدان",
    stLock: "قفل الإعدادات برمز مرور",
    stChangePin: "تغيير رمز المرور",
    stLockInfo: "عند تشغيل القفل، يجب على أحد الوالدين إدخال رمز المرور المكوّن من 4 أرقام لفتح الإعدادات، فلا يستطيع الطفل تغيير المفاتيح أو اللغة أو البيانات.",
    stUnlockMsg: "إيقاف القفل؟ سيتمكن أي شخص من فتح الإعدادات.",
    stPinTitle: "رمز مرور الوالدين",
    stPinBody: "اختر 4 أرقام. ستحتاجها لفتح الإعدادات.",
    stPinInvalid: "أدخل 4 أرقام بالضبط.",
    stPrivacyTitle: "الخصوصية",
    stSaveHistory: "حفظ سجل الجمل",
    stPrivacyPolicy: "سياسة الخصوصية",
    stResetProgress: "إعادة ضبط التقدم",
    stResetProgressMsg: "سيبدأ كل التقدم والمستويات والشارات من الصفر.",
    pvIntro: "صُمم BloomLearn للأطفال. لا يحتوي على حسابات أو إعلانات أو تتبع. توضح هذه الصفحة ما يحفظه التطبيق وما قد يغادر الجهاز.",
    pvKeepTitle: "ما يبقى على هذا الجهاز",
    pvKeepBody: "إعداداتك وسجل الجمل والتقدم والشارات والصور المحفوظة ورمز مرور الوالدين وأي مفاتيح تضيفها. لا يُرفع شيء إلى حساب BloomLearn — فلا يوجد حساب.",
    pvSendTitle: "ما قد يغادر الجهاز",
    pvSendBody: "للعثور على الصور، يُبحث عن كلمات مفردة (مثل \"cat\") في مكتبتي ARASAAC وOpenSymbols المجانيتين. فقط إذا أضاف أحد الوالدين مفتاحاً أو خادماً في الإعدادات: يُرسل التسجيل الصوتي إلى OpenAI لتحويله إلى نص، وتُرسل الجملة إلى OpenAI أو Groq أو Pollinations لفهمها أو رسمها.",
    pvNeverTitle: "ما لا نفعله أبداً",
    pvNeverBody: "لا إعلانات، ولا تحليلات، ولا تتبع، ولا بيع أو مشاركة للبيانات، ولا تواصل مع الطفل من خارج التطبيق.",
    pvChildTitle: "للوالدين",
    pvChildBody: "استخدم BloomLearn مع طفلك. شغّل قفل الوالدين حتى تكون وحدك من يغيّر المفاتيح واللغة والبيانات.",
    pvControlTitle: "أنت المتحكم",
    pvControlBody: "في الإعدادات يمكنك إيقاف حفظ السجل، ومسح السجل، وإعادة ضبط التقدم، ومسح مكتبة الصور، وإزالة كل المفاتيح. حذف التطبيق يمسح كل شيء.",
    prStreakShort: "أيام متتالية",
    hmLocal: "تدريبك محفوظ على هذا الجهاز فقط",
    stLibrarySub: "{n} صورة محفوظة على هذا الجهاز",
    hrKicker: "الكلام المصوّر",
    hrTitle: "تكلّم. شاهد. تعلّم.",
    hrBody: "قل جملة وشاهدها تتحول إلى صورة — ثم تعلّم الإنجليزية والرياضيات والعلوم بنفس الطريقة.",
    hrHow: "كيف يعمل",
    hmSubjects: "المواد",
    hmSubjectMeta: "الصفوف 1–5 · {n} فصلاً",
    sbChooseGrade: "اختر الصف",
    sbGrade: "الصف {n}",
    sbChapters: "الفصول",
    sbLessonsDone: "{n} من {m} دروس",
    sbComingSoon: "فصول الصف {n} قادمة قريباً.",
    sbEnglishBlurb: "كلمات وألوان وأماكن الأشياء — مع صورة لكل جملة.",
    sbMathBlurb: "الأعداد والأشكال والمسائل الكلامية — مع صورة لكل سؤال.",
    sbScienceBlurb: "الكائنات الحية وجسمك والمواد والقوى والفضاء.",
    lsLessonOf: "الدرس {i} من {n}",
    lsPrevious: "الدرس السابق",
    lsNext: "الدرس التالي",
    lsShowAnswer: "أظهر الإجابة",
    lsAnswer: "الإجابة",
    lsAllLessons: "كل دروس هذا الفصل",
    sbSource: "مواضيع الفصول تتبع المنهج الوطني الموحد في باكستان (2020) ومنهج كامبريدج للمرحلة الابتدائية. الدروس مكتوبة لتطبيق BloomLearn وليست منسوخة من أي كتاب مدرسي — راجعها مع كتاب مدرستك.",
    prReportTitle: "تقرير التعلّم",
    prReportSub: "كيف يتقدّم طفلك في الإنجليزية والرياضيات والعلوم.",
    prComplete: "مكتمل",
    prLessonsDone: "الدروس المنجزة",
    prChaptersDone: "الفصول المكتملة",
    prToday: "دروس اليوم",
    prThisWeekShort: "هذا الأسبوع",
    prContinue: "تابع التعلّم",
    prBySubject: "حسب المادة",
    prSubjectLine: "{n} من {m} دروس · {c} من {ct} فصول",
    prLessonsWeek: "دروس هذا الأسبوع",
    prReportNote: "يُحسب الدرس منجزاً عندما يفتحه طفلك داخل الفصل. هذا ملخص تدريب من هذا الجهاز، وليس درجة مدرسية أو اختباراً.",
    prShareReport: "شارك التقرير",
    bdFirstLesson: "أول درس",
    bdFirstChapter: "أول فصل",
    bdTenLessons: "10 دروس",
    bdFiftyLessons: "50 درساً",
    bdAllSubjects: "المواد الثلاث",
    bdGradeOne: "مادة الصف الأول",
    bdStreak7: "7 أيام متتالية",
    lsTapToSee: "اضغط ؟ لترى الإجابة",
    lsPrevShort: "السابق",
    lsNextShort: "الدرس التالي",
    spStoryDrawing: "جارٍ رسم القصة…",
    spStoryNeedsEngine: "صورة حقيقية للقصة تحتاج إلى محرك ذكاء اصطناعي — أضف رمز Pollinations مجانياً أو مفتاح OpenAI في الإعدادات. صورة العدّ في الأسفل تعمل دائماً.",
    spStoryFailed: "تعذّر رسم القصة الآن. صورة العدّ في الأسفل ما زالت تُظهر المسألة.",
    faTitle: "من يتعلم اليوم؟",
    faSubtitle: "انظر إلى الكاميرا لمسح الوجه",
    faScanning: "جارٍ مسح الوجه…",
    faRecognized: "تم التعرف على الوجه!",
    faAccuracy: "الدقة: {n}%",
    faDoctorPlan: "خطة الطبيب",
    faNoMatch: "لم يتم التعرف على الوجه. يرجى المحاذاة داخل الشكل البيضاوي أو الاختيار يدوياً.",
    faSwitchChild: "تبديل الطفل",
    faAddChild: "إضافة طفل",
    faManageKids: "إدارة الأطفال وخطط الطبيب",
    faManualSelect: "اختيار الملف الشخصي برمز المرور",
    faStartLearning: "ابدأ التعلم",
    faEnrollFace: "تسجيل الوجه",
    faCapturePhoto: "التقاط صورة",
    faSamplesCaptured: "تم التقاط {n} من 3 عينات",
    faPrescription: "وصفة الطبيب",
    faDoctorNotes: "ملاحظات الطبيب وتوصياته",
    faAssignedSubjects: "المواد المخصصة",
    faAssignedGrade: "الصف المخصص",
    faDailyGoal: "الهدف اليومي للجمل",
    faChildName: "اسم الطفل",
    faAge: "العمر",
    faSavedProfile: "تم حفظ الملف الشخصي",
    faHoldStill: "اضبط وجهك داخل الإطار البيضاوي واثبت",
    faLookingForFace: "جارٍ البحث عن الوجه…",
  },
};

export function t(key: TKey, lang: LanguageCode): string {
  return T[lang]?.[key] ?? T['en-US'][key] ?? key;
}

export function isRTL(lang: LanguageCode): boolean {
  return lang === 'ar-SA';
}

/** BCP-47 tag for the device speech engine. */
export function speechLocale(lang: LanguageCode): string {
  return lang; // "en-US" and "ar-SA" are both valid for expo-speech
}

/**
 * Apply layout direction for a language. Returns true when the direction
 * actually flipped — the caller must then ask the user to reopen the app,
 * because React Native only picks up an RTL change on a fresh start.
 */
export function applyLanguageDirection(lang: LanguageCode): boolean {
  const want = isRTL(lang);
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== want) {
    I18nManager.forceRTL(want);
    return true;
  }
  return false;
}

/** Starter board words, localised. Keys are the English label used as the id anchor. */
export const STARTER_WORDS: Record<LanguageCode | 'default', Record<string, string>> = {
  default: {},
  'en-US': {},
  'ar-SA': {
    I: 'أنا', you: 'أنت', want: 'أريد', more: 'المزيد', stop: 'توقف', go: 'اذهب', like: 'أحب', help: 'مساعدة', yes: 'نعم', no: 'لا',
    water: 'ماء', milk: 'حليب', juice: 'عصير', apple: 'تفاحة', banana: 'موز', bread: 'خبز', cookie: 'بسكويت', rice: 'أرز', chicken: 'دجاج', snack: 'وجبة خفيفة',
    happy: 'سعيد', sad: 'حزين', angry: 'غاضب', scared: 'خائف', tired: 'متعب', hurt: 'أتألم', sick: 'مريض', excited: 'متحمس', calm: 'هادئ', love: 'حب',
    mom: 'أمي', dad: 'أبي', me: 'أنا', teacher: 'المعلم', friend: 'صديق', baby: 'طفل', doctor: 'الطبيب', grandma: 'جدتي', grandpa: 'جدي', sister: 'أختي',
    eat: 'آكل', drink: 'أشرب', play: 'ألعب', sleep: 'أنام', read: 'أقرأ', walk: 'أمشي', run: 'أركض', sit: 'أجلس', wash: 'أغسل', open: 'افتح',
  },
};

export function starterLabel(englishLabel: string, lang: LanguageCode): string {
  return STARTER_WORDS[lang]?.[englishLabel] ?? englishLabel;
}

/** Display translation for the answer words used in the Games screen. */
/**
 * A broad English→Arabic word dictionary for the built-in vocabulary
 * (starter board + bulk-build seed lists). Words not listed keep their
 * original text — a caregiver's custom word is never guessed at.
 */
const WORD_AR: Record<string, string> = {
  // days & months
  Monday: 'الإثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت', Sunday: 'الأحد',
  January: 'يناير', February: 'فبراير', March: 'مارس', April: 'أبريل', May: 'مايو', June: 'يونيو', July: 'يوليو',
  August: 'أغسطس', September: 'سبتمبر', October: 'أكتوبر', November: 'نوفمبر', December: 'ديسمبر',
  // animals
  Ant: 'نملة', Bear: 'دب', Bee: 'نحلة', Bird: 'طائر', Butterfly: 'فراشة', Camel: 'جمل', Cat: 'قطة', Chicken: 'دجاجة', Cow: 'بقرة',
  Crab: 'سلطعون', Crocodile: 'تمساح', Deer: 'غزال', Dog: 'كلب', Dolphin: 'دلفين', Donkey: 'حمار', Duck: 'بطة', Eagle: 'نسر',
  Elephant: 'فيل', Fish: 'سمكة', Fox: 'ثعلب', Frog: 'ضفدع', Giraffe: 'زرافة', Goat: 'ماعز', Gorilla: 'غوريلا', Hippo: 'فرس النهر',
  Horse: 'حصان', Kangaroo: 'كنغر', Koala: 'كوالا', Lion: 'أسد', Lizard: 'سحلية', Monkey: 'قرد', Mouse: 'فأر', Octopus: 'أخطبوط',
  Owl: 'بومة', Panda: 'باندا', Parrot: 'ببغاء', Penguin: 'بطريق', Pig: 'خنزير', Rabbit: 'أرنب', Rhino: 'وحيد القرن',
  Rooster: 'ديك', Seal: 'فقمة', Shark: 'قرش', Sheep: 'خروف', Snail: 'حلزون', Snake: 'ثعبان', Spider: 'عنكبوت',
  Squirrel: 'سنجاب', Swan: 'بجعة', Tiger: 'نمر', Turtle: 'سلحفاة', Whale: 'حوت', Wolf: 'ذئب', Zebra: 'حمار وحشي',
  // fruits & veg & food
  Apple: 'تفاحة', Apricot: 'مشمش', Avocado: 'أفوكادو', Banana: 'موزة', Cherry: 'كرز', Coconut: 'جوز الهند', Grape: 'عنب',
  Kiwi: 'كيوي', Lemon: 'ليمون', Mango: 'مانجو', Melon: 'شمام', Orange: 'برتقالة', Peach: 'خوخ', Pear: 'كمثرى',
  Pineapple: 'أناناس', Strawberry: 'فراولة', Watermelon: 'بطيخ', Carrot: 'جزرة', Potato: 'بطاطا', Corn: 'ذرة', Tomato: 'طماطم',
  Onion: 'بصل', Garlic: 'ثوم', Cucumber: 'خيار', Bread: 'خبز', Rice: 'أرز', Egg: 'بيضة', Cheese: 'جبن', Milk: 'حليب',
  Water: 'ماء', Juice: 'عصير', Cake: 'كعكة', Cookie: 'بسكويت', Pizza: 'بيتزا', Soup: 'حساء', Chicken_food: 'دجاج',
  // sports
  Baseball: 'بيسبول', Basketball: 'كرة السلة', Boxing: 'ملاكمة', Cricket: 'كريكيت', Cycling: 'ركوب الدراجة', Golf: 'غولف',
  Hockey: 'هوكي', Running: 'الجري', Skating: 'تزلج', Skiing: 'تزلج على الجليد', Soccer: 'كرة القدم', Surfing: 'ركوب الأمواج',
  Swimming: 'سباحة', Tennis: 'تنس', Volleyball: 'كرة الطائرة',
  // school supplies
  Backpack: 'حقيبة ظهر', Book: 'كتاب', Crayon: 'قلم شمعي', Eraser: 'ممحاة', Folder: 'مجلد', Glue: 'غراء', Marker: 'قلم تحديد',
  Notebook: 'دفتر', Pen: 'قلم', Pencil: 'قلم رصاص', Ruler: 'مسطرة', Scissors: 'مقص',
  // colors & shapes
  Red: 'أحمر', Orange_c: 'برتقالي', Yellow: 'أصفر', Green: 'أخضر', Blue: 'أزرق', Purple: 'بنفسجي', Pink: 'وردي',
  Brown: 'بني', Black: 'أسود', White: 'أبيض', Gray: 'رمادي',
  Circle: 'دائرة', Square: 'مربع', Triangle: 'مثلث', Rectangle: 'مستطيل', Oval: 'بيضاوي', Star: 'نجمة', Heart: 'قلب', Diamond: 'معيّن',
  // vehicles / weather / clothes / body / family
  Car: 'سيارة', Bus: 'حافلة', Train: 'قطار', Airplane: 'طائرة', Boat: 'قارب', Bicycle: 'دراجة', Truck: 'شاحنة',
  Sunny: 'مشمس', Rain: 'مطر', Snow: 'ثلج', Cloudy: 'غائم', Wind: 'رياح', Storm: 'عاصفة', Rainbow: 'قوس قزح',
  Shirt: 'قميص', Pants: 'بنطال', Dress: 'فستان', Shoes: 'حذاء', Hat: 'قبعة', Socks: 'جوارب', Jacket: 'سترة',
  Eye: 'عين', Ear: 'أذن', Nose: 'أنف', Mouth: 'فم', Hand: 'يد', Foot: 'قدم', Head: 'رأس', Hair: 'شعر',
  // anatomy diagram (SceneStage "parts of the body")
  Brain: 'الدماغ', Lungs: 'الرئتان', Liver: 'الكبد', Stomach: 'المعدة', Pancreas: 'البنكرياس',
  Kidneys: 'الكليتان', Intestines: 'الأمعاء', Bladder: 'المثانة', Eyes: 'العينان', Ears: 'الأذنان',
  Neck: 'الرقبة', Shoulders: 'الكتفان', Chest: 'الصدر', Arms: 'الذراعان', Elbows: 'المرفقان',
  Hands: 'اليدان', Fingers: 'الأصابع', Tummy: 'البطن', Hips: 'الوركان', Legs: 'الساقان',
  Knees: 'الركبتان', Feet: 'القدمان', Toes: 'أصابع القدم', Back: 'الظهر', Torso: 'الجذع', Body: 'الجسم',
  Baby: 'طفل', Brother: 'أخ', Sister: 'أخت', Mom: 'أم', Dad: 'أب', Grandma: 'جدة', Grandpa: 'جد', Aunt: 'خالة', Uncle: 'عم',
  // core AAC words (the default "Core" board — the most-used words of all)
  I: 'أنا', You: 'أنت', Want: 'أريد', More: 'المزيد', Stop: 'توقف', Go: 'اذهب', Like: 'يعجبني', Help: 'مساعدة',
  Yes: 'نعم', No: 'لا', Please: 'من فضلك', 'Thank You': 'شكراً', Look: 'انظر', Come: 'تعال', Here: 'هنا', Where: 'أين',
  // sentence starters
  'I Need Help': 'أحتاج مساعدة', 'I Want': 'أريد', 'I Feel': 'أشعر', 'Can I Have': 'هل يمكنني الحصول على',
  'Look At This': 'انظر إلى هذا', 'More Please': 'المزيد من فضلك', 'Stop Please': 'توقف من فضلك', 'Go To': 'اذهب إلى',
  'I Am': 'أنا', 'Where Is': 'أين', 'What Is That': 'ما هذا', 'I Like': 'أنا أحب', "I Don't Like": 'لا أحب', 'All Done': 'انتهيت',
  In: 'في',
  // emotions (the "Emotion" board)
  Happy: 'سعيد', Sad: 'حزين', Angry: 'غاضب', Proud: 'فخور', Silly: 'سخيف', Frustrated: 'محبط', Loved: 'محبوب',
  Surprised: 'متفاجئ', Confused: 'مرتبك', Shy: 'خجول', Hurt: 'مجروح', Scared: 'خائف', Sick: 'مريض', Tired: 'متعب',
  Excited: 'متحمس', Calm: 'هادئ',
  // attributes / opposites
  Big: 'كبير', Small: 'صغير', Hot: 'ساخن', Cold: 'بارد', Fast: 'سريع', Slow: 'بطيء', Good: 'جيد', Bad: 'سيء',
  Clean: 'نظيف', Dirty: 'متسخ', Loud: 'صاخب', Quiet: 'هادئ', Soft: 'ناعم', Hard: 'صعب', Open: 'مفتوح', Closed: 'مغلق',
  Up: 'فوق', Down: 'تحت', Out: 'خارج', Same: 'نفسه', Different: 'مختلف',
  // more sports
  'Jump Rope': 'نط الحبل', Dancing: 'رقص', Playground: 'ملعب', Catch: 'أمسك', 'Ride Bike': 'ركوب الدراجة',
  Gymnastics: 'جمباز', Skateboard: 'لوح تزلج', Yoga: 'يوغا',
  // hygiene / routine
  'Wash Hands': 'اغسل يديك', 'Brush Teeth': 'نظف أسنانك', Toilet: 'مرحاض', Shower: 'دش', 'Comb Hair': 'مشط شعرك',
  'Wash Face': 'اغسل وجهك', 'Blow Nose': 'امسح أنفك', 'Put On Clothes': 'البس ملابسك', 'Drink Water': 'اشرب الماء',
  Sleep: 'نوم', 'Clean Up': 'رتب', Bandage: 'ضمادة',
  // music
  Sing: 'غنِّ', Dance: 'ارقص', Guitar: 'جيتار', Piano: 'بيانو', Drums: 'طبول', Listen: 'استمع', Song: 'أغنية',
  Music: 'موسيقى', Bell: 'جرس', Trumpet: 'بوق', Violin: 'كمان', Headphones: 'سماعات',
  // school (the "Schools" board)
  School: 'مدرسة', Teacher: 'معلم', Class: 'صف', Chair: 'كرسي', Desk: 'مكتب', Recess: 'استراحة', Crayons: 'ألوان شمعية',
  Blocks: 'مكعبات', 'Fire Drill': 'تدريب إخلاء الحريق', 'Bulletin Board': 'لوحة إعلانات', 'Pencil Sharpener': 'مبراة أقلام',
  Slide: 'زحليقة', Swing: 'أرجوحة', 'Sensory Table': 'طاولة حسية', Pens: 'أقلام', 'Coloured Pencils': 'أقلام ملونة',
  Bookshelf: 'رف كتب', Cafeteria: 'كافتيريا', 'Main Hall': 'القاعة الرئيسية', Reception: 'استقبال', 'School Store': 'متجر المدرسة',
  Counting: 'العد', Learn: 'تعلم', Numbers: 'أرقام', 'Flash Cards': 'بطاقات تعليمية', Crafts: 'حرف يدوية',
  // more tools
  Hammer: 'مطرقة', Calculator: 'آلة حاسبة', Tape: 'شريط لاصق', Sharpener: 'مبراة', Paperclip: 'مشبك ورق',
  Tablet: 'جهاز لوحي', Paintbrush: 'فرشاة', Clock: 'ساعة',
  // more food
  Snack: 'وجبة خفيفة', Sandwich: 'شطيرة', Fries: 'بطاطا مقلية', Fruit: 'فاكهة',
  // visual schedule — preset names + built-in routine activities
  'All Day': 'طوال اليوم', Morning: 'الصباح', Bedtime: 'وقت النوم', Therapy: 'العلاج',
  'Breakfast Time': 'وقت الفطور', 'Play & Learning': 'اللعب والتعلم', 'AAC Speech Session': 'جلسة تواصل بالصور',
  'Healthy Lunch': 'غداء صحي', 'Quiet Rest Time': 'وقت راحة هادئ', 'Sensory Playground': 'ملعب حسي',
  'Wake Up & Stretch': 'استيقظ وتمدد', 'Wash Face & Dress': 'اغسل وجهك والبس ملابسك', 'Eat Breakfast': 'تناول الفطور',
  'Pack Backpack': 'جهّز الحقيبة المدرسية',
  'Family Dinner': 'عشاء عائلي', 'Warm Bath': 'استحمام دافئ', 'Pajamas & Brush Teeth': 'بيجاما وتنظيف الأسنان',
  'Read Storybook': 'اقرأ قصة', 'Lights Out & Sleep': 'أطفئ الأنوار ونم',
  'Sensory Warmup': 'إحماء حسي', 'Speech AAC Practice': 'تمرين تواصل بالصور', 'Fine Motor Skills': 'مهارات حركية دقيقة',
  'Star Reward & Free Play': 'مكافأة نجمة ولعب حر',
  // "Say It For Me" board — full modeled sentences with pronouns, for children
  // who cannot speak but can understand and hear spoken language.
  'I want to eat': 'أريد أن آكل', 'I want to drink': 'أريد أن أشرب', 'I need the bathroom': 'أحتاج إلى الحمام',
  'I am happy': 'أنا سعيد', 'I am sad': 'أنا حزين', 'I am in pain': 'أشعر بألم',
  'I want to play': 'أريد أن ألعب', 'I am sleepy': 'أنا نعسان', 'I need help': 'أحتاج المساعدة', 'I want to go outside': 'أريد أن أخرج',
  'I love you': 'أحبك', 'I am hungry': 'أنا جائع', 'I am thirsty': 'أنا عطشان',
  'Thank you very much': 'شكراً جزيلاً', 'Please help me': 'من فضلك ساعدني', "I don't feel well": 'لا أشعر أنني بخير',
  'I want my mom': 'أريد أمي', 'I want my dad': 'أريد أبي', 'Can we go home': 'هل يمكننا الذهاب إلى المنزل',
  'I am scared': 'أنا خائف',
};
// Reverse lookups (Arabic text -> English) so a word already translated
// one way can be recovered and re-translated the other way. Without this,
// switching a category from Arabic back to English left every non-core word
// stuck in Arabic, because wordLabel() only ever matched by English key.
function buildReverse(dict: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [en, local] of Object.entries(dict)) out[local] = en;
  return out;
}
const WORD_AR_REVERSE = buildReverse(WORD_AR);

/** Recover the canonical English form of a word, whatever language it's
 * currently displayed in (a no-op if it's already English or unknown). */
function canonicalWordEn(label: string): string {
  return WORD_AR_REVERSE[label] ?? label;
}

export function wordLabel(label: string, lang: LanguageCode): string {
  const en = canonicalWordEn(label);
  if (lang === 'ar-SA') return WORD_AR[en] ?? starterLabel(en, lang) ?? en;
  return en;
}
