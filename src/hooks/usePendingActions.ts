import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ActionType =
  | "product_create"
  | "product_update"
  | "product_delete"
  | "order_create"
  | "order_update"
  | "order_cancel"
  | "dispensing_create"
  | "dispensing_update"
  | "stock_adjustment"
  | "stock_transfer"
  | "customer_create"
  | "customer_update"
  | "pricing_change"
  | "insurance_claim"
  | "medical_advice_create"
  | "medical_advice_update"
  | "store_create"
  | "store_update"
  | "settings_change"
  | "other";

export const usePendingActions = () => {
  const { user, isAdmin } = useAuth();

  const executeAction = async (actionType: ActionType, payload: any) => {
    try {
      const db = supabase as any;
      switch (actionType) {
        case "product_create":
          await db.from("products").insert({
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
          await db.from("customers").insert({
            full_name: payload.name,
            email: payload.email,
            phone: payload.phone,
            insurance_provider: payload.type === "wholesale" ? "Corporate" : "Retail"
          });
          break;

        case "order_create": {
          // Try to find a customer with that name first
          const { data: customer } = await db
            .from("customers")
            .select("id")
            .eq("full_name", payload.customerName)
            .maybeSingle();

          let customerId = customer?.id;

          // If not found, create a new customer record
          if (!customerId) {
            const { data: newCustomer } = await db
              .from("customers")
              .insert({
                full_name: payload.customerName,
                insurance_provider: payload.customerType === "wholesale" ? "Corporate" : "Retail"
              })
              .select("id")
              .single();
            customerId = newCustomer?.id;
          }

          await db.from("orders").insert({
            customer_id: customerId,
            total_amount: payload.totalAmount || 0,
            items: payload.items,
            status: "pending"
          });
          break;
        }

        case "stock_adjustment":
          // Update product quantity
          if (payload.productId) {
            const { data: prd } = await db.from("products").select("quantity").eq("id", payload.productId).single();
            if (prd) {
              const newQty = (prd.quantity || 0) + (parseInt(payload.adjustment) || 100);
              await db.from("products").update({
                quantity: newQty,
                status: newQty > 0 ? "in-stock" : "out-of-stock"
              }).eq("id", payload.productId);
            }
          }
          break;

        case "other":
          if (payload.email && payload.password && payload.fullName) {
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

    // Admin actions are auto-approved AND executed immediately
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

      // Execute the action for admin
      const executed = await executeAction(actionType, payload);
      if (executed) {
        toast.success("Action exécutée avec succès");
      } else {
        toast.error("L'action a été enregistrée mais l'exécution a échoué");
      }

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
        status: "pending"
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

    // If approved, we need the payload to execute it
    if (status === "approved" || status === "modified") {
      const { data: action } = await supabase
        .from("pending_actions")
        .select("*")
        .eq("id", actionId)
        .single();

      if (action) {
        const executed = await executeAction(action.action_type as ActionType, action.payload);
        if (!executed) {
          toast.error("Échec de l'exécution de l'action");
          return false;
        }
      }
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

  return { submitAction, reviewAction, executeAction };
};
