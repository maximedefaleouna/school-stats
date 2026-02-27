import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  classes, niveaux, cycles, filieres,
  EffectifClasse, Etablissement, Agent, AnneeData,
  getEffectifClasse,
} from "@/data/schoolData";

interface ExportPayload {
  etablissement: Etablissement;
  annee: string;
  data: AnneeData;
}

function buildClasseRows(effectifs: EffectifClasse[]) {
  return classes.map(cl => {
    const e = getEffectifClasse(effectifs, cl.id);
    const niveau = niveaux.find(n => n.id === cl.niveauId);
    const cycle = cycles.find(c => c.id === niveau?.cycleId);
    const filiere = filieres.find(f => f.id === cl.filiereId);
    return {
      Classe: cl.nom,
      Cycle: cycle?.nom ?? "",
      Filière: filiere?.nom ?? "",
      Niveau: niveau?.nom ?? "",
      Garçons: e.garcons,
      Filles: e.filles,
      Total: e.garcons + e.filles,
    };
  });
}

function buildAgentRows(agents: Agent[]) {
  return agents.map(a => ({
    Matricule: a.matricule,
    Nom: a.nom,
    Prénoms: a.prenoms,
    Catégorie: a.categorie,
    Spécialité: a.specialite,
    Poste: a.poste,
    Sexe: a.sexe === "M" ? "Homme" : "Femme",
  }));
}

export function exportExcel({ etablissement, annee, data }: ExportPayload) {
  const wb = XLSX.utils.book_new();

  const effectifRows = buildClasseRows(data.effectifs);
  const ws1 = XLSX.utils.json_to_sheet(effectifRows);
  XLSX.utils.book_append_sheet(wb, ws1, "Effectifs");

  const agentRows = buildAgentRows(data.agents);
  const ws2 = XLSX.utils.json_to_sheet(agentRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Personnel");

  XLSX.writeFile(wb, `${etablissement.nom} - ${annee}.xlsx`);
}

export function exportPDF({ etablissement, annee, data }: ExportPayload) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text(etablissement.nom, 14, 20);
  doc.setFontSize(10);
  doc.text(`Chef: ${etablissement.chef}`, 14, 28);
  doc.text(`${etablissement.ville}, ${etablissement.region} | Tél: ${etablissement.telephone}`, 14, 34);
  doc.text(`Année scolaire: ${annee}`, 14, 40);

  // Effectifs table
  doc.setFontSize(13);
  doc.text("Effectifs par Classe", 14, 52);

  const effectifRows = buildClasseRows(data.effectifs);
  const totalG = effectifRows.reduce((s, r) => s + r.Garçons, 0);
  const totalF = effectifRows.reduce((s, r) => s + r.Filles, 0);

  (doc as any).autoTable({
    startY: 56,
    head: [["Classe", "Cycle", "Filière", "Niveau", "Garçons", "Filles", "Total"]],
    body: [
      ...effectifRows.map(r => [r.Classe, r.Cycle, r.Filière, r.Niveau, r.Garçons, r.Filles, r.Total]),
      ["TOTAL", "", "", "", totalG, totalF, totalG + totalF],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 82] },
    foot: [],
  });

  // Personnel table
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(13);
  doc.text("Personnel", 14, finalY);

  const agentRows = buildAgentRows(data.agents);
  (doc as any).autoTable({
    startY: finalY + 4,
    head: [["Matricule", "Nom", "Prénoms", "Catégorie", "Spécialité", "Poste", "Sexe"]],
    body: agentRows.map(r => [r.Matricule, r.Nom, r.Prénoms, r.Catégorie, r.Spécialité, r.Poste, r.Sexe]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 82] },
  });

  doc.save(`${etablissement.nom} - ${annee}.pdf`);
}

export function exportJSON(payload: ExportPayload) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${payload.etablissement.nom} - ${payload.annee}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
