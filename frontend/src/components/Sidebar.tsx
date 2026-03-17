import { useState } from "react";
import {
  LayoutDashboard, Map, Flame, Users, Truck, Wrench,
  Bell, BarChart3, ChevronLeft, ChevronRight, Shield, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardSection =
  | "overview"
  | "map"
  | "heatmap"
  | "drivers"
  | "vehicles"
  | "maintenance"
  | "alerts"
  | "analytics";

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Fleet Overview", icon: LayoutDashboard },
  { id: "map", label: "Live Vehicle Map", icon: Map },
  { id: "heatmap", label: "Risk Heatmap", icon: Flame },
  { id: "drivers", label: "Driver Hub", icon: Users },
  { id: "vehicles", label: "Vehicle Health", icon: Truck },
  { id: "maintenance", label: "Predictive Maintenance", icon: Wrench },
  { id: "alerts", label: "Alert Center", icon: Bell },
  { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
];

interface SidebarProps {
  activeSection: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  activeAlerts: number;
  onLogout: () => void;
}

export function Sidebar({ activeSection, onNavigate, activeAlerts, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300 z-30",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Truck Safety IoT</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Fleet Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full" />
              )}
              <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              {!collapsed && <span>{item.label}</span>}
              {item.id === "alerts" && activeAlerts > 0 && (
                <span className={cn(
                  "ml-auto flex items-center justify-center text-[10px] font-bold rounded-full bg-red-500 text-white",
                  collapsed ? "w-4 h-4 absolute -top-1 -right-1" : "w-5 h-5"
                )}>
                  {activeAlerts}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout & Collapse */}
      <div className="border-t border-zinc-800 p-2 space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
