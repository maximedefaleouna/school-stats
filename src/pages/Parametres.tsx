import { useState, useRef } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Save, Upload, Download, Trash } from "lucide-react";
import {
  importInspectionStructure,
  getInspectionData,
  clearInspectionData,
  InspectionData,
} from "@/data/schoolData";

export default function ParametresPage() {
  const { data, updateEtablissement, importInspectionConfig } = useAppStore();
  const [form, setForm] = useState({ ...data.etablissement });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inspectionData = getInspectionData();

  const handleSave = () => {
    updateEtablissement(form);
    toast({ title: "Enregistré", description: "Les informations de l'établissement ont été mises à jour." });
  };

  const handleConfigImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        const parsed = JSON.parse(json);
        
        // Support both formats: with or without "data" wrapper
        const configData = parsed.data || parsed;
        
        // Validate the imported data
        if (!configData.cycles || !configData.filieres || !configData.niveaux || !configData.classes) {
          console.error('Missing fields:', { 
            hasCycles: !!configData.cycles, 
            hasFilieres: !!configData.filieres, 
            hasNiveaux: !!configData.niveaux, 
            hasClasses: !!configData.classes 
          });
          throw new Error("Structure JSON invalide");
        }
        
        importInspectionStructure(configData);
        toast({ 
          title: "Import réussi", 
          description: `La structure de l'inspection a été importée (${configData.classes.length} classes).` 
        });
        
        // Force reload to apply changes
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error('Import error:', error);
        toast({ 
          title: "Erreur", 
          description: "Le fichier JSON est invalide ou corrompu.", 
          variant: "destructive" 
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearInspection = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer la structure de l'inspection ? Les classes personnalisées seront également supprimées.")) {
      clearInspectionData();
      toast({ title: "Supprimé", description: "La structure de l'inspection a été réinitialisée." });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Import Inspection Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg">Structure de l'Inspection</h3>
        <p className="text-sm text-muted-foreground">
          Importez la structure officielle des cycles, filières, niveaux et classes définie par l'inspection.
        </p>
        
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".json" 
          className="hidden" 
          onChange={handleFileImport} 
        />
        
        {inspectionData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm font-medium text-success">Structure importée</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearInspection}>
                <Trash className="h-3.5 w-3.5 mr-1" />
                Supprimer
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{inspectionData.cycles.length}</p>
                <p className="text-xs text-muted-foreground">Cycles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{inspectionData.filieres.length}</p>
                <p className="text-xs text-muted-foreground">Filières</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{inspectionData.niveaux.length}</p>
                <p className="text-xs text-muted-foreground">Niveaux</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{inspectionData.classes.length}</p>
                <p className="text-xs text-muted-foreground">Classes</p>
              </div>
            </div>
          </div>
        ) : (
          <Button onClick={handleConfigImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importer inspection-config.json
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>Format attendu :</p>
          <code className="block mt-1 p-2 bg-muted rounded">{`{ cycles: [], filieres: [], niveaux: [], classes: [] }`}</code>
        </div>
      </div>
      
      {/* Etablissement Info Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="font-heading font-bold text-lg">Informations de l'établissement</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Nom de l'établissement</Label>
            <Input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Chef d'établissement</Label>
            <Input value={form.chef} onChange={e => setForm(p => ({ ...p, chef: e.target.value }))} />
          </div>
          <div>
            <Label>Région</Label>
            <Input value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} />
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={form.ville} onChange={e => setForm(p => ({ ...p, ville: e.target.value }))} />
          </div>
          <div>
            <Label>Préfecture</Label>
            <Input value={form.prefecture} onChange={e => setForm(p => ({ ...p, prefecture: e.target.value }))} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}