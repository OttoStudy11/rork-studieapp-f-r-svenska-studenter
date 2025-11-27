// Lista över alla Sveriges högskolor och universitet
export interface University {
  id: string;
  name: string;
  city: string;
  type: 'university' | 'college' | 'art_school' | 'business_school' | 'vocational_school' | 'specialized_school';
  category: string;
}

export interface UniversityProgram {
  id: string;
  name: string;
  abbreviation?: string;
  degreeType: 'kandidat' | 'magister' | 'master' | 'civilingenjör' | 'högskoleingenjör' | 'yrkeshögskola' | 'professionsprogram';
  field: string;
  credits: number;
  durationYears: number;
}

export const SWEDISH_UNIVERSITIES: University[] = [
  // Stora universitet
  { id: 'uppsala', name: 'Uppsala universitet', city: 'Uppsala', type: 'university', category: 'Universitet' },
  { id: 'lund', name: 'Lunds universitet', city: 'Lund', type: 'university', category: 'Universitet' },
  { id: 'goteborg', name: 'Göteborgs universitet', city: 'Göteborg', type: 'university', category: 'Universitet' },
  { id: 'stockholm', name: 'Stockholms universitet', city: 'Stockholm', type: 'university', category: 'Universitet' },
  { id: 'umea', name: 'Umeå universitet', city: 'Umeå', type: 'university', category: 'Universitet' },
  { id: 'linkoping', name: 'Linköpings universitet', city: 'Linköping', type: 'university', category: 'Universitet' },
  
  // Tekniska universitet
  { id: 'kth', name: 'Kungliga Tekniska högskolan (KTH)', city: 'Stockholm', type: 'university', category: 'Tekniskt universitet' },
  { id: 'chalmers', name: 'Chalmers tekniska högskola', city: 'Göteborg', type: 'university', category: 'Tekniskt universitet' },
  { id: 'ltu', name: 'Luleå tekniska universitet', city: 'Luleå', type: 'university', category: 'Tekniskt universitet' },
  
  // Medicinska och specialiserade
  { id: 'ki', name: 'Karolinska Institutet', city: 'Stockholm', type: 'specialized_school', category: 'Medicinskt universitet' },
  { id: 'slu', name: 'Sveriges lantbruksuniversitet (SLU)', city: 'Uppsala', type: 'specialized_school', category: 'Specialiserat universitet' },
  
  // Mindre universitet
  { id: 'karlstad', name: 'Karlstads universitet', city: 'Karlstad', type: 'university', category: 'Universitet' },
  { id: 'linnaeus', name: 'Linnéuniversitetet', city: 'Växjö', type: 'university', category: 'Universitet' },
  { id: 'orebro', name: 'Örebro universitet', city: 'Örebro', type: 'university', category: 'Universitet' },
  { id: 'miun', name: 'Mittuniversitetet', city: 'Sundsvall', type: 'university', category: 'Universitet' },
  { id: 'malmo', name: 'Malmö universitet', city: 'Malmö', type: 'university', category: 'Universitet' },
  
  // Handelshögskolor
  { id: 'hhs', name: 'Handelshögskolan i Stockholm', city: 'Stockholm', type: 'business_school', category: 'Handelshögskola' },
  
  // Högskolor
  { id: 'bth', name: 'Blekinge tekniska högskola', city: 'Karlskrona', type: 'college', category: 'Högskola' },
  { id: 'mdh', name: 'Mälardalens universitet', city: 'Västerås', type: 'college', category: 'Högskola' },
  { id: 'hb', name: 'Högskolan i Borås', city: 'Borås', type: 'college', category: 'Högskola' },
  { id: 'hda', name: 'Högskolan Dalarna', city: 'Falun', type: 'college', category: 'Högskola' },
  { id: 'hig', name: 'Högskolan i Gävle', city: 'Gävle', type: 'college', category: 'Högskola' },
  { id: 'hh', name: 'Högskolan i Halmstad', city: 'Halmstad', type: 'college', category: 'Högskola' },
  { id: 'hkr', name: 'Högskolan Kristianstad', city: 'Kristianstad', type: 'college', category: 'Högskola' },
  { id: 'his', name: 'Högskolan i Skövde', city: 'Skövde', type: 'college', category: 'Högskola' },
  { id: 'hv', name: 'Högskolan Väst', city: 'Trollhättan', type: 'college', category: 'Högskola' },
  { id: 'sh', name: 'Södertörns högskola', city: 'Stockholm', type: 'college', category: 'Högskola' },
  { id: 'hj', name: 'Högskolan i Jönköping', city: 'Jönköping', type: 'college', category: 'Högskola' },
  
  // Konstnärliga högskolor
  { id: 'konstfack', name: 'Konstfack', city: 'Stockholm', type: 'art_school', category: 'Konstnärlig högskola' },
  { id: 'kkh', name: 'Kungliga Konsthögskolan', city: 'Stockholm', type: 'art_school', category: 'Konstnärlig högskola' },
  { id: 'kmh', name: 'Kungliga Musikhögskolan', city: 'Stockholm', type: 'art_school', category: 'Konstnärlig högskola' },
  
  // Specialhögskolor
  { id: 'fhs', name: 'Försvarshögskolan', city: 'Stockholm', type: 'specialized_school', category: 'Specialhögskola' },
  { id: 'gih', name: 'Gymnastik- och idrottshögskolan (GIH)', city: 'Stockholm', type: 'specialized_school', category: 'Specialhögskola' },
  { id: 'polishogskolan', name: 'Polishögskolan', city: 'Stockholm', type: 'specialized_school', category: 'Specialhögskola' },
  
  // Yrkeshögskolor
  { id: 'nackademin', name: 'Nackademin', city: 'Stockholm', type: 'vocational_school', category: 'Yrkeshögskola' },
  { id: 'ihm', name: 'IHM Business School', city: 'Stockholm', type: 'vocational_school', category: 'Yrkeshögskola' },
  { id: 'chas', name: 'Chas Academy', city: 'Stockholm', type: 'vocational_school', category: 'Yrkeshögskola' },
  { id: 'jensen', name: 'Jensen Education', city: 'Stockholm', type: 'vocational_school', category: 'Yrkeshögskola' },
  { id: 'yrgo', name: 'Yrgo', city: 'Göteborg', type: 'vocational_school', category: 'Yrkeshögskola' },
];

