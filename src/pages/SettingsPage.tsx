import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Store, Palette, Database, Key } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "general", label: "Général", icon: SettingsIcon },
  { id: "profile", label: "Profil", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "localization", label: "Localisation", icon: Globe },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Configuration de l'application et préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="glass-card p-3 h-fit">
          <nav className="space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 lg:col-span-3">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold mb-1">Paramètres généraux</h3>
                <p className="text-xs text-muted-foreground mb-4">Configuration de base de l'application</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Nom de la pharmacie</label>
                  <input type="text" defaultValue="PharmaOS" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Devise</label>
                  <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                    <option>DZD - Dinar Algérien</option>
                    <option>USD - Dollar US</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Fuseau horaire</label>
                  <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                    <option>Africa/Algiers (UTC+1)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Seuil d'alerte stock bas (défaut)</label>
                  <input type="number" defaultValue={50} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Sauvegarder
              </button>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold mb-1">Profil utilisateur</h3>
                <p className="text-xs text-muted-foreground mb-4">Informations personnelles et rôle</p>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">AJ</div>
                <div>
                  <p className="font-semibold">Dr. Amina Juma</p>
                  <p className="text-sm text-muted-foreground">Administrateur — PharmaOS Central</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Nom complet</label>
                    <input type="text" defaultValue="Dr. Amina Juma" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Email</label>
                    <input type="email" defaultValue="admin@pharmaos.dz" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Rôle</label>
                  <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                    <option>Administrateur</option>
                    <option>Pharmacien</option>
                    <option>Caissier</option>
                    <option>Magasinier</option>
                  </select>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Mettre à jour
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold mb-1">Notifications</h3>
                <p className="text-xs text-muted-foreground mb-4">Gérez vos préférences de notification</p>
              </div>
              {[
                { label: "Alertes stock faible", desc: "Recevoir une notification quand un produit est en stock faible" },
                { label: "Nouvelles commandes", desc: "Notification pour chaque nouvelle commande reçue" },
                { label: "Produits expirés", desc: "Alerte quand un produit approche de sa date d'expiration" },
                { label: "Messages urgents", desc: "Notifications pour les messages marqués comme urgents" },
                { label: "Rapports mensuels", desc: "Recevoir les rapports mensuels par email" },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{notif.label}</p>
                    <p className="text-xs text-muted-foreground">{notif.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-card after:transition-transform peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold mb-1">Sécurité & Accès</h3>
                <p className="text-xs text-muted-foreground mb-4">Contrôle des accès et permissions par rôle</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Mot de passe actuel</label>
                  <input type="password" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Nouveau mot de passe</label>
                    <input type="password" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Confirmer</label>
                    <input type="password" className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Changer le mot de passe
              </button>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-sm mb-3">Rôles et permissions</h4>
                <div className="space-y-2">
                  {[
                    { role: "Administrateur", perms: "Accès complet à toutes les fonctionnalités" },
                    { role: "Pharmacien", perms: "Dispensation, ordonnances, conseils médicaux" },
                    { role: "Caissier", perms: "Ventes, encaissements, commandes détail" },
                    { role: "Magasinier", perms: "Stock, inventaire, réception marchandises" },
                    { role: "Manager", perms: "Rapports, tarification, gestion magasin" },
                  ].map((r) => (
                    <div key={r.role} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{r.role}</p>
                        <p className="text-xs text-muted-foreground">{r.perms}</p>
                      </div>
                      <button className="text-xs text-primary hover:underline">Modifier</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "localization" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold mb-1">Localisation</h3>
                <p className="text-xs text-muted-foreground mb-4">Langue et préférences régionales</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Langue de l'interface</label>
                  <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                    <option>Français</option>
                    <option>English</option>
                    <option>Kiswahili</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Format de date</label>
                  <select className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Sauvegarder
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
