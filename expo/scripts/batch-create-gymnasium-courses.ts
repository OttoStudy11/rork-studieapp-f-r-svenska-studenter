// Script to create hardcoded gymnasium course pages
// All common gymnasium courses that students take

export const gymnasiumCoursesToCreate = [
  // GYMNASIEGEMENSAMMA ÄMNEN
  { code: 'ENGENG05', title: 'Engelska 5', subject: 'Engelska', emoji: '🇬🇧', priority: 'high' },
  { code: 'ENGENG06', title: 'Engelska 6', subject: 'Engelska', emoji: '🗣️', priority: 'high' },
  { code: 'ENGENG07', title: 'Engelska 7', subject: 'Engelska', emoji: '📖', priority: 'medium' },
  
  { code: 'SVESVE01', title: 'Svenska 1', subject: 'Svenska', emoji: '📚', priority: 'high' },
  { code: 'SVESVE02', title: 'Svenska 2', subject: 'Svenska', emoji: '✍️', priority: 'high' },
  { code: 'SVESVE03', title: 'Svenska 3', subject: 'Svenska', emoji: '📖', priority: 'high' },
  
  { code: 'MATMAT01a', title: 'Matematik 1a', subject: 'Matematik', emoji: '➕', priority: 'high' },
  { code: 'MATMAT01b', title: 'Matematik 1b', subject: 'Matematik', emoji: '📐', priority: 'high' },
  { code: 'MATMAT01c', title: 'Matematik 1c', subject: 'Matematik', emoji: '🔢', priority: 'high' },
  { code: 'MATMAT02a', title: 'Matematik 2a', subject: 'Matematik', emoji: '📊', priority: 'high' },
  { code: 'MATMAT02b', title: 'Matematik 2b', subject: 'Matematik', emoji: '📈', priority: 'high' },
  { code: 'MATMAT02c', title: 'Matematik 2c', subject: 'Matematik', emoji: '📉', priority: 'high' },
  { code: 'MATMAT03b', title: 'Matematik 3b', subject: 'Matematik', emoji: '∫', priority: 'high' },
  { code: 'MATMAT03c', title: 'Matematik 3c', subject: 'Matematik', emoji: 'd/dx', priority: 'high' },
  { code: 'MATMAT04', title: 'Matematik 4', subject: 'Matematik', emoji: '∑', priority: 'medium' },
  { code: 'MATMAT05', title: 'Matematik 5', subject: 'Matematik', emoji: '∞', priority: 'medium' },
  
  { code: 'HISHIS01a1', title: 'Historia 1a1', subject: 'Historia', emoji: '🏛️', priority: 'high' },
  { code: 'HISHIS01a2', title: 'Historia 1a2', subject: 'Historia', emoji: '📜', priority: 'high' },
  { code: 'HISHIS01b', title: 'Historia 1b', subject: 'Historia', emoji: '⏳', priority: 'high' },
  { code: 'HISHIS02a', title: 'Historia 2a', subject: 'Historia', emoji: '🗿', priority: 'medium' },
  { code: 'HISHIS02b', title: 'Historia 2b', subject: 'Historia', emoji: '🏺', priority: 'medium' },
  
  { code: 'SAMSAM01a1', title: 'Samhällskunskap 1a1', subject: 'Samhällskunskap', emoji: '🏛️', priority: 'high' },
  { code: 'SAMSAM01a2', title: 'Samhällskunskap 1a2', subject: 'Samhällskunskap', emoji: '🗳️', priority: 'high' },
  { code: 'SAMSAM01b', title: 'Samhällskunskap 1b', subject: 'Samhällskunskap', emoji: '⚖️', priority: 'high' },
  { code: 'SAMSAM02', title: 'Samhällskunskap 2', subject: 'Samhällskunskap', emoji: '🌍', priority: 'medium' },
  { code: 'SAMSAM03', title: 'Samhällskunskap 3', subject: 'Samhällskunskap', emoji: '💼', priority: 'medium' },
  
  { code: 'NAKNAK01a1', title: 'Naturkunskap 1a1', subject: 'Naturkunskap', emoji: '🌿', priority: 'high' },
  { code: 'NAKNAK01a2', title: 'Naturkunskap 1a2', subject: 'Naturkunskap', emoji: '🌱', priority: 'high' },
  { code: 'NAKNAK01b', title: 'Naturkunskap 1b', subject: 'Naturkunskap', emoji: '🌳', priority: 'high' },
  { code: 'NAKNAK02', title: 'Naturkunskap 2', subject: 'Naturkunskap', emoji: '🍃', priority: 'medium' },
  
  { code: 'RELREL01', title: 'Religionskunskap 1', subject: 'Religionskunskap', emoji: '🕊️', priority: 'high' },
  { code: 'RELREL02', title: 'Religionskunskap 2', subject: 'Religionskunskap', emoji: '☪️', priority: 'medium' },
  
  { code: 'IDRIDR01', title: 'Idrott och hälsa 1', subject: 'Idrott och hälsa', emoji: '⚽', priority: 'high' },
  { code: 'IDRIDR02', title: 'Idrott och hälsa 2', subject: 'Idrott och hälsa', emoji: '🏃', priority: 'high' },
  
  // NATURVETENSKAPLIGA ÄMNEN
  { code: 'BIOBIO01', title: 'Biologi 1', subject: 'Biologi', emoji: '🧬', priority: 'high' },
  { code: 'BIOBIO02', title: 'Biologi 2', subject: 'Biologi', emoji: '🔬', priority: 'high' },
  { code: 'BIOBIO03', title: 'Biologi 3', subject: 'Biologi', emoji: '🦠', priority: 'medium' },
  
  { code: 'FYSFYS01a', title: 'Fysik 1a', subject: 'Fysik', emoji: '🔭', priority: 'high' },
  { code: 'FYSFYS01b1', title: 'Fysik 1b1', subject: 'Fysik', emoji: '⚛️', priority: 'medium' },
  { code: 'FYSFYS02', title: 'Fysik 2', subject: 'Fysik', emoji: '🌌', priority: 'high' },
  { code: 'FYSFYS03', title: 'Fysik 3', subject: 'Fysik', emoji: '🔬', priority: 'medium' },
  
  { code: 'KEMKEM01', title: 'Kemi 1', subject: 'Kemi', emoji: '⚗️', priority: 'high' },
  { code: 'KEMKEM02', title: 'Kemi 2', subject: 'Kemi', emoji: '🧪', priority: 'high' },
  { code: 'KEMKEM03', title: 'Kemi 3', subject: 'Kemi', emoji: '⚡', priority: 'medium' },
  
  // SAMHÄLLSVETENSKAPLIGA ÄMNEN
  { code: 'GEOGEO01', title: 'Geografi 1', subject: 'Geografi', emoji: '🌍', priority: 'high' },
  { code: 'GEOGEO02', title: 'Geografi 2', subject: 'Geografi', emoji: '🗺️', priority: 'medium' },
  
  { code: 'FILFIL01', title: 'Filosofi 1', subject: 'Filosofi', emoji: '🤔', priority: 'high' },
  { code: 'FILFIL02', title: 'Filosofi 2', subject: 'Filosofi', emoji: '💭', priority: 'medium' },
  
  { code: 'PSKPSK01', title: 'Psykologi 1', subject: 'Psykologi', emoji: '🧠', priority: 'high' },
  { code: 'PSKPSK02a', title: 'Psykologi 2a', subject: 'Psykologi', emoji: '🧘', priority: 'medium' },
  { code: 'PSKPSK02b', title: 'Psykologi 2b', subject: 'Psykologi', emoji: '💡', priority: 'medium' },
  
  // EKONOMI OCH JURIDIK
  { code: 'FÖRFÖR01', title: 'Företagsekonomi 1', subject: 'Företagsekonomi', emoji: '💼', priority: 'high' },
  { code: 'FÖRFÖR02', title: 'Företagsekonomi 2', subject: 'Företagsekonomi', emoji: '📊', priority: 'medium' },
  
  { code: 'JURJUR01', title: 'Juridik 1', subject: 'Juridik', emoji: '⚖️', priority: 'medium' },
  { code: 'JURJUR02', title: 'Juridik 2', subject: 'Juridik', emoji: '📜', priority: 'medium' },
  
  // MODERNA SPRÅK
  { code: 'MODMOD', title: 'Moderna språk', subject: 'Moderna språk', emoji: '🌍', priority: 'high' },
  { code: 'SPASPA1', title: 'Spanska 1', subject: 'Spanska', emoji: '🇪🇸', priority: 'medium' },
  { code: 'SPASPA2', title: 'Spanska 2', subject: 'Spanska', emoji: '🗣️', priority: 'medium' },
  { code: 'FRAFRA1', title: 'Franska 1', subject: 'Franska', emoji: '🇫🇷', priority: 'medium' },
  { code: 'FRAFRA2', title: 'Franska 2', subject: 'Franska', emoji: '🥐', priority: 'medium' },
  { code: 'TYGTYT1', title: 'Tyska 1', subject: 'Tyska', emoji: '🇩🇪', priority: 'medium' },
  { code: 'TYGTYT2', title: 'Tyska 2', subject: 'Tyska', emoji: '🍺', priority: 'medium' },
  
  // TEKNIK OCH PROGRAMMERING
  { code: 'TEKTEO01', title: 'Teknik 1', subject: 'Teknik', emoji: '🔧', priority: 'high' },
  { code: 'TEKTEO02', title: 'Teknik 2', subject: 'Teknik', emoji: '⚙️', priority: 'medium' },
  
  { code: 'PRRPRR01', title: 'Programmering 1', subject: 'Programmering', emoji: '💻', priority: 'high' },
  { code: 'PRRPRR02', title: 'Programmering 2', subject: 'Programmering', emoji: '⚙️', priority: 'medium' },
  
  { code: 'WEBWEB01', title: 'Webbutveckling 1', subject: 'Webbutveckling', emoji: '🌐', priority: 'high' },
  { code: 'WEBWEB02', title: 'Webbutveckling 2', subject: 'Webbutveckling', emoji: '💡', priority: 'medium' },
  
  { code: 'DAODAT01', title: 'Dator- och nätverksteknik', subject: 'Datorteknik', emoji: '🖥️', priority: 'medium' },
  
  // ESTETISKA ÄMNEN
  { code: 'BILBIL01', title: 'Bild och form 1', subject: 'Bild', emoji: '🎨', priority: 'medium' },
  { code: 'BILBIL02', title: 'Bild och form 2', subject: 'Bild', emoji: '🖼️', priority: 'low' },
  
  { code: 'MUSMUS01', title: 'Musik 1', subject: 'Musik', emoji: '🎵', priority: 'medium' },
  { code: 'MUSMUS02', title: 'Musik 2', subject: 'Musik', emoji: '🎶', priority: 'low' },
  
  { code: 'DANDAN01', title: 'Dans 1', subject: 'Dans', emoji: '💃', priority: 'low' },
  { code: 'TEATEA01', title: 'Teater 1', subject: 'Teater', emoji: '🎭', priority: 'low' },
  
  // PRAKTISKA ÄMNEN
  { code: 'MEKMEK01', title: 'Mekatronik 1', subject: 'Mekatronik', emoji: '🤖', priority: 'medium' },
  { code: 'PRDPRO01', title: 'Produktionskunskap 1', subject: 'Produktion', emoji: '🏭', priority: 'medium' },
  { code: 'PRDPRO02', title: 'Produktionsutrustning 1', subject: 'Produktion', emoji: '⚙️', priority: 'low' },
];

console.log(`${gymnasiumCoursesToCreate.length} gymnasium courses to create`);
console.log('High priority:', gymnasiumCoursesToCreate.filter(c => c.priority === 'high').length);
console.log('Medium priority:', gymnasiumCoursesToCreate.filter(c => c.priority === 'medium').length);
console.log('Low priority:', gymnasiumCoursesToCreate.filter(c => c.priority === 'low').length);
