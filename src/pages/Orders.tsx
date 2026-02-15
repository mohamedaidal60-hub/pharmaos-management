import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Eye, ShoppingCart, Loader2, Trash2, Package } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusLabels: Record<string, string> = { pending: "En attente", processing: "En cours", shipped: "Expédié", delivered: "Livré", cancelled: "Annulé" };

interface OrderItem {
  id: string; // locally generated for key
  productName: string;
  quantity: number;
  unitPrice: number;
}

const Orders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<string | null>(null);
  const { submitAction } = usePendingActions();

  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerType: "retail",
    items: [] as OrderItem[],
  });

  const [currentItem, setCurrentItem] = useState({ productName: "", quantity: 1, unitPrice: 0 });

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
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const viewOrder = orders.find((o) => o.id === showView);

  const formatCurrency = (amount: any) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount || "0");
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TZS" }).format(val);
  };

  const addItem = () => {
    if (!currentItem.productName || currentItem.quantity <= 0) {
      toast.error("Veuillez saisir un produit et une quantité valide");
      return;
    }
    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, { ...currentItem, id: crypto.randomUUID() }]
    });
    setCurrentItem({ productName: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (id: string) => {
    setOrderForm({
      ...orderForm,
      items: orderForm.items.filter(item => item.id !== id)
    });
  };

  const calculateTotal = () => {
    return orderForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderForm.items.length === 0) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }

    const total = calculateTotal();
    const success = await submitAction(
      "order_create",
      `Nouvelle commande: ${orderForm.customerName}`,
      `Commande pour ${orderForm.customerName} (${orderForm.customerType}) - Total: ${formatCurrency(total)}`,
      { ...orderForm, totalAmount: total } as any
    );

    if (success) {
      setShowAdd(false);
      setOrderForm({ customerName: "", customerType: "retail", items: [] });
      fetchOrders();
    }
  };

  const parseItems = (items: any) => {
    try {
      if (typeof items === 'string') return JSON.parse(items);
      return items;
    } catch {
      return [];
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">ORD-{order.id.slice(0, 8)}</p>
                        <span className="text-xs text-muted-foreground">{order.customer_id ? "Client ID: " + order.customer_id.slice(0, 5) : "Client inconnu"}</span>
                      </div>
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
                      <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                        {item.productName || item.description} {item.quantity ? "x" + item.quantity : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass-card"><ShoppingCart size={40} className="mb-3 opacity-30" /><p className="text-sm">Aucune commande trouvée</p></div>}
        </motion.div>
      )}

      {/* Structured Add Order Modal */}
      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouvelle commande">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Nom du client</label>
              <input required value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Type</label>
              <select value={orderForm.customerType} onChange={(e) => setOrderForm({ ...orderForm, customerType: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm">
                <option value="retail">Détail</option>
                <option value="wholesale">Gros</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package size={16} className="text-primary" />
              Articles de la commande
            </h4>

            {/* Add Item Form */}
            <div className="grid grid-cols-12 gap-2 mb-4 bg-muted/30 p-3 rounded-lg items-end">
              <div className="col-span-12 md:col-span-5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Produit</label>
                <input
                  placeholder="Ex: Paracetamol"
                  value={currentItem.productName}
                  onChange={(e) => setCurrentItem({ ...currentItem, productName: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-input bg-background text-xs focus:outline-none"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Qté</label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full h-8 px-2 rounded border border-input bg-background text-xs focus:outline-none"
                />
              </div>
              <div className="col-span-5 md:col-span-3">
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Prix Unit. (TZS)</label>
                <input
                  type="number"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseInt(e.target.value) || 0 })}
                  className="w-full h-8 px-2 rounded border border-input bg-background text-xs focus:outline-none"
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <button
                  onClick={addItem}
                  type="button"
                  className="w-full h-8 rounded bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 mb-4">
              <AnimatePresence>
                {orderForm.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs border border-border/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-muted-foreground">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold">{formatCurrency(item.quantity * item.unitPrice)}</p>
                      <button onClick={() => removeItem(item.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {orderForm.items.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4 border-2 border-dashed border-border rounded-lg italic">
                  Aucun article ajouté
                </p>
              )}
            </div>

            {/* Total */}
            {orderForm.items.length > 0 && (
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                <span className="text-sm font-semibold">Total de la commande</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 mt-4 shadow-sm"
          >
            Soumettre pour validation
          </button>
        </div>
      </ActionModal>

      <ActionModal isOpen={!!showView} onClose={() => setShowView(null)} title={`Détail Commande ORD-${viewOrder?.id.slice(0, 8)}`}>
        {viewOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
              <div><p className="text-muted-foreground text-[10px] uppercase font-bold">Date</p><p className="font-medium">{new Date(viewOrder.created_at).toLocaleString("fr-FR")}</p></div>
              <div><p className="text-muted-foreground text-[10px] uppercase font-bold">Total</p><p className="font-bold text-primary">{formatCurrency(viewOrder.total_amount)}</p></div>
              <div><p className="text-muted-foreground text-[10px] uppercase font-bold">Statut</p><span className="badge-primary">{statusLabels[viewOrder.status] || viewOrder.status}</span></div>
              <div><p className="text-muted-foreground text-[10px] uppercase font-bold">Client ID</p><p className="font-medium">{viewOrder.customer_id || "N/A"}</p></div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-3">Détail des articles</p>
              <div className="space-y-2">
                {parseItems(viewOrder.items).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{item.productName || item.description}</p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.unitPrice ? formatCurrency(item.quantity * item.unitPrice) : "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  );
};

export default Orders;
