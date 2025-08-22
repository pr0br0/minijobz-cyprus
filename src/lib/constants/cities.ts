// Predefined cities and locations in Cyprus
export const CYPRUS_CITIES = [
  // Major Cities
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Ayia Napa",
  
  // Nicosia District
  "Strovolos",
  "Lakatamia",
  "Latsia",
  "Engomi",
  "Aglandjia",
  "Dali",
  "Geri",
  "Tseri",
  "Deftera",
  "Kaimakli",
  
  // Limassol District
  "Mesa Geitonia",
  "Yermasoyia",
  "Agios Athanasios",
  "Limassol Marina",
  "Germasogeia",
  "Zakaki",
  "Kolossi",
  "Erimi",
  "Ypsonas",
  "Parekklisia",
  
  // Larnaca District
  "Aradippou",
  "Livadia",
  "Dromolaxia",
  "Kiti",
  "Pervolia",
  "Mazotos",
  "Kofinou",
  "Vavatsinia",
  "Lefkara",
  "Skarinou",
  
  // Paphos District
  "Geroskipou",
  "Peyia",
  "Chloraka",
  "Kissonerga",
  "Tala",
  "Polis Chrysochous",
  "Latchi",
  "Neo Chorio",
  "Droushia",
  "Kathikas",
  
  // Famagusta District (Republic controlled)
  "Paralimni",
  "Deryneia",
  "Sotira",
  "Frenaros",
  "Liopetri",
  "Xylofagou",
  "Avgorou",
  "Vrysoulles",
  "Achna",
  "Dherynia",
  
  // Other Notable Locations
  "Troodos Mountains",
  "Platres",
  "Kakopetria",
  "Pedoulas",
  "Kykkos",
  "Omodos",
  "Vasa Koilaniou",
  "Laneia",
  "Finikaria",
  "Monagri",
  
  // Coastal Areas
  "Protaras",
  "Cape Greco",
  "Coral Bay",
  "Governor's Beach",
  "Lady's Mile",
  "Curium Beach",
  "Aphrodite's Rock",
  "Akamas Peninsula",
  
  // Industrial Areas
  "Larnaca Industrial Area",
  "Limassol Industrial Area",
  "Nicosia Industrial Area",
  "Ypsonas Industrial Area",
  "Dali Industrial Area",
  
  // University Areas
  "University of Cyprus",
  "Cyprus University of Technology",
  "European University Cyprus",
  "University of Nicosia",
  "Frederick University",
  
  // Tourist Areas
  "Pyla",
  "Pissouri",
  "Tochni",
  "Kalavasos",
  "Maroni",
  "Zygi",
  "Governor's Beach",
  "Mouttagiaka",
  "Pentakomo",
  "Agios Tychonas"
] as const;

export type CyprusCity = typeof CYPRUS_CITIES[number];

// Popular cities for quick selection
export const POPULAR_CITIES = [
  "Nicosia",
  "Limassol", 
  "Larnaca",
  "Paphos",
  "Ayia Napa",
  "Paralimni",
  "Protaras"
] as const;

// District groupings for better organization
export const DISTRICTS = {
  NICOSIA: [
    "Nicosia", "Strovolos", "Lakatamia", "Latsia", "Engomi", "Aglandjia",
    "Dali", "Geri", "Tseri", "Deftera", "Kaimakli"
  ],
  LIMASSOL: [
    "Limassol", "Mesa Geitonia", "Yermasoyia", "Agios Athanasios", "Limassol Marina",
    "Germasogeia", "Zakaki", "Kolossi", "Erimi", "Ypsonas", "Parekklisia"
  ],
  LARNACA: [
    "Larnaca", "Aradippou", "Livadia", "Dromolaxia", "Kiti", "Pervolia",
    "Mazotos", "Kofinou", "Vavatsinia", "Lefkara", "Skarinou"
  ],
  PAPHOS: [
    "Paphos", "Geroskipou", "Peyia", "Chloraka", "Kissonerga", "Tala",
    "Polis Chrysochous", "Latchi", "Neo Chorio", "Droushia", "Kathikas"
  ],
  FAMAGUSTA: [
    "Ayia Napa", "Paralimni", "Deryneia", "Sotira", "Frenaros", "Liopetri",
    "Xylofagou", "Avgorou", "Vrysoulles", "Achna", "Dherynia"
  ]
} as const;

// Helper function to check if a location is valid
export function isValidCyprusCity(city: string): city is CyprusCity {
  return (CYPRUS_CITIES as readonly string[]).includes(city);
}

// Helper function to get district by city
export function getDistrictByCity(city: string): string | null {
  for (const [district, cities] of Object.entries(DISTRICTS)) {
  if ((cities as readonly string[]).includes(city)) {
      return district;
    }
  }
  return null;
}

// Helper function to get cities by district
export function getCitiesByDistrict(district: keyof typeof DISTRICTS): string[] {
  return (DISTRICTS as any)[district] || [];
}