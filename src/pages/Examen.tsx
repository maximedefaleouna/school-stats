import { useState, useMemo } from "react";
import { BookOpen, Pencil, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/hooks/useAppStore";
import {
  getCycles, getFilieres, getNiveaux, getClasses,
} from "@/data/schoolData";

// Types
export interface ExamenClasse {
  classeId: string;
  garcons: number;
  filles: number;
  compose: number; // number of subjects/composition
}

export default function ExamenPage() {
  const { currentAnnee, setEffectifs, selectedYear } = useAppStore();
  
  // Use effectifs as base data and add exam-specific data
  const [examenData, setExamenData] = useState<Record<string, ExamenClasse>>({});
  
  const [selectedCycle, setSelectedCycle] = useState<string>("all");
  const [selectedFiliere, setSelectedFiliere] = useState<string>("all");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editG, setEditG] = useState(0);
  const [editF, setEditF] = useState(0);
  const [editCompose, setEditCompose] = useState(0);

  const filteredFilieres = selectedCycle === "all" ? getFilieres(selectedYear) : getFilieres(selectedYear).filter(f => f.cycleId === selectedCycle);
  const filteredNiveaux = selectedCycle === "all" ? getNiveaux(selectedYear) : getNiveaux(selectedYear).filter(n => n.cycleId === selectedCycle);

  const filteredClasses = useMemo(() => {
    const classes = getClasses(selectedYear); // Get dynamic classes for current year
    const cycles = getCycles(selectedYear); // Get dynamic cycles for current year
    const filieres = getFilieres(selectedYear); // Get dynamic filieres for current year
    const niveaux = getNiveaux(selectedYear); // Get dynamic niveaux for current year
    return classes.filter(cl => {
      if (selectedNiveau !== "all" && cl.niveauId !== selectedNiveau) return false;
      if (selectedFiliere !== "all" && cl.filiereId !== selectedFiliere) return false;
      if (selectedCycle !== "all") {
        const niv = niveaux.find(n => n.id === cl.niveauId);
        if (niv && niv.cycleId !== selectedCycle) return false;
      }
      return true;
    });
  }, [selectedCycle, selectedFiliere, selectedNiveau]);

  const getExamenClasse = (classeId: string): ExamenClasse => {
    if (examenData[classeId]) return examenData[classeId];
    
    // Initialize from existing effectifs if available
    const effectif = currentAnnee.effectifs.find(e => e.classeId === classeId);
    return {
      classeId,
      garcons: effectif?.garcons ?? 0,
      filles: effectif?.filles ?? 0,
      compose: 0,
    };
  };

  const startEdit = (classeId: string) => {
    const data = getExamenClasse(classeId);
    setEditingId(classeId);
    setEditG(data.garcons);
    setEditF(data.filles);
    setEditCompose(data.compose);
  };

  const saveEdit = () => {
    if (editingId) {
      const updated: ExamenClasse = {
        classeId: editingId,
        garcons: editG,
        filles: editF,
        compose: editCompose,
      };
      
      setExamenData(prev => ({ ...prev, [editingId]: updated }));
      
      // Also update effectifs in the store
      const newEffectifs = currentAnnee.effectifs.filter(e => e.classeId !== editingId);
      newEffectifs.push({ classeId: editingId, garcons: editG, filles: editF });
      setEffectifs(newEffectifs);
      
      setEditingId(null);
    }
  };

  const totals = useMemo(() => {
    const filtered = filteredClasses.map(cl => getExamenClasse(cl.id));
    return {
      garcons: filtered.reduce((sum, e) => sum + e.garcons, 0),
      filles: filtered.reduce((sum, e) => sum + e.filles, 0),
      total: filtered.reduce((sum, e) => sum + e.garcons + e.filles, 0),
      compose: filtered.reduce((sum, e) => sum + e.compose, 0),
    };
  }, [filteredClasses, examenData, currentAnnee.effectifs]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedCycle} onValueChange={v => { setSelectedCycle(v); setSelectedFiliere("all"); setSelectedNiveau("all"); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Cycle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les cycles</SelectItem>
            {getCycles(selectedYear).map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filière" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes filières</SelectItem>
            {filteredFilieres.map(f => <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Niveau" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            {filteredNiveaux.map(n => <SelectItem key={n.id} value={n.id}>{n.nom}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 items-center rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">{totals.total}</span>
          <span className="text-sm text-muted-foreground">élèves inscrits aux examens</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm"><strong>{totals.garcons}</strong> garçons</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm"><strong>{totals.filles}</strong> filles</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm"><strong>{totals.compose}</strong> compositions</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <span className="text-sm text-muted-foreground">{filteredClasses.length} classe(s)</span>
      </div>

      {/* Classes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(cl => {
          const data = getExamenClasse(cl.id);
          const total = data.garcons + data.filles;
          const filiere = getFilieres(selectedYear).find(f => f.id === cl.filiereId);
          const niveau = getNiveaux(selectedYear).find(n => n.id === cl.niveauId);
          const cycle = getCycles(selectedYear).find(c => c.id === niveau?.cycleId);
          const isEditing = editingId === cl.id;

          return (
            <div key={cl.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-heading font-bold">{cl.nom}</h4>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{cycle?.nom}</Badge>
                  {!isEditing ? (
                    <button onClick={() => startEdit(cl.id)} className="p-1 rounded-md hover:bg-muted">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ) : (
                    <div className="flex gap-0.5">
                      <button onClick={saveEdit} className="p-1 rounded-md hover:bg-success/10 text-success">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 rounded-md hover:bg-destructive/10 text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{filiere?.nom} • {niveau?.nom}</p>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Garçons</p>
                      <Input type="number" min={0} value={editG} onChange={ev => setEditG(Number(ev.target.value))} className="h-8 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Filles</p>
                      <Input type="number" min={0} value={editF} onChange={ev => setEditF(Number(ev.target.value))} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nombre de compositions</p>
                    <Input type="number" min={0} value={editCompose} onChange={ev => setEditCompose(Number(ev.target.value))} className="h-8 text-sm" />
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total élèves:</span>
                      <span className="font-bold">{editG + editF}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-2xl font-heading font-bold">{total}</p>
                      <p className="text-xs text-muted-foreground">élèves</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-info">{data.garcons}</p>
                        <p className="text-xs text-muted-foreground">G</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-accent">{data.filles}</p>
                        <p className="text-xs text-muted-foreground">F</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Compositions</span>
                      </div>
                      <span className="text-lg font-bold text-primary">{data.compose}</span>
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-muted">
                      <div className="bg-info" style={{ width: `${(data.garcons / total) * 100}%` }} />
                      <div className="bg-accent" style={{ width: `${(data.filles / total) * 100}%` }} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
