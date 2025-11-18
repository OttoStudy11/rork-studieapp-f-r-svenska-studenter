// Script to list all unique courses that need pages
import { programCourses } from '../home/project/constants/program-courses';

const allCourses = new Set<string>();

programCourses.forEach(program => {
  program.courses.forEach(course => {
    // Extract the course code without the ID prefix
    const cleanCode = course.code.toLowerCase().replace(/[0-9]/g, '');
    allCourses.add(`${cleanCode}-${course.name}`);
  });
});

console.log('All unique courses:');
Array.from(allCourses).sort().forEach(course => {
  console.log(course);
});

console.log(`\nTotal: ${allCourses.size} courses`);
