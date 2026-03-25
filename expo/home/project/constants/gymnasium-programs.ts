// Gymnasieprogram mappade till specifika skolor
// Default-listan används för skolor som inte har specifik mappning

const allPrograms = [
  'Naturvetenskapsprogrammet',
  'Teknikprogrammet',
  'Samhällsvetenskapsprogrammet',
  'Ekonomiprogrammet',
  'Estetiska programmet',
  'Humanistiska programmet',
  'Barn- och fritidsprogrammet',
  'Bygg- och anläggningsprogrammet',
  'El- och energiprogrammet',
  'Fordons- och transportprogrammet',
  'Handels- och administrationsprogrammet',
  'Hantverksprogrammet',
  'Hotell- och turismprogrammet',
  'Industritekniska programmet',
  'Naturbruksprogrammet',
  'Restaurang- och livsmedelsprogrammet',
  'VVS- och fastighetsprogrammet',
  'Vård- och omsorgsprogrammet',
  'International Baccalaureate',
];

// Specifika program för vissa skolor
export const gymnasiumPrograms: { [key: string]: string[] } = {
  // Stockholm - Stora akademiska gymnasier
  'Kungsholmens gymnasium': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
  ],
  'Norra Real': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Teknikprogrammet',
  ],
  'Södra Latin': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Ekonomiprogrammet',
    'Humanistiska programmet',
  ],
  'Östra Real': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Ekonomiprogrammet',
  ],
  'Viktor Rydberg gymnasium': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
  ],
  
  // Tekniska gymnasier
  'NTI-gymnasiet Umeå': [
    'Teknikprogrammet',
    'El- och energiprogrammet',
  ],
  
  // Estetiska gymnasier
  'Stockholms estetiska gymnasium': [
    'Estetiska programmet',
  ],
  
  // IB-skolor
  'International High School of the Gothenburg Region': [
    'International Baccalaureate',
  ],
  'Sigtunaskolan Humanistiska Läroverket': [
    'International Baccalaureate',
    'Samhällsvetenskapsprogrammet',
    'Naturvetenskapsprogrammet',
  ],
  
  // Göteborg
  'Hvitfeldtska gymnasiet': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'International Baccalaureate',
  ],
  'Katrinelundsgymnasiet': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Ekonomiprogrammet',
  ],
  'Polhemsgymnasiet': [
    'Teknikprogrammet',
    'Naturvetenskapsprogrammet',
    'Industritekniska programmet',
  ],
  'Schillerska gymnasiet': [
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
    'Estetiska programmet',
  ],
  
  // Malmö
  'Malmö Borgarskola': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Ekonomiprogrammet',
  ],
  'Malmö latinskola': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
  ],
  'Malmö idrottsgymnasium': [
    'Samhällsvetenskapsprogrammet',
    'Naturvetenskapsprogrammet',
    'Ekonomiprogrammet',
  ],
  
  // Uppsala
  'Katedralskolan': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
    'Estetiska programmet',
  ],
  'Lundellska skolan': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Ekonomiprogrammet',
  ],
  'Fyrisskolan': [
    'Naturvetenskapsprogrammet',
    'Teknikprogrammet',
    'Samhällsvetenskapsprogrammet',
  ],
  'Celsiusskolan': [
    'Teknikprogrammet',
    'El- och energiprogrammet',
    'Industritekniska programmet',
  ],
  
  // Linköping
  'Berzeliusskolan': [
    'Naturvetenskapsprogrammet',
    'Teknikprogrammet',
  ],
  'Folkungaskolan': [
    'Samhällsvetenskapsprogrammet',
    'Ekonomiprogrammet',
    'Estetiska programmet',
  ],
  'Katedralskolan Linköping': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
  ],
  
  // Lund
  'Katedralskolan Lund': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Humanistiska programmet',
    'International Baccalaureate',
  ],
  'Polhemskolan': [
    'Teknikprogrammet',
    'Naturvetenskapsprogrammet',
  ],
  'Spyken': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
    'Estetiska programmet',
  ],
  
  // Yrkesinriktade gymnasier
  'Bäckängsgymnasiet': [
    'Bygg- och anläggningsprogrammet',
    'El- och energiprogrammet',
    'VVS- och fastighetsprogrammet',
  ],
  'Sven Eriksonsgymnasiet': [
    'Vård- och omsorgsprogrammet',
    'Barn- och fritidsprogrammet',
  ],
  'Burgårdens gymnasium': [
    'Restaurang- och livsmedelsprogrammet',
    'Hotell- och turismprogrammet',
  ],
  
  // Naturbruksgymnasier
  'Svenljunga gymnasium': [
    'Naturbruksprogrammet',
  ],
  'Öckerö seglande gymnasieskola': [
    'Naturvetenskapsprogrammet',
    'Samhällsvetenskapsprogrammet',
  ],
  
  // Default för övriga skolor
  'default': allPrograms,
};

// Helper function för att hämta program för en skola
export function getProgramsForGymnasium(gymnasium: string): string[] {
  return gymnasiumPrograms[gymnasium] || gymnasiumPrograms['default'];
}

export type GymnasiumProgram = typeof allPrograms[number];