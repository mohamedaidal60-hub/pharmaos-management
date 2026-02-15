import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Eye, Truck, ShoppingCart, Loader2 } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
      toast.error("Erreur lors du chargement des commandes");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()); // Searching by ID since order number might not exist yet
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const viewOrder = orders.find((o) => o.id === showView);

  const formatCurrency = (amount: any) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount || "0");
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TZS" }).format(val);
  };

  const parseItems = (items: any) => {
    try {
      if (typeof items === 'string') return JSON.parse(items);
      return items;
    } catch {
      return [];
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitAction("order_create", `Nouvelle commande: ${newOrder.customerName}`, `Commande pour ${newOrder.customerName} (${newOrder.customerType})`, newOrder as any);
    if (success) {
      setShowAdd(false);
      setNewOrder({ customerName: "", customerType: "retail", items: "" });
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Gestion des Commandes</h1><p className="page-subtitle">{orders.length} commandes — Suivi et traitement</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={16} /> Nouvelle commande</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Rechercher par ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="all">Tous statuts</option><option value="pending">En attente</option><option value="processing">En cours</option><option value="shipped">Expédié</option><option value="delivered">Livré</option></select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {filtered.map((order) => {
            const items = parseItems(order.items);
            return (
              <div key={order.id} className="glass-card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2"><p className="text-sm font-semibold">ORD-{order.id.slice(0, 8)}</p></div>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                      <span className="badge-primary">{statusLabels[order.status] || order.status}</span>
                    </div>
                    <button onClick={() => setShowView(order.id)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Eye size={16} className="text-muted-foreground" /></button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex flex-wrap gap-2">
                    {items && items.map((item: any, i: number) => (
                      <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{item.description || item.productName}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass-card"><ShoppingCart size={40} className="mb-3 opacity-30" /><p className="text-sm">Aucune commande trouvée</p></div>}
        </motion.div>
      )}

      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouvelle commande">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Nom du client</label><input required value={newOrder.customerName} onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Type</label><select value={newOrder.customerType} onChange={(e) => setNewOrder({ ...newOrder, customerType: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="retail">Détail</option><option value="wholesale">Gros</option></select></div>
          <div><label className="text-sm font-medium block mb-1">Articles (description)</label><textarea required value={newOrder.items} onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" placeholder="Ex: Paracetamol x10, Amoxicillin x5" /></div>
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
        </form>
      </ActionModal>

      <ActionModal isOpen={!!showView} onClose={() => setShowView(null)} title={`Commande ORD-${viewOrder?.id.slice(0, 8)}`}>
        {viewOrder && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium">{new Date(viewOrder.created_at).toLocaleString("fr-FR")}</p></div>
              <div><p className="text-muted-foreground text-xs">Total</p><p className="font-bold">{formatCurrency(viewOrder.total_amount)}</p></div>
              <div><p className="text-muted-foreground text-xs">Statut</p><span className="badge-primary">{statusLabels[viewOrder.status] || viewOrder.status}</span></div>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Articles</p>
              {parseItems(viewOrder.items).map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span>{item.description || item.productName}</span>
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
