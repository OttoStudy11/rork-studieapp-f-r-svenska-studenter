// Batch course creation utility
// This script generates course page files with proper structure

const remainingCourses = [
  { id: 'moderna-sprak', code: 'MODMOD', title: 'Moderna språk', desc: 'Språk och kultur', icon: '🌍', colors: ['#8B5CF6', '#7C3AED'] },
  { id: 'samhallskunskap1a', code: 'SAMSAM01a', title: 'Samhällskunskap 1a', desc: 'Samhälle, politik och ekonomi', icon: '🏛️', colors: ['#6366F1', '#4F46E5'] },
  { id: 'samhallskunskap1b', code: 'SAMSAM01b', title: 'Samhällskunskap 1b', desc: 'Samhälle, politik och ekonomi', icon: '🏛️', colors: ['#6366F1', '#4F46E5'] },
  { id: 'samhallskunskap2', code: 'SAMSAM02', title: 'Samhällskunskap 2', desc: 'Fördjupning i samhällsfrågor', icon: '📊', colors: ['#6366F1', '#4F46E5'] },
  { id: 'naturkunskap1a', code: 'NAKNAK01a', title: 'Naturkunskap 1a', desc: 'Naturvetenskapens grund', icon: '🌿', colors: ['#14B8A6', '#0D9488'] },
  { id: 'idrott-halsa1', code: 'IDRIDR01', title: 'Idrott och hälsa 1', desc: 'Fysisk aktivitet och hälsa', icon: '⚽', colors: ['#F97316', '#EA580C'] },
  { id: 'idrott-halsa2', code: 'IDRIDR02', title: 'Idrott och hälsa 2', desc: 'Träning och livsstil', icon: '🏃', colors: ['#F97316', '#EA580C'] },
  { id: 'geografi1', code: 'GEOGEO01', title: 'Geografi 1', desc: 'Jorden och människan', icon: '🌍', colors: ['#06B6D4', '#0891B2'] },
  { id: 'filosofi1', code: 'FILFIL01', title: 'Filosofi 1', desc: 'Filosofins grunder', icon: '🤔', colors: ['#8B5CF6', '#7C3AED'] },
  { id: 'psykologi1', code: 'PSKPSK01', title: 'Psykologi 1', desc: 'Människans beteende och psyke', icon: '🧠', colors: ['#A855F7', '#9333EA'] },
  { id: 'programmering1', code: 'PRRPRR01', title: 'Programmering 1', desc: 'Grundläggande programmering', icon: '💻', colors: ['#3B82F6', '#2563EB'] },
  { id: 'programmering2', code: 'PRRPRR02', title: 'Programmering 2', desc: 'Objektorienterad programmering', icon: '⚙️', colors: ['#3B82F6', '#2563EB'] },
  { id: 'webbutveckling1', code: 'WEBWEB01', title: 'Webbutveckling 1', desc: 'HTML, CSS och JavaScript', icon: '🌐', colors: ['#06B6D4', '#0891B2'] },
  { id: 'webbutveckling2', code: 'WEBWEB02', title: 'Webbutveckling 2', desc: 'Avancerad webbutveckling', icon: '💡', colors: ['#06B6D4', '#0891B2'] },
  { id: 'matematik3c', code: 'MATMAT03c', title: 'Matematik 3c', desc: 'Teknisk matematik', icon: '📐', colors: ['#3B82F6', '#2563EB'] },
  { id: 'matematik4', code: 'MATMAT04', title: 'Matematik 4', desc: 'Avancerad matematik', icon: '🔢', colors: ['#3B82F6', '#2563EB'] },
  { id: 'matematik5', code: 'MATMAT05', title: 'Matematik 5', desc: 'Högskolematematik', icon: '∑', colors: ['#3B82F6', '#2563EB'] },
];

console.log(`Remaining courses to create: ${remainingCourses.length}`);
remainingCourses.forEach(c => console.log(`- ${c.id} (${c.title})`));
