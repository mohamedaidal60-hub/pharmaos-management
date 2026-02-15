import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Search, Clock, CheckCircle, AlertCircle, PauseCircle, User } from "lucide-react";
import { prescriptions } from "@/data/mockData";
import { usePendingActions } from "@/hooks/usePendingActions";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; badge: string; icon: typeof CheckCircle }> = {
  pending: { label: "En attente", badge: "badge-warning", icon: Clock },
  dispensed: { label: "Dispensé", badge: "badge-success", icon: CheckCircle },
  "partially-dispensed": { label: "Partiel", badge: "badge-info", icon: AlertCircle },
  "on-hold": { label: "En pause", badge: "badge-danger", icon: PauseCircle },
};

const Dispensing = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { submitAction } = usePendingActions();

  const filtered = prescriptions.filter((rx) => {
    const matchesSearch = rx.patientName.toLowerCase().includes(search.toLowerCase()) || rx.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDispense = async (rx: typeof prescriptions[0]) => {
    await submitAction("dispensing_create", `Dispensation: ${rx.patientName}`, `Dispensation des médicaments pour ${rx.patientName} (ordonnance Dr. ${rx.doctorName})`, { prescriptionId: rx.id, patientName: rx.patientName, medications: rx.medications } as any);
  };

  const handleHold = async (rx: typeof prescriptions[0]) => {
    await submitAction("dispensing_update", `Mise en pause: ${rx.patientName}`, `Mise en pause de l'ordonnance de ${rx.patientName}`, { prescriptionId: rx.id, action: "hold" } as any);
  };

  return (
    <div className="space-y-6">
      <div className="page-header"><h1 className="page-title">Dispensation</h1><p className="page-subtitle">Gestion des ordonnances et délivrance des médicaments</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = prescriptions.filter(p => p.status === key).length;
          return (<div key={key} className="stat-card flex items-center gap-3"><config.icon size={20} className="text-muted-foreground" /><div><p className="text-lg font-bold font-display">{count}</p><p className="text-xs text-muted-foreground">{config.label}</p></div></div>);
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Rechercher patient ou médecin..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-background text-sm"><option value="all">Tous statuts</option><option value="pending">En attente</option><option value="dispensed">Dispensé</option><option value="partially-dispensed">Partiel</option><option value="on-hold">En pause</option></select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {filtered.map((rx) => {
          const config = statusConfig[rx.status];
          return (
            <div key={rx.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><User size={18} /></div>
                  <div><p className="font-semibold text-sm">{rx.patientName}</p><p className="text-xs text-muted-foreground">Dr. {rx.doctorName} — {rx.prescriptionDate}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {rx.insuranceCovered && <span className="badge-info">Assuré</span>}
                  <span className={config.badge}>{config.label}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {rx.medications.map((med, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Pill size={14} className="text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0"><p className="text-sm font-medium">{med.name} — {med.dosage}</p><p className="text-xs text-muted-foreground">Qté: {med.quantity} | {med.instructions}</p></div>
                  </div>
                ))}
              </div>
              {rx.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleDispense(rx)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"><CheckCircle size={14} /> Dispenser</button>
                  <button onClick={() => handleHold(rx)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Mettre en pause</button>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Dispensing;
