// Script to list university courses that need hardcoded pages
// Based on populate-all-university-courses-complete.sql

export const universityCoursesToCreate = [
  // TEKNISKA KURSER - Most important for engineering programs
  { code: 'SF1624', title: 'Algebra och geometri', subject: 'Matematik', emoji: '📐', priority: 'high' },
  { code: 'SF1625', title: 'Envariabelanalys', subject: 'Matematik', emoji: '📈', priority: 'high' },
  { code: 'DD1331', title: 'Grundläggande programmering', subject: 'Datavetenskap', emoji: '💻', priority: 'high' },
  { code: 'DD1337', title: 'Programmering', subject: 'Datavetenskap', emoji: '⚙️', priority: 'high' },
  { code: 'DD2372', title: 'Databaser', subject: 'Datavetenskap', emoji: '🗄️', priority: 'high' },
  
  // MEDICINSKA KURSER - For medical and nursing programs
  { code: 'MED101', title: 'Medicinsk terminologi', subject: 'Medicin', emoji: '🏥', priority: 'high' },
  { code: 'MED102', title: 'Anatomi och fysiologi I', subject: 'Medicin', emoji: '🫀', priority: 'high' },
  { code: 'OMV101', title: 'Omvårdnad - grunder', subject: 'Omvårdnad', emoji: '👩‍⚕️', priority: 'high' },
  
  // NATURVETENSKAP - Biology, Chemistry, Physics
  { code: 'BIO101', title: 'Allmän biologi I', subject: 'Biologi', emoji: '🧬', priority: 'high' },
  { code: 'KEM101', title: 'Allmän kemi', subject: 'Kemi', emoji: '⚗️', priority: 'high' },
  { code: 'FYS101', title: 'Mekanik', subject: 'Fysik', emoji: '🔭', priority: 'high' },
  
  // SAMHÄLLSVETENSKAP - Law, Economics, Psychology
  { code: 'JUR101', title: 'Introduktion till juridik', subject: 'Juridik', emoji: '⚖️', priority: 'high' },
  { code: 'EKO101', title: 'Introduktion till ekonomi', subject: 'Ekonomi', emoji: '💰', priority: 'high' },
  { code: 'PSY101', title: 'Introduktion till psykologi', subject: 'Psykologi', emoji: '🧠', priority: 'high' },
  
  // LÄRARUTBILDNINGAR
  { code: 'PED101', title: 'Allmän didaktik', subject: 'Pedagogik', emoji: '📚', priority: 'medium' },
  
  // Additional important courses
  { code: 'SF1626', title: 'Flervariabelanalys', subject: 'Matematik', emoji: '📊', priority: 'medium' },
  { code: 'DD1338', title: 'Algoritmer och datastrukturer', subject: 'Datavetenskap', emoji: '🌳', priority: 'medium' },
  { code: 'IE1206', title: 'Elektronik', subject: 'Elektroteknik', emoji: '⚡', priority: 'medium' },
  { code: 'MED201', title: 'Patologi', subject: 'Medicin', emoji: '🦠', priority: 'medium' },
  { code: 'BIO201', title: 'Molekylärbiologi', subject: 'Biologi', emoji: '🧪', priority: 'medium' },
];

console.log(`${universityCoursesToCreate.length} university courses to create`);
console.log('High priority:', universityCoursesToCreate.filter(c => c.priority === 'high').length);
console.log('Medium priority:', universityCoursesToCreate.filter(c => c.priority === 'medium').length);
