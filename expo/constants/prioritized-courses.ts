export type CourseStatus = 'completed' | 'in_progress' | 'queued' | 'future';

export interface PrioritizedCourse {
  priority: number;
  code: string;
  name: string;
  points: number;
  batch: string;
  status: CourseStatus;
}

const statusMap: Record<string, CourseStatus> = {
  '✅ Klar': 'completed',
  '🔄 Batch 1': 'in_progress',
  '⏳ Batch 2': 'queued',
  '⏳ Batch 3': 'queued',
  '⏳ Batch 4': 'queued',
  '⏳ Batch 5': 'queued',
  '⏳ Batch 6': 'queued',
  '⏳ Batch 7': 'queued',
  '⏳ Batch 8': 'queued',
  '⏳ Batch 9': 'queued',
  '⏳ Batch 10': 'queued',
  '⏳ Batch 11': 'queued',
  '⏳ Batch 12': 'queued',
  '⏳ Batch 13': 'queued',
  '⏳ Batch 14': 'queued',
  '⏳ Batch 15': 'queued',
  '⏳ Framtid': 'future'
};

const rawCourses: [
  number,
  string,
  string,
  number,
  string,
  string
][] = [
  [1, 'MATMAT01a', 'Matematik 1a', 100, 'Batch 1: Gymnasiegemensamma Obligatoriska', '✅ Klar'],
  [2, 'MATMAT01b', 'Matematik 1b', 100, 'Batch 1: Gymnasiegemensamma Obligatoriska', '🔄 Batch 1'],
  [3, 'SVESVE01', 'Svenska 1', 100, 'Batch 1: Gymnasiegemensamma Obligatoriska', '🔄 Batch 1'],
  [4, 'ENGENG05', 'Engelska 5', 100, 'Batch 1: Gymnasiegemensamma Obligatoriska', '🔄 Batch 1'],
  [5, 'SVESVE02', 'Svenska 2', 100, 'Batch 2: Gymnasiegemensamma Obligatoriska', '⏳ Batch 2'],
  [6, 'ENGENG06', 'Engelska 6', 100, 'Batch 2: Gymnasiegemensamma Obligatoriska', '⏳ Batch 2'],
  [7, 'MATMAT02b', 'Matematik 2b', 100, 'Batch 2: Gymnasiegemensamma Obligatoriska', '⏳ Batch 2'],
  [8, 'HISHIS01b', 'Historia 1b', 100, 'Batch 3: Gymnasiegemensamma Obligatoriska', '⏳ Batch 3'],
  [9, 'SAMSAM01b', 'Samhällskunskap 1b', 100, 'Batch 3: Gymnasiegemensamma Obligatoriska', '⏳ Batch 3'],
  [10, 'RELREL01', 'Religionskunskap 1', 50, 'Batch 3: Gymnasiegemensamma Obligatoriska', '⏳ Batch 3'],
  [11, 'BIOBIO01', 'Biologi 1', 100, 'Batch 4: Naturvetenskapliga kurser', '⏳ Batch 4'],
  [12, 'FYSFYS01a', 'Fysik 1a', 150, 'Batch 4: Naturvetenskapliga kurser', '⏳ Batch 4'],
  [13, 'KEMKEM01', 'Kemi 1', 100, 'Batch 4: Naturvetenskapliga kurser', '⏳ Batch 4'],
  [14, 'BIOBIO02', 'Biologi 2', 100, 'Batch 5: Naturvetenskapliga kurser', '⏳ Batch 5'],
  [15, 'FYSFYS02', 'Fysik 2', 100, 'Batch 5: Naturvetenskapliga kurser', '⏳ Batch 5'],
  [16, 'KEMKEM02', 'Kemi 2', 100, 'Batch 5: Naturvetenskapliga kurser', '⏳ Batch 5'],
  [17, 'MATMAT03b', 'Matematik 3b', 100, 'Batch 6: Naturvetenskapliga kurser', '⏳ Batch 6'],
  [18, 'MATMAT04', 'Matematik 4', 100, 'Batch 6: Naturvetenskapliga kurser', '⏳ Batch 6'],
  [19, 'MATMAT05', 'Matematik 5', 100, 'Batch 6: Naturvetenskapliga kurser', '⏳ Batch 6'],
  [20, 'PSKPSY01', 'Psykologi 1', 50, 'Batch 7: Samhällsvetenskapliga kurser', '⏳ Batch 7'],
  [21, 'FILFIL01', 'Filosofi 1', 50, 'Batch 7: Samhällsvetenskapliga kurser', '⏳ Batch 7'],
  [22, 'GEOGEO01', 'Geografi 1', 100, 'Batch 7: Samhällsvetenskapliga kurser', '⏳ Batch 7'],
  [23, 'SAMSAM02', 'Samhällskunskap 2', 100, 'Batch 8: Samhällsvetenskapliga kurser', '⏳ Batch 8'],
  [24, 'HISHIS02a', 'Historia 2a', 100, 'Batch 8: Samhällsvetenskapliga kurser', '⏳ Batch 8'],
  [25, 'RELREL02', 'Religionskunskap 2', 50, 'Batch 8: Samhällsvetenskapliga kurser', '⏳ Batch 8'],
  [26, 'SAMSAM03', 'Samhällskunskap 3', 100, 'Batch 9: Samhällsvetenskapliga kurser', '⏳ Batch 9'],
  [27, 'PSKPSY02a', 'Psykologi 2a', 50, 'Batch 9: Samhällsvetenskapliga kurser', '⏳ Batch 9'],
  [28, 'SOCSOC01', 'Sociologi', 100, 'Batch 9: Samhällsvetenskapliga kurser', '⏳ Batch 9'],
  [29, 'FÖRFÖR01', 'Företagsekonomi 1', 100, 'Batch 10: Ekonomiprogrammet', '⏳ Batch 10'],
  [30, 'JURJUR01', 'Juridik 1', 100, 'Batch 10: Ekonomiprogrammet', '⏳ Batch 10'],
  [31, 'ENTENT01', 'Entreprenörskap', 100, 'Batch 10: Ekonomiprogrammet', '⏳ Batch 10'],
  [32, 'FÖRFÖR02', 'Företagsekonomi 2', 100, 'Batch 11: Ekonomiprogrammet', '⏳ Batch 11'],
  [33, 'JURJUR02', 'Affärsjuridik', 100, 'Batch 11: Ekonomiprogrammet', '⏳ Batch 11'],
  [34, 'JURJUR03', 'Rätten och samhället', 100, 'Batch 11: Ekonomiprogrammet', '⏳ Batch 11'],
  [35, 'TEKTEO01', 'Teknik 1', 150, 'Batch 13: Teknikprogrammet', '⏳ Batch 13'],
  [36, 'PRRPRR01', 'Programmering 1', 100, 'Batch 13: Teknikprogrammet', '⏳ Batch 13'],
  [37, 'PRRPRR02', 'Programmering 2', 100, 'Batch 13: Teknikprogrammet', '⏳ Batch 13'],
  [38, 'WEBWEB01', 'Webbutveckling 1', 100, 'Batch 14: Teknikprogrammet', '⏳ Batch 14'],
  [39, 'WEBWEB02', 'Webbutveckling 2', 100, 'Batch 14: Teknikprogrammet', '⏳ Batch 14'],
  [40, 'DAODAT01', 'Dator- och nätverksteknik', 100, 'Batch 14: Teknikprogrammet', '⏳ Batch 14'],
  [41, 'IDRIDR01', 'Idrott och hälsa 1', 100, 'Övriga prioriterade kurser', '⏳ Framtid'],
  [42, 'NAKNAK01a1', 'Naturkunskap 1a1', 50, 'Övriga prioriterade kurser', '⏳ Framtid'],
  [43, 'MODMOD', 'Moderna språk', 100, 'Övriga prioriterade kurser', '⏳ Framtid'],
  [44, 'SVESVE03', 'Svenska 3', 100, 'Övriga prioriterade kurser', '⏳ Framtid']
];

export const prioritizedCourses: PrioritizedCourse[] = rawCourses.map(([priority, code, name, points, batch, status]) => ({
  priority,
  code,
  name,
  points,
  batch,
  status: statusMap[status]
}));

export const batchNames = Array.from(new Set(prioritizedCourses.map(course => course.batch)));

export const getSqlFileName = (courseCode: string) => `sql-templates/course-content-${courseCode}.sql`;

export const getCoursesByBatch = (batch: string) => prioritizedCourses.filter(course => course.batch === batch);
