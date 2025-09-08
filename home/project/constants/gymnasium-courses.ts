// Kurser kopplade till gymnasieprogram och årskurser
export interface Course {
  name: string;
  code: string;
  points: number;
  year: 1 | 2 | 3;
  mandatory: boolean;
  category: 'gymnasiegemensam' | 'programgemensam' | 'inriktning' | 'programfördjupning' | 'individuellt val';
}

// Gymnasiegemensamma ämnen (alla program)
const gymnasiegemensamma: Course[] = [
  // År 1
  { name: 'Svenska 1', code: 'SVESVE01', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Engelska 5', code: 'ENGENG05', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Matematik 1a', code: 'MATMAT01a', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Historia 1a1', code: 'HISHIS01a1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Samhällskunskap 1a1', code: 'SAMSAM01a1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Religionskunskap 1', code: 'RELREL01', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Naturkunskap 1a1', code: 'NAKNAK01a1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Idrott och hälsa 1', code: 'IDRIDR01', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  
  // År 2
  { name: 'Svenska 2', code: 'SVESVE02', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Engelska 6', code: 'ENGENG06', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Historia 1a2', code: 'HISHIS01a2', points: 50, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { name: 'Samhällskunskap 1a2', code: 'SAMSAM01a2', points: 50, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  
  // År 3
  { name: 'Svenska 3', code: 'SVESVE03', points: 100, year: 3, mandatory: true, category: 'gymnasiegemensam' },
];

// Programspecifika kurser
export const programCourses: { [key: string]: Course[] } = {
  'Naturvetenskapsprogrammet': [
    ...gymnasiegemensamma,
    // År 1 - Programgemensamma
    { name: 'Matematik 2c', code: 'MATMAT02c', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Biologi 1', code: 'BIOBIO01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Fysik 1a', code: 'FYSFYS01a', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Kemi 1', code: 'KEMKEM01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Moderna språk', code: 'MODXXX01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2 - Programgemensamma och inriktning
    { name: 'Matematik 3c', code: 'MATMAT03c', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Matematik 4', code: 'MATMAT04', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Biologi 2', code: 'BIOBIO02', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Fysik 2', code: 'FYSFYS02', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Kemi 2', code: 'KEMKEM02', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    
    // År 3 - Fördjupning och individuellt val
    { name: 'Matematik 5', code: 'MATMAT05', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Fysik 3', code: 'FYSFYS03', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Programmering 1', code: 'PRRPRR01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
    { name: 'Filosofi 1', code: 'FIOFIO01', points: 50, year: 3, mandatory: false, category: 'individuellt val' },
  ],
  
  'Teknikprogrammet': [
    ...gymnasiegemensamma,
    // År 1 - Programgemensamma
    { name: 'Matematik 2c', code: 'MATMAT02c', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Fysik 1a', code: 'FYSFYS01a', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Kemi 1', code: 'KEMKEM01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Teknik 1', code: 'TEKTEK01', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2 - Programgemensamma och inriktning
    { name: 'Matematik 3c', code: 'MATMAT03c', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Teknik 2', code: 'TEKTEK02', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Programmering 1', code: 'PRRPRR01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Webbutveckling 1', code: 'WEUWEB01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Dator- och nätverksteknik', code: 'DATDAT01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    
    // År 3 - Fördjupning
    { name: 'Matematik 4', code: 'MATMAT04', points: 100, year: 3, mandatory: true, category: 'programfördjupning' },
    { name: 'Fysik 2', code: 'FYSFYS02', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Programmering 2', code: 'PRRPRR02', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Tillämpad programmering', code: 'TILTIL01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
  ],
  
  'Samhällsvetenskapsprogrammet': [
    ...gymnasiegemensamma,
    // År 1 - Programgemensamma
    { name: 'Matematik 1b', code: 'MATMAT01b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Naturkunskap 1b', code: 'NAKNAK01b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Samhällskunskap 1b', code: 'SAMSAM01b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Moderna språk', code: 'MODXXX01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Psykologi 1', code: 'PSKPSY01', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2 - Programgemensamma och inriktning
    { name: 'Matematik 2b', code: 'MATMAT02b', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Samhällskunskap 2', code: 'SAMSAM02', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Historia 2a', code: 'HISHIS02a', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Religionskunskap 2', code: 'RELREL02', points: 50, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Filosofi 1', code: 'FIOFIO01', points: 50, year: 2, mandatory: true, category: 'inriktning' },
    
    // År 3 - Fördjupning
    { name: 'Samhällskunskap 3', code: 'SAMSAM03', points: 100, year: 3, mandatory: true, category: 'programfördjupning' },
    { name: 'Psykologi 2a', code: 'PSKPSY02a', points: 50, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Internationella relationer', code: 'INTINT01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
    { name: 'Entreprenörskap', code: 'ENTENT01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
  ],
  
  'Ekonomiprogrammet': [
    ...gymnasiegemensamma,
    // År 1 - Programgemensamma
    { name: 'Matematik 1b', code: 'MATMAT01b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Naturkunskap 1b', code: 'NAKNAK01b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Samhällskunskap 1b', code: 'SAMSAM01b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Företagsekonomi 1', code: 'FÖRFÖR01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Privatjuridik', code: 'JURPRI01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Moderna språk', code: 'MODXXX01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2 - Programgemensamma och inriktning
    { name: 'Matematik 2b', code: 'MATMAT02b', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Företagsekonomi 2', code: 'FÖRFÖR02', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    { name: 'Entreprenörskap och företagande', code: 'ENTENT01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Marknadsföring', code: 'MARMAR01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Redovisning 1', code: 'REDRED01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    
    // År 3 - Fördjupning
    { name: 'Matematik 3b', code: 'MATMAT03b', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Företagsekonomi - specialisering', code: 'FÖRSPE01', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Ledarskap och organisation', code: 'LEDLED01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
    { name: 'Internationell ekonomi', code: 'INTEKO01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
  ],
  
  'Estetiska programmet': [
    ...gymnasiegemensamma,
    // År 1 - Programgemensamma
    { name: 'Estetisk kommunikation 1', code: 'ESTEST01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Konstarterna och samhället', code: 'KONKON01', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    
    // Musik-inriktning
    { name: 'Ensemble med körsång', code: 'MUSENS01', points: 200, year: 1, mandatory: true, category: 'inriktning' },
    { name: 'Gehörs- och musiklära 1', code: 'MUSGEH01', points: 100, year: 1, mandatory: true, category: 'inriktning' },
    { name: 'Instrument eller sång 1', code: 'MUSINS01', points: 100, year: 1, mandatory: true, category: 'inriktning' },
    
    // År 2
    { name: 'Ensemble 2', code: 'MUSENS02', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Gehörs- och musiklära 2', code: 'MUSGEH02', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Instrument eller sång 2', code: 'MUSINS02', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    
    // År 3
    { name: 'Musikproduktion', code: 'MUSPRO01', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Scenisk gestaltning', code: 'SCNSCE01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
  ],
  
  'Humanistiska programmet': [
    ...gymnasiegemensamma,
    // År 1 - Programgemensamma
    { name: 'Filosofi 1', code: 'FIOFIO01', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Moderna språk', code: 'MODXXX01', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Människans språk 1', code: 'MÄSMÄS01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2 - Språkinriktning
    { name: 'Moderna språk 3', code: 'MODXXX03', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Moderna språk 4', code: 'MODXXX04', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Latin - språk och kultur 1', code: 'LATLAT01', points: 100, year: 2, mandatory: false, category: 'inriktning' },
    
    // År 3
    { name: 'Moderna språk 5', code: 'MODXXX05', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
    { name: 'Retorik', code: 'RETRET01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
    { name: 'Skrivande', code: 'SVESKR01', points: 100, year: 3, mandatory: false, category: 'individuellt val' },
  ],
  
  // Yrkesprogram
  'Barn- och fritidsprogrammet': [
    ...gymnasiegemensamma,
    // År 1
    { name: 'Hälsopedagogik', code: 'HÄLHÄL01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Naturkunskap 1a2', code: 'NAKNAK01a2', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Kommunikation', code: 'KOMKOM01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Lärande och utveckling', code: 'LÄRLÄR01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Människors miljöer', code: 'MÄNMÄN01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Pedagogiskt ledarskap', code: 'PEDPED01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Samhällskunskap 1a2', code: 'SAMSAM01a2', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2-3 Inriktning Pedagogiskt arbete
    { name: 'Barns lärande och växande', code: 'BARBAR01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Pedagogiskt arbete', code: 'PEDPED02', points: 200, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Skapande verksamhet', code: 'SKASKA01', points: 100, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Specialpedagogik 1', code: 'SPCSPC01', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
  ],
  
  'Vård- och omsorgsprogrammet': [
    ...gymnasiegemensamma,
    // År 1
    { name: 'Hälsopedagogik', code: 'HÄLHÄL01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Medicin 1', code: 'MEDMED01', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Etik och människans livsvillkor', code: 'ETIETI01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Psykiatri 1', code: 'PSYPSY01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Psykologi 1', code: 'PSKPSY01', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Samhällskunskap 1a2', code: 'SAMSAM01a2', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
    { name: 'Specialpedagogik 1', code: 'SPCSPC01', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
    
    // År 2-3
    { name: 'Vård- och omsorgsarbete 1', code: 'VÅRVÅR01', points: 200, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Vård- och omsorgsarbete 2', code: 'VÅRVÅR02', points: 150, year: 2, mandatory: true, category: 'inriktning' },
    { name: 'Medicin 2', code: 'MEDMED02', points: 100, year: 3, mandatory: false, category: 'programfördjupning' },
  ],
  
  // Default för program som inte har specifik mappning
  'default': gymnasiegemensamma,
};

// Helper function för att hämta kurser för ett program och årskurs
export function getCoursesForProgramAndYear(program: string, year: 1 | 2 | 3): Course[] {
  const allCourses = programCourses[program] || programCourses['default'];
  return allCourses.filter(course => course.year === year);
}

// Helper function för att hämta alla kurser för ett program
export function getAllCoursesForProgram(program: string): Course[] {
  return programCourses[program] || programCourses['default'];
}

// Helper function för att hämta obligatoriska kurser
export function getMandatoryCoursesForProgram(program: string, year?: 1 | 2 | 3): Course[] {
  const courses = year 
    ? getCoursesForProgramAndYear(program, year)
    : getAllCoursesForProgram(program);
  return courses.filter(course => course.mandatory);
}

// Helper function för att hämta valbara kurser
export function getElectiveCoursesForProgram(program: string, year?: 1 | 2 | 3): Course[] {
  const courses = year 
    ? getCoursesForProgramAndYear(program, year)
    : getAllCoursesForProgram(program);
  return courses.filter(course => !course.mandatory);
}