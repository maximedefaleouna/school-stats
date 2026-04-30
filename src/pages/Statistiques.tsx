import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAppStore } from "@/hooks/useAppStore";
import {
  getCycles, getFilieres, getNiveaux, getClasses,
  getEffectifsByCycle, getEffectifsByFiliere, getEffectifsByNiveau, getEffectifClasse, getTotalEffectifs,
} from "@/data/schoolData";

const COLORS = [
  "hsl(222, 60%, 28%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(210, 80%, 52%)",
  "hsl(340, 65%, 55%)",
  "hsl(270, 50%, 50%)",
  "hsl(180, 50%, 45%)",
];

export default function StatistiquesPage() {
  const { currentAnnee, selectedYear } = useAppStore();
  const effectifs = currentAnnee.effectifs;
  const cycles = getCycles(selectedYear);
  const filieres = getFilieres(selectedYear);
  const niveaux = getNiveaux(selectedYear);
  const classes = getClasses(selectedYear);
  const totals = getTotalEffectifs(effectifs);

  const cycleData = cycles.map((c, i) => ({
    name: c.nom,
    value: getEffectifsByCycle(effectifs, c.id).total,
    fill: COLORS[i],
  }));

  const filiereData = filieres.map((f, i) => ({
    name: f.nom,
    Effectif: getEffectifsByFiliere(effectifs, f.id).total,
    fill: COLORS[i % COLORS.length],
  }));

  const niveauSexeData = niveaux.map(n => {
    const s = getEffectifsByNiveau(effectifs, n.id);
    const cycle = cycles.find(c => c.id === n.cycleId);
    return { name: `${n.nom} (${cycle?.nom})`, Garçons: s.garcons, Filles: s.filles };
  });

  const classeSexeData = classes.map(cl => {
    const e = getEffectifClasse(effectifs, cl.id);
    return { name: cl.nom, Garçons: e.garcons, Filles: e.filles, Total: e.garcons + e.filles };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5 text-center">
          <p className="text-3xl font-heading font-bold">{totals.total}</p>
          <p className="text-sm text-muted-foreground">Total inscrits</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5 text-center">
          <p className="text-3xl font-heading font-bold text-info">{totals.garcons}</p>
          <p className="text-sm text-muted-foreground">Garçons ({totals.total > 0 ? ((totals.garcons / totals.total) * 100).toFixed(1) : 0}%)</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5 text-center">
          <p className="text-3xl font-heading font-bold text-accent">{totals.filles}</p>
          <p className="text-sm text-muted-foreground">Filles ({totals.total > 0 ? ((totals.filles / totals.total) * 100).toFixed(1) : 0}%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold mb-4">Répartition par Cycle</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={cycleData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {cycleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold mb-4">Effectifs par Filière</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filiereData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Effectif" radius={[4, 4, 0, 0]}>
                {filiereData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold mb-4">Répartition par Niveau et Sexe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={niveauSexeData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Garçons" fill="hsl(210, 80%, 52%)" stackId="a" />
              <Bar dataKey="Filles" fill="hsl(38, 92%, 50%)" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold mb-4">Détails par Classe</h3>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Classe</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">G</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">F</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {classeSexeData.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 px-2 font-medium">{row.name}</td>
                    <td className="text-right py-2 px-2 text-info">{row.Garçons}</td>
                    <td className="text-right py-2 px-2 text-accent">{row.Filles}</td>
                    <td className="text-right py-2 px-2 font-bold">{row.Total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
