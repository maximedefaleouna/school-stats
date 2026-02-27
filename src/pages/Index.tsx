import { Users, GraduationCap, Building } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatCard from "@/components/StatCard";
import { useAppStore } from "@/hooks/useAppStore";
import {
  cycles, niveaux, classes,
  getEffectifsByCycle, getEffectifsByNiveau, getEffectifClasse, getTotalEffectifs,
} from "@/data/schoolData";

const CHART_COLORS = [
  "hsl(222, 60%, 28%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(210, 80%, 52%)",
  "hsl(340, 65%, 55%)",
  "hsl(270, 50%, 50%)",
];

export default function Dashboard() {
  const { data, currentAnnee, selectedYear } = useAppStore();
  const effectifs = currentAnnee.effectifs;
  const agents = currentAnnee.agents;
  const etab = data.etablissement;

  const totals = getTotalEffectifs(effectifs);

  const cycleData = cycles.map((c, i) => ({
    name: c.nom,
    value: getEffectifsByCycle(effectifs, c.id).total,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const niveauData = niveaux.map((n) => {
    const s = getEffectifsByNiveau(effectifs, n.id);
    const cycle = cycles.find(c => c.id === n.cycleId);
    return { name: `${n.nom} (${cycle?.nom})`, Garçons: s.garcons, Filles: s.filles };
  });

  const personnelData = [
    { name: "Enseignant", value: agents.filter(a => a.categorie === "Enseignant").length, fill: CHART_COLORS[0] },
    { name: "Administratif", value: agents.filter(a => a.categorie === "Administratif").length, fill: CHART_COLORS[1] },
    { name: "Appui", value: agents.filter(a => a.categorie === "Appui").length, fill: CHART_COLORS[2] },
  ];

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-xl bg-primary p-5 text-primary-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-heading text-lg font-bold">{etab.nom}</h3>
            <p className="text-sm opacity-80">
              {etab.ville}, {etab.region} • Année scolaire {selectedYear}
            </p>
          </div>
          <span className="text-xs opacity-60 bg-primary-foreground/10 px-3 py-1 rounded-full self-start">
            {etab.prefecture}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Élèves" value={totals.total} icon={GraduationCap} color="primary" description="Inscrits cette année" />
        <StatCard title="Garçons" value={totals.garcons} icon={Users} color="info" description={totals.total > 0 ? `${((totals.garcons / totals.total) * 100).toFixed(1)}% de l'effectif` : "—"} />
        <StatCard title="Filles" value={totals.filles} icon={Users} color="accent" description={totals.total > 0 ? `${((totals.filles / totals.total) * 100).toFixed(1)}% de l'effectif` : "—"} />
        <StatCard title="Personnel" value={agents.length} icon={Building} color="success" description={`${agents.filter(a => a.categorie === "Enseignant").length} enseignants`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold text-base mb-4">Répartition par Cycle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={cycleData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {cycleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold text-base mb-4">Effectifs par Niveau & Sexe</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={niveauData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Garçons" fill={CHART_COLORS[3]} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Filles" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold text-base mb-4">Répartition du Personnel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={personnelData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {personnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-bold text-base mb-4">Effectifs par Classe</h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            {classes.map(cl => {
              const e = getEffectifClasse(effectifs, cl.id);
              const count = e.garcons + e.filles;
              const pct = totals.total > 0 ? (count / totals.total) * 100 : 0;
              return (
                <div key={cl.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-28 truncate">{cl.nom}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
