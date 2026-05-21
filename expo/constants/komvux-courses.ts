export interface KomvuxCourse {
  id: string;
  code: string;
  name: string;
  points: number;
  category: 'kärnämne' | 'gymnasiegemensam' | 'karaktärsämne' | 'individuellt val';
  subject: 'svenska' | 'engelska' | 'matematik' | 'naturvetenskap' | 'samhällsvetenskap' | 'humaniora' | 'ekonomi' | 'teknik';
  emoji: string;
}

export const KOMVUX_COURSES: KomvuxCourse[] = [
  // Svenska
  { id: 'sv1', code: 'SVESVE01', name: 'Svenska 1', points: 100, category: 'kärnämne', subject: 'svenska', emoji: '📝' },
  { id: 'sv2', code: 'SVESVE02', name: 'Svenska 2', points: 100, category: 'kärnämne', subject: 'svenska', emoji: '📝' },
  { id: 'sv3', code: 'SVESVE03', name: 'Svenska 3', points: 100, category: 'kärnämne', subject: 'svenska', emoji: '📝' },
  { id: 'svasf1', code: 'SVAAFS01', name: 'Svenska som andraspråk 1', points: 100, category: 'kärnämne', subject: 'svenska', emoji: '🗣️' },
  { id: 'svasf2', code: 'SVAAFS02', name: 'Svenska som andraspråk 2', points: 100, category: 'kärnämne', subject: 'svenska', emoji: '🗣️' },
  { id: 'svasf3', code: 'SVAAFS03', name: 'Svenska som andraspråk 3', points: 100, category: 'kärnämne', subject: 'svenska', emoji: '🗣️' },

  // Engelska
  { id: 'en5', code: 'ENGENG05', name: 'Engelska 5', points: 100, category: 'kärnämne', subject: 'engelska', emoji: '🌍' },
  { id: 'en6', code: 'ENGENG06', name: 'Engelska 6', points: 100, category: 'kärnämne', subject: 'engelska', emoji: '🌍' },
  { id: 'en7', code: 'ENGENG07', name: 'Engelska 7', points: 100, category: 'kärnämne', subject: 'engelska', emoji: '🌍' },

  // Matematik
  { id: 'ma1a', code: 'MATMAT01a', name: 'Matematik 1a', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma1b', code: 'MATMAT01b', name: 'Matematik 1b', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma1c', code: 'MATMAT01c', name: 'Matematik 1c', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma2a', code: 'MATMAT02a', name: 'Matematik 2a', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma2b', code: 'MATMAT02b', name: 'Matematik 2b', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma2c', code: 'MATMAT02c', name: 'Matematik 2c', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma3b', code: 'MATMAT03b', name: 'Matematik 3b', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma3c', code: 'MATMAT03c', name: 'Matematik 3c', points: 100, category: 'kärnämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma4', code: 'MATMAT04', name: 'Matematik 4', points: 100, category: 'karaktärsämne', subject: 'matematik', emoji: '🔢' },
  { id: 'ma5', code: 'MATMAT05', name: 'Matematik 5', points: 100, category: 'karaktärsämne', subject: 'matematik', emoji: '🔢' },

  // Naturvetenskap
  { id: 'bi1', code: 'BIOBIO01', name: 'Biologi 1', points: 100, category: 'karaktärsämne', subject: 'naturvetenskap', emoji: '🧬' },
  { id: 'bi2', code: 'BIOBIO02', name: 'Biologi 2', points: 100, category: 'karaktärsämne', subject: 'naturvetenskap', emoji: '🧬' },
  { id: 'fy1', code: 'FYSFYS01a', name: 'Fysik 1', points: 100, category: 'karaktärsämne', subject: 'naturvetenskap', emoji: '⚛️' },
  { id: 'fy2', code: 'FYSFYS02', name: 'Fysik 2', points: 100, category: 'karaktärsämne', subject: 'naturvetenskap', emoji: '⚛️' },
  { id: 'ke1', code: 'KEMKEM01', name: 'Kemi 1', points: 100, category: 'karaktärsämne', subject: 'naturvetenskap', emoji: '🧪' },
  { id: 'ke2', code: 'KEMKEM02', name: 'Kemi 2', points: 100, category: 'karaktärsämne', subject: 'naturvetenskap', emoji: '🧪' },
  { id: 'nak1b', code: 'NATNNA01b', name: 'Naturkunskap 1b', points: 100, category: 'gymnasiegemensam', subject: 'naturvetenskap', emoji: '🌱' },
  { id: 'nak2', code: 'NATNNA02', name: 'Naturkunskap 2', points: 100, category: 'gymnasiegemensam', subject: 'naturvetenskap', emoji: '🌱' },

  // Samhällsvetenskap
  { id: 'sam1b', code: 'SAMSAM01b', name: 'Samhällskunskap 1b', points: 100, category: 'gymnasiegemensam', subject: 'samhällsvetenskap', emoji: '🏛️' },
  { id: 'sam2', code: 'SAMSAM02', name: 'Samhällskunskap 2', points: 100, category: 'karaktärsämne', subject: 'samhällsvetenskap', emoji: '🏛️' },
  { id: 'sam3', code: 'SAMSAM03', name: 'Samhällskunskap 3', points: 100, category: 'karaktärsämne', subject: 'samhällsvetenskap', emoji: '🏛️' },
  { id: 'hi1b', code: 'HISHIS01b', name: 'Historia 1b', points: 100, category: 'gymnasiegemensam', subject: 'samhällsvetenskap', emoji: '📜' },
  { id: 'hi2a', code: 'HISHIS02a', name: 'Historia 2a', points: 100, category: 'karaktärsämne', subject: 'samhällsvetenskap', emoji: '📜' },
  { id: 'hi3', code: 'HISHIS03', name: 'Historia 3', points: 100, category: 'karaktärsämne', subject: 'samhällsvetenskap', emoji: '📜' },
  { id: 'ge1', code: 'GEOGEO01', name: 'Geografi 1', points: 100, category: 'gymnasiegemensam', subject: 'samhällsvetenskap', emoji: '🌏' },
  { id: 'ge2', code: 'GEOGEO02', name: 'Geografi 2', points: 100, category: 'karaktärsämne', subject: 'samhällsvetenskap', emoji: '🌏' },
  { id: 're1', code: 'RELREL01a1', name: 'Religionskunskap 1', points: 50, category: 'gymnasiegemensam', subject: 'samhällsvetenskap', emoji: '🕊️' },

  // Humaniora
  { id: 'psy1', code: 'PSYPSY01a', name: 'Psykologi 1a1', points: 50, category: 'karaktärsämne', subject: 'humaniora', emoji: '🧠' },
  { id: 'psy2', code: 'PSYPSY02a', name: 'Psykologi 2a', points: 50, category: 'karaktärsämne', subject: 'humaniora', emoji: '🧠' },
  { id: 'fil1', code: 'FILFIL01', name: 'Filosofi 1', points: 100, category: 'karaktärsämne', subject: 'humaniora', emoji: '💭' },
  { id: 'fil2', code: 'FILFIL02', name: 'Filosofi 2', points: 50, category: 'karaktärsämne', subject: 'humaniora', emoji: '💭' },
  { id: 'esp1', code: 'SPASP01', name: 'Spanska 1', points: 100, category: 'karaktärsämne', subject: 'humaniora', emoji: '🇪🇸' },
  { id: 'esp2', code: 'SPASP02', name: 'Spanska 2', points: 100, category: 'karaktärsämne', subject: 'humaniora', emoji: '🇪🇸' },
  { id: 'fran1', code: 'FRAPER01', name: 'Franska 1', points: 100, category: 'karaktärsämne', subject: 'humaniora', emoji: '🇫🇷' },
  { id: 'tys1', code: 'TYSGR01', name: 'Tyska 1', points: 100, category: 'karaktärsämne', subject: 'humaniora', emoji: '🇩🇪' },

  // Ekonomi
  { id: 'fek1', code: 'FOKFOK01', name: 'Företagsekonomi 1', points: 100, category: 'karaktärsämne', subject: 'ekonomi', emoji: '💼' },
  { id: 'fek2', code: 'FOKFOK02', name: 'Företagsekonomi 2', points: 100, category: 'karaktärsämne', subject: 'ekonomi', emoji: '💼' },
  { id: 'jur1', code: 'JURJUR01', name: 'Juridik 1', points: 100, category: 'karaktärsämne', subject: 'ekonomi', emoji: '⚖️' },
  { id: 'nar1', code: 'NARNAR01', name: 'Privatekonomi', points: 100, category: 'karaktärsämne', subject: 'ekonomi', emoji: '💰' },

  // Teknik/IT
  { id: 'prog1', code: 'PRSPRO01', name: 'Programmering 1', points: 100, category: 'karaktärsämne', subject: 'teknik', emoji: '💻' },
  { id: 'prog2', code: 'PRSPRO02', name: 'Programmering 2', points: 100, category: 'karaktärsämne', subject: 'teknik', emoji: '💻' },
  { id: 'tek1', code: 'TEKTEK01', name: 'Teknik 1', points: 150, category: 'karaktärsämne', subject: 'teknik', emoji: '⚙️' },
  { id: 'daa1', code: 'DAADAA01', name: 'Datorkunskap', points: 100, category: 'karaktärsämne', subject: 'teknik', emoji: '🖥️' },
];

export interface KomvuxSubjectCategory {
  id: string;
  label: string;
  emoji: string;
  subject: KomvuxCourse['subject'] | 'all';
  description: string;
  color: string;
}

export const KOMVUX_SUBJECT_CATEGORIES: KomvuxSubjectCategory[] = [
  { id: 'all', label: 'Alla ämnen', emoji: '📚', subject: 'all', description: 'Alla tillgängliga kurser', color: '#6B7280' },
  { id: 'svenska', label: 'Svenska', emoji: '📝', subject: 'svenska', description: 'Svenska 1–3 och SFI-kurser', color: '#10B981' },
  { id: 'engelska', label: 'Engelska', emoji: '🌍', subject: 'engelska', description: 'Engelska 5–7', color: '#3B82F6' },
  { id: 'matematik', label: 'Matematik', emoji: '🔢', subject: 'matematik', description: 'Matematik 1a–5', color: '#F59E0B' },
  { id: 'naturvetenskap', label: 'Naturvetenskap', emoji: '🔬', subject: 'naturvetenskap', description: 'Biologi, Fysik, Kemi, Naturkunskap', color: '#8B5CF6' },
  { id: 'samhällsvetenskap', label: 'Samhälle', emoji: '🏛️', subject: 'samhällsvetenskap', description: 'Samhällskunskap, Historia, Geografi', color: '#EC4899' },
  { id: 'humaniora', label: 'Humaniora', emoji: '💭', subject: 'humaniora', description: 'Psykologi, Filosofi, Moderna språk', color: '#14B8A6' },
  { id: 'ekonomi', label: 'Ekonomi', emoji: '💼', subject: 'ekonomi', description: 'Företagsekonomi, Juridik', color: '#F97316' },
  { id: 'teknik', label: 'Teknik/IT', emoji: '💻', subject: 'teknik', description: 'Programmering, Teknik', color: '#6366F1' },
];

export function getKomvuxCoursesBySubject(subject: string): KomvuxCourse[] {
  if (subject === 'all') return KOMVUX_COURSES;
  return KOMVUX_COURSES.filter(c => c.subject === subject);
}

export function getKomvuxRecommendedCourses(): KomvuxCourse[] {
  return KOMVUX_COURSES.filter(c =>
    ['sv1', 'en5', 'ma1b', 'hi1b', 'sam1b'].includes(c.id)
  );
}
