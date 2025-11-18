// Quick course page generator script
// This generates templates for all remaining courses

const courses = [
  { id: 'kemi1', code: 'KEMKEM01', title: 'Kemi 1', desc: 'Grundläggande kemi och kemiska reaktioner', icon: '⚗️', colors: ['#10B981', '#059669'] },
  { id: 'biologi2', code: 'BIOBIO02', title: 'Biologi 2', desc: 'Fördjupning i biologi och ekologi', icon: '🧬', colors: ['#06B6D4', '#0891B2'] },
  { id: 'fysik2', code: 'FYSFYS02', title: 'Fysik 2', desc: 'Elektricitet, magnetism och vågor', icon: '🔬', colors: ['#F59E0B', '#D97706'] },
  { id: 'kemi2', code: 'KEMKEM02', title: 'Kemi 2', desc: 'Organisk kemi och biokemi', icon: '🧪', colors: ['#10B981', '#059669'] },
  { id: 'svenska2', code: 'SVESVE02', title: 'Svenska 2', desc: 'Litteratur och språkutveckling', icon: '📚', colors: ['#EC4899', '#DB2777'] },
  { id: 'svenska3', code: 'SVESVE03', title: 'Svenska 3', desc: 'Retorik och språklig medvetenhet', icon: '✍️', colors: ['#EC4899', '#DB2777'] },
  { id: 'engelska6', code: 'ENGENG06', title: 'Engelska 6', desc: 'Avancerad engelska och kommunikation', icon: '🇬🇧', colors: ['#EF4444', '#DC2626'] },
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
  { id: 'matematik3b', code: 'MATMAT03b', title: 'Matematik 3b', desc: 'Derivata och integraler', icon: '📈', colors: ['#3B82F6', '#2563EB'] },
  { id: 'matematik3c', code: 'MATMAT03c', title: 'Matematik 3c', desc: 'Teknisk matematik', icon: '📐', colors: ['#3B82F6', '#2563EB'] },
  { id: 'matematik4', code: 'MATMAT04', title: 'Matematik 4', desc: 'Avancerad matematik', icon: '🔢', colors: ['#3B82F6', '#2563EB'] },
  { id: 'matematik5', code: 'MATMAT05', title: 'Matematik 5', desc: 'Högskolematematik', icon: '∑', colors: ['#3B82F6', '#2563EB'] },
];

console.log(`Need to create ${courses.length} course pages`);
courses.forEach(c => console.log(`- ${c.id}.tsx`));
