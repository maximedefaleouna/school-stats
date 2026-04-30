import { useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap, BarChart3, School, Menu, X, Settings, Download, Upload, FileJson, FileSpreadsheet, FileText, Plus, CalendarDays, BookOpen } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { exportJSON, exportExcel, exportPDF } from "@/lib/exportUtils";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/personnel", label: "Personnel", icon: Users },
  { to: "/effectifs", label: "Effectifs", icon: GraduationCap },
  { to: "/examen", label: "Examens", icon: BookOpen },
  { to: "/statistiques", label: "Statistiques", icon: BarChart3 },
  { to: "/parametres", label: "Paramètres", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newYearOpen, setNewYearOpen] = useState(false);
  const [newYear, setNewYear] = useState("");
  const location = useLocation();
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (format: "json" | "excel" | "pdf") => {
    const payload = store.getExportData();
    if (format === "json") exportJSON(payload);
    else if (format === "excel") exportExcel(payload);
    else exportPDF(payload);
    toast({ title: "Export réussi", description: `Données exportées en ${format.toUpperCase()}.` });
  };

  const handleImport = () => {
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
        const year = parsed.annee || store.selectedYear;
        store.importYearJSON(json, year);
        toast({ title: "Import réussi", description: `Données de l'année ${year} importées.` });
      } catch {
        toast({ title: "Erreur", description: "Fichier JSON invalide.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAddYear = () => {
    if (newYear && /^\d{4}-\d{4}$/.test(newYear)) {
      store.addYear(newYear);
      setNewYearOpen(false);
      setNewYear("");
      toast({ title: "Année ajoutée", description: `Année ${newYear} créée.` });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileImport} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <School className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-heading font-bold truncate">{store.data.etablissement.nom}</h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">Année {store.selectedYear}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-lg bg-sidebar-accent/50">
          <p className="text-xs text-sidebar-foreground/60 font-medium">Chef d'établissement</p>
          <p className="text-sm font-medium mt-0.5">{store.data.etablissement.chef}</p>
          <p className="text-xs text-sidebar-foreground/50 mt-1">{store.data.etablissement.telephone}</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-heading font-bold">
            {navItems.find(n => n.to === location.pathname)?.label ?? "Page"}
          </h2>

          <div className="ml-auto flex items-center gap-2">
            {/* Year selector */}
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={store.selectedYear} onValueChange={store.setSelectedYear}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {store.availableYears.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNewYearOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Export/Import */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <FileJson className="h-4 w-4 mr-2" /> JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleImport}>
              <Upload className="h-3.5 w-3.5 mr-1" />
              Importer
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* New Year Dialog */}
      <Dialog open={newYearOpen} onOpenChange={setNewYearOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Nouvelle année scolaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Année (format: 2026-2027)</Label>
              <Input value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="2026-2027" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewYearOpen(false)}>Annuler</Button>
              <Button onClick={handleAddYear}>Créer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
