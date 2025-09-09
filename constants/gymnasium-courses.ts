import { GYMNASIUM_PROGRAM_MAPPING, GYMNASIUM_PROGRAMS, type GymnasiumProgram } from './gymnasium-programs';
import { programCourses } from '../home/project/constants/program-courses';
import type { Gymnasium } from './gymnasiums';

export type { Course } from '../home/project/constants/program-courses';

export interface GymnasiumCourse {
  id: string;
  code: string;
  name: string;
  points: number;
  year: 1 | 2 | 3;
  mandatory: boolean;
  category: 'gymnasiegemensam' | 'programgemensam' | 'inriktning' | 'programfördjupning' | 'individuellt val';
  program: string;
}

// Map program names to match our course data
const PROGRAM_NAME_MAPPING: Record<string, string> = {
  'na': 'Naturvetenskapsprogrammet',
  'te': 'Teknikprogrammet',
  'sa': 'Samhällsvetenskapsprogrammet',
  'ek': 'Ekonomiprogrammet',
  'es': 'Estetiska programmet',
  'hu': 'Humanistiska programmet',
  'ib': 'International Baccalaureate',
  'ba': 'Bygg- och anläggningsprogrammet',
  'bf': 'Barn- och fritidsprogrammet',
  'ee': 'El- och energiprogrammet',
  'ft': 'Fordons- och transportprogrammet',
  'ha': 'Handels- och administrationsprogrammet',
  'hv': 'Hantverksprogrammet',
  'ht': 'Hotell- och turismprogrammet',
  'in': 'Industritekniska programmet',
  'nb': 'Naturbruksprogrammet',
  'rl': 'Restaurang- och livsmedelsprogrammet',
  'vf': 'VVS- och fastighetsprogrammet',
  'vo': 'Vård- och omsorgsprogrammet',
  'fs': 'Flygteknikprogrammet',
  'sx': 'Sjöfartsprogrammet',
  'mp': 'Estetiska programmet', // Music is part of Estetiska
  'id': 'Estetiska programmet', // Sports is often part of Estetiska or separate
};

export function getGymnasiumPrograms(gymnasiumId: string): GymnasiumProgram[] {
  const programIds = GYMNASIUM_PROGRAM_MAPPING[gymnasiumId] || GYMNASIUM_PROGRAM_MAPPING.default;
  return programIds.map(id => GYMNASIUM_PROGRAMS.find(p => p.id === id)!).filter(Boolean);
}

export function getGymnasiumCourses(gymnasium: Gymnasium, selectedProgram?: GymnasiumProgram, selectedGrade?: '1' | '2' | '3'): GymnasiumCourse[] {
  const availablePrograms = getGymnasiumPrograms(gymnasium.id);
  const courses: GymnasiumCourse[] = [];
  
  // If a specific program is selected, only show courses for that program
  const programsToProcess = selectedProgram ? [selectedProgram] : availablePrograms;
  
  programsToProcess.forEach(program => {
    const programName = PROGRAM_NAME_MAPPING[program.id];
    if (!programName) return;
    
    const programCourseData = programCourses.find(p => p.program === programName);
    if (!programCourseData) return;
    
    programCourseData.courses.forEach(course => {
      // If a specific grade is selected, only show courses for that grade
      if (selectedGrade && course.year !== parseInt(selectedGrade)) return;
      
      courses.push({
        id: `${gymnasium.id}-${program.id}-${course.code}`,
        code: course.code,
        name: course.name,
        points: course.points,
        year: course.year,
        mandatory: course.mandatory,
        category: course.category,
        program: program.name
      });
    });
  });
  
  // Sort courses by year, then by mandatory status, then by name
  return courses.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.mandatory !== b.mandatory) return a.mandatory ? -1 : 1;
    return a.name.localeCompare(b.name, 'sv');
  });
}

export function getGymnasiumCoursesByYear(gymnasium: Gymnasium, year: 1 | 2 | 3, selectedProgram?: GymnasiumProgram): GymnasiumCourse[] {
  return getGymnasiumCourses(gymnasium, selectedProgram, year.toString() as '1' | '2' | '3');
}

export function getMandatoryGymnasiumCourses(gymnasium: Gymnasium, selectedProgram?: GymnasiumProgram): GymnasiumCourse[] {
  return getGymnasiumCourses(gymnasium, selectedProgram).filter(course => course.mandatory);
}

export function getElectiveGymnasiumCourses(gymnasium: Gymnasium, selectedProgram?: GymnasiumProgram): GymnasiumCourse[] {
  return getGymnasiumCourses(gymnasium, selectedProgram).filter(course => !course.mandatory);
}

