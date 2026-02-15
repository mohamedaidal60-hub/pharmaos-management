import { useState } from "react";
import { motion } from "framer-motion";
import { Warehouse, AlertTriangle, Package, RefreshCw, Search, BarChart3, ArrowUpDown, Calendar } from "lucide-react";
import { products, formatCurrency } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { usePendingActions } from "@/hooks/usePendingActions";

const Stock = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "analytics">("list");
  const { submitAction } = usePendingActions();

  const inStock = products.filter((p) => p.status === "in-stock").length;
  const lowStock = products.filter((p) => p.status === "low-stock").length;
  const outOfStock = products.filter((p) => p.status === "out-of-stock").length;
  const expired = products.filter((p) => p.status === "expired").length;
  const totalValue = products.reduce((s, p) => s + p.retailPrice * p.quantity, 0);

  const stockByCategory = products.reduce((acc, p) => {
    const existing = acc.find(c => c.category === p.category);
    if (existing) { existing.quantity += p.quantity; existing.value += p.retailPrice * p.quantity; }
    else { acc.push({ category: p.category, quantity: p.quantity, value: p.retailPrice * p.quantity }); }
    return acc;
  }, [] as { category: string; quantity: number; value: number }[]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.batchNumber.toLowerCase().includes(search.toLowerCase()));

  const handleReorder = async (p: typeof products[0]) => {
    await submitAction("stock_adjustment", `Réapprovisionnement: ${p.name}`, `Demande de réapprovisionnement pour ${p.name} (stock actuel: ${p.quantity}, seuil: ${p.reorderLevel})`, { productId: p.id, productName: p.name, currentStock: p.quantity, reorderLevel: p.reorderLevel } as any);
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Gestion des Stocks</h1><p className="page-subtitle">Suivi en temps réel, alertes et inventaire</p></div>
        <div className="flex gap-2">
          <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Liste</button>
          <button onClick={() => setView("analytics")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "analytics" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Analytique</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "En stock", value: inStock, icon: Package, cls: "text-success" },
          { label: "Stock faible", value: lowStock, icon: AlertTriangle, cls: "text-warning" },
          { label: "Rupture", value: outOfStock, icon: Warehouse, cls: "text-destructive" },
          { label: "Expirés", value: expired, icon: Calendar, cls: "text-destructive" },
          { label: "Valeur totale", value: formatCurrency(totalValue), icon: BarChart3, cls: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="stat-card"><div className="flex items-center gap-2 mb-1"><s.icon size={16} className={s.cls} /><span className="text-xs text-muted-foreground">{s.label}</span></div><p className="text-xl font-bold font-display">{s.value}</p></div>
        ))}
      </div>

      {view === "analytics" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4">Stock par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}><BarChart data={stockByCategory}><CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" /><XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" /><YAxis tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" /><Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} /><Bar dataKey="quantity" fill="hsl(168,80%,36%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4">Valeur du stock par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}><BarChart data={stockByCategory}><CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" /><XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" /><YAxis tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatCurrency(v), "Valeur"]} /><Bar dataKey="value" fill="hsl(210,80%,55%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-display font-semibold mb-4">Suivi des dates d'expiration</h3>
            <div className="space-y-2">
              {products.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).map((p) => {
                const daysUntilExpiry = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${daysUntilExpiry < 0 ? "bg-destructive" : daysUntilExpiry < 90 ? "bg-warning" : "bg-success"}`} />
                      <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Lot: {p.batchNumber} | Qté: {p.quantity}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm">{p.expiryDate}</p><p className={`text-xs ${daysUntilExpiry < 0 ? "text-destructive" : daysUntilExpiry < 90 ? "text-warning" : "text-muted-foreground"}`}>{daysUntilExpiry < 0 ? `Expiré il y a ${Math.abs(daysUntilExpiry)} jours` : `${daysUntilExpiry} jours restants`}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Rechercher par nom ou n° de lot..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border"><th className="table-header text-left p-4">Produit</th><th className="table-header text-left p-4">Lot</th><th className="table-header text-left p-4">Emplacement</th><th className="table-header text-right p-4">Quantité</th><th className="table-header text-right p-4">Seuil</th><th className="table-header text-left p-4">Expiration</th><th className="table-header text-left p-4">Statut</th><th className="table-header text-center p-4">Action</th></tr></thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.manufacturer}</p></td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">{p.batchNumber}</td>
                      <td className="p-4 text-sm">{p.location}</td>
                      <td className="p-4 text-sm text-right font-medium">{p.quantity}</td>
                      <td className="p-4 text-sm text-right text-muted-foreground">{p.reorderLevel}</td>
                      <td className="p-4 text-sm">{p.expiryDate}</td>
                      <td className="p-4"><span className={p.status === "in-stock" ? "badge-success" : p.status === "low-stock" ? "badge-warning" : "badge-danger"}>{p.status === "in-stock" ? "OK" : p.status === "low-stock" ? "Bas" : p.status === "out-of-stock" ? "Rupture" : "Expiré"}</span></td>
                      <td className="p-4 text-center">
                        {(p.status === "low-stock" || p.status === "out-of-stock") && (
                          <button onClick={() => handleReorder(p)} className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Réapprovisionner</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Stock;
