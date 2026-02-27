import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Agent, CategoriePersonnel, Sexe } from "@/data/schoolData";
import { useAppStore } from "@/hooks/useAppStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categorieColors: Record<CategoriePersonnel, string> = {
  Administratif: "bg-accent/15 text-accent-foreground border-accent/30",
  Enseignant: "bg-primary/10 text-primary border-primary/20",
  Appui: "bg-success/15 text-success border-success/30",
};

export default function PersonnelPage() {
  const { currentAnnee, setAgents } = useAppStore();
  const agentsList = currentAnnee.agents;

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const filtered = agentsList.filter(a => {
    const matchSearch = `${a.nom} ${a.prenoms} ${a.matricule} ${a.specialite}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || a.categorie === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (agent: Agent) => {
    if (editingAgent) {
      setAgents(agentsList.map(a => a.id === agent.id ? agent : a));
    } else {
      setAgents([...agentsList, { ...agent, id: `a${Date.now()}` }]);
    }
    setDialogOpen(false);
    setEditingAgent(null);
  };

  const handleDelete = (id: string) => {
    setAgents(agentsList.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un agent..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="Administratif">Administratif</SelectItem>
              <SelectItem value="Enseignant">Enseignant</SelectItem>
              <SelectItem value="Appui">Appui</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditingAgent(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">{filtered.length} agent(s)</span>
        <span className="text-muted-foreground">•</span>
        <span>{agentsList.filter(a => a.sexe === "M").length} H / {agentsList.filter(a => a.sexe === "F").length} F</span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Matricule</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom & Prénoms</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Spécialité</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Poste</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Sexe</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(agent => (
                <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{agent.matricule}</td>
                  <td className="px-4 py-3 font-medium">{agent.nom} {agent.prenoms}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{agent.specialite}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{agent.poste}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={categorieColors[agent.categorie]}>{agent.categorie}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{agent.sexe === "M" ? "Homme" : "Femme"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingAgent(agent); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(agent.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AgentDialog open={dialogOpen} onOpenChange={setDialogOpen} agent={editingAgent} onSave={handleSave} />
    </div>
  );
}

function AgentDialog({ open, onOpenChange, agent, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; agent: Agent | null; onSave: (a: Agent) => void;
}) {
  const [form, setForm] = useState<Partial<Agent>>(agent ?? {});

  const handleOpenChange = (v: boolean) => {
    if (v) setForm(agent ?? {});
    onOpenChange(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: agent?.id ?? "",
      matricule: form.matricule ?? "",
      nom: form.nom ?? "",
      prenoms: form.prenoms ?? "",
      specialite: form.specialite ?? "",
      poste: form.poste ?? "",
      sexe: (form.sexe as Sexe) ?? "M",
      dateNaissance: form.dateNaissance ?? "",
      categorie: (form.categorie as CategoriePersonnel) ?? "Enseignant",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{agent ? "Modifier l'agent" : "Nouvel agent"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Matricule</Label>
              <Input value={form.matricule ?? ""} onChange={e => setForm(p => ({ ...p, matricule: e.target.value }))} required />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.categorie ?? "Enseignant"} onValueChange={v => setForm(p => ({ ...p, categorie: v as CategoriePersonnel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administratif">Administratif</SelectItem>
                  <SelectItem value="Enseignant">Enseignant</SelectItem>
                  <SelectItem value="Appui">Appui</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={form.nom ?? ""} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} required />
            </div>
            <div>
              <Label>Prénoms</Label>
              <Input value={form.prenoms ?? ""} onChange={e => setForm(p => ({ ...p, prenoms: e.target.value }))} required />
            </div>
            <div>
              <Label>Spécialité</Label>
              <Input value={form.specialite ?? ""} onChange={e => setForm(p => ({ ...p, specialite: e.target.value }))} />
            </div>
            <div>
              <Label>Poste occupé</Label>
              <Input value={form.poste ?? ""} onChange={e => setForm(p => ({ ...p, poste: e.target.value }))} />
            </div>
            <div>
              <Label>Sexe</Label>
              <Select value={form.sexe ?? "M"} onValueChange={v => setForm(p => ({ ...p, sexe: v as Sexe }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date de naissance</Label>
              <Input type="date" value={form.dateNaissance ?? ""} onChange={e => setForm(p => ({ ...p, dateNaissance: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit">{agent ? "Enregistrer" : "Ajouter"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
