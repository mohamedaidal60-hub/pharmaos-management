import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-[240px] transition-all duration-300">
        <AppHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
