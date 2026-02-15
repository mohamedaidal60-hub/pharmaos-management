import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Pill,
  BarChart3,
  MessageSquare,
  CalendarDays,
  Settings,
  Shield,
  DollarSign,
  Stethoscope,
  Warehouse,
  Store,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  UserCog,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Produits" },
  { to: "/orders", icon: ShoppingCart, label: "Commandes" },
  { to: "/dispensing", icon: Pill, label: "Dispensation" },
  { to: "/stock", icon: Warehouse, label: "Stock" },
  { to: "/customers", icon: Users, label: "Clients" },
  { to: "/pricing", icon: DollarSign, label: "Tarification" },
  { to: "/insurance", icon: Shield, label: "Assurance" },
  { to: "/medical-advice", icon: Stethoscope, label: "Conseils Médicaux" },
  { to: "/reports", icon: BarChart3, label: "Rapports" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/calendar", icon: CalendarDays, label: "Calendrier" },
  { to: "/stores", icon: Store, label: "Multi-Magasins" },
  { to: "/settings", icon: Settings, label: "Paramètres" },
];

const adminItems = [
  { to: "/admin/validation", icon: CheckSquare, label: "Validations" },
  { to: "/admin/users", icon: UserCog, label: "Utilisateurs" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin, profile, signOut } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r transition-all duration-300",
        "bg-sidebar border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-bold text-primary-foreground text-sm">
          PO
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-sm text-sidebar-primary-foreground truncate">
              PharmaOS
            </span>
            <span className="text-[10px] text-sidebar-muted truncate">
              Pharmacy Management
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  Administration
                </p>
              )}
            </div>
            {adminItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "sidebar-item",
                    isActive && "sidebar-item-active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" size={18} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* User & Logout */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {profile && !collapsed && (
          <div className="px-3 py-1.5">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{profile.full_name}</p>
            <p className="text-[10px] text-sidebar-muted truncate">{profile.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10"
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="truncate">Déconnexion</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="truncate">Réduire</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
