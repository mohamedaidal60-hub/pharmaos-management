import { useState, useEffect } from "react";
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
  ArrowRight,
  Loader2,
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
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["hsl(168,80%,36%)", "hsl(210,80%,55%)", "hsl(38,92%,50%)", "hsl(280,60%,55%)", "hsl(0,72%,51%)", "hsl(200,20%,60%)"];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    lowStock: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Products count and low stock
      const { data: products } = await (supabase as any).from("products").select("status");
      const lowStock = products?.filter((p: any) => p.status === "low-stock").length || 0;

      // Orders count and total revenue
      const { data: orders } = await (supabase as any).from("orders").select("total_amount, status, created_at");
      const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;
      const recent = orders?.slice(0, 5) || [];

      // Customers count
      const { count: customerCount } = await (supabase as any).from("customers").select("*", { count: 'exact', head: true });

      setCounts({
        products: products?.length || 0,
        orders: orders?.length || 0,
        customers: customerCount || 0,
        revenue: totalRevenue,
        lowStock,
      });

      setRecentOrders(recent);

      setStats([
        { label: "Chiffre d'Affaires", value: formatCurrency(totalRevenue), icon: DollarSign, trend: "+0%", up: true, color: "text-primary" },
        { label: "Commandes totales", value: (orders?.length || 0).toString(), icon: ShoppingCart, trend: "+0", up: true, color: "text-info" },
        { label: "Produits en stock", value: (products?.length || 0).toString(), icon: Package, trend: `${lowStock} bas`, up: false, color: "text-warning" },
        { label: "Clients actifs", value: (customerCount || 0).toString(), icon: Users, trend: "+0%", up: true, color: "text-success" },
      ]);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TZS" }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-subtitle">Vue d'ensemble de votre pharmacie — PharmaOS Central</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.35 }} className="glass-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Commandes Récentes</h3>
            <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                    ORD
                  </div>
                  <div>
                    <p className="text-sm font-medium">Commande ORD-{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(order.total_amount)}</p>
                  <span className="badge-primary">{order.status}</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">Aucune commande récente</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
