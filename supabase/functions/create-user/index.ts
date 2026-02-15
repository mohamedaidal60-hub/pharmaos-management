import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the calling user is admin
    const authHeader = req.headers.get("Authorization")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: { user: callingUser } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (!callingUser) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check if caller is admin
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Accès refusé. Seul l'administrateur peut créer des utilisateurs." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { email, password, full_name, role } = await req.json();

    // Create user with admin client
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Assign role
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role,
    });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
