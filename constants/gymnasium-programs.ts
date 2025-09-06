export interface GymnasiumProgram {
  id: string;
  name: string;
  abbreviation: string;
  category: 'högskoleförberedande' | 'yrkesprogram';
}

export const GYMNASIUM_PROGRAMS: GymnasiumProgram[] = [
  // Högskoleförberedande program
  { id: 'ek', name: 'Ekonomiprogrammet', abbreviation: 'EK', category: 'högskoleförberedande' },
  { id: 'es', name: 'Estetiska programmet', abbreviation: 'ES', category: 'högskoleförberedande' },
  { id: 'hu', name: 'Humanistiska programmet', abbreviation: 'HU', category: 'högskoleförberedande' },
  { id: 'na', name: 'Naturvetenskapsprogrammet', abbreviation: 'NA', category: 'högskoleförberedande' },
  { id: 'sa', name: 'Samhällsvetenskapsprogrammet', abbreviation: 'SA', category: 'högskoleförberedande' },
  { id: 'te', name: 'Teknikprogrammet', abbreviation: 'TE', category: 'högskoleförberedande' },
  { id: 'ib', name: 'International Baccalaureate', abbreviation: 'IB', category: 'högskoleförberedande' },
  
  // Yrkesprogram
  { id: 'ba', name: 'Bygg- och anläggningsprogrammet', abbreviation: 'BA', category: 'yrkesprogram' },
  { id: 'bf', name: 'Barn- och fritidsprogrammet', abbreviation: 'BF', category: 'yrkesprogram' },
  { id: 'ee', name: 'El- och energiprogrammet', abbreviation: 'EE', category: 'yrkesprogram' },
  { id: 'ft', name: 'Fordons- och transportprogrammet', abbreviation: 'FT', category: 'yrkesprogram' },
  { id: 'ha', name: 'Handels- och administrationsprogrammet', abbreviation: 'HA', category: 'yrkesprogram' },
  { id: 'hv', name: 'Hantverksprogrammet', abbreviation: 'HV', category: 'yrkesprogram' },
  { id: 'ht', name: 'Hotell- och turismprogrammet', abbreviation: 'HT', category: 'yrkesprogram' },
  { id: 'in', name: 'Industritekniska programmet', abbreviation: 'IN', category: 'yrkesprogram' },
  { id: 'nb', name: 'Naturbruksprogrammet', abbreviation: 'NB', category: 'yrkesprogram' },
  { id: 'rl', name: 'Restaurang- och livsmedelsprogrammet', abbreviation: 'RL', category: 'yrkesprogram' },
  { id: 'vf', name: 'VVS- och fastighetsprogrammet', abbreviation: 'VF', category: 'yrkesprogram' },
  { id: 'vo', name: 'Vård- och omsorgsprogrammet', abbreviation: 'VO', category: 'yrkesprogram' },
  { id: 'fs', name: 'Flygteknikprogrammet', abbreviation: 'FS', category: 'yrkesprogram' },
  { id: 'sx', name: 'Sjöfartsprogrammet', abbreviation: 'SX', category: 'yrkesprogram' },
  { id: 'mp', name: 'Musikprogrammet', abbreviation: 'MP', category: 'högskoleförberedande' },
  { id: 'id', name: 'Idrottsprogrammet', abbreviation: 'ID', category: 'högskoleförberedande' },
];

