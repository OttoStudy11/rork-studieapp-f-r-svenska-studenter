// Helper functions for program ID mapping
// This ensures consistent program_id assignment across the app

export const PROGRAM_ID_MAP: Record<string, string> = {
  'Naturvetenskapsprogrammet': 'nat-program-id',
  'Teknikprogrammet': 'tek-program-id',
  'Samhällsvetenskapsprogrammet': 'sam-program-id',
  'Ekonomiprogrammet': 'eko-program-id',
  'Estetiska programmet': 'est-program-id',
  'Humanistiska programmet': 'hum-program-id',
  'Barn- och fritidsprogrammet': 'baf-program-id',
  'Bygg- och anläggningsprogrammet': 'bya-program-id',
  'El- och energiprogrammet': 'ele-program-id',
  'Fordons- och transportprogrammet': 'for-program-id',
  'Handels- och administrationsprogrammet': 'han-program-id',
  'Hantverksprogrammet': 'hnt-program-id',
  'Hotell- och turismprogrammet': 'hot-program-id',
  'Industritekniska programmet': 'ind-program-id',
  'Naturbruksprogrammet': 'nab-program-id',
  'Restaurang- och livsmedelsprogrammet': 'res-program-id',
  'VVS- och fastighetsprogrammet': 'vvs-program-id',
  'Vård- och omsorgsprogrammet': 'var-program-id',
  'International Baccalaureate': 'ib-program-id',
};

export const PROGRAM_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PROGRAM_ID_MAP).map(([name, id]) => [id, name])
);

/**
 * Get program ID from program name
 */
export function getProgramId(programName: string): string | null {
  return PROGRAM_ID_MAP[programName] || null;
}

/**
 * Get program name from program ID
 */
export function getProgramName(programId: string): string | null {
  return PROGRAM_NAME_MAP[programId] || null;
}

/**
 * Check if a program name is valid
 */
export function isValidProgramName(programName: string): boolean {
  return programName in PROGRAM_ID_MAP;
}

/**
 * Check if a program ID is valid
 */
export function isValidProgramId(programId: string): boolean {
  return programId in PROGRAM_NAME_MAP;
}

/**
 * Get all available program names
 */
export function getAllProgramNames(): string[] {
  return Object.keys(PROGRAM_ID_MAP);
}

/**
 * Get all available program IDs
 */
export function getAllProgramIds(): string[] {
  return Object.values(PROGRAM_ID_MAP);
}