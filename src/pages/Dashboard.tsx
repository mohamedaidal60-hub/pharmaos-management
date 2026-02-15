import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  DollarSign,
  Pill,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { products, orders, customers, messages, salesData, categoryData, prescriptions, formatCurrency } from "@/data/mockData";
import { Link } from "react-router-dom";

const COLORS = ["hsl(168,80%,36%)", "hsl(210,80%,55%)", "hsl(38,92%,50%)", "hsl(280,60%,55%)", "hsl(0,72%,51%)", "hsl(200,20%,60%)"];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStockItems = products.filter((p) => p.status === "low-stock").length;
  const expiredItems = products.filter((p) => p.status === "expired").length;
  const outOfStock = products.filter((p) => p.status === "out-of-stock").length;
  const pendingPrescriptions = prescriptions.filter((p) => p.status === "pending").length;

  const stats = [
    { label: "Chiffre d'Affaires", value: formatCurrency(totalRevenue), icon: DollarSign, trend: "+12.5%", up: true, color: "text-primary" },
    { label: "Commandes en cours", value: pendingOrders.toString(), icon: ShoppingCart, trend: "+3", up: true, color: "text-info" },
    { label: "Produits en stock", value: products.length.toString(), icon: Package, trend: `${lowStockItems} bas`, up: false, color: "text-warning" },
    { label: "Clients actifs", value: customers.length.toString(), icon: Users, trend: "+8%", up: true, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-subtitle">Vue d'ensemble de votre pharmacie — PharmaOS Central</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 font-display">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs">
              {stat.up ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-warning" />}
              <span className={stat.up ? "text-success" : "text-warning"}>{stat.trend}</span>
              <span className="text-muted-foreground ml-1">vs mois dernier</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockItems > 0 || expiredItems > 0 || outOfStock > 0) && (
        <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="flex gap-3 flex-wrap">
          {expiredItems > 0 && (
            <div className="badge-danger flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
              <AlertTriangle size={14} /> {expiredItems} produit(s) expiré(s) — Action requise
            </div>
          )}
          {outOfStock > 0 && (
            <div className="badge-danger flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
              <Package size={14} /> {outOfStock} produit(s) en rupture de stock
            </div>
          )}
          {lowStockItems > 0 && (
            <div className="badge-warning flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
              <AlertTriangle size={14} /> {lowStockItems} produit(s) en stock faible
            </div>
          )}
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.25 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Ventes Mensuelles</h3>
              <p className="text-xs text-muted-foreground">Évolution sur les 6 derniers mois</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168,80%,36%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(168,80%,36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(200,10%,45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(200,10%,45%)" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(200,15%,90%)", fontSize: "12px" }}
                formatter={(value: number) => [formatCurrency(value), "Ventes"]}
              />
              <Area type="monotone" dataKey="sales" stroke="hsl(168,80%,36%)" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1">Catégories</h3>
          <p className="text-xs text-muted-foreground mb-4">Répartition des ventes</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.35 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Commandes Récentes</h3>
            <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                    {order.customerType === "wholesale" ? "W" : "R"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                  <span className={`text-xs ${order.status === "delivered" ? "badge-success" :
                      order.status === "pending" ? "badge-warning" :
                        order.status === "processing" ? "badge-info" :
                          order.status === "shipped" ? "badge-primary" : "badge-danger"
                    }`}>
                    {order.status === "delivered" ? "Livré" :
                      order.status === "pending" ? "En attente" :
                        order.status === "processing" ? "En cours" :
                          order.status === "shipped" ? "Expédié" : "Annulé"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions & Prescriptions */}
        <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.4 }} className="space-y-4">
          {/* Pending Prescriptions */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">Ordonnances en attente</h3>
              <span className="badge-warning">{pendingPrescriptions}</span>
            </div>
            <div className="space-y-2">
              {prescriptions.filter(p => p.status === "pending").map((rx) => (
                <div key={rx.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Pill size={14} className="text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{rx.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{rx.medications.map(m => m.name).join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/dispensing" className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Pill size={14} /> Dispenser
            </Link>
          </div>

          {/* Recent Messages */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">Messages récents</h3>
              <Link to="/messages" className="text-xs text-primary hover:underline">Voir</Link>
            </div>
            <div className="space-y-2">
              {messages.slice(0, 3).map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2.5 p-2 rounded-lg ${!msg.read ? "bg-primary/5" : "bg-muted/30"}`}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">{msg.fromAvatar}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold truncate">{msg.from}</p>
                      {msg.urgent && <span className="badge-danger text-[10px] px-1.5 py-0">Urgent</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
