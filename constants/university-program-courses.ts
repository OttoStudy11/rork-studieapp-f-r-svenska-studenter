export interface UniversityCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  year: 1 | 2 | 3 | 4 | 5;
  mandatory: boolean;
  category: 'grundkurs' | 'fördjupningskurs' | 'avancerad' | 'mastersnivå' | 'professionskurs' | 'valbara';
  field: string;
}

export interface UniversityProgramCourses {
  programId: string;
  programName: string;
  degreeType: 'kandidat' | 'magister' | 'master' | 'civilingenjör' | 'högskoleingenjör' | 'yrkeshögskola' | 'professionsprogram';
  courses: UniversityCourse[];
}

// Tekniska program - Civilingenjör
const civilingenjorDatateknikkurser: UniversityCourse[] = [
  // År 1
  { id: 'SF1624', code: 'SF1624', name: 'Algebra och geometri', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'SF1625', code: 'SF1625', name: 'Envariabelanalys', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'DD1301', code: 'DD1301', name: 'Introduktion till programmering', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'DD1320', code: 'DD1320', name: 'Tillämpad datalogi', credits: 6, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'SF1626', code: 'SF1626', name: 'Flervariabelanalys', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'DD1337', code: 'DD1337', name: 'Programmeringsteknik', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'IS1200', code: 'IS1200', name: 'Datorteknik', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'SF1627', code: 'SF1627', name: 'Diskret matematik', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  
  // År 2
  { id: 'DD1324', code: 'DD1324', name: 'Algoritmer och datastrukturer', credits: 7.5, year: 2, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'DD1351', code: 'DD1351', name: 'Logik för dataloger', credits: 6, year: 2, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'DD1352', code: 'DD1352', name: 'Arkitektur, operativsystem och nätverk', credits: 9, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'SF1624', code: 'SF1680', name: 'Sannolikhetsteori och statistik', credits: 7.5, year: 2, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'DD1361', code: 'DD1361', name: 'Programmeringsparadigm', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'DD1396', code: 'DD1396', name: 'Parallellprogrammering', credits: 6, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'DD2350', code: 'DD2350', name: 'Algoritmer och komplexitet', credits: 6, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datateknik' },
  
  // År 3
  { id: 'DD2380', code: 'DD2380', name: 'Artificiell intelligens', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'DD2421', code: 'DD2421', name: 'Maskininlärning', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'DH2642', code: 'DH2642', name: 'Interaktionsprogrammering', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'DD2440', code: 'DD2440', name: 'Avancerad webbprogrammering', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datateknik' },
  { id: 'DD2412', code: 'DD2412', name: 'Kandidatexjobb', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Datateknik' },
];

const civilingenjorElektroteknikkurser: UniversityCourse[] = [
  // År 1
  { id: 'SF1624', code: 'SF1624', name: 'Algebra och geometri', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'SF1625', code: 'SF1625', name: 'Envariabelanalys', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'EI1210', code: 'EI1210', name: 'Introduktion till elektroteknik', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Elektroteknik' },
  { id: 'EI1220', code: 'EI1220', name: 'Elektriska kretsar', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Elektroteknik' },
  { id: 'SF1626', code: 'SF1626', name: 'Flervariabelanalys', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'SI1140', code: 'SI1140', name: 'Elektromagnetism', credits: 6, year: 1, mandatory: true, category: 'grundkurs', field: 'Fysik' },
  { id: 'DD1310', code: 'DD1310', name: 'Programmering för elektroingenjörer', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  
  // År 2
  { id: 'EI2300', code: 'EI2300', name: 'Signalbehandling', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI2310', code: 'EI2310', name: 'Analog elektronik', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI2320', code: 'EI2320', name: 'Digital elektronik', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI2330', code: 'EI2330', name: 'Reglerteknik', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI2340', code: 'EI2340', name: 'Elkraftteknik', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Elektroteknik' },
  
  // År 3
  { id: 'EI3350', code: 'EI3350', name: 'Trådlös kommunikation', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI3360', code: 'EI3360', name: 'Inbyggda system', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI3370', code: 'EI3370', name: 'Kraft- och energisystem', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Elektroteknik' },
  { id: 'EI3900', code: 'EI3900', name: 'Kandidatexjobb', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Elektroteknik' },
];

const civilingenjorIndustriellEkonomikurser: UniversityCourse[] = [
  // År 1
  { id: 'SF1624', code: 'SF1624', name: 'Algebra och geometri', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'ME1003', code: 'ME1003', name: 'Industriell ekonomi och organisation', credits: 6, year: 1, mandatory: true, category: 'grundkurs', field: 'Ekonomi' },
  { id: 'ME1312', code: 'ME1312', name: 'Företagsekonomi', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Ekonomi' },
  { id: 'DD1301', code: 'DD1301', name: 'Introduktion till programmering', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datateknik' },
  { id: 'SF1625', code: 'SF1625', name: 'Envariabelanalys', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'ME1313', code: 'ME1313', name: 'Bokföring och ekonomistyrning', credits: 6, year: 1, mandatory: true, category: 'grundkurs', field: 'Ekonomi' },
  
  // År 2
  { id: 'ME2063', code: 'ME2063', name: 'Produktionsekonomi', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'ME2015', code: 'ME2015', name: 'Marknadsföring', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'ME2073', code: 'ME2073', name: 'Finansiell ekonomi', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'ME2016', code: 'ME2016', name: 'Strategisk ledning', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'SF1680', code: 'SF1680', name: 'Sannolikhetsteori och statistik', credits: 7.5, year: 2, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  
  // År 3
  { id: 'ME3031', code: 'ME3031', name: 'Produktionsutveckling', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Produktion' },
  { id: 'ME3032', code: 'ME3032', name: 'Supply Chain Management', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Logistik' },
  { id: 'ME3033', code: 'ME3033', name: 'Innovation och entreprenörskap', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'ME3900', code: 'ME3900', name: 'Kandidatexjobb', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
];

// Medicinska program
const lakarprogrammetkurser: UniversityCourse[] = [
  // År 1 - Termin 1-2
  { id: 'KI1001', code: 'KI1001', name: 'Medicinens grunder', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI1002', code: 'KI1002', name: 'Människokroppen', credits: 30, year: 1, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI1003', code: 'KI1003', name: 'Fysiologi och biokemi', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  
  // År 2
  { id: 'KI2001', code: 'KI2001', name: 'Sjukdomslära', credits: 30, year: 2, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI2002', code: 'KI2002', name: 'Klinisk medicin introduktion', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI2003', code: 'KI2003', name: 'Mikrobiologi och immunologi', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  
  // År 3
  { id: 'KI3001', code: 'KI3001', name: 'Kirurgi', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI3002', code: 'KI3002', name: 'Internmedicin', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI3003', code: 'KI3003', name: 'Psykiatri', credits: 10, year: 3, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI3004', code: 'KI3004', name: 'Pediatrik', credits: 10, year: 3, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'KI3005', code: 'KI3005', name: 'Obstetrik och gynekologi', credits: 10, year: 3, mandatory: true, category: 'professionskurs', field: 'Medicin' },
];

const sjukskoterskeprogrammetkurser: UniversityCourse[] = [
  // År 1
  { id: 'OM1001', code: 'OM1001', name: 'Omvårdnadens grunder', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  { id: 'OM1002', code: 'OM1002', name: 'Anatomi och fysiologi', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'OM1003', code: 'OM1003', name: 'Biokemi och farmakologi', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'OM1004', code: 'OM1004', name: 'Verksamhetsförlagd utbildning 1', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  
  // År 2
  { id: 'OM2001', code: 'OM2001', name: 'Sjukdomslära', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Medicin' },
  { id: 'OM2002', code: 'OM2002', name: 'Klinisk omvårdnad', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  { id: 'OM2003', code: 'OM2003', name: 'Psykiatri och psykisk hälsa', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  { id: 'OM2004', code: 'OM2004', name: 'Verksamhetsförlagd utbildning 2', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  
  // År 3
  { id: 'OM3001', code: 'OM3001', name: 'Avancerad omvårdnad', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  { id: 'OM3002', code: 'OM3002', name: 'Folkhälsa och hälsofrämjande', credits: 7.5, year: 3, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  { id: 'OM3003', code: 'OM3003', name: 'Verksamhetsförlagd utbildning 3', credits: 22.5, year: 3, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
  { id: 'OM3004', code: 'OM3004', name: 'Examensarbete', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Omvårdnad' },
];

const psykologprogrammetkurser: UniversityCourse[] = [
  // År 1
  { id: 'PS1001', code: 'PS1001', name: 'Psykologins grunder', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Psykologi' },
  { id: 'PS1002', code: 'PS1002', name: 'Utvecklingspsykologi', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Psykologi' },
  { id: 'PS1003', code: 'PS1003', name: 'Biologisk psykologi', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Psykologi' },
  
  // År 2
  { id: 'PS2001', code: 'PS2001', name: 'Socialpsykologi', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Psykologi' },
  { id: 'PS2002', code: 'PS2002', name: 'Klinisk psykologi', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Psykologi' },
  { id: 'PS2003', code: 'PS2003', name: 'Kognitiv psykologi', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Psykologi' },
  { id: 'PS2004', code: 'PS2004', name: 'Psykologisk metodik', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Psykologi' },
  
  // År 3
  { id: 'PS3001', code: 'PS3001', name: 'Personlighetspsykologi', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Psykologi' },
  { id: 'PS3002', code: 'PS3002', name: 'Psykoterapi och behandling', credits: 15, year: 3, mandatory: true, category: 'avancerad', field: 'Psykologi' },
  { id: 'PS3003', code: 'PS3003', name: 'Verksamhetsförlagd utbildning', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Psykologi' },
  { id: 'PS3004', code: 'PS3004', name: 'Examensarbete psykologi', credits: 15, year: 3, mandatory: true, category: 'avancerad', field: 'Psykologi' },
];

// Juridik och ekonomi
const juristprogrammetkurser: UniversityCourse[] = [
  // År 1
  { id: 'JU1001', code: 'JU1001', name: 'Introduktion till juridiken', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Juridik' },
  { id: 'JU1002', code: 'JU1002', name: 'Förmögenhetsrätt', credits: 22.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Juridik' },
  { id: 'JU1003', code: 'JU1003', name: 'Associationsrätt', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Juridik' },
  { id: 'JU1004', code: 'JU1004', name: 'Offentlig rätt', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Juridik' },
  
  // År 2
  { id: 'JU2001', code: 'JU2001', name: 'Straffrätt', credits: 22.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Juridik' },
  { id: 'JU2002', code: 'JU2002', name: 'Processrätt', credits: 22.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Juridik' },
  { id: 'JU2003', code: 'JU2003', name: 'Skatterätt', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Juridik' },
  
  // År 3
  { id: 'JU3001', code: 'JU3001', name: 'Arbetsrätt', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Juridik' },
  { id: 'JU3002', code: 'JU3002', name: 'EU-rätt', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Juridik' },
  { id: 'JU3003', code: 'JU3003', name: 'Miljörätt', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Juridik' },
  { id: 'JU3004', code: 'JU3004', name: 'Familjerätt', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Juridik' },
];

const ekonomprogrammetkurser: UniversityCourse[] = [
  // År 1
  { id: 'EK1001', code: 'EK1001', name: 'Företagsekonomi grund', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Ekonomi' },
  { id: 'EK1002', code: 'EK1002', name: 'Mikroekonomi', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Ekonomi' },
  { id: 'EK1003', code: 'EK1003', name: 'Makroekonomi', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Ekonomi' },
  { id: 'ST1001', code: 'ST1001', name: 'Statistik för ekonomer', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Statistik' },
  
  // År 2
  { id: 'EK2001', code: 'EK2001', name: 'Redovisning och bokföring', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'EK2002', code: 'EK2002', name: 'Marknadsföring', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'EK2003', code: 'EK2003', name: 'Finansiell ekonomi', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'EK2004', code: 'EK2004', name: 'Ekonometri', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
  
  // År 3
  { id: 'EK3001', code: 'EK3001', name: 'Strategisk management', credits: 15, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'EK3002', code: 'EK3002', name: 'Internationell ekonomi', credits: 15, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'EK3003', code: 'EK3003', name: 'Corporate Finance', credits: 15, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Ekonomi' },
  { id: 'EK3900', code: 'EK3900', name: 'Kandidatuppsats', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Ekonomi' },
];

// Naturvetenskap
const kandidatBiologikurser: UniversityCourse[] = [
  // År 1
  { id: 'BIO101', code: 'BIO101', name: 'Biologi I', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Biologi' },
  { id: 'KEM101', code: 'KEM101', name: 'Kemi för biologer', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Kemi' },
  { id: 'BIO102', code: 'BIO102', name: 'Cellbiologi', credits: 15, year: 1, mandatory: true, category: 'grundkurs', field: 'Biologi' },
  { id: 'MAT101', code: 'MAT101', name: 'Matematik för biologer', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'STA101', code: 'STA101', name: 'Biostatistik', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Statistik' },
  
  // År 2
  { id: 'BIO201', code: 'BIO201', name: 'Genetik', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Biologi' },
  { id: 'BIO202', code: 'BIO202', name: 'Ekologi', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Biologi' },
  { id: 'BIO203', code: 'BIO203', name: 'Mikrobiologi', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Biologi' },
  { id: 'BIO204', code: 'BIO204', name: 'Evolution', credits: 15, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Biologi' },
  
  // År 3
  { id: 'BIO301', code: 'BIO301', name: 'Molekylärbiologi', credits: 15, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Biologi' },
  { id: 'BIO302', code: 'BIO302', name: 'Fysiologi', credits: 15, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Biologi' },
  { id: 'BIO303', code: 'BIO303', name: 'Biokemi', credits: 15, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Biologi' },
  { id: 'BIO399', code: 'BIO399', name: 'Kandidatarbete biologi', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Biologi' },
];

const kandidatDatavetenskapkurser: UniversityCourse[] = [
  // År 1
  { id: 'CS101', code: 'CS101', name: 'Programmering I', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datavetenskap' },
  { id: 'CS102', code: 'CS102', name: 'Programmering II', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datavetenskap' },
  { id: 'MA101', code: 'MA101', name: 'Matematisk analys', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'MA102', code: 'MA102', name: 'Diskret matematik', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Matematik' },
  { id: 'CS103', code: 'CS103', name: 'Datastrukturer', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datavetenskap' },
  { id: 'CS104', code: 'CS104', name: 'Objektorienterad programmering', credits: 7.5, year: 1, mandatory: true, category: 'grundkurs', field: 'Datavetenskap' },
  
  // År 2
  { id: 'CS201', code: 'CS201', name: 'Algoritmer och datastrukturer', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS202', code: 'CS202', name: 'Databaser', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS203', code: 'CS203', name: 'Operativsystem', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS204', code: 'CS204', name: 'Webbutveckling', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS205', code: 'CS205', name: 'Mjukvaruutveckling', credits: 7.5, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Datavetenskap' },
  
  // År 3
  { id: 'CS301', code: 'CS301', name: 'Maskininlärning', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS302', code: 'CS302', name: 'IT-säkerhet', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS303', code: 'CS303', name: 'Distribuerade system', credits: 7.5, year: 3, mandatory: false, category: 'fördjupningskurs', field: 'Datavetenskap' },
  { id: 'CS399', code: 'CS399', name: 'Kandidatarbete', credits: 15, year: 3, mandatory: true, category: 'fördjupningskurs', field: 'Datavetenskap' },
];

// Lärarutbildningar
const forskollararprogrammetkurser: UniversityCourse[] = [
  // År 1
  { id: 'FÖ1001', code: 'FÖ1001', name: 'Förskolan i samhället', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ1002', code: 'FÖ1002', name: 'Barns utveckling och lärande', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ1003', code: 'FÖ1003', name: 'Verksamhetsförlagd utbildning 1', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ1004', code: 'FÖ1004', name: 'Pedagogiskt ledarskap', credits: 15, year: 1, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  
  // År 2
  { id: 'FÖ2001', code: 'FÖ2001', name: 'Språk och kommunikation', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ2002', code: 'FÖ2002', name: 'Matematik och naturvetenskap', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ2003', code: 'FÖ2003', name: 'Skapande verksamhet', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ2004', code: 'FÖ2004', name: 'Verksamhetsförlagd utbildning 2', credits: 15, year: 2, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  
  // År 3
  { id: 'FÖ3001', code: 'FÖ3001', name: 'Specialpedagogik', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ3002', code: 'FÖ3002', name: 'Verksamhetsförlagd utbildning 3', credits: 22.5, year: 3, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
  { id: 'FÖ3003', code: 'FÖ3003', name: 'Examensarbete', credits: 15, year: 3, mandatory: true, category: 'professionskurs', field: 'Utbildningsvetenskap' },
];

// Yrkeshögskolor
const webbutvecklarekurser: UniversityCourse[] = [
  // År 1
  { id: 'WEB101', code: 'WEB101', name: 'HTML och CSS', credits: 20, year: 1, mandatory: true, category: 'grundkurs', field: 'Webbutveckling' },
  { id: 'WEB102', code: 'WEB102', name: 'JavaScript grund', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Webbutveckling' },
  { id: 'WEB103', code: 'WEB103', name: 'React och moderna ramverk', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Webbutveckling' },
  { id: 'WEB104', code: 'WEB104', name: 'Backend utveckling', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Webbutveckling' },
  { id: 'WEB105', code: 'WEB105', name: 'Databaser', credits: 20, year: 1, mandatory: true, category: 'grundkurs', field: 'Webbutveckling' },
  { id: 'WEB106', code: 'WEB106', name: 'UX/UI Design', credits: 20, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  
  // År 2
  { id: 'WEB201', code: 'WEB201', name: 'Avancerad JavaScript', credits: 30, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Webbutveckling' },
  { id: 'WEB202', code: 'WEB202', name: 'Cloud och DevOps', credits: 20, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Webbutveckling' },
  { id: 'WEB203', code: 'WEB203', name: 'Examensarbete', credits: 30, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Webbutveckling' },
  { id: 'LIA001', code: 'LIA001', name: 'LIA (Lärande i Arbete)', credits: 80, year: 2, mandatory: true, category: 'professionskurs', field: 'Webbutveckling' },
];

const uxDesignerkurser: UniversityCourse[] = [
  // År 1
  { id: 'UX101', code: 'UX101', name: 'Introduktion till UX', credits: 20, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  { id: 'UX102', code: 'UX102', name: 'Användarforskning', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  { id: 'UX103', code: 'UX103', name: 'Prototyping och wireframing', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  { id: 'UX104', code: 'UX104', name: 'Visual Design', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  { id: 'UX105', code: 'UX105', name: 'Interaktionsdesign', credits: 30, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  { id: 'UX106', code: 'UX106', name: 'Frontend för designers', credits: 20, year: 1, mandatory: true, category: 'grundkurs', field: 'Design' },
  
  // År 2
  { id: 'UX201', code: 'UX201', name: 'Avancerad UX', credits: 30, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Design' },
  { id: 'UX202', code: 'UX202', name: 'Design system', credits: 20, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Design' },
  { id: 'UX203', code: 'UX203', name: 'Examensarbete', credits: 30, year: 2, mandatory: true, category: 'fördjupningskurs', field: 'Design' },
  { id: 'LIA002', code: 'LIA002', name: 'LIA (Lärande i Arbete)', credits: 80, year: 2, mandatory: true, category: 'professionskurs', field: 'Design' },
];

// Export all program courses
export const UNIVERSITY_PROGRAM_COURSES: UniversityProgramCourses[] = [
  // Tekniska program - Civilingenjör
  { programId: 'civ_datateknik', programName: 'Civilingenjör - Datateknik', degreeType: 'civilingenjör', courses: civilingenjorDatateknikkurser },
  { programId: 'civ_elektroteknik', programName: 'Civilingenjör - Elektroteknik', degreeType: 'civilingenjör', courses: civilingenjorElektroteknikkurser },
  { programId: 'civ_industriell_ekonomi', programName: 'Civilingenjör - Industriell ekonomi', degreeType: 'civilingenjör', courses: civilingenjorIndustriellEkonomikurser },
  
  // Medicinska program
  { programId: 'lakarprogrammet', programName: 'Läkarprogrammet', degreeType: 'professionsprogram', courses: lakarprogrammetkurser },
  { programId: 'sjukskoterskeprogrammet', programName: 'Sjuksköterskeprogrammet', degreeType: 'professionsprogram', courses: sjukskoterskeprogrammetkurser },
  { programId: 'psykologprogrammet', programName: 'Psykologprogrammet', degreeType: 'professionsprogram', courses: psykologprogrammetkurser },
  
  // Juridik och ekonomi
  { programId: 'juristprogrammet', programName: 'Juristprogrammet', degreeType: 'professionsprogram', courses: juristprogrammetkurser },
  { programId: 'ekonomprogrammet', programName: 'Ekonomprogrammet', degreeType: 'kandidat', courses: ekonomprogrammetkurser },
  
  // Naturvetenskap
  { programId: 'kand_biologi', programName: 'Kandidatprogram i biologi', degreeType: 'kandidat', courses: kandidatBiologikurser },
  { programId: 'kand_datavetenskap', programName: 'Kandidatprogram i datavetenskap', degreeType: 'kandidat', courses: kandidatDatavetenskapkurser },
  
  // Lärarutbildningar
  { programId: 'forskollararprogrammet', programName: 'Förskollärarprogrammet', degreeType: 'professionsprogram', courses: forskollararprogrammetkurser },
  
  // Yrkeshögskolor
  { programId: 'webbutvecklare', programName: 'Webbutvecklare', degreeType: 'yrkeshögskola', courses: webbutvecklarekurser },
  { programId: 'ux_designer', programName: 'UX Designer', degreeType: 'yrkeshögskola', courses: uxDesignerkurser },
];

// Helper functions
export function getCoursesForUniversityProgram(programId: string, year?: 1 | 2 | 3 | 4 | 5): UniversityCourse[] {
  const program = UNIVERSITY_PROGRAM_COURSES.find(p => p.programId === programId);
  
  if (!program) {
    console.log('University program not found:', programId);
    return [];
  }
  
  if (year) {
    return program.courses.filter(course => course.year === year);
  }
  
  return program.courses;
}

export function getMandatoryCoursesForYear(programId: string, year: 1 | 2 | 3 | 4 | 5): UniversityCourse[] {
  return getCoursesForUniversityProgram(programId, year).filter(course => course.mandatory);
}

export function getElectiveCoursesForYear(programId: string, year: 1 | 2 | 3 | 4 | 5): UniversityCourse[] {
  return getCoursesForUniversityProgram(programId, year).filter(course => !course.mandatory);
}

export function getTotalCreditsForYear(programId: string, year: 1 | 2 | 3 | 4 | 5): number {
  const courses = getCoursesForUniversityProgram(programId, year);
  return courses.reduce((sum, course) => sum + course.credits, 0);
}

export function getProgramByProgramId(programId: string): UniversityProgramCourses | undefined {
  return UNIVERSITY_PROGRAM_COURSES.find(p => p.programId === programId);
}