// Mapping av gymnasier till deras program
// Detta är en förenklad version - i verkligheten skulle varje skola ha sin specifika lista
export const GYMNASIUM_PROGRAM_MAPPING: Record<string, string[]> = {
  // Stockholm - stora gymnasier har ofta många program
  'sto-1': ['es', 'mp'], // Stockholms Musikgymnasium - fokus på musik och estetik
  'sto-2': ['na', 'sa', 'ek', 'hu', 'es'], // Södra Latins - brett utbud
  'sto-3': ['na', 'sa', 'ek', 'te'], // Norra Real - akademiskt fokus
  'sto-4': ['na', 'sa', 'ek', 'te'], // Östra Real
  'sto-5': ['na', 'sa', 'ek', 'es', 'hu'], // Kungsholmens
  'sto-6': ['na', 'sa', 'ek', 'ib'], // Viktor Rydberg - inkl IB
  'sto-7': ['na', 'sa', 'ek', 'te'], // Internationella Engelska
  'sto-8': ['sa', 'ek', 'ha', 'bf'], // Thorildsplans
  'sto-9': ['na', 'sa', 'ek', 'te'], // Blackebergs
  'sto-10': ['na', 'sa', 'ek', 'hu'], // Enskilda
  'sto-11': ['sa', 'ek', 'hu'], // Globala
  'sto-12': ['es', 'mp'], // Stockholms Estetiska
  'sto-13': ['te', 'ee', 'in'], // Stockholms Tekniska
  'sto-14': ['sa', 'ek', 'bf', 'ha'], // Rinkeby
  'sto-15': ['sa', 'ek', 'bf', 'ha'], // Tensta
  'sto-16': ['na', 'sa', 'ek', 'te'], // Farsta
  'sto-17': ['sa', 'ek', 'bf', 'ha'], // Skärholmens
  'sto-18': ['na', 'sa', 'ek', 'te'], // Vällingby
  'sto-19': ['na', 'sa', 'ek', 'te'], // Bromma
  'sto-20': ['sa', 'ek', 'bf', 'ha'], // Spånga

  // Göteborg
  'got-1': ['na', 'sa', 'ek', 'hu'], // Göteborgs Högre Samskola
  'got-2': ['na', 'sa', 'ek', 'te', 'hu'], // Hvitfeldtska
  'got-3': ['na', 'sa', 'ek', 'es'], // Katrinelunds
  'got-4': ['es', 'mp'], // Schillerska
  'got-5': ['te', 'ee', 'in'], // Polhemsgymnasiet
  'got-6': ['sa', 'ek', 'bf', 'ha'], // Burgårdens
  'got-7': ['te', 'ee', 'in', 'ba'], // Göteborgs Tekniska
  'got-8': ['sa', 'ek', 'bf', 'ha'], // Angered
  'got-9': ['sa', 'ek', 'ha'], // Plusgymnasiet
  'got-10': ['sa', 'ek', 'ha', 'es'], // John Bauer

  // Malmö
  'mal-1': ['na', 'sa', 'ek', 'hu'], // Malmö Borgarskola
  'mal-2': ['na', 'sa', 'ek', 'hu'], // Malmö Latinskola
  'mal-3': ['na', 'sa', 'ek', 'te'], // Katedralskolan
  'mal-4': ['id', 'sa'], // Malmö Idrottsgymnasium
  'mal-5': ['te', 'ee', 'in'], // Teknikum
  'mal-6': ['mp', 'es'], // Malmö Musikhögskola
  'mal-7': ['sa', 'ek', 'bf'], // Pildammsgymnasiet
  'mal-8': ['sa', 'ek', 'bf', 'ha'], // Rosengård
  'mal-9': ['na', 'sa', 'ek', 'te'], // Malmö Högskola
  'mal-10': ['sa', 'ek', 'na'], // Kunskapsskolan

  // Uppsala
  'upp-1': ['na', 'sa', 'ek', 'hu', 'te'], // Katedralskolan
  'upp-2': ['na', 'sa', 'ek', 'te'], // Fyrisskolan
  'upp-3': ['na', 'sa', 'ek', 'te'], // Celsiusskolan
  'upp-4': ['na', 'sa', 'ek', 'es'], // Lundellska
  'upp-5': ['sa', 'ek', 'bf', 'ha'], // Rosendalsgymnasiet
  'upp-6': ['sa', 'ek', 'ha'], // Åsö
  'upp-7': ['na', 'sa', 'ek'], // Mikael Elias
  'upp-8': ['ha', 'bf', 'ft', 'ee'], // Praktiska

  // Linköping
  'lin-1': ['na', 'sa', 'ek', 'hu'], // Katedralskolan
  'lin-2': ['na', 'te', 'ee'], // Berzeliusskolan
  'lin-3': ['sa', 'ek', 'es'], // Folkungaskolan
  'lin-4': ['sa', 'ek', 'bf'], // Frödings
  'lin-5': ['te', 'ee', 'in'], // Tekniska
  'lin-6': ['nb', 'na', 'sa'], // Vreta Kloster

  // Västerås
  'vas-1': ['na', 'sa', 'ek', 'te'], // Rudbeckianska
  'vas-2': ['sa', 'ek', 'es', 'hu'], // Västerås Gymnasium
  'vas-3': ['te', 'ee', 'in'], // Mälardalens Tekniska
  'vas-4': ['sa', 'ek', 'bf'], // Hammarby
  'vas-5': ['id', 'sa'], // Idrottsgymnasium
  'vas-6': ['mp', 'es'], // Musikklasser
  'vas-7': ['ha', 'ft', 'ee'], // Praktiska

  // Örebro
  'ore-1': ['na', 'sa', 'ek', 'te'], // Karolinska
  'ore-2': ['te', 'ee', 'in'], // Palmcrantzskolan
  'ore-3': ['sa', 'ek', 'es'], // Nikolai
  'ore-4': ['te', 'ee', 'in', 'ba'], // Tekniska
  'ore-5': ['sa', 'ek', 'bf'], // Vivalla

  // Default för övriga gymnasier - ett grundutbud
  default: ['na', 'sa', 'ek', 'te']
};

export function getGymnasiumPrograms(gymnasiumId: string): GymnasiumProgram[] {
  const programIds = GYMNASIUM_PROGRAM_MAPPING[gymnasiumId] || GYMNASIUM_PROGRAM_MAPPING.default;
  return programIds.map(id => GYMNASIUM_PROGRAMS.find(p => p.id === id)!).filter(Boolean);
}

export function getProgramById(programId: string): GymnasiumProgram | undefined {
  return GYMNASIUM_PROGRAMS.find(p => p.id === programId);
}

export function getProgramsByCategory(category: 'högskoleförberedande' | 'yrkesprogram'): GymnasiumProgram[] {
  return GYMNASIUM_PROGRAMS.filter(p => p.category === category);
}