// Types
export interface Etablissement {
  nom: string;
  chef: string;
  region: string;
  ville: string;
  prefecture: string;
  telephone: string;
}

export type CategoriePersonnel = "Administratif" | "Enseignant" | "Appui";
export type Sexe = "M" | "F";

export interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  specialite: string;
  poste: string;
  sexe: Sexe;
  dateNaissance: string;
  categorie: CategoriePersonnel;
}

export interface Cycle {
  id: string;
  nom: string;
}

export interface Filiere {
  id: string;
  nom: string;
  cycleId: string;
}

export interface Niveau {
  id: string;
  nom: string;
  cycleId: string;
}

// Classe Pédagogique : Structure officielle de l'inspection (non modifiable)
export interface ClassePedagogique {
  id: string;
  nom: string; // ex: "2nde A", "1ère C"
  niveauId: string;
  filiereId: string;
}

// Classe : Utilisée dans Effectifs et Statistiques
export interface Classe {
  id: string;
  nom: string; // ex: "2nde A1", "2nde A2"
  niveauId: string; // Pour compatibilité avec les filtres
  filiereId: string; // Pour compatibilité avec les filtres
  classePedagogiqueId?: string; // Référence optionnelle à la classe pédagogique
  numero?: number; // Numéro de variante (1, 2, 3...)
  estPersonnalise?: boolean; // true si créée par l'école
}

export interface EffectifClasse {
  classeId: string;
  garcons: number;
  filles: number;
}

export interface AnneeData {
  effectifs: EffectifClasse[];
  agents: Agent[];
}

export interface AppData {
  etablissement: Etablissement;
  annees: Record<string, AnneeData>; // key = "2025-2026"
}

// Static structure
export const cycles: Cycle[] = [
  { id: "c1", nom: "BAC" },
  { id: "c2", nom: "CAP" },
  { id: "c3", nom: "BT" },
];

export const filieres: Filiere[] = [
  { id: "f1", nom: "Série A", cycleId: "c1" },
  { id: "f2", nom: "Série C", cycleId: "c1" },
  { id: "f3", nom: "Série D", cycleId: "c1" },
  { id: "f4", nom: "Mécanique Auto", cycleId: "c2" },
  { id: "f5", nom: "Electricité", cycleId: "c2" },
  { id: "f6", nom: "Comptabilité", cycleId: "c3" },
  { id: "f7", nom: "Secrétariat", cycleId: "c3" },
];

export const niveaux: Niveau[] = [
  { id: "n1", nom: "Seconde", cycleId: "c1" },
  { id: "n2", nom: "Première", cycleId: "c1" },
  { id: "n3", nom: "Terminale", cycleId: "c1" },
  { id: "n4", nom: "1ère Année", cycleId: "c2" },
  { id: "n5", nom: "2ème Année", cycleId: "c2" },
  { id: "n6", nom: "3ème Année", cycleId: "c2" },
  { id: "n7", nom: "1ère Année", cycleId: "c3" },
  { id: "n8", nom: "2ème Année", cycleId: "c3" },
];

// Default data - these are templates that schools can customize
export const defaultClasses: Classe[] = [
  { id: "cl1", nom: "2nde A1", niveauId: "n1", filiereId: "f1" },
  { id: "cl2", nom: "2nde A2", niveauId: "n1", filiereId: "f1" },
  { id: "cl3", nom: "2nde C", niveauId: "n1", filiereId: "f2" },
  { id: "cl4", nom: "1ère A", niveauId: "n2", filiereId: "f1" },
  { id: "cl5", nom: "1ère C", niveauId: "n2", filiereId: "f2" },
  { id: "cl6", nom: "1ère D", niveauId: "n2", filiereId: "f3" },
  { id: "cl7", nom: "Tle A", niveauId: "n3", filiereId: "f1" },
  { id: "cl8", nom: "Tle C", niveauId: "n3", filiereId: "f2" },
  { id: "cl9", nom: "Tle D", niveauId: "n3", filiereId: "f3" },
  { id: "cl10", nom: "CAP MA 1", niveauId: "n4", filiereId: "f4" },
  { id: "cl11", nom: "CAP Elec 1", niveauId: "n4", filiereId: "f5" },
  { id: "cl12", nom: "CAP MA 2", niveauId: "n5", filiereId: "f4" },
  { id: "cl13", nom: "BT Compta 1", niveauId: "n7", filiereId: "f6" },
  { id: "cl14", nom: "BT Secr 1", niveauId: "n7", filiereId: "f7" },
];

