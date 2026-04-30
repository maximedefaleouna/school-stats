import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { AppData, AnneeData, Etablissement, Agent, EffectifClasse, getDefaultAppData } from "@/data/schoolData";
import { InspectionData, importInspectionStructure, clearConfigCache } from "@/data/schoolData";

const STORAGE_KEY = "school-app-data";
const YEAR_KEY = "school-selected-year";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultAppData();
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export interface AppStore {
  data: AppData;
  selectedYear: string;
  availableYears: string[];
  currentAnnee: AnneeData;

  setSelectedYear: (year: string) => void;
  addYear: (year: string) => void;

  // Etablissement
  updateEtablissement: (etab: Etablissement) => void;

  // Agents (per year)
  setAgents: (agents: Agent[]) => void;

  // Effectifs (per year)
  setEffectifs: (effectifs: EffectifClasse[]) => void;
  updateEffectif: (classeId: string, garcons: number, filles: number) => void;

  // Import/Export
  exportYearJSON: () => string;
  importYearJSON: (json: string, year: string) => void;
  getExportData: () => { etablissement: Etablissement; annee: string; data: AnneeData };
  
  // Inspection config import
  importInspectionConfig: (config: InspectionData) => void;
}

const emptyAnnee: AnneeData = { effectifs: [], agents: [] };

export function useAppStoreImpl(): AppStore {
  const [data, setData] = useState<AppData>(loadData);
  const [selectedYear, setSelectedYearInternal] = useState<string>(() => {
    return localStorage.getItem(YEAR_KEY) || "2025-2026";
  });

  useEffect(() => { saveData(data); }, [data]);
  
  const setSelectedYear = useCallback((year: string) => {
    localStorage.setItem(YEAR_KEY, year);
    clearConfigCache(); // Clear cache when changing years
    setSelectedYearInternal(year);
  }, []);

  const availableYears = Object.keys(data.annees).sort();
  const currentAnnee = data.annees[selectedYear] ?? emptyAnnee;

  const addYear = useCallback((year: string) => {
    setData(prev => {
      // Copy agents from the CURRENT selected year (not first year)
      const newYearData: AnneeData = {
        effectifs: [],
        agents: [...(prev.annees[selectedYear]?.agents ?? [])],
      };
      
      return {
        ...prev,
        annees: {
          ...prev.annees,
          [year]: prev.annees[year] ?? newYearData,
        },
      };
    });
    setSelectedYear(year);
  }, [selectedYear]);

  const updateEtablissement = useCallback((etab: Etablissement) => {
    setData(prev => ({ ...prev, etablissement: etab }));
  }, []);

  const setAgents = useCallback((agents: Agent[]) => {
    setData(prev => ({
      ...prev,
      annees: { ...prev.annees, [selectedYear]: { ...prev.annees[selectedYear], agents } },
    }));
  }, [selectedYear]);

  const setEffectifs = useCallback((effectifs: EffectifClasse[]) => {
    setData(prev => ({
      ...prev,
      annees: { ...prev.annees, [selectedYear]: { ...prev.annees[selectedYear], effectifs } },
    }));
  }, [selectedYear]);

  const updateEffectif = useCallback((classeId: string, garcons: number, filles: number) => {
    setData(prev => {
      const annee = prev.annees[selectedYear] ?? emptyAnnee;
      const existing = annee.effectifs.findIndex(e => e.classeId === classeId);
      const newEffectifs = [...annee.effectifs];
      if (existing >= 0) {
        newEffectifs[existing] = { classeId, garcons, filles };
      } else {
        newEffectifs.push({ classeId, garcons, filles });
      }
      return {
        ...prev,
        annees: { ...prev.annees, [selectedYear]: { ...annee, effectifs: newEffectifs } },
      };
    });
  }, [selectedYear]);

  const exportYearJSON = useCallback(() => {
    const exportObj = {
      etablissement: data.etablissement,
      annee: selectedYear,
      data: currentAnnee,
    };
    return JSON.stringify(exportObj, null, 2);
  }, [data.etablissement, selectedYear, currentAnnee]);

  const importYearJSON = useCallback((json: string, year: string) => {
    const parsed = JSON.parse(json);
    const anneeData: AnneeData = parsed.data ?? { effectifs: parsed.effectifs ?? [], agents: parsed.agents ?? [] };
    if (parsed.etablissement) {
      setData(prev => ({
        ...prev,
        etablissement: parsed.etablissement,
        annees: { ...prev.annees, [year]: anneeData },
      }));
    } else {
      setData(prev => ({
        ...prev,
        annees: { ...prev.annees, [year]: anneeData },
      }));
    }
    setSelectedYear(year);
  }, []);

  const getExportData = useCallback(() => ({
    etablissement: data.etablissement,
    annee: selectedYear,
    data: currentAnnee,
  }), [data.etablissement, selectedYear, currentAnnee]);

  const importInspectionConfig = useCallback((config: InspectionData) => {
    importInspectionStructure(config, selectedYear); // Import for current year
  }, [selectedYear]);

  return {
    data, selectedYear, availableYears, currentAnnee,
    setSelectedYear, addYear,
    updateEtablissement, setAgents, setEffectifs, updateEffectif,
    exportYearJSON, importYearJSON, getExportData, importInspectionConfig,
  };
}

const AppStoreContext = createContext<AppStore | null>(null);

export const AppStoreProvider = AppStoreContext.Provider;

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
