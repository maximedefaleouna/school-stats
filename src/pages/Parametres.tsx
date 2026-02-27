import { useState } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function ParametresPage() {
  const { data, updateEtablissement } = useAppStore();
  const [form, setForm] = useState({ ...data.etablissement });

  const handleSave = () => {
    updateEtablissement(form);
    toast({ title: "Enregistré", description: "Les informations de l'établissement ont été mises à jour." });
  };

  return (
    <div className="max-w-2xl space-y-6">
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
