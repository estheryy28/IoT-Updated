import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import type { DashboardSection } from "@/components/Sidebar";
import { useFleetData } from "@/hooks/useFleetData";
import { FleetOverview } from "@/components/dashboard/FleetOverview";
import { VehicleMap } from "@/components/dashboard/VehicleMap";
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap";
import { DriverHub } from "@/components/dashboard/DriverHub";
import { VehicleHealth } from "@/components/dashboard/VehicleHealth";
import { PredictiveMaintenancePanel } from "@/components/dashboard/PredictiveMaintenance";
import { AlertCenter } from "@/components/dashboard/AlertCenter";
import { Analytics } from "@/components/dashboard/Analytics";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [section, setSection] = useState<DashboardSection>("overview");
  const data = useFleetData();

  function renderSection() {
    switch (section) {
      case "overview":
        return (
          <FleetOverview
            totalTrucks={data.totalTrucks}
            activeTrucks={data.activeTrucks}
            highRiskVehicles={data.highRiskVehicles}
            maintenanceRequired={data.maintenanceRequired}
            activeAlerts={data.activeAlerts}
            vehicles={data.vehicles}
            drivers={data.drivers}
            alerts={data.alerts}
          />
        );
      case "map":
        return <VehicleMap vehicles={data.vehicles} />;
      case "heatmap":
        return <RiskHeatmap vehicles={data.vehicles} />;
      case "drivers":
        return <DriverHub drivers={data.drivers} vehicles={data.vehicles} />;
      case "vehicles":
        return <VehicleHealth vehicles={data.vehicles} />;
      case "maintenance":
        return <PredictiveMaintenancePanel maintenance={data.predictiveMaintenance} vehicles={data.vehicles} />;
      case "alerts":
        return <AlertCenter alerts={data.alerts} drivers={data.drivers} vehicles={data.vehicles} onResolve={data.resolveAlert} />;
      case "analytics":
        return <Analytics historicalData={data.historicalData} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar activeSection={section} onNavigate={setSection} activeAlerts={data.activeAlerts} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
