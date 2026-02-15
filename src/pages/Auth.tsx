import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Pill, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isSetup, setIsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [email, setEmail] = useState("amperella@gmail.com");
  const [password, setPassword] = useState("Admin123");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
    // Check if admin exists already
    const checkAdmin = async () => {
      const { data } = await supabase.functions.invoke("check-admin");
      setIsSetup(!data?.hasAdmin);
      setCheckingSetup(false);
    };
    checkAdmin().catch(() => setCheckingSetup(false));
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Connexion réussie");
      navigate("/");
    }
    setLoading(false);
  };

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sign up first
    const { error: signUpError } = await signUp(email, password, fullName);
    if (signUpError) {
      toast.error(signUpError.message);
      setLoading(false);
      return;
    }

    // Sign in immediately (auto-confirm is on)
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      toast.error(signInError.message);
      setLoading(false);
      return;
    }

    // Call setup-admin to assign admin role
    const { data, error } = await supabase.functions.invoke("setup-admin");
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Erreur lors de la configuration admin");
      setLoading(false);
      return;
    }

    toast.success("Compte administrateur créé avec succès !");
    navigate("/");
    setLoading(false);
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
              <Pill size={28} />
            </div>
            <h1 className="font-display text-2xl font-bold">PharmaOS</h1>
            <p className="text-sm text-muted-foreground mt-1">Système de gestion pharmaceutique</p>
          </div>

          <h2 className="text-lg font-semibold text-center mb-6">
            {isSetup ? "Configuration initiale — Compte Admin" : "Connexion"}
          </h2>

          <form onSubmit={isSetup ? handleSetupAdmin : handleLogin} className="space-y-4">
            {isSetup && (
              <div>
                <label className="text-sm font-medium block mb-1.5">Nom complet</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Administrateur PharmaOS" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="admin@pharmaos.fr" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isSetup ? "Créer le compte Admin" : "Se connecter"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
