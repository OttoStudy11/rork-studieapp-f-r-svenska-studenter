export interface Gymnasium {
  id: string;
  name: string;
  city: string;
  municipality: string;
  type: 'kommunal' | 'friskola' | 'privat';
}

export const SWEDISH_GYMNASIUMS: Gymnasium[] = [
  // Stockholm
  { id: 'sto-1', name: 'Stockholms Musikgymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-2', name: 'Södra Latins Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-3', name: 'Norra Real', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-4', name: 'Östra Real', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-5', name: 'Kungsholmens Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-6', name: 'Viktor Rydbergs Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-7', name: 'Internationella Engelska Skolan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-8', name: 'Thorildsplans Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-9', name: 'Blackebergs Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-10', name: 'Enskilda Gymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },

  // Göteborg
  { id: 'got-1', name: 'Göteborgs Högre Samskola', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-2', name: 'Hvitfeldtska Gymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-3', name: 'Katrinelunds Gymnasium', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-4', name: 'Schillerska Gymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-5', name: 'Polhemsgymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-6', name: 'Burgårdens Gymnasium', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-7', name: 'Göteborgs Tekniska Gymnasium', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-8', name: 'Angered Gymnasium', city: 'Göteborg', municipality: 'Göteborg', type: 'kommunal' },
  { id: 'got-9', name: 'Plusgymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },
  { id: 'got-10', name: 'John Bauer Gymnasiet', city: 'Göteborg', municipality: 'Göteborg', type: 'friskola' },

  // Malmö
  { id: 'mal-1', name: 'Malmö Borgarskola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-2', name: 'Malmö Latinskola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-3', name: 'Katedralskolan', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-4', name: 'Malmö Idrottsgymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-5', name: 'Teknikum', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-6', name: 'Malmö Musikhögskola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-7', name: 'Pildammsgymnasiet', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-8', name: 'Rosengård Gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-9', name: 'Malmö Högskola Gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-10', name: 'Kunskapsskolan Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },

  // Uppsala
  { id: 'upp-1', name: 'Katedralskolan Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-2', name: 'Fyrisskolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-3', name: 'Celsiusskolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-4', name: 'Lundellska Skolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-5', name: 'Rosendalsgymnasiet', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-6', name: 'Åsö Gymnasium', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-7', name: 'Mikael Elias Teoretiska Gymnasium', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-8', name: 'Praktiska Gymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },

  // Linköping
  { id: 'lin-1', name: 'Katedralskolan Linköping', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-2', name: 'Berzeliusskolan', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-3', name: 'Folkungaskolan', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-4', name: 'Frödings Gymnasium', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-5', name: 'Tekniska Gymnasiet Linköping', city: 'Linköping', municipality: 'Linköping', type: 'kommunal' },
  { id: 'lin-6', name: 'Vreta Kloster Gymnasium', city: 'Linköping', municipality: 'Linköping', type: 'friskola' },

  // Västerås
  { id: 'vas-1', name: 'Rudbeckianska Gymnasiet', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-2', name: 'Västerås Gymnasium', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-3', name: 'Mälardalens Tekniska Gymnasium', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-4', name: 'Hammarby Gymnasium', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-5', name: 'Västerås Idrottsgymnasium', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },

  // Örebro
  { id: 'ore-1', name: 'Karolinska Gymnasiet', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-2', name: 'Palmcrantzskolan', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-3', name: 'Nikolai Gymnasium', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-4', name: 'Örebro Tekniska Gymnasium', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },
  { id: 'ore-5', name: 'Vivalla Gymnasium', city: 'Örebro', municipality: 'Örebro', type: 'kommunal' },

  // Norrköping
  { id: 'nor-1', name: 'Borg Gymnasium', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },
  { id: 'nor-2', name: 'Hagagymnasiet', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },
  { id: 'nor-3', name: 'Minervasskolan', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },
  { id: 'nor-4', name: 'Norrköpings Tekniska Gymnasium', city: 'Norrköping', municipality: 'Norrköping', type: 'kommunal' },

  // Helsingborg
  { id: 'hel-1', name: 'Olympiaskolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-2', name: 'Nicolaiskolan', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-3', name: 'Söderslätt­gymnasiet', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },
  { id: 'hel-4', name: 'Helsingborgs Tekniska Gymnasium', city: 'Helsingborg', municipality: 'Helsingborg', type: 'kommunal' },

  // Jönköping
  { id: 'jon-1', name: 'Sandagymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-2', name: 'Värnamo Gymnasium', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-3', name: 'Ljungby Gymnasium', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-4', name: 'Tekniska Gymnasiet Jönköping', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },

  // Umeå
  { id: 'ume-1', name: 'Dragonskolan', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-2', name: 'Midgårdsskolan', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-3', name: 'Umeå Tekniska Gymnasium', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },
  { id: 'ume-4', name: 'Umeå Idrottsgymnasium', city: 'Umeå', municipality: 'Umeå', type: 'kommunal' },

  // Lund
  { id: 'lun-1', name: 'Katedralskolan Lund', city: 'Lund', municipality: 'Lund', type: 'kommunal' },
  { id: 'lun-2', name: 'Spyken Lund', city: 'Lund', municipality: 'Lund', type: 'kommunal' },
  { id: 'lun-3', name: 'Polhemsskolan Lund', city: 'Lund', municipality: 'Lund', type: 'kommunal' },

  // Borås
  { id: 'bor-1', name: 'Sven Eriksonsgymnasiet', city: 'Borås', municipality: 'Borås', type: 'kommunal' },
  { id: 'bor-2', name: 'Almås Gymnasium', city: 'Borås', municipality: 'Borås', type: 'kommunal' },
  { id: 'bor-3', name: 'Bäckängsgymnasiet', city: 'Borås', municipality: 'Borås', type: 'kommunal' },

  // Sundsvall
  { id: 'sun-1', name: 'Sundsvalls Gymnasium', city: 'Sundsvall', municipality: 'Sundsvall', type: 'kommunal' },
  { id: 'sun-2', name: 'Hedbergska Skolan', city: 'Sundsvall', municipality: 'Sundsvall', type: 'kommunal' },
  { id: 'sun-3', name: 'Kunskapsskolan Sundsvall', city: 'Sundsvall', municipality: 'Sundsvall', type: 'friskola' },

  // Gävle
  { id: 'gav-1', name: 'Vasaskolan', city: 'Gävle', municipality: 'Gävle', type: 'kommunal' },
  { id: 'gav-2', name: 'Polhemsskolan Gävle', city: 'Gävle', municipality: 'Gävle', type: 'kommunal' },
  { id: 'gav-3', name: 'Gävle Tekniska Gymnasium', city: 'Gävle', municipality: 'Gävle', type: 'kommunal' },

  // Eskilstuna
  { id: 'esk-1', name: 'Torshälla Gymnasium', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'kommunal' },
  { id: 'esk-2', name: 'Kjell Lönnå Gymnasium', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'kommunal' },
  { id: 'esk-3', name: 'Eskilstuna Tekniska Gymnasium', city: 'Eskilstuna', municipality: 'Eskilstuna', type: 'kommunal' },

  // Karlstad
  { id: 'kar-1', name: 'Karlstads Gymnasium', city: 'Karlstad', municipality: 'Karlstad', type: 'kommunal' },
  { id: 'kar-2', name: 'Drottning Blankas Gymnasium', city: 'Karlstad', municipality: 'Karlstad', type: 'friskola' },
  { id: 'kar-3', name: 'Karlstad Tekniska Gymnasium', city: 'Karlstad', municipality: 'Karlstad', type: 'kommunal' },

  // Växjö
  { id: 'vax-1', name: 'Växjö Gymnasium', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-2', name: 'Teleborg Gymnasium', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-3', name: 'Växjö Tekniska Gymnasium', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },

  // Halmstad
  { id: 'hal-1', name: 'Gymnasieskolan Halmstad', city: 'Halmstad', municipality: 'Halmstad', type: 'kommunal' },
  { id: 'hal-2', name: 'Sannarpsgymnasiet', city: 'Halmstad', municipality: 'Halmstad', type: 'kommunal' },
  { id: 'hal-3', name: 'Halmstad Tekniska Gymnasium', city: 'Halmstad', municipality: 'Halmstad', type: 'kommunal' },

  // Täby
  { id: 'tab-1', name: 'Tibble Gymnasium', city: 'Täby', municipality: 'Täby', type: 'kommunal' },
  { id: 'tab-2', name: 'Täby Enskilda Gymnasium', city: 'Täby', municipality: 'Täby', type: 'friskola' },

  // Sollentuna
  { id: 'sol-1', name: 'Rudbecks Gymnasium', city: 'Sollentuna', municipality: 'Sollentuna', type: 'kommunal' },
  { id: 'sol-2', name: 'Sollentuna Gymnasium', city: 'Sollentuna', municipality: 'Sollentuna', type: 'kommunal' },

  // Sundbyberg
  { id: 'sub-1', name: 'Sundbybergs Gymnasium', city: 'Sundbyberg', municipality: 'Sundbyberg', type: 'kommunal' },

  // Danderyd
  { id: 'dan-1', name: 'Danderyds Gymnasium', city: 'Danderyd', municipality: 'Danderyd', type: 'kommunal' },

  // Nacka
  { id: 'nac-1', name: 'Nacka Gymnasium', city: 'Nacka', municipality: 'Nacka', type: 'kommunal' },
  { id: 'nac-2', name: 'Boo Gymnasium', city: 'Nacka', municipality: 'Nacka', type: 'kommunal' },

  // Huddinge
  { id: 'hud-1', name: 'Huddinge Gymnasium', city: 'Huddinge', municipality: 'Huddinge', type: 'kommunal' },
  { id: 'hud-2', name: 'Flemingsberg Gymnasium', city: 'Huddinge', municipality: 'Huddinge', type: 'kommunal' },

  // Botkyrka
  { id: 'bot-1', name: 'Tumba Gymnasium', city: 'Botkyrka', municipality: 'Botkyrka', type: 'kommunal' },
  { id: 'bot-2', name: 'Fittja Gymnasium', city: 'Botkyrka', municipality: 'Botkyrka', type: 'kommunal' },

  // Haninge
  { id: 'han-1', name: 'Haninge Gymnasium', city: 'Haninge', municipality: 'Haninge', type: 'kommunal' },

  // Södertälje
  { id: 'sod-1', name: 'Södertälje Gymnasium', city: 'Södertälje', municipality: 'Södertälje', type: 'kommunal' },
  { id: 'sod-2', name: 'Cybergymnasiet', city: 'Södertälje', municipality: 'Södertälje', type: 'friskola' },

  // Solna
  { id: 'sln-1', name: 'Solna Gymnasium', city: 'Solna', municipality: 'Solna', type: 'kommunal' },

  // Lidingö
  { id: 'lid-1', name: 'Lidingö Gymnasium', city: 'Lidingö', municipality: 'Lidingö', type: 'kommunal' },

  // Järfälla
  { id: 'jar-1', name: 'Järfälla Gymnasium', city: 'Järfälla', municipality: 'Järfälla', type: 'kommunal' },

  // Ekerö
  { id: 'eke-1', name: 'Ekerö Gymnasium', city: 'Ekerö', municipality: 'Ekerö', type: 'kommunal' },

  // Norrtälje
  { id: 'nrt-1', name: 'Norrtälje Gymnasium', city: 'Norrtälje', municipality: 'Norrtälje', type: 'kommunal' },

  // Nykvarn
  { id: 'nyk-1', name: 'Nykvarn Gymnasium', city: 'Nykvarn', municipality: 'Nykvarn', type: 'kommunal' },

  // Salem
  { id: 'sal-1', name: 'Salem Gymnasium', city: 'Salem', municipality: 'Salem', type: 'kommunal' },

  // Sigtuna
  { id: 'sig-1', name: 'Sigtunaskolan Humanistiska Läroverket', city: 'Sigtuna', municipality: 'Sigtuna', type: 'friskola' },
  { id: 'sig-2', name: 'Sigtuna Gymnasium', city: 'Sigtuna', municipality: 'Sigtuna', type: 'kommunal' },

  // Upplands Väsby
  { id: 'upv-1', name: 'Upplands Väsby Gymnasium', city: 'Upplands Väsby', municipality: 'Upplands Väsby', type: 'kommunal' },

  // Vallentuna
  { id: 'val-1', name: 'Vallentuna Gymnasium', city: 'Vallentuna', municipality: 'Vallentuna', type: 'kommunal' },

  // Vaxholm
  { id: 'vaxh-1', name: 'Vaxholm Gymnasium', city: 'Vaxholm', municipality: 'Vaxholm', type: 'kommunal' },

  // Österåker
  { id: 'ost-1', name: 'Österåkers Gymnasium', city: 'Österåker', municipality: 'Österåker', type: 'kommunal' },
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