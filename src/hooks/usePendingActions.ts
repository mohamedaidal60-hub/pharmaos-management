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

const executeAction = async (actionType: ActionType, payload: any) => {
  try {
    switch (actionType) {
      case "product_create":
        await supabase.from("products").insert({
          name: payload.name,
          generic_name: payload.genericName,
          category: payload.category,
          sku: payload.sku,
          wholesale_price: parseFloat(payload.wholesalePrice),
          retail_price: parseFloat(payload.retailPrice),
          quantity: parseInt(payload.quantity),
          reorder_level: parseInt(payload.reorderLevel),
          status: "in-stock"
        });
        break;

      case "customer_create":
        await supabase.from("customers").insert({
          full_name: payload.name,
          email: payload.email,
          phone: payload.phone,
          insurance_provider: payload.type === "wholesale" ? "Corporate" : "Retail"
        });
        break;

      case "order_create":
        await supabase.from("orders").insert({
          customer_id: null, // Should ideally find or create customer
          total_amount: 0, // Placeholder
          items: JSON.stringify([{ description: payload.items }]),
          status: "pending"
        });
        break;

      case "other":
        // This is usually user creation
        if (payload.email && payload.password && payload.fullName) {
          // Note: We can't easily sign up users from the frontend without logging out
          // For now, we rely on the manual SQL or an Edge Function if restored
          console.log("User creation request for:", payload.email);
        }
        break;

      default:
        console.warn("No execution logic for action type:", actionType);
    }
    return true;
  } catch (error) {
    console.error("Action execution failed:", error);
    return false;
  }
};

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

      // Execute the action immediately for admins
      await executeAction(actionType, payload);

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

    // Execute the action if approved
    if (status === "approved") {
      // Fetch action details to get the payload
      const { data: actionData } = await supabase
        .from("pending_actions")
        .select("*")
        .eq("id", actionId)
        .single();

      if (actionData) {
        await executeAction(actionData.action_type as ActionType, actionData.payload);
      }
    }

    const statusLabels = { approved: "approuvée", rejected: "rejetée", modified: "modifiée" };
    toast.success(`Action ${statusLabels[status]}`);
    return true;
  };

  return { submitAction, reviewAction };
};