// Helper function to convert selected course IDs to actual course data for database storage
export function getSelectedCoursesData(selectedCourseIds: string[], gymnasium: Gymnasium, selectedProgram?: GymnasiumProgram): Array<{
  title: string;
  description: string;
  subject: string;
  level: string;
  resources: string[];
  tips: string[];
  related_courses: string[];
}> {
  const allCourses = getGymnasiumCourses(gymnasium, selectedProgram);
  
  return selectedCourseIds
    .map(courseId => allCourses.find(course => course.id === courseId))
    .filter(Boolean)
    .map(course => ({
      title: course!.name,
      description: `${course!.name} - ${course!.points} poäng`,
      subject: extractSubjectFromCode(course!.code),
      level: 'gymnasie',
      resources: ['Kursmaterial', 'Övningsuppgifter'],
      tips: ['Studera regelbundet', 'Fråga läraren vid behov'],
      related_courses: []
    }));
}

// Helper function to extract subject from course code
function extractSubjectFromCode(courseCode: string): string {
  const subjectMappings: Record<string, string> = {
    'ENG': 'Engelska',
    'HIS': 'Historia',
    'IDR': 'Idrott och hälsa',
    'MAT': 'Matematik',
    'NAK': 'Naturkunskap',
    'REL': 'Religionskunskap',
    'SAM': 'Samhällskunskap',
    'SVE': 'Svenska',
    'BIO': 'Biologi',
    'FYS': 'Fysik',
    'KEM': 'Kemi',
    'MOD': 'Moderna språk',
    'TEK': 'Teknik',
    'FIL': 'Filosofi',
    'PSK': 'Psykologi',
    'FÖR': 'Företagsekonomi',
    'JUR': 'Juridik',
    'EST': 'Estetisk kommunikation',
    'KOT': 'Konstarterna',
    'BIL': 'Bild',
    'DAN': 'Dans',
    'MUS': 'Musik',
    'TEA': 'Teater'
  };
  
  const match = courseCode.match(/^([A-Z]{3})/);
  const prefix = match ? match[1] : courseCode.substring(0, 3);
  
  return subjectMappings[prefix] || 'Okänt ämne';
}

// Helper function to get all unique subjects for a gymnasium
export function getGymnasiumSubjects(gymnasium: Gymnasium, selectedProgram?: GymnasiumProgram): string[] {
  const courses = getGymnasiumCourses(gymnasium, selectedProgram);
  const subjects = [...new Set(courses.map(course => extractSubjectFromCode(course.code)))];
  return subjects.sort();
}

// Helper function to get courses for a specific program and year
export function getCoursesForProgramAndYear(programName: string, year: 1 | 2 | 3) {
  // Find the program in our course data
  const programData = programCourses.find(p => 
    p.program.toLowerCase() === programName.toLowerCase() ||
    p.program === programName
  );
  
  if (!programData) {
    console.log('Program not found:', programName);
    // Return default courses if program not found
    return [
      {
        code: 'SVE01',
        name: 'Svenska 1',
        points: 100,
        year,
        mandatory: true,
        category: 'gymnasiegemensam' as const
      },
      {
        code: 'ENG05',
        name: 'Engelska 5',
        points: 100,
        year,
        mandatory: true,
        category: 'gymnasiegemensam' as const
      },
      {
        code: 'MAT01a',
        name: 'Matematik 1a',
        points: 100,
        year,
        mandatory: true,
        category: 'gymnasiegemensam' as const
      }
    ];
  }
  
  // Filter courses by year
  return programData.courses.filter(course => course.year === year);
}

// Helper function to get course statistics for a gymnasium
export function getGymnasiumCourseStats(gymnasium: Gymnasium, selectedProgram?: GymnasiumProgram) {
  const courses = getGymnasiumCourses(gymnasium, selectedProgram);
  const totalPoints = courses.reduce((sum, course) => sum + course.points, 0);
  const mandatoryCourses = courses.filter(c => c.mandatory);
  const electiveCourses = courses.filter(c => !c.mandatory);
  
  return {
    totalCourses: courses.length,
    totalPoints,
    mandatoryCourses: mandatoryCourses.length,
    electiveCourses: electiveCourses.length,
    mandatoryPoints: mandatoryCourses.reduce((sum, course) => sum + course.points, 0),
    electivePoints: electiveCourses.reduce((sum, course) => sum + course.points, 0),
    coursesByYear: {
      year1: courses.filter(c => c.year === 1).length,
      year2: courses.filter(c => c.year === 2).length,
      year3: courses.filter(c => c.year === 3).length,
    }
  };
}