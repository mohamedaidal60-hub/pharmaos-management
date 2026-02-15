import { Bell, Search, Store } from "lucide-react";
import { useState } from "react";
import { stores } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const AppHeader = () => {
  const [selectedStore, setSelectedStore] = useState(stores[0].name);
  const { profile, role } = useAuth();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const roleLabels: Record<string, string> = {
    admin: "Administrateur",
    pharmacien: "Pharmacien",
    caissier: "Caissier",
    magasinier: "Magasinier",
    manager: "Manager",
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher produits, commandes, clients..."
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Store selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm">
          <Store className="h-4 w-4 text-primary" />
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.name}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            {initials}
          </div>
          {profile && (
            <div className="hidden md:block">
              <p className="text-xs font-medium">{profile.full_name}</p>
              <p className="text-[10px] text-muted-foreground">{role ? roleLabels[role] || role : ""}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