// Dynamic data getters - use inspection data for current year if available
let cachedCycles: Cycle[] | null = null;
let cachedFilieres: Filiere[] | null = null;
let cachedNiveaux: Niveau[] | null = null;
let cachedClasses: Classe[] | null = null;
let currentYearConfig: string | null = null; // Track which year we loaded config for

// Function to clear cache when changing years
export function clearConfigCache(): void {
  cachedCycles = null;
  cachedFilieres = null;
  cachedNiveaux = null;
  cachedClasses = null;
  currentYearConfig = null;
}

export function getCycles(year?: string): Cycle[] {
  // Always reload if year is provided and different
  if (year && year !== currentYearConfig) {
    const stored = localStorage.getItem(`school-inspection-cycles-${year}`);
    if (stored) {
      try {
        cachedCycles = JSON.parse(stored);
        currentYearConfig = year;
        return cachedCycles;
      } catch {}
    }
    // If year-specific data doesn't exist, clear cache to use fallback
    cachedCycles = null;
    currentYearConfig = null;
  }
  
  // Return cached if available
  if (cachedCycles) return cachedCycles;
  
  // Try global storage (backward compatibility)
  try {
    const stored = localStorage.getItem("school-inspection-cycles");
    if (stored) {
      cachedCycles = JSON.parse(stored);
      return cachedCycles;
    }
  } catch {}
  
  // Fallback to defaults
  cachedCycles = cycles;
  return cycles;
}

export function getFilieres(year?: string): Filiere[] {
  if (year && year !== currentYearConfig) {
    const stored = localStorage.getItem(`school-inspection-filieres-${year}`);
    if (stored) {
      try {
        cachedFilieres = JSON.parse(stored);
        currentYearConfig = year;
        return cachedFilieres;
      } catch {}
    }
    // If year-specific data doesn't exist, clear cache to use fallback
    cachedFilieres = null;
    currentYearConfig = null;
  }
  
  if (cachedFilieres) return cachedFilieres;
  
  try {
    const stored = localStorage.getItem("school-inspection-filieres");
    if (stored) {
      cachedFilieres = JSON.parse(stored);
      return cachedFilieres;
    }
  } catch {}
  
  cachedFilieres = filieres;
  return filieres;
}

export function getNiveaux(year?: string): Niveau[] {
  if (year && year !== currentYearConfig) {
    const stored = localStorage.getItem(`school-inspection-niveaux-${year}`);
    if (stored) {
      try {
        cachedNiveaux = JSON.parse(stored);
        currentYearConfig = year;
        return cachedNiveaux;
      } catch {}
    }
    // If year-specific data doesn't exist, clear cache to use fallback
    cachedNiveaux = null;
    currentYearConfig = null;
  }
  
  if (cachedNiveaux) return cachedNiveaux;
  
  try {
    const stored = localStorage.getItem("school-inspection-niveaux");
    if (stored) {
      cachedNiveaux = JSON.parse(stored);
      return cachedNiveaux;
    }
  } catch {}
  
  cachedNiveaux = niveaux;
  return niveaux;
}

export function getClasses(year?: string): Classe[] {
  if (year && year !== currentYearConfig) {
    const stored = localStorage.getItem(`school-inspection-classes-${year}`);
    if (stored) {
      try {
        const inspectionClasses = JSON.parse(stored);
        currentYearConfig = year;
        
        // Merge with custom classes for this year
        const customKey = `school-custom-classes-${year}`;
        let customClasses: Classe[] = [];
        try {
          const customStored = localStorage.getItem(customKey);
          if (customStored) customClasses = JSON.parse(customStored);
        } catch {}
        
        cachedClasses = [...inspectionClasses, ...customClasses];
        return cachedClasses;
      } catch {}
    }
    // If year-specific data doesn't exist, clear cache to use fallback
    cachedClasses = null;
    currentYearConfig = null;
  }
  
  if (cachedClasses) return cachedClasses;
  
  // Fallback to global storage
  try {
    const stored = localStorage.getItem("school-inspection-classes");
    if (stored) {
      const inspectionClasses = JSON.parse(stored);
      const storedCustom = localStorage.getItem("school-custom-classes");
      const customClasses: Classe[] = storedCustom ? JSON.parse(storedCustom) : [];
      cachedClasses = [...inspectionClasses, ...customClasses];
      return cachedClasses;
    }
  } catch {}
  
  cachedClasses = defaultClasses;
  return cachedClasses;
}
let customClasses: Classe[] = [];
let inspectionClasses: Classe[] = []; // Classes from inspection JSON

