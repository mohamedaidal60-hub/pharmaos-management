import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ActionType =
  | "product_create" | "product_update" | "product_delete"
  | "order_create" | "order_update" | "order_cancel"
  | "dispensing_create" | "dispensing_update"
  | "stock_adjustment" | "stock_transfer"
  | "customer_create" | "customer_update"
  | "pricing_change" | "insurance_claim"
  | "medical_advice_create" | "medical_advice_update"
  | "store_create" | "store_update"
  | "settings_change" | "other";

export const usePendingActions = () => {
  const { user, isAdmin } = useAuth();

  const submitAction = async (
    actionType: ActionType,
    title: string,
    description: string,
    payload: Record<string, unknown>
  ) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return null;
    }

    // Admin actions are auto-approved
    if (isAdmin) {
      const { data, error } = await supabase
        .from("pending_actions")
        .insert({
          action_type: actionType,
          title,
          description,
          payload: payload as any,
          submitted_by: user.id,
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast.error("Erreur: " + error.message);
        return null;
      }
      toast.success("Action exécutée avec succès");
      return data;
    }

    // Non-admin actions go to pending
    const { data, error } = await supabase
      .from("pending_actions")
      .insert({
        action_type: actionType,
        title,
        description,
        payload: payload as any,
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur: " + error.message);
      return null;
    }
    toast.info("Action soumise pour validation par l'administrateur");
    return data;
  };

  const reviewAction = async (
    actionId: string,
    status: "approved" | "rejected" | "modified",
    reviewNote?: string
  ) => {
    if (!user || !isAdmin) {
      toast.error("Seul l'administrateur peut valider les actions");
      return false;
    }

    const { error } = await supabase
      .from("pending_actions")
      .update({
        status,
        reviewed_by: user.id,
        review_note: reviewNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", actionId);

    if (error) {
      toast.error("Erreur: " + error.message);
      return false;
    }

    const statusLabels = { approved: "approuvée", rejected: "rejetée", modified: "modifiée" };
    toast.success(`Action ${statusLabels[status]}`);
    return true;
  };

  return { submitAction, reviewAction };
};
