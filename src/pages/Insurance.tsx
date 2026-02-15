import { motion } from "framer-motion";
import { Shield, FileText, CheckCircle, Clock, XCircle, AlertCircle, Search, Plus } from "lucide-react";
import { insuranceClaims, formatCurrency } from "@/data/mockData";
import { useState } from "react";
import ActionModal from "@/components/ActionModal";
import { usePendingActions } from "@/hooks/usePendingActions";

const statusConfig: Record<string, { label: string; badge: string; icon: typeof CheckCircle }> = {
  submitted: { label: "Soumise", badge: "badge-info", icon: FileText },
  processing: { label: "En traitement", badge: "badge-warning", icon: Clock },
  approved: { label: "Approuvée", badge: "badge-success", icon: CheckCircle },
  denied: { label: "Refusée", badge: "badge-danger", icon: XCircle },
};

const Insurance = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const { submitAction } = usePendingActions();
  const [newClaim, setNewClaim] = useState({ patientName: "", provider: "", policyNumber: "", medicationName: "", claimAmount: "" });

  const filtered = insuranceClaims.filter((c) => {
    const matchesSearch = c.patientName.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAction("insurance_claim", `Réclamation: ${newClaim.patientName}`, `Réclamation assurance pour ${newClaim.patientName} via ${newClaim.provider}`, newClaim as any);
    setShowAdd(false);
    setNewClaim({ patientName: "", provider: "", policyNumber: "", medicationName: "", claimAmount: "" });
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Gestion des Assurances</h1><p className="page-subtitle">Vérification, réclamations et suivi des couvertures</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={16} /> Nouvelle réclamation</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = insuranceClaims.filter(c => c.status === key).length;
          const total = insuranceClaims.filter(c => c.status === key).reduce((s, c) => s + c.claimAmount, 0);
          return (<div key={key} className="stat-card"><div className="flex items-center gap-2 mb-1"><config.icon size={16} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">{config.label}</span></div><p className="text-xl font-bold font-display">{count}</p><p className="text-xs text-muted-foreground">{formatCurrency(total)}</p></div>);
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Rechercher patient ou assureur..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">{<option value="all">Tous statuts</option>}{Object.entries(statusConfig).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}</select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {filtered.map((claim) => {
          const config = statusConfig[claim.status];
          return (
            <div key={claim.id} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info"><Shield size={18} /></div>
                  <div><p className="text-sm font-semibold">{claim.patientName}</p><p className="text-xs text-muted-foreground">{claim.provider} — {claim.policyNumber}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-bold">{formatCurrency(claim.claimAmount)}</p><span className={config.badge}>{config.label}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground"><span>Médicament: {claim.medicationName}</span><span>Soumis le: {claim.submittedDate}</span></div>
            </div>
          );
        })}
      </motion.div>

      <ActionModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouvelle réclamation d'assurance">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-sm font-medium block mb-1">Patient</label><input required value={newClaim.patientName} onChange={(e) => setNewClaim({...newClaim, patientName: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Assureur</label><input required value={newClaim.provider} onChange={(e) => setNewClaim({...newClaim, provider: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">N° Police</label><input required value={newClaim.policyNumber} onChange={(e) => setNewClaim({...newClaim, policyNumber: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium block mb-1">Médicament</label><input required value={newClaim.medicationName} onChange={(e) => setNewClaim({...newClaim, medicationName: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-sm font-medium block mb-1">Montant (TZS)</label><input type="number" required value={newClaim.claimAmount} onChange={(e) => setNewClaim({...newClaim, claimAmount: e.target.value})} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
          </div>
          <button type="submit" className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Soumettre pour validation</button>
        </form>
      </ActionModal>
    </div>
  );
};

export default Insurance;
