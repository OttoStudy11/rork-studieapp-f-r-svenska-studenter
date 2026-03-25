import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prioritizedCourses, PrioritizedCourse, getSqlFileName } from '../constants/prioritized-courses';

const rootDir = process.cwd();

const subjectMap: Record<string, string> = {
  MAT: 'Matematik',
  SVE: 'Svenska',
  ENG: 'Engelska',
  HIS: 'Historia',
  SAM: 'Samhällskunskap',
  REL: 'Religionskunskap',
  BIO: 'Biologi',
  FYS: 'Fysik',
  KEM: 'Kemi',
  PSK: 'Psykologi',
  FIL: 'Filosofi',
  GEO: 'Geografi',
  FÖR: 'Företagsekonomi',
  JUR: 'Juridik',
  ENT: 'Entreprenörskap',
  TEK: 'Teknik',
  PRR: 'Programmering',
  WEB: 'Webbutveckling',
  DAO: 'Datorteknik',
  IDR: 'Idrott',
  NAK: 'Naturkunskap',
  MOD: 'Moderna språk'
};

const moduleThemes = ['Grundmodul', 'Strategier och metoder', 'Tillämpning i vardagen', 'Övningar och träning', 'Projekt och reflektion', 'Provförberedelser'] as const;
const lessonFocus = ['Teori', 'Exempel', 'Övningar', 'Reflektion'] as const;
const lessonTypes: ('theory' | 'example' | 'exercise' | 'reflection')[] = ['theory', 'example', 'exercise', 'reflection'];

const escapeSql = (value: string) => value.replace(/'/g, "''");

const toJsonb = (values: string[]) => `'${escapeSql(JSON.stringify(values))}'::jsonb`;

const inferSubject = (code: string) => {
  const match = Object.entries(subjectMap).find(([prefix]) => code.startsWith(prefix));
  return match ? match[1] : 'Allmänna studier';
};

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const formatUuid = (seed: string) => {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};

const getModuleCount = (points: number) => {
  if (points >= 150) return 6;
  if (points >= 100) return 5;
  return 4;
};

const buildCourseInsert = (course: PrioritizedCourse) => {
  const subject = inferSubject(course.code);
  const description = `${course.name} fokuserar på att bygga en stabil grund, fördjupa förståelsen och koppla teori till praktiska exempel.`;
  const resources = ['Kursplan', 'Övningar', 'Videoresurser', 'Studiehandledning'];
  const tips = ['Studera i korta block med tydliga mål', 'Återkoppla teorin till egna exempel', 'Utvärdera din progression varje vecka'];
  return `INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  '${course.code}',
  '${course.code}',
  '${escapeSql(course.name)}',
  '${escapeSql(description)}',
  '${subject}',
  'gymnasie',
  ${course.points},
  ${toJsonb(resources)},
  ${toJsonb(tips)},
  '[]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points = EXCLUDED.points;`;
};

interface GeneratedLesson {
  id: string;
  moduleId: string;
  orderIndex: number;
  title: string;
  description: string;
  content: string;
  lessonType: 'theory' | 'example' | 'exercise' | 'reflection';
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium';
  objectives: string[];
}

interface GeneratedModule {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  estimatedHours: number;
  lessons: GeneratedLesson[];
}

const buildLessonContent = (courseName: string, moduleTitle: string, focus: string) => `## ${focus} ${courseName}

### Koppling till ${moduleTitle}
- Definiera huvudbegreppen
- Visa hur de används i riktiga situationer
- Lägg till korta övningar som bryter ned momenten

### Rekommenderad studieplan
1. Läs igenom teorin
2. Arbeta igenom exemplen
3. Lös övningar och kontrollera svar
4. Sammanfatta vad du lärt dig i egna ord`;

const buildModules = (course: PrioritizedCourse): GeneratedModule[] => {
  const moduleCount = getModuleCount(course.points);
  const estimatedHours = [6, 8, 9, 7, 6, 5];
  return Array.from({ length: moduleCount }).map((_, moduleIndex) => {
    const moduleTitle = `${course.name} – ${moduleThemes[moduleIndex] ?? moduleThemes[moduleThemes.length - 1]}`;
    const moduleDescription = `Delmoment ${moduleIndex + 1} i ${course.name} med fokus på ${moduleThemes[moduleIndex].toLowerCase()}.`;
    const moduleId = formatUuid(`${course.code}-module-${moduleIndex + 1}`);
    const lessons = Array.from({ length: lessonFocus.length }).map((__, lessonIndex) => {
      const lessonId = formatUuid(`${course.code}-module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`);
      const focus = lessonFocus[lessonIndex];
      const estimatedMinutes = 35 + lessonIndex * 10;
      const difficulty: 'easy' | 'medium' = lessonIndex <= 1 ? 'easy' : 'medium';
      const lessonTitle = `${focus}: ${course.name}`;
      const lessonDescription = `${focus} för att förstärka ${course.name.toLowerCase()} i ${moduleThemes[moduleIndex].toLowerCase()}.`;
      const objectives = [
        `${focus} av kärnkoncept`,
        `Koppla ${course.name.toLowerCase()} till vardagen`,
        `Förbered dig för uppgifter i ${moduleThemes[moduleIndex].toLowerCase()}`
      ];
      return {
        id: lessonId,
        moduleId,
        orderIndex: lessonIndex + 1,
        title: lessonTitle,
        description: lessonDescription,
        content: buildLessonContent(course.name, moduleTitle, focus),
        lessonType: lessonTypes[lessonIndex],
        estimatedMinutes,
        difficulty,
        objectives
      };
    });
    return {
      id: moduleId,
      orderIndex: moduleIndex + 1,
      title: moduleTitle,
      description: moduleDescription,
      estimatedHours: estimatedHours[moduleIndex] ?? 5,
      lessons
    };
  });
};

const buildModuleInsert = (course: PrioritizedCourse, module: GeneratedModule) => `INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  '${module.id}'::uuid,
  '${course.code}',
  '${escapeSql(module.title)}',
  '${escapeSql(module.description)}',
  ${module.orderIndex},
  ${module.estimatedHours},
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;`;

const buildLessonInsert = (course: PrioritizedCourse, lesson: GeneratedLesson) => `INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  '${lesson.id}'::uuid,
  '${lesson.moduleId}'::uuid,
  '${course.code}',
  '${escapeSql(lesson.title)}',
  '${escapeSql(lesson.description)}',
  '${escapeSql(lesson.content)}',
  '${lesson.lessonType}',
  ${lesson.orderIndex},
  ${lesson.estimatedMinutes},
  '${lesson.difficulty}',
  ARRAY[${lesson.objectives.map(obj => `'${escapeSql(obj)}'`).join(', ')}],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;`;

const generateSqlForCourse = (course: PrioritizedCourse) => {
  const modules = buildModules(course);
  const segments = [
    'BEGIN;',
    buildCourseInsert(course),
    ...modules.map(module => buildModuleInsert(course, module)),
    ...modules.flatMap(module => module.lessons.map(lesson => buildLessonInsert(course, lesson))),
    'COMMIT;'
  ];
  return segments.join('\n\n');
};

const run = () => {
  prioritizedCourses.forEach(course => {
    const sql = generateSqlForCourse(course);
    const relativePath = getSqlFileName(course.code);
    const absolutePath = path.join(rootDir, relativePath);
    ensureDir(path.dirname(absolutePath));
    fs.writeFileSync(absolutePath, sql, 'utf8');
    console.log(`✅ Generated ${relativePath}`);
  });
};

run();