export function addCustomClass(classe: Omit<Classe, "id" | "estPersonnalise">, year?: string): Classe {
  const newClass: Classe = {
    ...classe,
    id: `custom-${Date.now()}`,
    estPersonnalise: true,
  };
  customClasses.push(newClass);
  localStorage.setItem("school-custom-classes", JSON.stringify(customClasses));
  return newClass;
}

export function deleteCustomClass(classeId: string): boolean {
  const index = customClasses.findIndex(c => c.id === classeId);
  if (index >= 0) {
    customClasses.splice(index, 1);
    localStorage.setItem("school-custom-classes", JSON.stringify(customClasses));
    return true;
  }
  return false;
}

// Import structure from inspection JSON
export interface InspectionData {
  cycles: Cycle[];
  filieres: Filiere[];
  niveaux: Niveau[];
  classes: Classe[];
}

export function importInspectionStructure(data: InspectionData, year?: string): void {
  try {
    // If year is provided, store in year-specific keys
    const suffix = year ? `-${year}` : '';
    
    localStorage.setItem(`school-inspection-classes${suffix}`, JSON.stringify(data.classes));
    localStorage.setItem(`school-inspection-cycles${suffix}`, JSON.stringify(data.cycles));
    localStorage.setItem(`school-inspection-filieres${suffix}`, JSON.stringify(data.filieres));
    localStorage.setItem(`school-inspection-niveaux${suffix}`, JSON.stringify(data.niveaux));
    
    // Clear custom classes when importing new inspection data (for this year)
    const customKey = `school-custom-classes${suffix}`;
    localStorage.removeItem(customKey);
  } catch (error) {
    console.error("Error importing inspection structure:", error);
    throw new Error("Failed to import inspection structure");
  }
}

export function getInspectionData(): InspectionData | null {
  try {
    const cycles = localStorage.getItem("school-inspection-cycles");
    const filieres = localStorage.getItem("school-inspection-filieres");
    const niveaux = localStorage.getItem("school-inspection-niveaux");
    const classes = localStorage.getItem("school-inspection-classes");
    
    if (cycles && filieres && niveaux && classes) {
      return {
        cycles: JSON.parse(cycles),
        filieres: JSON.parse(filieres),
        niveaux: JSON.parse(niveaux),
        classes: JSON.parse(classes),
      };
    }
  } catch {}
  return null;
}

export function clearInspectionData(): void {
  localStorage.removeItem("school-inspection-classes");
  localStorage.removeItem("school-inspection-cycles");
  localStorage.removeItem("school-inspection-filieres");
  localStorage.removeItem("school-inspection-niveaux");
}

// Re-export for backward compatibility
export const classes = getClasses();

