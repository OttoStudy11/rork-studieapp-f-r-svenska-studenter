export interface Gymnasium {
  id: string;
  name: string;
  city: string;
  municipality: string;
  type: 'kommunal' | 'friskola' | 'privat';
}

export type GymnasiumGrade = '1' | '2' | '3';

export interface GymnasiumSelection {
  gymnasium: Gymnasium;
  grade: GymnasiumGrade;
}

export const SWEDISH_GYMNASIUMS: Gymnasium[] = [
  // =====================================================
  // STOCKHOLM REGION
  // =====================================================
  
  // Stockholm Stad - Kommunala
  { id: 'sto-1', name: 'Blackebergs gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-2', name: 'Bromma gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-3', name: 'Enskede gårds gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-4', name: 'Farsta gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-5', name: 'Globala gymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-6', name: 'Kungsholmens gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-7', name: 'Kulturama gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-8', name: 'Norra Real', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-9', name: 'Östra Real', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-10', name: 'S:t Eriks gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-11', name: 'Södra Latins gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-12', name: 'Thorildsplans gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-13', name: 'Stockholms Idrottsgymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-14', name: 'Stockholms hotell- och restaurangskola', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-15', name: 'Frans Schartaus gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-16', name: 'Anna Whitlocks gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-17', name: 'Kärrtorps gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-18', name: 'Skarpnäcks gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-19', name: 'Åsö gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-20', name: 'Bernadottegymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  
  // Stockholm - Friskolor
  { id: 'sto-21', name: 'Viktor Rydberg Gymnasium Odenplan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-22', name: 'Viktor Rydberg Gymnasium Jarlaplan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-23', name: 'Enskilda gymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-24', name: 'Stockholms Enskilda Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-25', name: 'Jensen Gymnasium Stockholm City', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-26', name: 'Jensen Gymnasium Norra', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-27', name: 'Jensen Gymnasium Gamla Stan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-28', name: 'NTI Gymnasiet Stockholm City', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-29', name: 'NTI Gymnasiet Södertörn', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-30', name: 'LBS Kreativa Gymnasiet Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-31', name: 'Sjölins Gymnasium Södermalm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-32', name: 'Sjölins Gymnasium Vasastan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-33', name: 'ProCivitas Privata Gymnasium Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-34', name: 'Rytmus Musikergymnasiet Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-35', name: 'Fredrika Bremer-gymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-36', name: 'Thoren Business School Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-37', name: 'Kunskapsgymnasiet Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-38', name: 'Stockholms fria gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-39', name: 'Medborgarskolan gymnasium Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-40', name: 'Klara gymnasium Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-41', name: 'Hermods gymnasium Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },

  // Solna
  { id: 'sol-1', name: 'Solna gymnasium', city: 'Solna', municipality: 'Solna', type: 'kommunal' },
  { id: 'sol-2', name: 'Washington Internship High School', city: 'Solna', municipality: 'Solna', type: 'friskola' },

  // Sundbyberg
  { id: 'sub-1', name: 'Sundbybergs gymnasium', city: 'Sundbyberg', municipality: 'Sundbyberg', type: 'kommunal' },

  // Nacka
  { id: 'nac-1', name: 'Nacka gymnasium', city: 'Nacka', municipality: 'Nacka', type: 'kommunal' },
  { id: 'nac-2', name: 'Sickla gymnasium', city: 'Nacka', municipality: 'Nacka', type: 'kommunal' },
  { id: 'nac-3', name: 'Design & Construction College', city: 'Nacka', municipality: 'Nacka', type: 'friskola' },
  { id: 'nac-4', name: 'Viktor Rydberg Gymnasium Nacka', city: 'Nacka', municipality: 'Nacka', type: 'friskola' },

  // Danderyd
  { id: 'dan-1', name: 'Danderyds gymnasium', city: 'Danderyd', municipality: 'Danderyd', type: 'kommunal' },
  { id: 'dan-2', name: 'Viktor Rydberg Gymnasium Djursholm', city: 'Danderyd', municipality: 'Danderyd', type: 'friskola' },

  // Täby
  { id: 'tab-1', name: 'Åva gymnasium', city: 'Täby', municipality: 'Täby', type: 'kommunal' },
  { id: 'tab-2', name: 'Täby Enskilda gymnasium', city: 'Täby', municipality: 'Täby', type: 'friskola' },
  { id: 'tab-3', name: 'Tibble Fristående gymnasium', city: 'Täby', municipality: 'Täby', type: 'friskola' },

  // Lidingö
  { id: 'lid-1', name: 'Hersby gymnasium', city: 'Lidingö', municipality: 'Lidingö', type: 'kommunal' },
  { id: 'lid-2', name: 'Gångsätra gymnasium', city: 'Lidingö', municipality: 'Lidingö', type: 'kommunal' },

  // Sollentuna
  { id: 'soll-1', name: 'Rudbecksskolan', city: 'Sollentuna', municipality: 'Sollentuna', type: 'kommunal' },
  { id: 'soll-2', name: 'Sollentuna gymnasium', city: 'Sollentuna', municipality: 'Sollentuna', type: 'kommunal' },
  { id: 'soll-3', name: 'Jensen Gymnasium Sollentuna', city: 'Sollentuna', municipality: 'Sollentuna', type: 'friskola' },

  // Järfälla
  { id: 'jar-1', name: 'Jakobsbergs gymnasium', city: 'Järfälla', municipality: 'Järfälla', type: 'kommunal' },
  { id: 'jar-2', name: 'IT-Gymnasiet Jakobsberg', city: 'Järfälla', municipality: 'Järfälla', type: 'friskola' },

  // Upplands Väsby
  { id: 'upv-1', name: 'Vilunda gymnasium', city: 'Upplands Väsby', municipality: 'Upplands Väsby', type: 'kommunal' },

  // Sigtuna
  { id: 'sig-1', name: 'Arlandagymnasiet', city: 'Sigtuna', municipality: 'Sigtuna', type: 'kommunal' },
  { id: 'sig-2', name: 'Sigtunaskolan Humanistiska Läroverket', city: 'Sigtuna', municipality: 'Sigtuna', type: 'friskola' },

  // Vallentuna
  { id: 'val-1', name: 'Vallentuna gymnasium', city: 'Vallentuna', municipality: 'Vallentuna', type: 'kommunal' },

  // Norrtälje
  { id: 'nrt-1', name: 'Rodengymnasiet', city: 'Norrtälje', municipality: 'Norrtälje', type: 'kommunal' },

  // Huddinge
  { id: 'hud-1', name: 'Huddinge gymnasium', city: 'Huddinge', municipality: 'Huddinge', type: 'kommunal' },
  { id: 'hud-2', name: 'Sjödalsgymnasiet', city: 'Huddinge', municipality: 'Huddinge', type: 'kommunal' },
  { id: 'hud-3', name: 'Södertörns friskola', city: 'Huddinge', municipality: 'Huddinge', type: 'friskola' },

  // Botkyrka
  { id: 'bot-1', name: 'Tumba gymnasium', city: 'Botkyrka', municipality: 'Botkyrka', type: 'kommunal' },
  { id: 'bot-2', name: 'Botkyrka gymnasium', city: 'Botkyrka', municipality: 'Botkyrka', type: 'kommunal' },

  // Haninge
  { id: 'han-1', name: 'Fredrika Bremergymnasiet', city: 'Haninge', municipality: 'Haninge', type: 'kommunal' },

  // Södertälje
  { id: 'sod-1', name: 'Torekällgymnasiet', city: 'Södertälje', municipality: 'Södertälje', type: 'kommunal' },
  { id: 'sod-2', name: 'Täljegymnasiet', city: 'Södertälje', municipality: 'Södertälje', type: 'kommunal' },
  { id: 'sod-3', name: 'Fornbygymnasiet', city: 'Södertälje', municipality: 'Södertälje', type: 'kommunal' },

  // Nynäshamn
  { id: 'nyn-1', name: 'Nynäshamns gymnasium', city: 'Nynäshamn', municipality: 'Nynäshamn', type: 'kommunal' },

  // Tyresö
  { id: 'tyr-1', name: 'Tyresö gymnasium', city: 'Tyresö', municipality: 'Tyresö', type: 'kommunal' },

  // =====================================================
  // GÖTEBORG REGION
  // =====================================================
  
  // Göteborg - Kommunala
  { id: 'got-1', name: 'Hvitfeldtska gymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-2', name: 'Schillerska gymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-3', name: 'Polhemsgymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-4', name: 'Burgårdens utbildningscentrum', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-5', name: 'Angeredsgymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-6', name: 'Katrinelundsgymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-7', name: 'Lindholmens tekniska gymnasium', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-8', name: 'Bräckegymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-9', name: 'Ester Mosessons gymnasium', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-10', name: 'Munkebäcksgymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-11', name: 'Donnergymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  
  // Göteborg - Friskolor
  { id: 'got-12', name: 'Göteborgs Högre Samskola', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-13', name: 'Jensen Gymnasium Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-14', name: 'NTI Gymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-15', name: 'LBS Kreativa Gymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-16', name: 'Praktiska Gymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-17', name: 'Kunskapsgymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-18', name: 'Rytmus Musikergymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-19', name: 'Thoren Business School Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-20', name: 'IT-Gymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-21', name: 'Drottning Blankas Gymnasieskola Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-22', name: 'Mediegymnasiet Göteborg', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },

  // Mölndal
  { id: 'mol-1', name: 'Fässbergsgymnasiet', city: 'Mölndal', municipality: 'Mölndal', type: 'kommunal' },
  { id: 'mol-2', name: 'Krokslättsgymnasiet', city: 'Mölndal', municipality: 'Mölndal', type: 'kommunal' },

  // Partille
  { id: 'par-1', name: 'Partille gymnasium', city: 'Partille', municipality: 'Partille', type: 'kommunal' },

  // Kungsbacka
  { id: 'kun-1', name: 'Elof Lindälvs gymnasium', city: 'Kungsbacka', municipality: 'Kungsbacka', type: 'kommunal' },
  { id: 'kun-2', name: 'Aranäsgymnasiet', city: 'Kungsbacka', municipality: 'Kungsbacka', type: 'kommunal' },

  // Lerum
  { id: 'ler-1', name: 'Lerums gymnasium', city: 'Lerum', municipality: 'Lerum', type: 'kommunal' },

  // Alingsås
  { id: 'ali-1', name: 'Alströmergymnasiet', city: 'Alingsås', municipality: 'Alingsås', type: 'kommunal' },

  // =====================================================
  // MALMÖ REGION (SKÅNE)
  // =====================================================
  
  // Malmö - Kommunala
  { id: 'mal-1', name: 'Malmö Latinskola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-2', name: 'Malmö Borgarskola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-3', name: 'Pauliskolan', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-4', name: 'Heleneholms gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-5', name: 'S:t Petri skola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-6', name: 'Malmö Idrottsgymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-7', name: 'Universitetsholmens gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-8', name: 'Norra Sorgenfri gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-9', name: 'Jörgen Kocks gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  
  // Malmö - Friskolor
  { id: 'mal-10', name: 'Jensen Gymnasium Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-11', name: 'NTI Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-12', name: 'LBS Kreativa Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-13', name: 'Praktiska Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-14', name: 'Kunskapsgymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-15', name: 'ProCivitas Privata Gymnasium Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-16', name: 'Thoren Business School Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-17', name: 'Drottning Blankas Gymnasieskola Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-18', name: 'Rytmus Musikergymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-19', name: 'IT-Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },

  // Lund
  { id: 'lun-1', name: 'Katedralskolan Lund', city: 'Lund', municipality: 'Lund', type: 'kommunal' },
  { id: 'lun-2', name: 'Spyken', city: 'Lund', municipality: 'Lund', type: 'kommunal' },
  { id: 'lun-3', name: 'Polhemskolan Lund', city: 'Lund', municipality: 'Lund', type: 'kommunal' },
  { id: 'lun-4', name: 'Vipan', city: 'Lund', municipality: 'Lund', type: 'kommunal' },
  { id: 'lun-5', name: 'Jensen Gymnasium Lund', city: 'Lund', municipality: 'Lund', type: 'friskola' },

  // Helsingborg
  { id: 'hel-1', name: 'Olympiaskolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-2', name: 'Nicolaiskolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-3', name: 'Rönnowska skolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-4', name: 'Filbornaskolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-5', name: 'Wieselgrensskolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-6', name: 'NTI Gymnasiet Helsingborg', city: 'Helsingborg', municipality: 'Helsingborg', type: 'friskola' },
  { id: 'hel-7', name: 'Jensen Gymnasium Helsingborg', city: 'Helsingborg', municipality: 'Helsingborg', type: 'friskola' },

  // Landskrona
  { id: 'lan-1', name: 'Lärande i Landskrona', city: 'Landskrona', municipality: 'Landskrona', type: 'kommunal' },

  // Trelleborg
  { id: 'tre-1', name: 'Söderslättsgymnasiet', city: 'Trelleborg', municipality: 'Trelleborg', type: 'kommunal' },

  // Ystad
  { id: 'ysta-1', name: 'Österportgymnasiet', city: 'Ystad', municipality: 'Ystad', type: 'kommunal' },

  // Kristianstad
  { id: 'kri-1', name: 'Wendesgymnasiet', city: 'Kristianstad', municipality: 'Kristianstad', type: 'kommunal' },
  { id: 'kri-2', name: 'Söderportgymnasiet', city: 'Kristianstad', municipality: 'Kristianstad', type: 'kommunal' },
  { id: 'kri-3', name: 'Christian IV:s gymnasium', city: 'Kristianstad', municipality: 'Kristianstad', type: 'kommunal' },

  // Ängelholm
  { id: 'ang-1', name: 'Rönnegymnasiet', city: 'Ängelholm', municipality: 'Ängelholm', type: 'kommunal' },

  // Eslöv
  { id: 'esl-1', name: 'Eslövs gymnasium', city: 'Eslöv', municipality: 'Eslöv', type: 'kommunal' },

  // Hässleholm
  { id: 'has-1', name: 'Hässleholms gymnasium', city: 'Hässleholm', municipality: 'Hässleholm', type: 'kommunal' },

  // =====================================================
  // UPPSALA REGION
  // =====================================================
  
  { id: 'upp-1', name: 'Katedralskolan Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-2', name: 'Fyrisskolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-3', name: 'Rosendalsgymnasiet', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-4', name: 'Lundellska skolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-5', name: 'Bolandgymnasiet', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-6', name: 'Celsiusskolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-7', name: 'Jensen Gymnasium Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-8', name: 'NTI Gymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-9', name: 'Kunskapsgymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-10', name: 'LBS Kreativa Gymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-11', name: 'Thoren Business School Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },

  // =====================================================
  // VÄSTRA GÖTALAND
  // =====================================================
  
  // Borås
  { id: 'bor-1', name: 'Sven Eriksonsgymnasiet', city: 'Borås', municipality: 'Borås', type: 'kommunal' },
  { id: 'bor-2', name: 'Almåsgymnasiet', city: 'Borås', municipality: 'Borås', type: 'kommunal' },
  { id: 'bor-3', name: 'Bäckängsgymnasiet', city: 'Borås', municipality: 'Borås', type: 'kommunal' },
  { id: 'bor-4', name: 'Viskastrandsgymnasiet', city: 'Borås', municipality: 'Borås', type: 'kommunal' },

  // Trollhättan
  { id: 'tro-1', name: 'Nils Ericsongymnasiet', city: 'Trollhättan', municipality: 'Trollhättan', type: 'kommunal' },
  { id: 'tro-2', name: 'Magnus Åbergsgymnasiet', city: 'Trollhättan', municipality: 'Trollhättan', type: 'kommunal' },

  // Uddevalla
  { id: 'udd-1', name: 'Uddevalla gymnasieskola', city: 'Uddevalla', municipality: 'Uddevalla', type: 'kommunal' },

  // Skövde
  { id: 'sko-1', name: 'Kavelbro gymnasium', city: 'Skövde', municipality: 'Skövde', type: 'kommunal' },
  { id: 'sko-2', name: 'Västerhöjdsgymnasiet', city: 'Skövde', municipality: 'Skövde', type: 'kommunal' },

  // Lidköping
  { id: 'lidk-1', name: 'De la Gardiegymnasiet', city: 'Lidköping', municipality: 'Lidköping', type: 'kommunal' },

  // Mariestad
  { id: 'mar-1', name: 'Vadsbogymnasiet', city: 'Mariestad', municipality: 'Mariestad', type: 'kommunal' },

  // Falköping
  { id: 'falk-1', name: 'Ållebergsgymnasiet', city: 'Falköping', municipality: 'Falköping', type: 'kommunal' },

  // Varberg
  { id: 'var-1', name: 'Peder Skrivares skola', city: 'Varberg', municipality: 'Varberg', type: 'kommunal' },

  // Falkenberg
  { id: 'falke-1', name: 'Falkenbergs gymnasium', city: 'Falkenberg', municipality: 'Falkenberg', type: 'kommunal' },

  // =====================================================
  // ÖSTERGÖTLAND
  // =====================================================
  
  // Linköping
  { id: 'lin-1', name: 'Katedralskolan Linköping', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-2', name: 'Berzeliusskolan', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-3', name: 'Birgittaskolan', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-4', name: 'Folkungaskolan', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-5', name: 'Jensen Gymnasium Linköping', city: 'Linköping', municipality: 'Linköping', type: 'friskola' },
  { id: 'lin-6', name: 'NTI Gymnasiet Linköping', city: 'Linköping', municipality: 'Linköping', type: 'friskola' },
  { id: 'lin-7', name: 'Kunskapsgymnasiet Linköping', city: 'Linköping', municipality: 'Linköping', type: 'friskola' },

  // Norrköping
  { id: 'nor-1', name: 'De Geergymnasiet', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },
  { id: 'nor-2', name: 'Ebersteinska gymnasiet', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },
  { id: 'nor-3', name: 'Hagagymnasiet', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },
  { id: 'nor-4', name: 'NTI Gymnasiet Norrköping', city: 'Norrköping', municipality: 'Norrköping', type: 'friskola' },

  // Motala
  { id: 'mot-1', name: 'Platengymnasiet', city: 'Motala', municipality: 'Motala', type: 'kommunal' },

  // =====================================================
  // ÖREBRO LÄN
  // =====================================================
  
  { id: 'ore-1', name: 'Karolinska gymnasiet', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-2', name: 'Virginska gymnasiet', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-3', name: 'Risbergska gymnasiet', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-4', name: 'Rudbecksskolan Örebro', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-5', name: 'Tullängsskolan', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-6', name: 'NTI Gymnasiet Örebro', city: 'Örebro', municipality: 'Örebro', type: 'friskola' },
  { id: 'ore-7', name: 'Jensen Gymnasium Örebro', city: 'Örebro', municipality: 'Örebro', type: 'friskola' },
  { id: 'ore-8', name: 'Praktiska Gymnasiet Örebro', city: 'Örebro', municipality: 'Örebro', type: 'friskola' },

  // Karlskoga
  { id: 'ksko-1', name: 'Möckelngymnasiet', city: 'Karlskoga', municipality: 'Karlskoga', type: 'kommunal' },

  // =====================================================
  // VÄSTMANLAND
  // =====================================================
  
  // Västerås
  { id: 'vas-1', name: 'Rudbeckianska gymnasiet', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-2', name: 'Carlforsska gymnasiet', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-3', name: 'John Bauergymnasiet Västerås', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-4', name: 'Widénska gymnasiet', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-5', name: 'NTI Gymnasiet Västerås', city: 'Västerås', municipality: 'Västerås', type: 'friskola' },
  { id: 'vas-6', name: 'IT-Gymnasiet Västerås', city: 'Västerås', municipality: 'Västerås', type: 'friskola' },

  // Sala
  { id: 'sala-1', name: 'Kungsängsskolan', city: 'Sala', municipality: 'Sala', type: 'kommunal' },

  // =====================================================
  // SÖDERMANLAND
  // =====================================================
  
  // Eskilstuna
  { id: 'esk-1', name: 'Rekarnegymnasiet', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'kommunal' },
  { id: 'esk-2', name: 'Carl Engströmgymnasiet', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'kommunal' },
  { id: 'esk-3', name: 'Rinmangymnasiet', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'kommunal' },
  { id: 'esk-4', name: 'NTI Gymnasiet Eskilstuna', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'friskola' },

  // Nyköping
  { id: 'nyk-1', name: 'Nyköpings gymnasium', city: 'Nyköping', municipality: 'Nyköping', type: 'kommunal' },
  { id: 'nyk-2', name: 'Gripengymnasiet', city: 'Nyköping', municipality: 'Nyköping', type: 'kommunal' },

  // Strängnäs
  { id: 'str-1', name: 'Thomasgymnasiet', city: 'Strängnäs', municipality: 'Strängnäs', type: 'kommunal' },

  // Katrineholm
  { id: 'kat-1', name: 'Lindengymnasiet', city: 'Katrineholm', municipality: 'Katrineholm', type: 'kommunal' },

  // =====================================================
  // JÖNKÖPINGS LÄN
  // =====================================================
  
  // Jönköping
  { id: 'jon-1', name: 'Per Brahegymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-2', name: 'Sandagymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-3', name: 'Bäckadalsgymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-4', name: 'Erik Dahlbergsgymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-5', name: 'Jensen Gymnasium Jönköping', city: 'Jönköping', municipality: 'Jönköping', type: 'friskola' },
  { id: 'jon-6', name: 'NTI Gymnasiet Jönköping', city: 'Jönköping', municipality: 'Jönköping', type: 'friskola' },
  { id: 'jon-7', name: 'Kunskapsgymnasiet Jönköping', city: 'Jönköping', municipality: 'Jönköping', type: 'friskola' },

  // Värnamo
  { id: 'varn-1', name: 'Finnvedens gymnasium', city: 'Värnamo', municipality: 'Värnamo', type: 'kommunal' },

  // Nässjö
  { id: 'nas-1', name: 'Brinellgymnasiet', city: 'Nässjö', municipality: 'Nässjö', type: 'kommunal' },

  // =====================================================
  // KRONOBERGS LÄN
  // =====================================================
  
  // Växjö
  { id: 'vax-1', name: 'Katedralskolan Växjö', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-2', name: 'Kungsmadskolan', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-3', name: 'Teknikum', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-4', name: 'Allbo lärcenter', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-5', name: 'Jensen Gymnasium Växjö', city: 'Växjö', municipality: 'Växjö', type: 'friskola' },
  { id: 'vax-6', name: 'NTI Gymnasiet Växjö', city: 'Växjö', municipality: 'Växjö', type: 'friskola' },
  { id: 'vax-7', name: 'Praktiska Gymnasiet Växjö', city: 'Växjö', municipality: 'Växjö', type: 'friskola' },

  // Ljungby
  { id: 'lju-1', name: 'Sunnerbogymnasiet', city: 'Ljungby', municipality: 'Ljungby', type: 'kommunal' },

  // =====================================================
  // KALMAR LÄN
  // =====================================================
  
  // Kalmar
  { id: 'kal-1', name: 'Stagneliusskolan', city: 'Kalmar', municipality: 'Kalmar', type: 'kommunal' },
  { id: 'kal-2', name: 'Lars Kaggskolan', city: 'Kalmar', municipality: 'Kalmar', type: 'kommunal' },
  { id: 'kal-3', name: 'Jenny Nyströmskolan', city: 'Kalmar', municipality: 'Kalmar', type: 'kommunal' },
  { id: 'kal-4', name: 'NTI Gymnasiet Kalmar', city: 'Kalmar', municipality: 'Kalmar', type: 'friskola' },

  // Oskarshamn
  { id: 'osk-1', name: 'Oscarsgymnasiet', city: 'Oskarshamn', municipality: 'Oskarshamn', type: 'kommunal' },

  // Västervik
  { id: 'vvik-1', name: 'Västerviks gymnasium', city: 'Västervik', municipality: 'Västervik', type: 'kommunal' },

  // =====================================================
  // BLEKINGE LÄN
  // =====================================================
  
  // Karlskrona
  { id: 'kar-1', name: 'Chapmangymnasiet', city: 'Karlskrona', municipality: 'Karlskrona', type: 'kommunal' },
  { id: 'kar-2', name: 'Törnströmska gymnasiet', city: 'Karlskrona', municipality: 'Karlskrona', type: 'kommunal' },

  // Karlshamn
  { id: 'kham-1', name: 'Väggaskolan', city: 'Karlshamn', municipality: 'Karlshamn', type: 'kommunal' },

  // =====================================================
  // GOTLAND
  // =====================================================
  
  { id: 'vis-1', name: 'Wisbygymnasiet', city: 'Visby', municipality: 'Gotland', type: 'kommunal' },

  // =====================================================
  // HALLAND
  // =====================================================
  
  // Halmstad
  { id: 'hal-1', name: 'Kattegattgymnasiet', city: 'Halmstad', municipality: 'Halmstad', type: 'kommunal' },
  { id: 'hal-2', name: 'Sannarpsgymnasiet', city: 'Halmstad', municipality: 'Halmstad', type: 'kommunal' },
  { id: 'hal-3', name: 'Sturegymnasiet', city: 'Halmstad', municipality: 'Halmstad', type: 'kommunal' },
  { id: 'hal-4', name: 'NTI Gymnasiet Halmstad', city: 'Halmstad', municipality: 'Halmstad', type: 'friskola' },

  // Laholm
  { id: 'lah-1', name: 'Osbecksgymnasiet', city: 'Laholm', municipality: 'Laholm', type: 'kommunal' },

  // =====================================================
  // VÄRMLAND
  // =====================================================
  
  // Karlstad
  { id: 'kstad-1', name: 'Tingvalla gymnasium', city: 'Karlstad', municipality: 'Karlstad', type: 'kommunal' },
  { id: 'kstad-2', name: 'Sundsta-Älvkullegymnasiet', city: 'Karlstad', municipality: 'Karlstad', type: 'kommunal' },
  { id: 'kstad-3', name: 'Nobelgymnasiet', city: 'Karlstad', municipality: 'Karlstad', type: 'kommunal' },
  { id: 'kstad-4', name: 'NTI Gymnasiet Karlstad', city: 'Karlstad', municipality: 'Karlstad', type: 'friskola' },
  { id: 'kstad-5', name: 'Jensen Gymnasium Karlstad', city: 'Karlstad', municipality: 'Karlstad', type: 'friskola' },
  { id: 'kstad-6', name: 'Drottning Blankas Gymnasieskola Karlstad', city: 'Karlstad', municipality: 'Karlstad', type: 'friskola' },

  // Arvika
  { id: 'arv-1', name: 'Solbergagymnasiet', city: 'Arvika', municipality: 'Arvika', type: 'kommunal' },

  // Kristinehamn
  { id: 'kris-1', name: 'Brogårdsgymnasiet', city: 'Kristinehamn', municipality: 'Kristinehamn', type: 'kommunal' },

  // =====================================================
  // DALARNA
  // =====================================================
  
  // Falun
  { id: 'fal-1', name: 'Lugnetgymnasiet', city: 'Falun', municipality: 'Falun', type: 'kommunal' },
  { id: 'fal-2', name: 'Kristine gymnasium', city: 'Falun', municipality: 'Falun', type: 'kommunal' },
  { id: 'fal-3', name: 'Soltorgsgymnasiet', city: 'Falun', municipality: 'Falun', type: 'kommunal' },

  // Borlänge
  { id: 'borl-1', name: 'Hagaskolan', city: 'Borlänge', municipality: 'Borlänge', type: 'kommunal' },
  { id: 'borl-2', name: 'Erikslunds gymnasium', city: 'Borlänge', municipality: 'Borlänge', type: 'kommunal' },

  // Mora
  { id: 'mora-1', name: 'Moragymnasiet', city: 'Mora', municipality: 'Mora', type: 'kommunal' },

  // Ludvika
  { id: 'ludv-1', name: 'Ludvika gymnasium', city: 'Ludvika', municipality: 'Ludvika', type: 'kommunal' },

  // Leksand
  { id: 'leks-1', name: 'Leksands gymnasium', city: 'Leksand', municipality: 'Leksand', type: 'kommunal' },

  // =====================================================
  // GÄVLEBORG
  // =====================================================
  
  // Gävle
  { id: 'gav-1', name: 'Vasaskolan', city: 'Gävle', municipality: 'Gävle', type: 'kommunal' },
  { id: 'gav-2', name: 'Polhemsskolan Gävle', city: 'Gävle', municipality: 'Gävle', type: 'kommunal' },
  { id: 'gav-3', name: 'Borgarskolan', city: 'Gävle', municipality: 'Gävle', type: 'kommunal' },
  { id: 'gav-4', name: 'NTI Gymnasiet Gävle', city: 'Gävle', municipality: 'Gävle', type: 'friskola' },
  { id: 'gav-5', name: 'Jensen Gymnasium Gävle', city: 'Gävle', municipality: 'Gävle', type: 'friskola' },

  // Sandviken
  { id: 'san-1', name: 'Bessemerskolan', city: 'Sandviken', municipality: 'Sandviken', type: 'kommunal' },
  { id: 'san-2', name: 'Göranssonska skolan', city: 'Sandviken', municipality: 'Sandviken', type: 'friskola' },

  // Hudiksvall
  { id: 'hudk-1', name: 'Bromangymnasiet', city: 'Hudiksvall', municipality: 'Hudiksvall', type: 'kommunal' },

  // Bollnäs
  { id: 'bol-1', name: 'Torsbergsgymnasiet', city: 'Bollnäs', municipality: 'Bollnäs', type: 'kommunal' },

  // Söderhamn
  { id: 'sodh-1', name: 'Staffangymnasiet', city: 'Söderhamn', municipality: 'Söderhamn', type: 'kommunal' },

  // =====================================================
  // VÄSTERNORRLAND
  // =====================================================
  
  // Sundsvall
  { id: 'sun-1', name: 'Hedbergska skolan', city: 'Sundsvall', municipality: 'Sundsvall', type: 'kommunal' },
  { id: 'sun-2', name: 'Västermalms skola', city: 'Sundsvall', municipality: 'Sundsvall', type: 'kommunal' },
  { id: 'sun-3', name: 'Sundsvalls gymnasium', city: 'Sundsvall', municipality: 'Sundsvall', type: 'kommunal' },
  { id: 'sun-4', name: 'NTI Gymnasiet Sundsvall', city: 'Sundsvall', municipality: 'Sundsvall', type: 'friskola' },

  // Härnösand
  { id: 'har-1', name: 'Härnösands gymnasium', city: 'Härnösand', municipality: 'Härnösand', type: 'kommunal' },

  // Örnsköldsvik
  { id: 'orn-1', name: 'Nolaskolan', city: 'Örnsköldsvik', municipality: 'Örnsköldsvik', type: 'kommunal' },
  { id: 'orn-2', name: 'Parkskolan', city: 'Örnsköldsvik', municipality: 'Örnsköldsvik', type: 'kommunal' },

  // Kramfors
  { id: 'kra-1', name: 'Ådalsskolan', city: 'Kramfors', municipality: 'Kramfors', type: 'kommunal' },

  // =====================================================
  // JÄMTLAND
  // =====================================================
  
  // Östersund
  { id: 'ost-1', name: 'Wargentin gymnasium', city: 'Östersund', municipality: 'Östersund', type: 'kommunal' },
  { id: 'ost-2', name: 'Palmcrantzskolan', city: 'Östersund', municipality: 'Östersund', type: 'kommunal' },
  { id: 'ost-3', name: 'Jämtlands gymnasium', city: 'Östersund', municipality: 'Östersund', type: 'kommunal' },
  { id: 'ost-4', name: 'NTI Gymnasiet Östersund', city: 'Östersund', municipality: 'Östersund', type: 'friskola' },

  // =====================================================
  // VÄSTERBOTTEN
  // =====================================================
  
  // Umeå
  { id: 'ume-1', name: 'Dragonskolan', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-2', name: 'Midgårdsskolan', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-3', name: 'Fridhemsgymnasiet', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-4', name: 'Forslundagymnasiet', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-5', name: 'NTI Gymnasiet Umeå', city: 'Umeå', municipality: 'Umeå', type: 'friskola' },
  { id: 'ume-6', name: 'Jensen Gymnasium Umeå', city: 'Umeå', municipality: 'Umeå', type: 'friskola' },
  { id: 'ume-7', name: 'Thoren Business School Umeå', city: 'Umeå', municipality: 'Umeå', type: 'friskola' },

  // Skellefteå
  { id: 'ske-1', name: 'Anderstorpsgymnasiet', city: 'Skellefteå', municipality: 'Skellefteå', type: 'kommunal' },
  { id: 'ske-2', name: 'Balderskolan', city: 'Skellefteå', municipality: 'Skellefteå', type: 'kommunal' },

  // Lycksele
  { id: 'lyck-1', name: 'Tannbergsskolan', city: 'Lycksele', municipality: 'Lycksele', type: 'kommunal' },

  // =====================================================
  // NORRBOTTEN
  // =====================================================
  
  // Luleå
  { id: 'lul-1', name: 'Luleå gymnasieskola', city: 'Luleå', municipality: 'Luleå', type: 'kommunal' },
  { id: 'lul-2', name: 'Björkskatan gymnasium', city: 'Luleå', municipality: 'Luleå', type: 'kommunal' },
  { id: 'lul-3', name: 'NTI Gymnasiet Luleå', city: 'Luleå', municipality: 'Luleå', type: 'friskola' },

  // Piteå
  { id: 'pit-1', name: 'Strömbackaskolan', city: 'Piteå', municipality: 'Piteå', type: 'kommunal' },

  // Boden
  { id: 'bod-1', name: 'Björknäsgymnasiet', city: 'Boden', municipality: 'Boden', type: 'kommunal' },

  // Kiruna
  { id: 'kir-1', name: 'Hjalmar Lundbohmsskolan', city: 'Kiruna', municipality: 'Kiruna', type: 'kommunal' },

  // Gällivare
  { id: 'gal-1', name: 'Gällivare gymnasium', city: 'Gällivare', municipality: 'Gällivare', type: 'kommunal' },

  // Kalix
  { id: 'kalix-1', name: 'Kalix Naturbruksgymnasium', city: 'Kalix', municipality: 'Kalix', type: 'kommunal' },

  // Haparanda
  { id: 'hap-1', name: 'Tornedalsskolan', city: 'Haparanda', municipality: 'Haparanda', type: 'kommunal' },
];

export const getGymnasiumsByCity = (city: string): Gymnasium[] => {
  return SWEDISH_GYMNASIUMS.filter(gym => gym.city.toLowerCase() === city.toLowerCase());
};

export const getGymnasiumsByMunicipality = (municipality: string): Gymnasium[] => {
  return SWEDISH_GYMNASIUMS.filter(gym => gym.municipality.toLowerCase() === municipality.toLowerCase());
};

export const searchGymnasiums = (query: string): Gymnasium[] => {
  const lowercaseQuery = query.toLowerCase();
  return SWEDISH_GYMNASIUMS.filter(gym => 
    gym.name.toLowerCase().includes(lowercaseQuery) ||
    gym.city.toLowerCase().includes(lowercaseQuery) ||
    gym.municipality.toLowerCase().includes(lowercaseQuery)
  );
};

export const getCities = (): string[] => {
  const cities = [...new Set(SWEDISH_GYMNASIUMS.map(gym => gym.city))];
  return cities.sort();
};

export const getMunicipalities = (): string[] => {
  const municipalities = [...new Set(SWEDISH_GYMNASIUMS.map(gym => gym.municipality))];
  return municipalities.sort();
};
