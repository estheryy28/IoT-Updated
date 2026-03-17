import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PredictiveMaintenance as PM, Vehicle } from "@/hooks/useFleetData";
import { Wrench, AlertTriangle, CalendarClock, TrendingUp } from "lucide-react";

interface PredictiveMaintenanceProps {
  maintenance: PM[];
  vehicles: Vehicle[];
}

const statusStyles: Record<PM["status"], string> = {
  Urgent: "text-red-400 bg-red-500/10 border-red-500/30",
  Scheduled: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Monitoring: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
};

export function PredictiveMaintenancePanel({ maintenance, vehicles }: PredictiveMaintenanceProps) {
  const sorted = [...maintenance].sort((a, b) => b.failureProbability - a.failureProbability);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Predictive Maintenance</h2>
        <p className="text-zinc-400 text-sm mt-1">AI-predicted component failures and recommended service dates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Summary Cards */}
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{maintenance.filter(m => m.status === "Urgent").length}</p>
              <p className="text-xs text-zinc-400">Urgent Services</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <CalendarClock className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-white">{maintenance.filter(m => m.status === "Scheduled").length}</p>
              <p className="text-xs text-zinc-400">Scheduled Services</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-white">{maintenance.filter(m => m.status === "Monitoring").length}</p>
              <p className="text-xs text-zinc-400">Under Monitoring</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Items */}
      <div className="space-y-3">
        {sorted.map(item => {
          const v = vehicles.find(v => v.id === item.vehicleId);
          return (
            <Card key={item.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.component}</p>
                      <p className="text-xs text-zinc-500">{v?.name || item.vehicleId} • {item.vehicleId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Failure Probability */}
                    <div className="text-center">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                          <circle cx="30" cy="30" r="24" fill="none" stroke="#27272a" strokeWidth="4" />
                          <circle cx="30" cy="30" r="24" fill="none"
                            stroke={item.failureProbability > 70 ? "#ef4444" : item.failureProbability > 40 ? "#f59e0b" : "#22d3ee"}
                            strokeWidth="4"
                            strokeDasharray={`${(item.failureProbability / 100) * 150.8} 150.8`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{item.failureProbability}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Failure Risk</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-zinc-300">{item.recommendedDate}</p>
                      <p className="text-[10px] text-zinc-500">Recommended Service</p>
                    </div>

                    <Badge variant="outline" className={statusStyles[item.status]}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
