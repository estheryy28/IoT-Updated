import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, AlertTriangle, Wrench, Activity, TrendingUp, Shield, Zap } from "lucide-react";
import type { Vehicle, Driver, Alert } from "@/hooks/useFleetData";

interface FleetOverviewProps {
  totalTrucks: number;
  activeTrucks: number;
  highRiskVehicles: number;
  maintenanceRequired: number;
  activeAlerts: number;
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
}

function StatCard({ title, value, icon: Icon, color, subtitle, trend }: {
  title: string; value: number | string; icon: typeof Truck; color: string; subtitle: string; trend?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/30 text-violet-400",
  };
  const iconColorMap: Record<string, string> = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    red: "bg-red-500/20 text-red-400",
    amber: "bg-amber-500/20 text-amber-400",
    violet: "bg-violet-500/20 text-violet-400",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]} border relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <Icon className="w-full h-full" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconColorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorMap[color].split(" ").pop()}`}>{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-zinc-500">{subtitle}</p>
          {trend && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-700 text-zinc-400">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FleetOverview({
  totalTrucks, activeTrucks, highRiskVehicles, maintenanceRequired, activeAlerts, vehicles, drivers, alerts,
}: FleetOverviewProps) {
  const recentAlerts = alerts.filter(a => !a.resolved).slice(0, 5);
  const avgSafetyScore = drivers.length > 0
    ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Fleet Overview</h2>
        <p className="text-zinc-400 text-sm mt-1">Real-time fleet intelligence dashboard</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Trucks" value={totalTrucks} icon={Truck} color="cyan" subtitle="Registered fleet" />
        <StatCard title="Active Trucks" value={activeTrucks} icon={Activity} color="emerald" subtitle="Currently operating" trend={`${Math.round((activeTrucks / totalTrucks) * 100)}%`} />
        <StatCard title="High-Risk" value={highRiskVehicles} icon={AlertTriangle} color="red" subtitle="Immediate attention" />
        <StatCard title="Maintenance" value={maintenanceRequired} icon={Wrench} color="amber" subtitle="Services pending" />
        <StatCard title="Active Alerts" value={activeAlerts} icon={Zap} color="violet" subtitle="Unresolved" />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fleet Safety Score */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> Fleet Safety Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={avgSafetyScore >= 70 ? "#22d3ee" : avgSafetyScore >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="10" strokeDasharray={`${(avgSafetyScore / 100) * 314} 314`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{avgSafetyScore}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-8">
                  <span className="text-zinc-400">Excellent</span>
                  <span className="text-emerald-400">{drivers.filter(d => d.safetyScore >= 80).length}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-zinc-400">Good</span>
                  <span className="text-cyan-400">{drivers.filter(d => d.safetyScore >= 60 && d.safetyScore < 80).length}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-zinc-400">At Risk</span>
                  <span className="text-red-400">{drivers.filter(d => d.safetyScore < 60).length}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Avg Accident Risk (Fusion Score):</span>
                <span className="text-white font-bold">{
                  vehicles.length > 0
                    ? Math.round(vehicles.reduce((s, v) => s + v.accidentRiskScore, 0) / vehicles.length)
                    : 0
                }%</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 text-right italic">0.4(Driver) + 0.4(Vehicle) + 0.2(Env)</p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Status Distribution */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Vehicle Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["safe", "warning", "danger"] as const).map(status => {
                const count = vehicles.filter(v => v.status === status).length;
                const pct = totalTrucks > 0 ? (count / totalTrucks) * 100 : 0;
                const colorBar = status === "safe" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400 capitalize">{status}</span>
                      <span className="text-zinc-300">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colorBar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" /> Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAlerts.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">No active alerts</p>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${alert.severity === "critical" ? "bg-red-500 animate-pulse" : alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 truncate">{alert.message}</p>
                      <p className="text-[10px] text-zinc-500">{alert.vehicleId} • {new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
