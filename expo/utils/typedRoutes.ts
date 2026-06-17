/**
 * Typed route definitions for the Expo Router app.
 * Use these instead of router.push('/path' as any).
 */

// ---------- Tab routes ----------
export const ROUTES = {
  // Tabs
  home: '/(tabs)/home' as const,
  courses: '/(tabs)/courses' as const,
  timer: '/(tabs)/timer' as const,
  friends: '/(tabs)/friends' as const,
  aiChat: '/(tabs)/ai-chat' as const,
  hogskoleprovet: '/(tabs)/hogskoleprovet' as const,

  // Auth & onboarding
  auth: '/auth' as const,
  ftue: '/ftue' as const,
  onboarding: '/onboarding' as const,

  // Profile & settings
  profile: '/profile' as const,
  settings: '/settings' as const,

  // Premium
  premium: '/premium' as const,

  // Courses
  courseDetail: (id: string) => `/course/${id}` as const,
  courseLibrary: '/course-library' as const,
  courseQuiz: (courseId: string) => `/course-quiz/${courseId}` as const,

  // Lessons & content
  lesson: (id: string) => `/lesson/${id}` as const,
  studyGuide: (id: string) => `/study-guide/${id}` as const,
  contentCourse: (id: string) => `/content-course/${id}` as const,
  contentModule: (id: string) => `/content-module/${id}` as const,
  contentLesson: (id: string) => `/content-lesson/${id}` as const,

  // Quiz & flashcards
  quiz: (id: string) => `/quiz/${id}` as const,
  flashcards: (courseId: string) => `/flashcards/${courseId}` as const,
  flashcardsV2: (courseId: string) => `/flashcards-v2/${courseId}` as const,
  smartFlashcards: '/smart-flashcards' as const,

  // Högskoleprovet
  hogskoleprovetMain: '/hogskoleprovet' as const,
  hpTest: '/hp-test' as const,
  hpPractice: (sectionCode: string) => `/hp-practice/${sectionCode}` as const,
  hpResults: '/hp-results' as const,
  hpStats: '/hp-stats' as const,
  hpStudyPlan: '/hp-study-plan' as const,
  hpSelectVersion: '/hp-select-version' as const,
  hpAiGenerator: '/hp-ai-generator' as const,
  hpAiPractice: '/hp-ai-practice' as const,

  // Study features
  studyInsights: '/study-insights' as const,
  advancedAnalytics: '/advanced-analytics' as const,
  studyCoach: '/study-coach' as const,
  speechPractice: '/speech-practice' as const,
  studyPlan: (examId: string) => `/study-plan/${examId}` as const,
  studyTechniques: '/study-techniques' as const,
  studyTips: '/study-tips' as const,
  studyTechnique: (id: string) => `/study-technique/${id}` as const,
  studyTip: (id: string) => `/study-tip/${id}` as const,

  // Social
  community: (id: string) => `/community/${id}` as const,
  friendStats: (friendId: string) => `/friend-stats/${friendId}` as const,

  // Diagnosstöd
  diagnosstod: '/diagnosstod' as const,
  diagnosDetail: (id: string) => `/diagnos/${id}` as const,

  // Planning
  planning: '/planning' as const,

  // History
  history: '/history' as const,

  // Achievements
  achievements: '/achievements' as const,

  // AI Chat
  mathChat: '/math-chat' as const,
  generalChat: '/general-chat' as const,

  // Legal
  privacyPolicy: '/privacy-policy' as const,
  terms: '/terms' as const,

  // Program selection
  programSelection: '/program-selection' as const,
} as const;
