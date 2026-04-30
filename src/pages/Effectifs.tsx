import { useState, useMemo } from "react";
import { GraduationCap, Users, Pencil, Check, X, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/hooks/useAppStore";
import {
  getCycles, getFilieres, getNiveaux, getClasses, addCustomClass, deleteCustomClass,
  getEffectifClasse, getTotalEffectifs,
} from "@/data/schoolData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function EffectifsPage() {
  const { currentAnnee, updateEffectif, selectedYear } = useAppStore();
  const effectifs = currentAnnee.effectifs;
  const classes = getClasses(selectedYear); // Get dynamic classes for current year
  const cycles = getCycles(selectedYear); // Get dynamic cycles for current year
  const filieres = getFilieres(selectedYear); // Get dynamic filieres for current year
  const niveaux = getNiveaux(selectedYear); // Get dynamic niveaux for current year

  const [selectedCycle, setSelectedCycle] = useState<string>("all");
  const [selectedFiliere, setSelectedFiliere] = useState<string>("all");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editG, setEditG] = useState(0);
  const [editF, setEditF] = useState(0);
  
  // New class dialog state
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassNiveau, setNewClassNiveau] = useState<string>("");
  const [newClassFiliere, setNewClassFiliere] = useState<string>("");

  const filteredFilieres = selectedCycle === "all" ? filieres : filieres.filter(f => f.cycleId === selectedCycle);
  const filteredNiveaux = selectedCycle === "all" ? niveaux : niveaux.filter(n => n.cycleId === selectedCycle);

  const filteredClasses = useMemo(() => {
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

  const filteredEffectifs = effectifs.filter(e => filteredClasses.some(cl => cl.id === e.classeId));
  const totals = getTotalEffectifs(filteredEffectifs);

  const startEdit = (classeId: string) => {
    const e = getEffectifClasse(effectifs, classeId);
    setEditingId(classeId);
    setEditG(e.garcons);
    setEditF(e.filles);
  };

  const saveEdit = () => {
    if (editingId) {
      updateEffectif(editingId, editG, editF);
      setEditingId(null);
    }
  };

  const handleCreateClass = () => {
    if (newClassName && newClassNiveau && newClassFiliere) {
      addCustomClass({
        nom: newClassName,
        niveauId: newClassNiveau,
        filiereId: newClassFiliere,
      });
      setNewClassName("");
      setNewClassNiveau("");
      setNewClassFiliere("");
      setNewClassDialogOpen(false);
    }
  };

  const handleDeleteClass = (classeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      deleteCustomClass(classeId);
      // Force re-render by toggling state
      setSelectedCycle(prev => prev === "all" ? "temp" : "all");
      setTimeout(() => setSelectedCycle("all"), 10);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedCycle} onValueChange={v => { setSelectedCycle(v); setSelectedFiliere("all"); setSelectedNiveau("all"); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Cycle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les cycles</SelectItem>
            {cycles.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
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
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">{totals.total}</span>
          <span className="text-sm text-muted-foreground">élèves</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-info" />
          <span className="text-sm"><strong>{totals.garcons}</strong> garçons</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <span className="text-sm"><strong>{totals.filles}</strong> filles</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <span className="text-sm text-muted-foreground">{filteredClasses.length} classe(s)</span>
        
        <Button 
          size="sm" 
          className="ml-auto"
          onClick={() => {
            // Pre-select based on current filters
            if (selectedNiveau !== "all") setNewClassNiveau(selectedNiveau);
            if (selectedFiliere !== "all") setNewClassFiliere(selectedFiliere);
            setNewClassDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle classe
        </Button>
      </div>

      {/* Classes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(cl => {
          const e = getEffectifClasse(effectifs, cl.id);
          const total = e.garcons + e.filles;
          const filiere = filieres.find(f => f.id === cl.filiereId);
          const niveau = niveaux.find(n => n.id === cl.niveauId);
          const cycle = cycles.find(c => c.id === niveau?.cycleId);
          const isEditing = editingId === cl.id;

          return (
            <div key={cl.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-heading font-bold">{cl.nom}</h4>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{cycle?.nom}</Badge>
                  {cl.estPersonnalise && (
                    <Badge variant="secondary" className="text-xs">Personnalisée</Badge>
                  )}
                  {!isEditing ? (
                    <div className="flex gap-0.5">
                      <button onClick={() => startEdit(cl.id)} className="p-1 rounded-md hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {cl.estPersonnalise && (
                        <button onClick={() => handleDeleteClass(cl.id)} className="p-1 rounded-md hover:bg-destructive/10 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
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
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Garçons</p>
                    <Input type="number" min={0} value={editG} onChange={ev => setEditG(Number(ev.target.value))} className="h-8 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Filles</p>
                    <Input type="number" min={0} value={editF} onChange={ev => setEditF(Number(ev.target.value))} className="h-8 text-sm" />
                  </div>
                  <div className="text-center pb-1">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-sm">{editG + editF}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-heading font-bold">{total}</p>
                      <p className="text-xs text-muted-foreground">élèves</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-info">{e.garcons}</p>
                        <p className="text-xs text-muted-foreground">G</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-accent">{e.filles}</p>
                        <p className="text-xs text-muted-foreground">F</p>
                      </div>
                    </div>
                  </div>
                  {total > 0 && (
                    <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-muted">
                      <div className="bg-info" style={{ width: `${(e.garcons / total) * 100}%` }} />
                      <div className="bg-accent" style={{ width: `${(e.filles / total) * 100}%` }} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* New Class Dialog */}
      <Dialog open={newClassDialogOpen} onOpenChange={setNewClassDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Créer une nouvelle classe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la classe</Label>
              <Input 
                value={newClassName} 
                onChange={e => setNewClassName(e.target.value)} 
                placeholder="Ex: 2nde A3, 1ère B, etc."
              />
              <p className="text-xs text-muted-foreground">
                Nom unique pour identifier la classe (ex: A3, B, C, etc.)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Cycle</Label>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cycle" />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={newClassNiveau} onValueChange={setNewClassNiveau}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {filteredNiveaux.map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filière</Label>
              <Select value={newClassFiliere} onValueChange={setNewClassFiliere}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une filière" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFilieres.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClassDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateClass} disabled={!newClassName || !newClassNiveau || !newClassFiliere}>
              Créer la classe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
