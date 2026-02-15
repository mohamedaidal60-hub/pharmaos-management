import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  TrendingUp,
  Package,
  Users,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { salesData, products, orders, customers, formatCurrency } from "@/data/mockData";
import { useState } from "react";

const Reports = () => {
  const [period, setPeriod] = useState("6m");

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = totalRevenue / orders.length;

  const inventoryTurnover = [
    { month: "Jul", turnover: 3.2 },
    { month: "Aug", turnover: 2.8 },
    { month: "Sep", turnover: 4.1 },
    { month: "Oct", turnover: 3.5 },
    { month: "Nov", turnover: 4.5 },
    { month: "Dec", turnover: 5.2 },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Rapports & Analytiques</h1>
          <p className="page-subtitle">Performances, ventes, inventaire et métriques clés</p>
        </div>
        <div className="flex gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
            <option value="1m">1 mois</option>
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="1y">1 an</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
            <Download size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Chiffre d'affaires total", value: formatCurrency(totalRevenue), icon: DollarSign, cls: "text-primary" },
          { label: "Commande moyenne", value: formatCurrency(avgOrderValue), icon: TrendingUp, cls: "text-success" },
          { label: "Produits actifs", value: products.length.toString(), icon: Package, cls: "text-info" },
          { label: "Clients actifs", value: customers.length.toString(), icon: Users, cls: "text-warning" },
        ].map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon size={16} className={kpi.cls} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold font-display">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1">Tendance des ventes</h3>
          <p className="text-xs text-muted-foreground mb-4">Évolution mensuelle</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168,80%,36%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(168,80%,36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatCurrency(v), "Ventes"]} />
              <Area type="monotone" dataKey="sales" stroke="hsl(168,80%,36%)" strokeWidth={2} fill="url(#rptGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1">Volume de commandes</h3>
          <p className="text-xs text-muted-foreground mb-4">Nombre de commandes par mois</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="orders" fill="hsl(210,80%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-1">Rotation des stocks</h3>
          <p className="text-xs text-muted-foreground mb-4">Taux de rotation mensuel</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={inventoryTurnover}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(200,10%,45%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="turnover" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ fill: "hsl(38,92%,50%)", strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Products */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">Top Produits par Valeur de Stock</h3>
        <div className="space-y-2">
          {products
            .map((p) => ({ ...p, stockValue: p.retailPrice * p.quantity }))
            .sort((a, b) => b.stockValue - a.stockValue)
            .slice(0, 5)
            .map((p, i) => {
              const maxValue = products.reduce((max, pp) => Math.max(max, pp.retailPrice * pp.quantity), 0);
              const pct = (p.stockValue / maxValue) * 100;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-sm font-semibold">{formatCurrency(p.stockValue)}</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Reports;
