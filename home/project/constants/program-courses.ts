export interface Course {
  code: string;
  name: string;
  points: number;
  year: 1 | 2 | 3;
  mandatory: boolean;
  category: 'gymnasiegemensam' | 'programgemensam' | 'inriktning' | 'programfördjupning' | 'individuellt val';
}

export interface ProgramCourses {
  program: string;
  courses: Course[];
}

// Gymnasiegemensamma ämnen för alla program
const gymnasiegemensamma: Course[] = [
  // År 1
  { code: 'ENGENG05', name: 'Engelska 5', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'HISHIS01a1', name: 'Historia 1a1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'IDRIDR01', name: 'Idrott och hälsa 1', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'MATMAT01a', name: 'Matematik 1a', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'NAKNAK01a1', name: 'Naturkunskap 1a1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'RELREL01', name: 'Religionskunskap 1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SAMSAM01a1', name: 'Samhällskunskap 1a1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SVESVE01', name: 'Svenska 1', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  
  // År 2
  { code: 'ENGENG06', name: 'Engelska 6', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'HISHIS01a2', name: 'Historia 1a2', points: 50, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'IDRIDR02', name: 'Idrott och hälsa 2', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'NAKNAK01a2', name: 'Naturkunskap 1a2', points: 50, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SAMSAM01a2', name: 'Samhällskunskap 1a2', points: 50, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SVESVE02', name: 'Svenska 2', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  
  // År 3
  { code: 'SVESVE03', name: 'Svenska 3', points: 100, year: 3, mandatory: true, category: 'gymnasiegemensam' },
];

// Högskoleförberedande program kurser
const gymnasiegemensamma_hogskole: Course[] = [
  { code: 'ENGENG05', name: 'Engelska 5', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'ENGENG06', name: 'Engelska 6', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'HISHIS01b', name: 'Historia 1b', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'IDRIDR01', name: 'Idrott och hälsa 1', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'IDRIDR02', name: 'Idrott och hälsa 2', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'MATMAT01b', name: 'Matematik 1b', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'MATMAT02b', name: 'Matematik 2b', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'RELREL01', name: 'Religionskunskap 1', points: 50, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SAMSAM01b', name: 'Samhällskunskap 1b', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SVESVE01', name: 'Svenska 1', points: 100, year: 1, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SVESVE02', name: 'Svenska 2', points: 100, year: 2, mandatory: true, category: 'gymnasiegemensam' },
  { code: 'SVESVE03', name: 'Svenska 3', points: 100, year: 3, mandatory: true, category: 'gymnasiegemensam' },
];

export const programCourses: ProgramCourses[] = [
  // Naturvetenskapsprogrammet
  {
    program: 'Naturvetenskapsprogrammet',
    courses: [
      ...gymnasiegemensamma_hogskole.map(c => ({ ...c, mandatory: true })),
      // Programgemensamma
      { code: 'BIOBIO01', name: 'Biologi 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'FYSFYS01a', name: 'Fysik 1a', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'KEMKEM01', name: 'Kemi 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MATMAT03b', name: 'Matematik 3b', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'MATMAT04', name: 'Matematik 4', points: 100, year: 3, mandatory: true, category: 'programgemensam' },
      { code: 'MODMOD', name: 'Moderna språk', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Naturvetenskap
      { code: 'BIOBIO02', name: 'Biologi 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FYSFYS02', name: 'Fysik 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'KEMKEM02', name: 'Kemi 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'MATMAT05', name: 'Matematik 5', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Naturvetenskap och samhälle
      { code: 'GEOGEO01', name: 'Geografi 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SAMSAM02', name: 'Samhällskunskap 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Teknikprogrammet
  {
    program: 'Teknikprogrammet',
    courses: [
      ...gymnasiegemensamma_hogskole.map(c => ({ ...c, mandatory: true })),
      // Programgemensamma
      { code: 'FYSFYS01a', name: 'Fysik 1a', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'KEMKEM01', name: 'Kemi 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MATMAT03c', name: 'Matematik 3c', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'MATMAT04', name: 'Matematik 4', points: 100, year: 3, mandatory: true, category: 'programgemensam' },
      { code: 'TEKTEO01', name: 'Teknik 1', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Informations- och medieteknik
      { code: 'DAODAT01', name: 'Dator- och nätverksteknik', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PRRPRR01', name: 'Programmering 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PRRPRR02', name: 'Programmering 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'WEBWEB01', name: 'Webbutveckling 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'WEBWEB02', name: 'Webbutveckling 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Produktionsteknik
      { code: 'MEKMEK01', name: 'Mekatronik 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PRDPRO01', name: 'Produktionskunskap 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PRDPRO02', name: 'Produktionsutrustning 1', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Samhällsvetenskapsprogrammet
  {
    program: 'Samhällsvetenskapsprogrammet',
    courses: [
      ...gymnasiegemensamma_hogskole.map(c => ({ ...c, mandatory: true })),
      // Programgemensamma
      { code: 'FILFIL01', name: 'Filosofi 1', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MODMOD', name: 'Moderna språk', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PSKPSY01', name: 'Psykologi 1', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Beteendevetenskap
      { code: 'KOTKMU01', name: 'Kommunikation', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PSKPSY02a', name: 'Psykologi 2a', points: 50, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SOCSOC01', name: 'Sociologi', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'LEALED01', name: 'Ledarskap och organisation', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Samhällsvetenskap
      { code: 'GEOGEO01', name: 'Geografi 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'HISHIS02a', name: 'Historia 2a', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'RELREL02', name: 'Religionskunskap 2', points: 50, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SAMSAM02', name: 'Samhällskunskap 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SAMSAM03', name: 'Samhällskunskap 3', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Ekonomiprogrammet
  {
    program: 'Ekonomiprogrammet',
    courses: [
      ...gymnasiegemensamma_hogskole.map(c => ({ ...c, mandatory: true })),
      // Programgemensamma
      { code: 'FÖRFÖR01', name: 'Företagsekonomi 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'JURJUR01', name: 'Juridik 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MODMOD', name: 'Moderna språk', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PSKPSY01', name: 'Psykologi 1', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Ekonomi
      { code: 'FÖRFÖR02', name: 'Företagsekonomi 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'MATMAT03b', name: 'Matematik 3b', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'ENTENT01', name: 'Entreprenörskap och företagande', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      // Inriktning Juridik
      { code: 'FILFIL01', name: 'Filosofi 1', points: 50, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'JURJUR02', name: 'Affärsjuridik', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'JURJUR03', name: 'Rätten och samhället', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'PSKPSY02a', name: 'Psykologi 2a', points: 50, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Estetiska programmet
  {
    program: 'Estetiska programmet',
    courses: [
      ...gymnasiegemensamma_hogskole.map(c => ({ ...c, mandatory: true })),
      // Programgemensamma
      { code: 'ESTEST01', name: 'Estetisk kommunikation 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'KOTKKO01', name: 'Konstarterna och samhället', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Bild och formgivning
      { code: 'BILBIL01', name: 'Bild', points: 100, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'BILBIL02', name: 'Bild och form 1a', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'BILBIL03', name: 'Bild och form 1b', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FORFOM01', name: 'Form', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Dans
      { code: 'DANDAN01', name: 'Dansgestaltning 1', points: 100, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'DANDAN02', name: 'Dansteori', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'DANDAN03', name: 'Dansteknik 1', points: 100, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'DANDAN04', name: 'Dansteknik 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      // Inriktning Musik
      { code: 'MUSMUS01', name: 'Ensemble med körsång', points: 200, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'MUSMUS02', name: 'Gehörs- och musiklära 1', points: 100, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'MUSMUS03', name: 'Instrument eller sång 1', points: 100, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'MUSMUS04', name: 'Instrument eller sång 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      // Inriktning Teater
      { code: 'TEATEA01', name: 'Scenisk gestaltning 1', points: 100, year: 1, mandatory: false, category: 'inriktning' },
      { code: 'TEATEA02', name: 'Scenisk gestaltning 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TEATEA03', name: 'Teaterteori', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TEATEA04', name: 'Teaterprojekt', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Barn- och fritidsprogrammet
  {
    program: 'Barn- och fritidsprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'HÄLHÄL01', name: 'Hälsopedagogik', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'NAKNAK01b', name: 'Naturkunskap 1b', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'KOTKMU01', name: 'Kommunikation', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PEDPED01', name: 'Lärande och utveckling', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PEDPED02', name: 'Pedagogiskt ledarskap', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'SAMSAM01a2', name: 'Samhällskunskap 1a2', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'SVESVE02', name: 'Svenska 2', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      // Inriktning Pedagogiskt och socialt arbete
      { code: 'PEDBAR01', name: 'Barns lärande och växande', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PEDPED03', name: 'Pedagogiskt arbete', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SOCSOC01', name: 'Socialt arbete', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Fritid och hälsa
      { code: 'FRIAKT01', name: 'Fritids- och friskvårdsverksamheter', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FRIAKT02', name: 'Fritids- och idrottskunskap', points: 100, year: 2, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Bygg- och anläggningsprogrammet
  {
    program: 'Bygg- och anläggningsprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'BYGBYG01', name: 'Bygg och anläggning 1', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'BYGBYG02', name: 'Bygg och anläggning 2', points: 200, year: 2, mandatory: true, category: 'programgemensam' },
      // Inriktning Husbyggnad
      { code: 'HUSHUS01', name: 'Husbyggnadsprocessen', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'HUSHUS02', name: 'Husbyggnad 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'HUSHUS03', name: 'Husbyggnad 2', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'HUSHUS04', name: 'Husbyggnad 3 - ombyggnad', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Anläggningsfordon
      { code: 'ANLANL01', name: 'Anläggningsförare 1', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ANLANL02', name: 'Anläggningsförare 2', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'ANLANL03', name: 'Anläggningsförare 3', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // El- och energiprogrammet
  {
    program: 'El- och energiprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'DAODAT01', name: 'Datorteknik 1a', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'ELEELE01', name: 'Elektromekanik', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'ELEELE02', name: 'Energiteknik 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MEKMEK01', name: 'Mekatronik 1', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      // Inriktning Elteknik
      { code: 'ELEELE03', name: 'Elkraftteknik', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ELEELE04', name: 'Praktisk ellära', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ELEINS01', name: 'Elinstallationer', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ELEINS02', name: 'Kommunikationsnät 1', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Energiteknik
      { code: 'ENRENE01', name: 'Energiteknik 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ENRENE02', name: 'Förnybar energi', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ENRENE03', name: 'Värmelära', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Fordons- och transportprogrammet
  {
    program: 'Fordons- och transportprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'FORFOR01', name: 'Fordons- och transportbranschens villkor och arbetsområden', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'FORFOR02', name: 'Fordonsteknik - introduktion', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Personbil
      { code: 'PERPER01', name: 'Personbilar - verkstad och elteknik', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PERPER02', name: 'Personbilar - basteknik', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PERPER03', name: 'Personbilar - motor och kraftöverföring', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PERPER04', name: 'Personbilar - chassi och bromsar', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'PERPER05', name: 'Personbilar - el- och hybridfordon', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Transport
      { code: 'TRATRA01', name: 'Yrkestrafik 1a', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TRATRA02', name: 'Yrkestrafik 1b', points: 300, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'TRATRA03', name: 'Godstransporter', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Handels- och administrationsprogrammet
  {
    program: 'Handels- och administrationsprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'FÖRFÖR01', name: 'Företagsekonomi 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'HANHND01', name: 'Handel och hållbar utveckling', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'INFINF01', name: 'Information och kommunikation 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'ENTENT01', name: 'Entreprenörskap', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Handel och service
      { code: 'HANHND02', name: 'Handel - specialisering', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'HANHND03', name: 'Näthandel', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PERPER01', name: 'Personlig försäljning 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PERPER02', name: 'Personlig försäljning 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'PERPER03', name: 'Personlig försäljning 3', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'PRAPRA01', name: 'Praktisk marknadsföring 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      // Inriktning Administrativ service
      { code: 'ADMADM01', name: 'Administration 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'ADMADM02', name: 'Administration 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'INFINF02', name: 'Information och kommunikation 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'INFINF03', name: 'Intern och extern kommunikation', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'RECRED01', name: 'Reception 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Hantverksprogrammet
  {
    program: 'Hantverksprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'HANHVK01', name: 'Hantverk - introduktion', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'ENTENT01', name: 'Entreprenörskap', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'HANHVK02', name: 'Tradition och utveckling', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Frisör
      { code: 'FRIFRI01', name: 'Frisör 1', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FRIFRI02', name: 'Frisör 2', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FRIFRI03', name: 'Frisör 3', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'FRIFRI04', name: 'Frisör 4', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'FRIFRI05', name: 'Frisör 5', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Textil design
      { code: 'TEXTEX01', name: 'Textil design 1', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TEXTEX02', name: 'Textil design 2', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TEXTEX03', name: 'Textil design 3', points: 200, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Hotell- och turismprogrammet
  {
    program: 'Hotell- och turismprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'ENGENG06', name: 'Engelska 6', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'ENTENT01', name: 'Entreprenörskap', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'KOTKMU01', name: 'Konferens och evenemang', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'SERSER01', name: 'Service och bemötande 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'HÄLHÄL01', name: 'Hållbar turism', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Hotell och konferens
      { code: 'HOTHOT01', name: 'Hotell 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'HOTHOT02', name: 'Hotell 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'KONKON01', name: 'Konferens 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'RECRED01', name: 'Reception 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'RECRED02', name: 'Reception 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'FRUFRU01', name: 'Frukost och bufféservering', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Turism och resor
      { code: 'TURTUR01', name: 'Aktiviteter och upplevelser', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TURTUR02', name: 'Besöksnäringen', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TURTUR03', name: 'Destinationskunskap', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TURTUR04', name: 'Resmål och resvägar', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'TURTUR05', name: 'Reseproduktion och försäljning', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'GUIGUI01', name: 'Guide och reseledare', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Industritekniska programmet
  {
    program: 'Industritekniska programmet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'INDINP01', name: 'Industritekniska processer 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PEDPED01', name: 'Människan i industrin 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PRDPRO01', name: 'Produktionskunskap 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PRDPRO02', name: 'Produktionsutrustning 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Produkt och maskinteknik
      { code: 'DATCAD01', name: 'Datorstyrd produktion 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'DATCAD02', name: 'Datorstyrd produktion 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'PRDPRO03', name: 'Produktionsutrustning 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PRDPRO04', name: 'Produktutveckling 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SVESVE01', name: 'Svets grund', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      // Inriktning Processteknik
      { code: 'PROPRO01', name: 'Processteknik 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PROPRO02', name: 'Processteknik 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'PROPRO03', name: 'Processteknik 3', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'PROPRO04', name: 'Processteknik 4', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Naturbruksprogrammet
  {
    program: 'Naturbruksprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'BIOBIO01', name: 'Biologi 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'ENTENT01', name: 'Entreprenörskap', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'NATNBR01', name: 'Naturbruk', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Djurvård
      { code: 'DJUDJR01', name: 'Djuren i naturbruket', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'DJUDJR02', name: 'Djurvård 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'DJUDJR03', name: 'Djurvård 2', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'DJUDJR04', name: 'Djurens biologi', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'DJUDJR05', name: 'Sällskapsdjur 1', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'DJUDJR06', name: 'Sällskapsdjur 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Lantbruk
      { code: 'LANLNT01', name: 'Lantbruksdjur 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'LANLNT02', name: 'Lantbruksmaskiner 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'LANLNT03', name: 'Marken och växternas biologi', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'LANLNT04', name: 'Växtodling 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'LANLNT05', name: 'Växtodling 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'FÖRFÖR01', name: 'Företagsekonomi 1', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Skog
      { code: 'SKOSKO01', name: 'Mångbruk av skog', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SKOSKO02', name: 'Skogsmaskiner', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SKOSKO03', name: 'Skogsskötsel 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SKOSKO04', name: 'Skogsskötsel 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'SKOSKO05', name: 'Virkeslära', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'MOTMOT01', name: 'Motor- och röjmotorsåg', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Trädgård
      { code: 'TRÄTRD01', name: 'Marken och växternas biologi', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TRÄTRD02', name: 'Trädgårdsanläggning 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TRÄTRD03', name: 'Trädgårdsodling', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TRÄTRD04', name: 'Trädgårdsmaskiner', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'TRÄTRD05', name: 'Växtkunskap 1', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'TRÄTRD06', name: 'Växthusodling', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Restaurang- och livsmedelsprogrammet
  {
    program: 'Restaurang- och livsmedelsprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'HYGHYG01', name: 'Hygienkunskap', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'LIVLIV01', name: 'Livsmedels- och näringskunskap 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'SERSER01', name: 'Service och bemötande 1', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'BRABRA01', name: 'Branschkunskap inom restaurang och livsmedel', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Kök och servering
      { code: 'MATMAT01', name: 'Matlagning 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'MATMAT02', name: 'Matlagning 2', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'MATMAT03', name: 'Matlagning 3', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'MATMAT04', name: 'Matlagning 4', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'SERSER02', name: 'Servering 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'SERSER03', name: 'Servering 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Bageri och konditori
      { code: 'BAGBAG01', name: 'Bageri 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'BAGBAG02', name: 'Bageri 2', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'BAGBAG03', name: 'Bageri 3', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'KONKON01', name: 'Konditori 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'KONKON02', name: 'Konditori 2', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'KONKON03', name: 'Konditori 3', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // VVS- och fastighetsprogrammet
  {
    program: 'VVS- och fastighetsprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'ELEELE01', name: 'Elkraftteknik', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'SYTSYS01', name: 'Systemkunskap', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'VÄRVER01', name: 'Värmelära', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'VVSVVS01', name: 'Verktygs- och materialhantering', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning VVS
      { code: 'VVSVVS02', name: 'Sanitetsteknik 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'VVSVVS03', name: 'Värmeteknik 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'VVSVVS04', name: 'VVS svets och lödning rör', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'VVSVVS05', name: 'VVS-teknik', points: 200, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'VVSVVS06', name: 'Entreprenadteknik', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'VVSVVS07', name: 'Sanitetsteknik 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Fastighet
      { code: 'FASFAS01', name: 'Fastighetsförvaltning', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FASFAS02', name: 'Fastighetsservice - byggnader', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FASFAS03', name: 'Fastighetsservice - VVS', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'FASFAS04', name: 'Fastighetstekniska system', points: 200, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'FASFAS05', name: 'Informationsteknik i fastigheter', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // Vård- och omsorgsprogrammet
  {
    program: 'Vård- och omsorgsprogrammet',
    courses: [
      ...gymnasiegemensamma,
      // Programgemensamma
      { code: 'HÄLHÄL01', name: 'Hälsopedagogik', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MEDMED01', name: 'Medicin 1', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'ETIETK01', name: 'Etik och människans livsvillkor', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PSKPSY01', name: 'Psykologi 1', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'PSKPSY02a', name: 'Psykiatri 1', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'SAMSAM01a2', name: 'Samhällskunskap 1a2', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'SPEPED01', name: 'Specialpedagogik 1', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'SVESVE02', name: 'Svenska 2', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'GERGEA01', name: 'Gerontologi och geriatrik', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'HÄLHSO01', name: 'Hälso- och sjukvård 1', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'HÄLHSO02', name: 'Hälso- och sjukvård 2', points: 100, year: 3, mandatory: true, category: 'programgemensam' },
      { code: 'OMVOMV01', name: 'Omvårdnad 1', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'OMVOMV02', name: 'Omvårdnad 2', points: 100, year: 3, mandatory: true, category: 'programgemensam' },
      { code: 'SOCSOC01', name: 'Social omsorg 1', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'SOCSOC02', name: 'Social omsorg 2', points: 100, year: 3, mandatory: true, category: 'programgemensam' },
    ]
  },
  
  // Humanistiska programmet
  {
    program: 'Humanistiska programmet',
    courses: [
      ...gymnasiegemensamma_hogskole.map(c => ({ ...c, mandatory: true })),
      // Programgemensamma
      { code: 'FILFIL01', name: 'Filosofi 1', points: 50, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'HISHIS02b', name: 'Historia 2b - kultur', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
      { code: 'KULKUL01', name: 'Kultur- och idéhistoria', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'MODMOD', name: 'Moderna språk', points: 200, year: 1, mandatory: true, category: 'programgemensam' },
      // Inriktning Kultur
      { code: 'ESTEST01', name: 'Estetisk kommunikation', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'KULKUL02', name: 'Kulturliv', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'KULKUL03', name: 'Samtida kulturuttryck', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'SKASKAP01', name: 'Skapande verksamhet', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      // Inriktning Språk
      { code: 'LATLAT01', name: 'Latin - språk och kultur 1', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'LATLAT02', name: 'Latin - språk och kultur 2', points: 100, year: 3, mandatory: false, category: 'inriktning' },
      { code: 'MODMOD03', name: 'Moderna språk 3', points: 100, year: 2, mandatory: false, category: 'inriktning' },
      { code: 'MODMOD04', name: 'Moderna språk 4', points: 100, year: 3, mandatory: false, category: 'inriktning' },
    ]
  },
  
  // International Baccalaureate
  {
    program: 'International Baccalaureate',
    courses: [
      // Group 1: Studies in Language and Literature
      { code: 'IBSWE01', name: 'Swedish A: Literature HL', points: 240, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'IBENG01', name: 'English A: Language and Literature SL', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      
      // Group 2: Language Acquisition
      { code: 'IBLAN01', name: 'Language B SL/HL', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      
      // Group 3: Individuals and Societies
      { code: 'IBHIS01', name: 'History HL', points: 240, year: 1, mandatory: false, category: 'programgemensam' },
      { code: 'IBECO01', name: 'Economics SL', points: 150, year: 1, mandatory: false, category: 'programgemensam' },
      { code: 'IBPSY01', name: 'Psychology SL', points: 150, year: 1, mandatory: false, category: 'programgemensam' },
      
      // Group 4: Sciences
      { code: 'IBBIO01', name: 'Biology HL', points: 240, year: 1, mandatory: false, category: 'programgemensam' },
      { code: 'IBCHE01', name: 'Chemistry SL', points: 150, year: 1, mandatory: false, category: 'programgemensam' },
      { code: 'IBPHY01', name: 'Physics SL', points: 150, year: 1, mandatory: false, category: 'programgemensam' },
      
      // Group 5: Mathematics
      { code: 'IBMAT01', name: 'Mathematics: Analysis and Approaches SL', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      
      // Group 6: The Arts
      { code: 'IBVIS01', name: 'Visual Arts SL', points: 150, year: 1, mandatory: false, category: 'programgemensam' },
      { code: 'IBMUS01', name: 'Music SL', points: 150, year: 1, mandatory: false, category: 'programgemensam' },
      
      // Core Components
      { code: 'IBTOK01', name: 'Theory of Knowledge', points: 100, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'IBCAS01', name: 'Creativity, Activity, Service', points: 150, year: 1, mandatory: true, category: 'programgemensam' },
      { code: 'IBEE01', name: 'Extended Essay', points: 100, year: 2, mandatory: true, category: 'programgemensam' },
    ]
  },
];

// Helper function to get courses for a specific program and year
export function getCoursesForProgramAndYear(program: string, year: 1 | 2 | 3): Course[] {
  const programData = programCourses.find(p => p.program === program);
  if (!programData) return [];
  
  return programData.courses.filter(course => course.year === year);
}

// Helper function to get mandatory courses for a program
export function getMandatoryCourses(program: string): Course[] {
  const programData = programCourses.find(p => p.program === program);
  if (!programData) return [];
  
  return programData.courses.filter(course => course.mandatory);
}

// Helper function to get elective courses for a program
export function getElectiveCourses(program: string): Course[] {
  const programData = programCourses.find(p => p.program === program);
  if (!programData) return [];
  
  return programData.courses.filter(course => !course.mandatory);
}