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
  // Stockholm
  { id: 'sto-1', name: 'Stockholms Musikgymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-2', name: 'Södra Latins Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-3', name: 'Norra Real', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-4', name: 'Östra Real', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-5', name: 'Kungsholmens Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-6', name: 'Viktor Rydberg Gymnasium Odenplan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-7', name: 'Viktor Rydberg Gymnasium Djursholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-8', name: 'Thorildsplans Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-9', name: 'Blackebergs Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-10', name: 'Enskilda Gymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-11', name: 'Globala Gymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-12', name: 'S:t Eriks Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-13', name: 'Stockholms Tekniska Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-14', name: 'Ross Tensta Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-15', name: 'Spyken Gymnasium Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-16', name: 'Farsta Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-17', name: 'Skärholmens Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-18', name: 'Vällingby Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-19', name: 'Bromma Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-20', name: 'Spånga Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-21', name: 'Anna Whitlocks Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-22', name: 'Bernadottegymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-23', name: 'Didaktus Jakobsberg', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-24', name: 'Europaskolan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-25', name: 'Frans Schartaus Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-26', name: 'Fredrika Bremergymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-27', name: 'Hersby Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-28', name: 'Hägersten Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-29', name: 'Jensen Gymnasium Norra', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-30', name: 'Jensen Gymnasium Södra', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-31', name: 'Kärrtorps Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-32', name: 'LBS Kreativa Gymnasiet Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-33', name: 'Lycée Français Saint Louis', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-34', name: 'Mediagymnasiet', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-35', name: 'NTI Gymnasiet Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-36', name: 'Praktiska Gymnasiet Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-37', name: 'ProCivitas Privata Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-38', name: 'Rytmus Musikgymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-39', name: 'Sjölins Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-40', name: 'Stockholms Idrottsgymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-41', name: 'Stockholms Naturbruksgymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-42', name: 'Stockholms Transport och Fordonstekniska Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },
  { id: 'sto-43', name: 'Thoren Business School Stockholm', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-44', name: 'Tibble Fristående Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-45', name: 'Tyska Skolan', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-46', name: 'Yrkesplugget', city: 'Stockholm', municipality: 'Stockholm', type: 'friskola' },
  { id: 'sto-47', name: 'Åsö Gymnasium', city: 'Stockholm', municipality: 'Stockholm', type: 'kommunal' },

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
  { id: 'mal-3', name: 'Malmö Idrottsgymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-6', name: 'S:t Petri Skola', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-7', name: 'Pauliskolan', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-8', name: 'Heleneholms Gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-9', name: 'Värnhemsskolan', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-10', name: 'Kunskapsskolan Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-11', name: 'Agnesfrids Gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-12', name: 'Djupadals Gymnasium', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-13', name: 'Erik Dahlbergsgymnasiet', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-14', name: 'Gymnasieskolan Kvarnby', city: 'Malmö', municipality: 'Malmö', type: 'kommunal' },
  { id: 'mal-15', name: 'Jensen Gymnasium Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-16', name: 'John Bauergymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-17', name: 'LBS Kreativa Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-18', name: 'Montessorigymnasiet', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-19', name: 'NTI Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-20', name: 'Praktiska Gymnasiet Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-21', name: 'ProCivitas Privata Gymnasium Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-22', name: 'Rytmus Musikgymnasium Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },
  { id: 'mal-23', name: 'Thoren Business School Malmö', city: 'Malmö', municipality: 'Malmö', type: 'friskola' },

  // Uppsala
  { id: 'upp-1', name: 'Katedralskolan Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-2', name: 'Fyrisskolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-3', name: 'Celsiusskolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-4', name: 'Lundellska Skolan', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-5', name: 'Rosendalsgymnasiet', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-6', name: 'Bolandgymnasiet', city: 'Uppsala', municipality: 'Uppsala', type: 'kommunal' },
  { id: 'upp-7', name: 'Mikael Elias Teoretiska Gymnasium', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-8', name: 'Praktiska Gymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-9', name: 'Kunskapsgymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-10', name: 'Jensen Gymnasium Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-11', name: 'NTI Gymnasiet Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },
  { id: 'upp-12', name: 'Thoren Business School Uppsala', city: 'Uppsala', municipality: 'Uppsala', type: 'friskola' },

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
  { id: 'vas-6', name: 'Västerås Musikklasser', city: 'Västerås', municipality: 'Västerås', type: 'kommunal' },
  { id: 'vas-7', name: 'Praktiska Gymnasiet Västerås', city: 'Västerås', municipality: 'Västerås', type: 'friskola' },

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
  { id: 'jon-2', name: 'Per Brahegymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-3', name: 'Bäckadalsgymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-4', name: 'Erik Dahlbergsgymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'kommunal' },
  { id: 'jon-5', name: 'Wisbygymnasiet', city: 'Jönköping', municipality: 'Jönköping', type: 'friskola' },
  { id: 'jon-6', name: 'Praktiska Gymnasiet Jönköping', city: 'Jönköping', municipality: 'Jönköping', type: 'friskola' },
  { id: 'jon-7', name: 'Jensen Gymnasium Jönköping', city: 'Jönköping', municipality: 'Jönköping', type: 'friskola' },

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
  { id: 'vax-1', name: 'Katedralskolan Växjö', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-2', name: 'Kungsmadskolan', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-3', name: 'Teknikum', city: 'Växjö', municipality: 'Växjö', type: 'kommunal' },
  { id: 'vax-4', name: 'Växjö Fria Gymnasium', city: 'Växjö', municipality: 'Växjö', type: 'friskola' },
  { id: 'vax-5', name: 'Praktiska Gymnasiet Växjö', city: 'Växjö', municipality: 'Växjö', type: 'friskola' },

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



  // Sigtuna
  { id: 'sig-1', name: 'Sigtunaskolan Humanistiska Läroverket', city: 'Sigtuna', municipality: 'Sigtuna', type: 'friskola' },
  { id: 'sig-2', name: 'Sigtuna Gymnasium', city: 'Sigtuna', municipality: 'Sigtuna', type: 'kommunal' },

  // Upplands Väsby
  { id: 'upv-1', name: 'Upplands Väsby Gymnasium', city: 'Upplands Väsby', municipality: 'Upplands Väsby', type: 'kommunal' },

  // Vallentuna
  { id: 'val-1', name: 'Vallentuna Gymnasium', city: 'Vallentuna', municipality: 'Vallentuna', type: 'kommunal' },

  // Vaxholm
  { id: 'vaxh-1', name: 'Kunskapscentrum Vaxholm', city: 'Vaxholm', municipality: 'Vaxholm', type: 'kommunal' },

  // Österåker
  { id: 'ost-1', name: 'Österåkers Gymnasium', city: 'Österåker', municipality: 'Österåker', type: 'kommunal' },

  // Kiruna
  { id: 'kir-1', name: 'Kirunagymnasiet', city: 'Kiruna', municipality: 'Kiruna', type: 'kommunal' },
  { id: 'kir-2', name: 'Hjalmar Lundbohmsgymnasiet', city: 'Kiruna', municipality: 'Kiruna', type: 'kommunal' },

  // Luleå
  { id: 'lul-1', name: 'Luleå Gymnasium', city: 'Luleå', municipality: 'Luleå', type: 'kommunal' },
  { id: 'lul-2', name: 'Porsöns Gymnasium', city: 'Luleå', municipality: 'Luleå', type: 'kommunal' },
  { id: 'lul-3', name: 'Tekniska Gymnasiet Luleå', city: 'Luleå', municipality: 'Luleå', type: 'kommunal' },

  // Skellefteå
  { id: 'ske-1', name: 'Skellefteå Gymnasium', city: 'Skellefteå', municipality: 'Skellefteå', type: 'kommunal' },
  { id: 'ske-2', name: 'Balderskolan', city: 'Skellefteå', municipality: 'Skellefteå', type: 'kommunal' },
  { id: 'ske-3', name: 'Anderstorpsgymnasiet', city: 'Skellefteå', municipality: 'Skellefteå', type: 'kommunal' },

  // Östersund
  { id: 'ost-2', name: 'Wargentinsskolan', city: 'Östersund', municipality: 'Östersund', type: 'kommunal' },
  { id: 'ost-3', name: 'Palmcrantzskolan Östersund', city: 'Östersund', municipality: 'Östersund', type: 'kommunal' },
  { id: 'ost-4', name: 'Frösö Gymnasium', city: 'Östersund', municipality: 'Östersund', type: 'kommunal' },

  // Falun
  { id: 'fal-1', name: 'Lugnetgymnasiet', city: 'Falun', municipality: 'Falun', type: 'kommunal' },
  { id: 'fal-2', name: 'Kristine Gymnasium', city: 'Falun', municipality: 'Falun', type: 'kommunal' },
  { id: 'fal-3', name: 'Soltorgsgymnasiet', city: 'Falun', municipality: 'Falun', type: 'kommunal' },

  // Borlänge
  { id: 'bor-4', name: 'Tunaskolan', city: 'Borlänge', municipality: 'Borlänge', type: 'kommunal' },
  { id: 'bor-5', name: 'Dalarnas Gymnasium', city: 'Borlänge', municipality: 'Borlänge', type: 'kommunal' },
  { id: 'bor-6', name: 'Borlänge Gymnasium', city: 'Borlänge', municipality: 'Borlänge', type: 'kommunal' },

  // Sandviken
  { id: 'san-1', name: 'Sandvikens Gymnasium', city: 'Sandviken', municipality: 'Sandviken', type: 'kommunal' },
  { id: 'san-2', name: 'Jernvallsskolan', city: 'Sandviken', municipality: 'Sandviken', type: 'kommunal' },

  // Hudiksvall
  { id: 'hud-3', name: 'Hudiksvalls Gymnasium', city: 'Hudiksvall', municipality: 'Hudiksvall', type: 'kommunal' },
  { id: 'hud-4', name: 'Strömbackaskolan', city: 'Hudiksvall', municipality: 'Hudiksvall', type: 'kommunal' },

  // Söderhamn
  { id: 'sod-3', name: 'Staffangymnasiet', city: 'Söderhamn', municipality: 'Söderhamn', type: 'kommunal' },

  // Ljusdal
  { id: 'lju-1', name: 'Slottegymnasiet', city: 'Ljusdal', municipality: 'Ljusdal', type: 'kommunal' },

  // Bollnäs
  { id: 'bol-1', name: 'Torsbergsgymnasiet', city: 'Bollnäs', municipality: 'Bollnäs', type: 'kommunal' },

  // Ovanåker
  { id: 'ova-1', name: 'Alftaåsens Gymnasium', city: 'Edsbyn', municipality: 'Ovanåker', type: 'kommunal' },

  // Kramfors
  { id: 'kra-1', name: 'Ådalsskolan', city: 'Kramfors', municipality: 'Kramfors', type: 'kommunal' },

  // Sollefteå
  { id: 'soll-1', name: 'Gudlav Bilderskolan', city: 'Sollefteå', municipality: 'Sollefteå', type: 'kommunal' },

  // Härnösand
  { id: 'har-1', name: 'Härnösands Gymnasium', city: 'Härnösand', municipality: 'Härnösand', type: 'kommunal' },
  { id: 'har-2', name: 'Domkyrkoskolan', city: 'Härnösand', municipality: 'Härnösand', type: 'kommunal' },

  // Örnsköldsvik
  { id: 'orn-1', name: 'Örnsköldsviks Gymnasium', city: 'Örnsköldsvik', municipality: 'Örnsköldsvik', type: 'kommunal' },
  { id: 'orn-2', name: 'Höga Kusten Gymnasium', city: 'Örnsköldsvik', municipality: 'Örnsköldsvik', type: 'kommunal' },

  // Kalmar
  { id: 'kal-1', name: 'Kalmarsundsgymnasiet', city: 'Kalmar', municipality: 'Kalmar', type: 'kommunal' },
  { id: 'kal-2', name: 'Stagneliusskolan', city: 'Kalmar', municipality: 'Kalmar', type: 'kommunal' },
  { id: 'kal-3', name: 'Kalmar Tekniska Gymnasium', city: 'Kalmar', municipality: 'Kalmar', type: 'kommunal' },

  // Visby
  { id: 'vis-1', name: 'Richard Steffen Gymnasium', city: 'Visby', municipality: 'Gotland', type: 'kommunal' },
  { id: 'vis-2', name: 'Pär Lagerkvists Gymnasium', city: 'Visby', municipality: 'Gotland', type: 'kommunal' },

  // Karlskrona
  { id: 'kar-4', name: 'Blekinge Tekniska Gymnasium', city: 'Karlskrona', municipality: 'Karlskrona', type: 'kommunal' },
  { id: 'kar-5', name: 'Karlskrona Gymnasium', city: 'Karlskrona', municipality: 'Karlskrona', type: 'kommunal' },
  { id: 'kar-6', name: 'Wämöparken', city: 'Karlskrona', municipality: 'Karlskrona', type: 'kommunal' },

  // Kristianstad
  { id: 'kri-1', name: 'Kristianstad Gymnasium', city: 'Kristianstad', municipality: 'Kristianstad', type: 'kommunal' },
  { id: 'kri-2', name: 'Yrkesakademin', city: 'Kristianstad', municipality: 'Kristianstad', type: 'kommunal' },
  { id: 'kri-3', name: 'Hammarskjöld Gymnasium', city: 'Kristianstad', municipality: 'Kristianstad', type: 'kommunal' },

  // Landskrona
  { id: 'lan-1', name: 'Landskrona Gymnasium', city: 'Landskrona', municipality: 'Landskrona', type: 'kommunal' },
  { id: 'lan-2', name: 'Yrkesakademin Landskrona', city: 'Landskrona', municipality: 'Landskrona', type: 'kommunal' },

  // Trelleborg
  { id: 'tre-1', name: 'Trelleborgs Gymnasium', city: 'Trelleborg', municipality: 'Trelleborg', type: 'kommunal' },
  { id: 'tre-2', name: 'Smygehuk Gymnasium', city: 'Trelleborg', municipality: 'Trelleborg', type: 'kommunal' },

  // Ystad
  { id: 'ysta-1', name: 'Ystads Gymnasium', city: 'Ystad', municipality: 'Ystad', type: 'kommunal' },
  { id: 'ysta-2', name: 'Österlengymnasiet', city: 'Ystad', municipality: 'Ystad', type: 'kommunal' },

  // Ängelholm
  { id: 'ang-1', name: 'Ängelholms Gymnasium', city: 'Ängelholm', municipality: 'Ängelholm', type: 'kommunal' },
  { id: 'ang-2', name: 'Thoren Business School Ängelholm', city: 'Ängelholm', municipality: 'Ängelholm', type: 'friskola' },

  // Trollhättan
  { id: 'tro-1', name: 'Trollhättans Gymnasium', city: 'Trollhättan', municipality: 'Trollhättan', type: 'kommunal' },
  { id: 'tro-2', name: 'Innovatum Gymnasium', city: 'Trollhättan', municipality: 'Trollhättan', type: 'kommunal' },
  { id: 'tro-3', name: 'Åsenskolan', city: 'Trollhättan', municipality: 'Trollhättan', type: 'kommunal' },

  // Uddevalla
  { id: 'udd-1', name: 'Uddevalla Gymnasium', city: 'Uddevalla', municipality: 'Uddevalla', type: 'kommunal' },
  { id: 'udd-2', name: 'Kunskapsskolan Uddevalla', city: 'Uddevalla', municipality: 'Uddevalla', type: 'friskola' },

  // Skövde
  { id: 'sko-1', name: 'Kavelbro Gymnasium', city: 'Skövde', municipality: 'Skövde', type: 'kommunal' },
  { id: 'sko-2', name: 'Skövde Gymnasium', city: 'Skövde', municipality: 'Skövde', type: 'kommunal' },
  { id: 'sko-3', name: 'Västerhöjdsgymnasiet', city: 'Skövde', municipality: 'Skövde', type: 'kommunal' },

  // Mariestad
  { id: 'mar-1', name: 'Vådsbogymnasierna', city: 'Mariestad', municipality: 'Mariestad', type: 'kommunal' },

  // Lidköping
  { id: 'lid-2', name: 'De la Gardiegymnasiet', city: 'Lidköping', municipality: 'Lidköping', type: 'kommunal' },

  // Falköping
  { id: 'falk-1', name: 'Falköpings Gymnasium', city: 'Falköping', municipality: 'Falköping', type: 'kommunal' },
  { id: 'falk-2', name: 'Katedralskolan Falköping', city: 'Falköping', municipality: 'Falköping', type: 'kommunal' },

  // Alingsås
  { id: 'ali-1', name: 'Alingsås Gymnasium', city: 'Alingsås', municipality: 'Alingsås', type: 'kommunal' },
  { id: 'ali-2', name: 'Hermods Gymnasium Alingsås', city: 'Alingsås', municipality: 'Alingsås', type: 'friskola' },

  // Lerum
  { id: 'ler-1', name: 'Lerums Gymnasium', city: 'Lerum', municipality: 'Lerum', type: 'kommunal' },
  { id: 'ler-2', name: 'Hulebäcksgymnasiet', city: 'Lerum', municipality: 'Lerum', type: 'kommunal' },

  // Partille
  { id: 'par-1', name: 'Partille Gymnasium', city: 'Partille', municipality: 'Partille', type: 'kommunal' },

  // Mölndal
  { id: 'mol-1', name: 'Krokslättsgymnasiet', city: 'Mölndal', municipality: 'Mölndal', type: 'kommunal' },
  { id: 'mol-2', name: 'Fässbergsgymnasiet', city: 'Mölndal', municipality: 'Mölndal', type: 'kommunal' },

  // Varberg
  { id: 'var-1', name: 'Peder Skrivares Gymnasium', city: 'Varberg', municipality: 'Varberg', type: 'kommunal' },
  { id: 'var-2', name: 'Haegymnasiet', city: 'Varberg', municipality: 'Varberg', type: 'kommunal' },

  // Falkenberg
  { id: 'falke-1', name: 'Falkenbergs Gymnasium', city: 'Falkenberg', municipality: 'Falkenberg', type: 'kommunal' },
  { id: 'falke-2', name: 'Tullängsgymnasiet', city: 'Falkenberg', municipality: 'Falkenberg', type: 'kommunal' },

  // Kungsbacka
  { id: 'kun-1', name: 'Kungsbacka Gymnasium', city: 'Kungsbacka', municipality: 'Kungsbacka', type: 'kommunal' },
  { id: 'kun-2', name: 'Onsala Gymnasium', city: 'Kungsbacka', municipality: 'Kungsbacka', type: 'kommunal' },

  // Laholm
  { id: 'lah-1', name: 'Osbecksgymnasiet', city: 'Laholm', municipality: 'Laholm', type: 'kommunal' },

  // Båstad
  { id: 'bas-1', name: 'Akademi Båstad Gymnasium', city: 'Båstad', municipality: 'Båstad', type: 'kommunal' },

  // Åmål
  { id: 'ama-1', name: 'Karlbergsgymnasiet', city: 'Åmål', municipality: 'Åmål', type: 'kommunal' },

  // Säffle
  { id: 'saf-1', name: 'Herrgårdsgymnasiet', city: 'Säffle', municipality: 'Säffle', type: 'kommunal' },

  // Arvika
  { id: 'arv-1', name: 'Solbergagymnasiet', city: 'Arvika', municipality: 'Arvika', type: 'kommunal' },

  // Eda
  { id: 'eda-1', name: 'Gunnarsbygymnasiet', city: 'Charlottenberg', municipality: 'Eda', type: 'kommunal' },

  // Filipstad
  { id: 'fil-1', name: 'Spångbergsgymnasiet', city: 'Filipstad', municipality: 'Filipstad', type: 'kommunal' },

  // Hagfors
  { id: 'hag-1', name: 'Älvstrandsgymnasiet', city: 'Hagfors', municipality: 'Hagfors', type: 'kommunal' },

  // Kristinehamn
  { id: 'kris-1', name: 'Brogårdsgymnasiet', city: 'Kristinehamn', municipality: 'Kristinehamn', type: 'kommunal' },

  // Torsby
  { id: 'tor-1', name: 'Stjerneskolan', city: 'Torsby', municipality: 'Torsby', type: 'kommunal' },

  // Sunne
  { id: 'sun-4', name: 'Brobygymnasiet', city: 'Sunne', municipality: 'Sunne', type: 'kommunal' },
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