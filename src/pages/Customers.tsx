import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Eye, Mail, Phone, Users } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<string | null>(null);
  const { submitAction } = usePendingActions();
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", type: "retail" });
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("customers").select("*").order("full_name");
    if (error) {
      toast.error("Erreur lors du chargement des clients");
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch = c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || (typeFilter === "wholesale" ? c.insurance_provider === "Corporate" : c.insurance_provider === "Retail");
    return matchesSearch && matchesType;
  });

  const viewCustomer = customers.find((c) => c.id === showView);

  const formatCurrency = (amount: any) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount || "0");
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TZS" }).format(val);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitAction("customer_create", `Nouveau client: ${newCustomer.name}`, `Ajout du client ${newCustomer.name} (${newCustomer.type})`, newCustomer as any);
    if (success) {
      setShowAdd(false);
      setNewCustomer({ name: "", email: "", phone: "", type: "retail" });
      fetchCustomers();
    }
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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
          <option value="all">Tous</option><option value="retail">Détail</option><option value="wholesale">Grossiste</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((customer) => (
          <div key={customer.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-sm ${customer.insurance_provider === "Corporate" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                  {customer.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{customer.full_name}</p>
                  <span className={customer.insurance_provider === "Corporate" ? "badge-info" : "badge-primary"}>{customer.insurance_provider === "Corporate" ? "Grossiste" : "Détail"}</span>
                </div>
              </div>
              <button onClick={() => setShowView(customer.id)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Eye size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-2"><Mail size={12} /> {customer.email || "N/A"}</div>
              <div className="flex items-center gap-2"><Phone size={12} /> {customer.phone || "N/A"}</div>
            </div>
          </div>
        ))}
      </motion.div>

      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un client">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Nom complet</label><input required value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Email</label><input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Téléphone</label><input required value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div><label className="text-sm font-medium block mb-1">Type</label><select value={newCustomer.type} onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="retail">Détail</option><option value="wholesale">Grossiste</option></select></div>
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
        </form>
      </ActionModal>

      <ActionModal isOpen={!!showView} onClose={() => setShowView(null)} title={viewCustomer?.full_name || "Détail client"}>
        {viewCustomer && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{viewCustomer.email || "N/A"}</p></div>
              <div><p className="text-muted-foreground text-xs">Téléphone</p><p className="font-medium">{viewCustomer.phone || "N/A"}</p></div>
              <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium">{viewCustomer.insurance_provider === "Corporate" ? "Grossiste" : "Détail"}</p></div>
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  );
};

export default Customers;
