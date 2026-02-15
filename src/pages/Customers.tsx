import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Users, UserCheck, Eye, Mail, Phone } from "lucide-react";
import { customers, formatCurrency } from "@/data/mockData";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<string | null>(null);
  const { submitAction } = usePendingActions();
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", type: "retail" });

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const viewCustomer = customers.find((c) => c.id === showView);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAction("customer_create", `Nouveau client: ${newCustomer.name}`, `Ajout du client ${newCustomer.name} (${newCustomer.type})`, newCustomer as any);
    setShowAdd(false);
    setNewCustomer({ name: "", email: "", phone: "", type: "retail" });
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Gestion des Clients</h1>
          <p className="page-subtitle">{customers.length} clients — Profils et fidélité</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Ajouter un client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="stat-card"><p className="text-xs text-muted-foreground">Total clients</p><p className="text-2xl font-bold font-display">{customers.length}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Clients détail</p><p className="text-2xl font-bold font-display">{customers.filter(c => c.type === "retail").length}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Clients grossiste</p><p className="text-2xl font-bold font-display">{customers.filter(c => c.type === "wholesale").length}</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
          <option value="all">Tous</option><option value="retail">Détail</option><option value="wholesale">Grossiste</option>
        </select>
      </div>

      {/* Customer Cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((customer) => (
          <div key={customer.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-sm ${customer.type === "wholesale" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                  {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{customer.name}</p>
                  <span className={customer.type === "wholesale" ? "badge-info" : "badge-primary"}>{customer.type === "wholesale" ? "Grossiste" : "Détail"}</span>
                </div>
              </div>
              <button onClick={() => setShowView(customer.id)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Eye size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-2"><Mail size={12} /> {customer.email}</div>
              <div className="flex items-center gap-2"><Phone size={12} /> {customer.phone}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
              <div className="text-center"><p className="text-sm font-bold">{formatCurrency(customer.totalSpent)}</p><p className="text-[10px] text-muted-foreground">Dépensé</p></div>
              <div className="text-center"><p className="text-sm font-bold">{customer.totalOrders}</p><p className="text-[10px] text-muted-foreground">Commandes</p></div>
              <div className="text-center"><p className="text-sm font-bold">{customer.loyaltyPoints}</p><p className="text-[10px] text-muted-foreground">Points</p></div>
            </div>
            {customer.insuranceProvider && (
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                <span className="badge-info text-[10px]">{customer.insuranceProvider}</span>
                <span className="text-xs text-muted-foreground">{customer.insurancePolicyNumber}</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Add Customer Modal */}
      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un client">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Nom complet</label><input required value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Email</label><input type="email" required value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Téléphone</label><input required value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Type</label><select value={newCustomer.type} onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="retail">Détail</option><option value="wholesale">Grossiste</option></select></div>
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
        </form>
      </ActionModal>

      {/* View Customer Modal */}
      <ActionModal isOpen={!!showView} onClose={() => setShowView(null)} title={viewCustomer?.name || "Détail client"}>
        {viewCustomer && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{viewCustomer.email}</p></div>
              <div><p className="text-muted-foreground text-xs">Téléphone</p><p className="font-medium">{viewCustomer.phone}</p></div>
              <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium">{viewCustomer.type === "wholesale" ? "Grossiste" : "Détail"}</p></div>
              <div><p className="text-muted-foreground text-xs">Total dépensé</p><p className="font-bold">{formatCurrency(viewCustomer.totalSpent)}</p></div>
              <div><p className="text-muted-foreground text-xs">Commandes</p><p className="font-medium">{viewCustomer.totalOrders}</p></div>
              <div><p className="text-muted-foreground text-xs">Points fidélité</p><p className="font-medium">{viewCustomer.loyaltyPoints}</p></div>
            </div>
            {viewCustomer.insuranceProvider && (
              <div className="pt-3 border-t border-border">
                <p className="text-muted-foreground text-xs">Assurance</p>
                <p className="font-medium">{viewCustomer.insuranceProvider} — {viewCustomer.insurancePolicyNumber}</p>
              </div>
            )}
          </div>
        )}
      </ActionModal>
    </div>
  );
};

export default Customers;