// Default data
const defaultAgents: Agent[] = [
  { id: "a1", matricule: "ADM-001", nom: "ADJOKAN", prenoms: "Kodjo", specialite: "Gestion", poste: "Secrétaire Principal", sexe: "M", dateNaissance: "1975-03-15", categorie: "Administratif" },
  { id: "a2", matricule: "ADM-002", nom: "AGBENYO", prenoms: "Afi", specialite: "Comptabilité", poste: "Comptable", sexe: "F", dateNaissance: "1980-07-22", categorie: "Administratif" },
  { id: "a3", matricule: "ENS-001", nom: "KOKOU", prenoms: "Komi", specialite: "Mathématiques", poste: "Professeur", sexe: "M", dateNaissance: "1982-11-10", categorie: "Enseignant" },
  { id: "a4", matricule: "ENS-002", nom: "AWOLI", prenoms: "Akouavi", specialite: "Français", poste: "Professeur", sexe: "F", dateNaissance: "1985-01-28", categorie: "Enseignant" },
  { id: "a5", matricule: "ENS-003", nom: "DZRAMA", prenoms: "Sena", specialite: "Physique-Chimie", poste: "Professeur", sexe: "M", dateNaissance: "1979-06-05", categorie: "Enseignant" },
  { id: "a6", matricule: "ENS-004", nom: "KOKO", prenoms: "Mawuli", specialite: "SVT", poste: "Professeur", sexe: "F", dateNaissance: "1988-09-18", categorie: "Enseignant" },
  { id: "a7", matricule: "ENS-005", nom: "AGBELE", prenoms: "Kossi", specialite: "Anglais", poste: "Professeur", sexe: "M", dateNaissance: "1983-04-12", categorie: "Enseignant" },
  { id: "a8", matricule: "ENS-006", nom: "KODZO", prenoms: "Afia", specialite: "Histoire-Géo", poste: "Professeur", sexe: "F", dateNaissance: "1986-12-01", categorie: "Enseignant" },
  { id: "a9", matricule: "APP-001", nom: "KLOVI", prenoms: "Kodjo", specialite: "Maintenance", poste: "Agent d'entretien", sexe: "M", dateNaissance: "1970-08-20", categorie: "Appui" },
  { id: "a10", matricule: "APP-002", nom: "KPEDE", prenoms: "Kodjo", specialite: "Restauration", poste: "Cuisinière", sexe: "F", dateNaissance: "1978-02-14", categorie: "Appui" },
  { id: "a11", matricule: "ENS-007", nom: "KLODZI", prenoms: "Koffi", specialite: "Mécanique", poste: "Professeur Technique", sexe: "M", dateNaissance: "1981-05-30", categorie: "Enseignant" },
  { id: "a12", matricule: "ENS-008", nom: "AGBLE", prenoms: "Akou", specialite: "Comptabilité", poste: "Professeur Technique", sexe: "F", dateNaissance: "1984-10-08", categorie: "Enseignant" },
];

function generateDefaultEffectifs(): EffectifClasse[] {
  return classes.map(cl => ({
    classeId: cl.id,
    garcons: 15 + Math.floor(Math.random() * 15),
    filles: 12 + Math.floor(Math.random() * 15),
  }));
}

export function getDefaultAppData(): AppData {
  return {
    etablissement: {
      nom: "Lycée Technique de Kara",
      chef: "M. KODJO Koffi Jean",
      region: "Région de Kara",
      ville: "Kara",
      prefecture: "Kara",
      telephone: "+228 22 15 25 35",
    },
    annees: {
      "2025-2026": {
        effectifs: generateDefaultEffectifs(),
        agents: defaultAgents,
      },
    },
  };
}

// Utility functions that work with effectifs
export function getEffectifClasse(effectifs: EffectifClasse[], classeId: string): EffectifClasse {
  return effectifs.find(e => e.classeId === classeId) ?? { classeId, garcons: 0, filles: 0 };
}

export function getEffectifsByNiveau(effectifs: EffectifClasse[], niveauId: string) {
  const classeIds = classes.filter(c => c.niveauId === niveauId).map(c => c.id);
  const matched = effectifs.filter(e => classeIds.includes(e.classeId));
  return {
    garcons: matched.reduce((s, e) => s + e.garcons, 0),
    filles: matched.reduce((s, e) => s + e.filles, 0),
    total: matched.reduce((s, e) => s + e.garcons + e.filles, 0),
  };
}

export function getEffectifsByCycle(effectifs: EffectifClasse[], cycleId: string) {
  const niveauIds = niveaux.filter(n => n.cycleId === cycleId).map(n => n.id);
  const classeIds = classes.filter(c => niveauIds.includes(c.niveauId)).map(c => c.id);
  const matched = effectifs.filter(e => classeIds.includes(e.classeId));
  return {
    garcons: matched.reduce((s, e) => s + e.garcons, 0),
    filles: matched.reduce((s, e) => s + e.filles, 0),
    total: matched.reduce((s, e) => s + e.garcons + e.filles, 0),
  };
}

export function getEffectifsByFiliere(effectifs: EffectifClasse[], filiereId: string) {
  const classeIds = classes.filter(c => c.filiereId === filiereId).map(c => c.id);
  const matched = effectifs.filter(e => classeIds.includes(e.classeId));
  return {
    garcons: matched.reduce((s, e) => s + e.garcons, 0),
    filles: matched.reduce((s, e) => s + e.filles, 0),
    total: matched.reduce((s, e) => s + e.garcons + e.filles, 0),
  };
}

export function getTotalEffectifs(effectifs: EffectifClasse[]) {
  return {
    garcons: effectifs.reduce((s, e) => s + e.garcons, 0),
    filles: effectifs.reduce((s, e) => s + e.filles, 0),
    total: effectifs.reduce((s, e) => s + e.garcons + e.filles, 0),
  };
}
