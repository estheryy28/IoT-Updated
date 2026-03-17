import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Alert, Driver, Vehicle } from "@/hooks/useFleetData";
import { CheckCircle, Send } from "lucide-react";
import { useState } from "react";

interface AlertCenterProps {
  alerts: Alert[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onResolve: (alertId: string) => void;
}

const severityStyles = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", dot: "bg-red-500", text: "text-red-400", label: "Critical" },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500", text: "text-amber-400", label: "Warning" },
  info: { bg: "bg-blue-500/10", border: "border-blue-500/30", dot: "bg-blue-500", text: "text-blue-400", label: "Info" },
};

export function AlertCenter({ alerts, drivers, vehicles, onResolve }: AlertCenterProps) {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");

  const filtered = alerts.filter(a => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === "warning" && !a.resolved).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Alert Management Center</h2>
        <p className="text-zinc-400 text-sm mt-1">Monitor, manage, and resolve fleet safety alerts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div>
              <p className="text-xl font-bold text-white">{criticalCount}</p>
              <p className="text-xs text-zinc-400">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div>
              <p className="text-xl font-bold text-white">{warningCount}</p>
              <p className="text-xs text-zinc-400">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xl font-bold text-white">{alerts.filter(a => a.resolved).length}</p>
              <p className="text-xs text-zinc-400">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "active", "resolved"] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
            className={filter === f ? "bg-cyan-600 hover:bg-cyan-700" : "border-zinc-700 text-zinc-400"}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-zinc-800/50">
              {filtered.map(alert => {
                const sev = severityStyles[alert.severity];
                const driver = drivers.find(d => d.id === alert.driverId);
                const vehicle = vehicles.find(v => v.id === alert.vehicleId);

                return (
                  <div key={alert.id} className={`p-4 flex items-start gap-4 transition-colors ${alert.resolved ? "opacity-50" : "hover:bg-zinc-800/30"}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${sev.dot} ${!alert.resolved && alert.severity === "critical" ? "animate-pulse" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] ${sev.text} ${sev.border}`}>{alert.type}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${sev.text} ${sev.border}`}>{sev.label}</Badge>
                        {alert.resolved && <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Resolved</Badge>}
                      </div>
                      <p className="text-sm text-zinc-300">{alert.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {vehicle?.name || alert.vehicleId} • {driver?.name || alert.driverId} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="text-xs border-zinc-700 text-zinc-400 hover:text-cyan-400">
                          <Send className="w-3 h-3 mr-1" /> Notify
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-zinc-700 text-zinc-400 hover:text-violet-400">
                          Schedule Maintenance
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-zinc-700 text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => onResolve(alert.id)}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
