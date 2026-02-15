import { motion } from "framer-motion";
import { Store, MapPin, Phone, User, Settings, ArrowLeftRight, BarChart3, Plus } from "lucide-react";
import { stores } from "@/data/mockData";
import { toast } from "sonner";

const Stores = () => {
  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Gestion Multi-Magasins</h1>
          <p className="page-subtitle">{stores.length} magasins — Tableau de bord centralisé</p>
        </div>
        <button
          onClick={() => toast.info("Fonctionnalité d'ajout de magasin bientôt disponible")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Ajouter un magasin
        </button>
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store, i) => (
          <motion.div
            key={store.id}
            className="glass-card p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm">{store.name}</h3>
                  <span className={store.status === "active" ? "badge-success" : "badge-danger"}>
                    {store.status === "active" ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-2"><MapPin size={12} /> {store.address}</div>
              <div className="flex items-center gap-2"><Phone size={12} /> {store.phone}</div>
              <div className="flex items-center gap-2"><User size={12} /> {store.manager}</div>
            </div>

            {/* Quick Stats (mock) */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
              <div className="text-center">
                <p className="text-sm font-bold">156</p>
                <p className="text-[10px] text-muted-foreground">Produits</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">42</p>
                <p className="text-[10px] text-muted-foreground">Commandes/mois</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">8</p>
                <p className="text-[10px] text-muted-foreground">Personnel</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toast.info("Génération du rapport en cours...")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
              >
                <BarChart3 size={12} /> Rapports
              </button>
              <button
                onClick={() => toast.info("Interface de transfert inter-magasins...")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
              >
                <ArrowLeftRight size={12} /> Transferts
              </button>
              <button
                onClick={() => toast.info("Paramètres du magasin...")}
                className="flex items-center justify-center p-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Settings size={14} className="text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inventory Sync Info */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-2">Synchronisation des stocks</h3>
        <p className="text-sm text-muted-foreground mb-4">Les niveaux de stock sont synchronisés en temps réel entre tous les magasins. Les transferts inter-magasins peuvent être initiés depuis chaque magasin.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Sync automatique", desc: "Stock mis à jour en temps réel entre tous les magasins" },
            { title: "Transferts", desc: "Transférez des produits entre magasins pour équilibrer les stocks" },
            { title: "Rapports centralisés", desc: "Vue consolidée des performances de tous les magasins" },
          ].map((item) => (
            <div key={item.title} className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stores;
