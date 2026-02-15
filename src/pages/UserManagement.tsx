import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Loader2, Shield, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { usePendingActions } from "@/hooks/usePendingActions";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "pharmacien", label: "Pharmacien" },
  { value: "caissier", label: "Caissier" },
  { value: "magasinier", label: "Magasinier" },
  { value: "manager", label: "Manager" },
];

const UserManagement = () => {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", fullName: "", role: "pharmacien" });
  const { submitAction } = usePendingActions();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    setProfiles((profilesData as UserProfile[]) || []);
    setRoles((rolesData as UserRole[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const getUserRole = (userId: string) => {
    const r = roles.find((r) => r.user_id === userId);
    return r ? ROLES.find((rl) => rl.value === r.role)?.label || r.role : "Non assigné";
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Record the intent to create a user since we don't have Edge Functions
      const success = await submitAction(
        "other",
        `Création utilisateur: ${newUser.fullName}`,
        `Demande de création de compte pour ${newUser.email} avec le rôle ${newUser.role}`,
        { ...newUser } as any
      );

      if (success) {
        toast.success("Demande de création envoyée à l'administrateur");
        setShowCreate(false);
        setNewUser({ email: "", password: "", fullName: "", role: "pharmacien" });
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    }
    setCreating(false);
  };

  const toggleActive = async (profile: UserProfile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !profile.is_active })
      .eq("id", profile.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(profile.is_active ? "Utilisateur désactivé" : "Utilisateur activé");
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Gestion des Utilisateurs</h1>
          <p className="page-subtitle">Créez et gérez les comptes utilisateurs et leurs rôles</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Créer un utilisateur</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Nom complet</label>
                <input type="text" required value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Mot de passe</label>
                <input type="password" required minLength={6} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Rôle</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                  {ROLES.filter((r) => r.value !== "admin").map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={creating} className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {creating && <Loader2 size={14} className="animate-spin" />}
                Créer l'utilisateur
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Utilisateur</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Rôle</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Statut</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Créé le</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Shield size={10} />
                      {getUserRole(p.user_id)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {p.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3 text-right">
                    {p.user_id !== user?.id && (
                      <button
                        onClick={() => toggleActive(p)}
                        className={`text-xs px-2 py-1 rounded ${p.is_active ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"}`}
                      >
                        {p.is_active ? "Désactiver" : "Activer"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
