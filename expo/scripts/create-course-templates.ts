// Helper to generate course pages
// Run: bun scripts/create-course-templates.ts

const courses = [
  { id: 'historia1b', name: 'Historia 1b', code: 'HISHIS01b', emoji: '🏛️', color: ['#F59E0B', '#D97706'] },
  { id: 'idrott-halsa1', name: 'Idrott och hälsa 1', code: 'IDRIDR01', emoji: '⚽', color: ['#EF4444', '#DC2626'] },
  { id: 'matematik1b', name: 'Matematik 1b', code: 'MATMAT01b', emoji: '📐', color: ['#3B82F6', '#2563EB'] },
  { id: 'matematik2b', name: 'Matematik 2b', code: 'MATMAT02b', emoji: '📊', color: ['#3B82F6', '#2563EB'] },
  { id: 'naturkunskap1b', name: 'Naturkunskap 1b', code: 'NAKNAK01b', emoji: '🌱', color: ['#10B981', '#059669'] },
  { id: 'samhallskunskap1b', name: 'Samhällskunskap 1b', code: 'SAMSAM01b', emoji: '🏛️', color: ['#8B5CF6', '#7C3AED'] },
  { id: 'svenska2', name: 'Svenska 2', code: 'SVESVE02', emoji: '📝', color: ['#EC4899', '#DB2777'] },
  { id: 'svenska3', name: 'Svenska 3', code: 'SVESVE03', emoji: '📖', color: ['#EC4899', '#DB2777'] },
  { id: 'biologi1', name: 'Biologi 1', code: 'BIOBIO01', emoji: '🧬', color: ['#22C55E', '#16A34A'] },
  { id: 'fysik1a', name: 'Fysik 1a', code: 'FYSFYS01a', emoji: '⚛️', color: ['#3B82F6', '#2563EB'] },
  { id: 'kemi1', name: 'Kemi 1', code: 'KEMKEM01', emoji: '🧪', color: ['#8B5CF6', '#7C3AED'] },
  { id: 'matematik3b', name: 'Matematik 3b', code: 'MATMAT03b', emoji: '📈', color: ['#3B82F6', '#2563EB'] },
  { id: 'moderna-sprak', name: 'Moderna språk', code: 'MODMOD', emoji: '🌍', color: ['#06B6D4', '#0891B2'] },
  { id: 'filosofi1', name: 'Filosofi 1', code: 'FILFIL01', emoji: '🤔', color: ['#A855F7', '#9333EA'] },
  { id: 'psykologi1', name: 'Psykologi 1', code: 'PSKPSY01', emoji: '🧠', color: ['#EC4899', '#DB2777'] },
  { id: 'foretagsekonomi1', name: 'Företagsekonomi 1', code: 'FÖRFÖR01', emoji: '💼', color: ['#F59E0B', '#D97706'] },
  { id: 'juridik1', name: 'Juridik 1', code: 'JURJUR01', emoji: '⚖️', color: ['#6366F1', '#4F46E5'] },
];

console.log('Course pages will be created in app/course-content/ directory');
console.log('Total courses:', courses.length);
courses.forEach(course => {
  console.log(`- ${course.name} (${course.code})`);
});
