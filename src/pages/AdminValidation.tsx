import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Edit3, Clock, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingActions } from "@/hooks/usePendingActions";
import { Navigate } from "react-router-dom";

interface PendingAction {
  id: string;
  action_type: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  submitted_by: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "En attente", color: "bg-warning/10 text-warning", icon: Clock },
  approved: { label: "Approuvé", color: "bg-success/10 text-success", icon: CheckCircle },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive", icon: XCircle },
  modified: { label: "Modifié", color: "bg-info/10 text-info", icon: Edit3 },
};

const actionTypeLabels: Record<string, string> = {
  product_create: "Création produit",
  product_update: "Modification produit",
  product_delete: "Suppression produit",
  order_create: "Nouvelle commande",
  order_update: "Modification commande",
  order_cancel: "Annulation commande",
  dispensing_create: "Dispensation",
  dispensing_update: "Modification dispensation",
  stock_adjustment: "Ajustement stock",
  stock_transfer: "Transfert stock",
  customer_create: "Nouveau client",
  customer_update: "Modification client",
  pricing_change: "Changement tarif",
  insurance_claim: "Réclamation assurance",
  medical_advice_create: "Conseil médical",
  medical_advice_update: "Modification conseil",
  store_create: "Nouveau magasin",
  store_update: "Modification magasin",
  settings_change: "Paramètres",
  other: "Autre",
};

const AdminValidation = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { reviewAction } = usePendingActions();
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchActions = async () => {
    setLoading(true);
    let query = supabase
      .from("pending_actions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter as any);
    }

    const { data } = await query;
    setActions((data as PendingAction[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchActions();
  }, [isAdmin, filter]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleReview = async (id: string, status: "approved" | "rejected" | "modified") => {
    const success = await reviewAction(id, status, reviewNote);
    if (success) {
      setReviewingId(null);
      setReviewNote("");
      fetchActions();
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Validation des Actions</h1>
        <p className="page-subtitle">Approuvez, modifiez ou rejetez les actions soumises</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted-foreground" />
        {["pending", "approved", "rejected", "modified", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? "Tout" : statusConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : actions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Clock size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucune action à afficher</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, i) => {
            const config = statusConfig[action.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {actionTypeLabels[action.action_type] || action.action_type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm">{action.title}</h4>
                    {action.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(action.created_at).toLocaleString("fr-FR")}
                    </p>
                    {action.review_note && (
                      <p className="text-xs mt-2 p-2 rounded bg-muted/50 italic">
                        Note: {action.review_note}
                      </p>
                    )}
                  </div>

                  {action.status === "pending" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {reviewingId === action.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="Note (optionnel)..."
                            rows={2}
                            className="w-48 px-2 py-1 rounded border border-input bg-background text-xs resize-none focus:outline-none"
                          />
                          <div className="flex gap-1">
                            <button onClick={() => handleReview(action.id, "approved")} className="flex-1 px-2 py-1 rounded bg-success/10 text-success text-xs font-medium hover:bg-success/20">
                              Approuver
                            </button>
                            <button onClick={() => handleReview(action.id, "modified")} className="flex-1 px-2 py-1 rounded bg-info/10 text-info text-xs font-medium hover:bg-info/20">
                              Modifier
                            </button>
                            <button onClick={() => handleReview(action.id, "rejected")} className="flex-1 px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">
                              Rejeter
                            </button>
                          </div>
                          <button onClick={() => setReviewingId(null)} className="text-xs text-muted-foreground hover:underline">
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(action.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                        >
                          Examiner
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminValidation;
