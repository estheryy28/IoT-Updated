import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vehicle } from "@/hooks/useFleetData";
import { Signal } from "lucide-react";

interface VehicleMapProps {
  vehicles: Vehicle[];
}

const statusColor = {
  safe: { bg: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30", label: "Safe" },
  warning: { bg: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30", label: "Warning" },
  danger: { bg: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30", label: "High Risk" },
};

export function VehicleMap({ vehicles }: VehicleMapProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Real-Time Vehicle Map</h2>
        <p className="text-zinc-400 text-sm mt-1">GPS-enabled live tracking of all fleet vehicles</p>
      </div>

      {/* Simulated Map */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full h-[500px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
            {/* Grid overlay to simulate map */}
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(63,63,70,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(63,63,70,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
            {/* Road-like lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <line x1="0" y1="250" x2="100%" y2="250" stroke="#4ade80" strokeWidth="2" strokeDasharray="8 4" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#4ade80" strokeWidth="2" strokeDasharray="8 4" />
              <path d="M0,100 Q400,400 800,200 T1600,300" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 3" />
            </svg>

            {/* Vehicle dots */}
            {vehicles.map((v) => {
              const x = ((v.lng - 72) / 16) * 100;
              const y = ((28 - v.lat) / 20) * 100;
              const sc = statusColor[v.status];
              return (
                <div
                  key={v.id}
                  className="absolute group cursor-pointer transition-transform duration-500"
                  style={{ left: `${Math.max(5, Math.min(90, x))}%`, top: `${Math.max(5, Math.min(90, y))}%` }}
                >
                  <div className={`relative w-4 h-4 rounded-full ${sc.bg} ring-4 ${sc.ring} shadow-lg`}>
                    {v.status === "danger" && (
                      <div className={`absolute inset-0 rounded-full ${sc.bg} animate-ping opacity-40`} />
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl min-w-[180px]">
                      <p className="text-sm font-bold text-white">{v.name}</p>
                      <p className="text-xs text-zinc-500">{v.plate}</p>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Status</span>
                          <span className={sc.text}>{sc.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Engine</span>
                          <span className="text-zinc-300">{v.engineHealth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Load</span>
                          <span className={v.loadRatio > 95 ? "text-red-400" : "text-zinc-300"}>{v.loadRatio}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-zinc-900/90 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs font-semibold text-zinc-300 mb-2">Status Indicators</p>
              {Object.entries(statusColor).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs mb-1">
                  <div className={`w-3 h-3 rounded-full ${val.bg}`} />
                  <span className="text-zinc-400">{val.label}</span>
                </div>
              ))}
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-zinc-900/90 border border-zinc-700 rounded-full px-3 py-1.5">
              <Signal className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-300">Live Tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map(v => {
          const sc = statusColor[v.status];
          return (
            <Card key={v.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${sc.bg} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{v.name}</p>
                  <p className="text-xs text-zinc-500">{v.id} • {v.plate}</p>
                </div>
                <Badge variant="outline" className={`${sc.text} border-current text-[10px]`}>{sc.label}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