export const UNIVERSITY_PROGRAMS: UniversityProgram[] = [
  // Tekniska program - Civilingenjör
  { id: 'civ_datateknik', name: 'Civilingenjör - Datateknik', abbreviation: 'CI-DT', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  { id: 'civ_elektroteknik', name: 'Civilingenjör - Elektroteknik', abbreviation: 'CI-EL', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  { id: 'civ_maskinteknik', name: 'Civilingenjör - Maskinteknik', abbreviation: 'CI-MA', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  { id: 'civ_teknisk_fysik', name: 'Civilingenjör - Teknisk fysik', abbreviation: 'CI-TF', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  { id: 'civ_kemiteknik', name: 'Civilingenjör - Kemiteknik', abbreviation: 'CI-KE', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  { id: 'civ_industriell_ekonomi', name: 'Civilingenjör - Industriell ekonomi', abbreviation: 'CI-IE', degreeType: 'civilingenjör', field: 'Teknik/Ekonomi', credits: 300, durationYears: 5 },
  { id: 'civ_samhallsbyggnad', name: 'Civilingenjör - Samhällsbyggnad', abbreviation: 'CI-SB', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  { id: 'civ_bioteknik', name: 'Civilingenjör - Bioteknik', abbreviation: 'CI-BT', degreeType: 'civilingenjör', field: 'Teknik', credits: 300, durationYears: 5 },
  
  // Tekniska program - Högskoleingenjör
  { id: 'hsk_datateknik', name: 'Högskoleingenjör - Datateknik', abbreviation: 'HI-DT', degreeType: 'högskoleingenjör', field: 'Teknik', credits: 180, durationYears: 3 },
  { id: 'hsk_elektroteknik', name: 'Högskoleingenjör - Elektroteknik', abbreviation: 'HI-EL', degreeType: 'högskoleingenjör', field: 'Teknik', credits: 180, durationYears: 3 },
  { id: 'hsk_maskinteknik', name: 'Högskoleingenjör - Maskinteknik', abbreviation: 'HI-MA', degreeType: 'högskoleingenjör', field: 'Teknik', credits: 180, durationYears: 3 },
  { id: 'hsk_byggteknik', name: 'Högskoleingenjör - Byggteknik', abbreviation: 'HI-BY', degreeType: 'högskoleingenjör', field: 'Teknik', credits: 180, durationYears: 3 },
  
  // Medicin och hälsa - Professionsprogram
  { id: 'lakarprogrammet', name: 'Läkarprogrammet', degreeType: 'professionsprogram', field: 'Medicin', credits: 330, durationYears: 5.5 },
  { id: 'tandlakarprogrammet', name: 'Tandläkarprogrammet', degreeType: 'professionsprogram', field: 'Medicin', credits: 300, durationYears: 5 },
  { id: 'sjukskoterskeprogrammet', name: 'Sjuksköterskeprogrammet', degreeType: 'professionsprogram', field: 'Vårdvetenskap', credits: 180, durationYears: 3 },
  { id: 'fysioterapeutprogrammet', name: 'Fysioterapeutprogrammet', degreeType: 'professionsprogram', field: 'Vårdvetenskap', credits: 180, durationYears: 3 },
  { id: 'psykologprogrammet', name: 'Psykologprogrammet', degreeType: 'professionsprogram', field: 'Psykologi', credits: 300, durationYears: 5 },
  
  // Naturvetenskap - Kandidat
  { id: 'kand_biologi', name: 'Kandidatprogram i biologi', degreeType: 'kandidat', field: 'Naturvetenskap', credits: 180, durationYears: 3 },
  { id: 'kand_kemi', name: 'Kandidatprogram i kemi', degreeType: 'kandidat', field: 'Naturvetenskap', credits: 180, durationYears: 3 },
  { id: 'kand_fysik', name: 'Kandidatprogram i fysik', degreeType: 'kandidat', field: 'Naturvetenskap', credits: 180, durationYears: 3 },
  { id: 'kand_matematik', name: 'Kandidatprogram i matematik', degreeType: 'kandidat', field: 'Naturvetenskap', credits: 180, durationYears: 3 },
  { id: 'kand_datavetenskap', name: 'Kandidatprogram i datavetenskap', degreeType: 'kandidat', field: 'Naturvetenskap', credits: 180, durationYears: 3 },
  
  // Samhällsvetenskap - Professionsprogram och Kandidat
  { id: 'juristprogrammet', name: 'Juristprogrammet', degreeType: 'professionsprogram', field: 'Juridik', credits: 270, durationYears: 4.5 },
  { id: 'ekonomprogrammet', name: 'Ekonomprogrammet', degreeType: 'kandidat', field: 'Ekonomi', credits: 180, durationYears: 3 },
  { id: 'civilekonomprogrammet', name: 'Civilekonomprogrammet', degreeType: 'professionsprogram', field: 'Ekonomi', credits: 240, durationYears: 4 },
  { id: 'socionomprogrammet', name: 'Socionomprogrammet', degreeType: 'professionsprogram', field: 'Socialt arbete', credits: 210, durationYears: 3.5 },
  { id: 'politices_kandidat', name: 'Politices kandidatprogram', degreeType: 'kandidat', field: 'Statsvetenskap', credits: 180, durationYears: 3 },
  { id: 'kand_statsvetenskap', name: 'Kandidatprogram i statsvetenskap', degreeType: 'kandidat', field: 'Samhällsvetenskap', credits: 180, durationYears: 3 },
  { id: 'kand_sociologi', name: 'Kandidatprogram i sociologi', degreeType: 'kandidat', field: 'Samhällsvetenskap', credits: 180, durationYears: 3 },
  
  // Humaniora - Kandidat
  { id: 'kand_historia', name: 'Kandidatprogram i historia', degreeType: 'kandidat', field: 'Humaniora', credits: 180, durationYears: 3 },
  { id: 'kand_filosofi', name: 'Kandidatprogram i filosofi', degreeType: 'kandidat', field: 'Humaniora', credits: 180, durationYears: 3 },
  { id: 'kand_litteraturvetenskap', name: 'Kandidatprogram i litteraturvetenskap', degreeType: 'kandidat', field: 'Humaniora', credits: 180, durationYears: 3 },
  { id: 'kand_sprakvetenskap', name: 'Kandidatprogram i språkvetenskap', degreeType: 'kandidat', field: 'Humaniora', credits: 180, durationYears: 3 },
  
  // Lärarutbildningar - Professionsprogram
  { id: 'forskollararprogrammet', name: 'Förskollärarprogrammet', degreeType: 'professionsprogram', field: 'Utbildningsvetenskap', credits: 210, durationYears: 3.5 },
  { id: 'grundlararprogrammet_f3', name: 'Grundlärarprogrammet F-3', degreeType: 'professionsprogram', field: 'Utbildningsvetenskap', credits: 240, durationYears: 4 },
  { id: 'grundlararprogrammet_46', name: 'Grundlärarprogrammet 4-6', degreeType: 'professionsprogram', field: 'Utbildningsvetenskap', credits: 240, durationYears: 4 },
  { id: 'amneslararprogrammet_79', name: 'Ämneslärarprogrammet 7-9', degreeType: 'professionsprogram', field: 'Utbildningsvetenskap', credits: 270, durationYears: 4.5 },
  { id: 'amneslararprogrammet_gym', name: 'Ämneslärarprogrammet gymnasiet', degreeType: 'professionsprogram', field: 'Utbildningsvetenskap', credits: 300, durationYears: 5 },
  
  // Media och kommunikation
  { id: 'journalistprogrammet', name: 'Journalistprogrammet', degreeType: 'kandidat', field: 'Media', credits: 180, durationYears: 3 },
  { id: 'medie_kommunikation', name: 'Medie- och kommunikationsvetenskap', degreeType: 'kandidat', field: 'Media', credits: 180, durationYears: 3 },
  { id: 'systemvetenskap', name: 'Systemvetenskap', degreeType: 'kandidat', field: 'IT', credits: 180, durationYears: 3 },
  
  // Ekonomi och handel
  { id: 'business_economics', name: 'Business and Economics', degreeType: 'kandidat', field: 'Ekonomi', credits: 180, durationYears: 3 },
  { id: 'international_business', name: 'International Business', degreeType: 'kandidat', field: 'Ekonomi', credits: 180, durationYears: 3 },
  { id: 'foretagsekonomi', name: 'Företagsekonomi', degreeType: 'kandidat', field: 'Ekonomi', credits: 180, durationYears: 3 },
  
  // Lantbruk och djur
  { id: 'veterinarprogrammet', name: 'Veterinärprogrammet', degreeType: 'professionsprogram', field: 'Veterinärmedicin', credits: 330, durationYears: 5.5 },
  { id: 'agronomprogram', name: 'Agronomprogram', degreeType: 'kandidat', field: 'Lantbruk', credits: 180, durationYears: 3 },
  { id: 'jagmastarprogrammet', name: 'Jägmästarprogrammet', degreeType: 'professionsprogram', field: 'Skogshushållning', credits: 300, durationYears: 5 },
];

export type UniversityProgramYear = 1 | 2 | 3 | 4 | 5;
