import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Eye, Truck, ShoppingCart } from "lucide-react";
import { orders, formatCurrency } from "@/data/mockData";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";

const statusLabels: Record<string, string> = { pending: "En attente", processing: "En cours", shipped: "Expédié", delivered: "Livré", cancelled: "Annulé" };
const paymentLabels: Record<string, string> = { paid: "Payé", unpaid: "Non payé", partial: "Partiel" };

const Orders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<string | null>(null);
  const { submitAction } = usePendingActions();
  const [newOrder, setNewOrder] = useState({ customerName: "", customerType: "retail", items: "" });

  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesType = typeFilter === "all" || o.customerType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const viewOrder = orders.find((o) => o.id === showView);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAction("order_create", `Nouvelle commande: ${newOrder.customerName}`, `Commande pour ${newOrder.customerName} (${newOrder.customerType})`, newOrder as any);
    setShowAdd(false);
    setNewOrder({ customerName: "", customerType: "retail", items: "" });
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Gestion des Commandes</h1><p className="page-subtitle">{orders.length} commandes — Suivi et traitement</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={16} /> Nouvelle commande</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: orders.length, badge: "badge-primary" },
          { label: "En attente", value: orders.filter(o => o.status === "pending").length, badge: "badge-warning" },
          { label: "En cours", value: orders.filter(o => o.status === "processing" || o.status === "shipped").length, badge: "badge-info" },
          { label: "Livrées", value: orders.filter(o => o.status === "delivered").length, badge: "badge-success" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-3">
            <span className={`${stat.badge} text-lg font-bold px-3 py-1`}>{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Rechercher par n° de commande ou client..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="all">Tous types</option><option value="retail">Détail</option><option value="wholesale">Gros</option></select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="all">Tous statuts</option><option value="pending">En attente</option><option value="processing">En cours</option><option value="shipped">Expédié</option><option value="delivered">Livré</option></select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="glass-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${order.customerType === "wholesale" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                  {order.customerType === "wholesale" ? <Truck size={18} /> : <ShoppingCart size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2"><p className="text-sm font-semibold">{order.orderNumber}</p><span className={order.customerType === "wholesale" ? "badge-info" : "badge-primary"}>{order.customerType === "wholesale" ? "Gros" : "Détail"}</span></div>
                  <p className="text-xs text-muted-foreground">{order.customerName} — {order.orderDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={order.status === "delivered" ? "badge-success" : order.status === "pending" ? "badge-warning" : order.status === "shipped" ? "badge-primary" : order.status === "processing" ? "badge-info" : "badge-danger"}>{statusLabels[order.status]}</span>
                    <span className={order.paymentStatus === "paid" ? "badge-success" : order.paymentStatus === "unpaid" ? "badge-danger" : "badge-warning"}>{paymentLabels[order.paymentStatus]}</span>
                  </div>
                </div>
                <button onClick={() => setShowView(order.id)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Eye size={16} className="text-muted-foreground" /></button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50"><div className="flex flex-wrap gap-2">{order.items.map((item, i) => (<span key={i} className="text-xs bg-muted px-2 py-1 rounded">{item.productName} × {item.quantity}</span>))}</div></div>
          </div>
        ))}
        {filtered.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass-card"><ShoppingCart size={40} className="mb-3 opacity-30" /><p className="text-sm">Aucune commande trouvée</p></div>}
      </motion.div>

      {/* Add Order Modal */}
      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouvelle commande">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Nom du client</label><input required value={newOrder.customerName} onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Type</label><select value={newOrder.customerType} onChange={(e) => setNewOrder({...newOrder, customerType: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="retail">Détail</option><option value="wholesale">Gros</option></select></div>
          <div><label className="text-sm font-medium block mb-1">Articles (description)</label><textarea required value={newOrder.items} onChange={(e) => setNewOrder({...newOrder, items: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" placeholder="Ex: Paracetamol x10, Amoxicillin x5" /></div>
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
        </form>
      </ActionModal>

      {/* View Order Modal */}
      <ActionModal isOpen={!!showView} onClose={() => setShowView(null)} title={`Commande ${viewOrder?.orderNumber || ""}`}>
        {viewOrder && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-muted-foreground text-xs">Client</p><p className="font-medium">{viewOrder.customerName}</p></div>
              <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium">{viewOrder.customerType === "wholesale" ? "Grossiste" : "Détail"}</p></div>
              <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium">{viewOrder.orderDate}</p></div>
              <div><p className="text-muted-foreground text-xs">Total</p><p className="font-bold">{formatCurrency(viewOrder.total)}</p></div>
              <div><p className="text-muted-foreground text-xs">Statut</p><span className={viewOrder.status === "delivered" ? "badge-success" : "badge-warning"}>{statusLabels[viewOrder.status]}</span></div>
              <div><p className="text-muted-foreground text-xs">Paiement</p><span className={viewOrder.paymentStatus === "paid" ? "badge-success" : "badge-danger"}>{paymentLabels[viewOrder.paymentStatus]}</span></div>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Articles</p>
              {viewOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span>{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  );
};

export default Orders;
