import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Vehicle } from "@/hooks/useFleetData";

interface RiskHeatmapProps {
  vehicles: Vehicle[];
}

export function RiskHeatmap({ vehicles }: RiskHeatmapProps) {
  const dangerVehicles = vehicles.filter(v => v.status === "danger");
  const warningVehicles = vehicles.filter(v => v.status === "warning");
  const safeVehicles = vehicles.filter(v => v.status === "safe");

  // Create a grid-based heatmap
  const gridSize = 8;
  const grid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

  vehicles.forEach(v => {
    const col = Math.min(gridSize - 1, Math.floor(((v.lng - 72) / 16) * gridSize));
    const row = Math.min(gridSize - 1, Math.floor(((28 - v.lat) / 20) * gridSize));
    const r = Math.max(0, Math.min(gridSize - 1, row));
    const c = Math.max(0, Math.min(gridSize - 1, col));
    grid[r][c] += v.status === "danger" ? 3 : v.status === "warning" ? 2 : 1;
  });

  const maxIntensity = Math.max(1, ...grid.flat());

  function getHeatColor(intensity: number): string {
    if (intensity === 0) return "bg-zinc-800/30";
    const ratio = intensity / maxIntensity;
    if (ratio > 0.7) return "bg-red-500/80";
    if (ratio > 0.4) return "bg-amber-500/60";
    if (ratio > 0.2) return "bg-emerald-500/40";
    return "bg-emerald-500/20";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Fleet Risk Heatmap</h2>
        <p className="text-zinc-400 text-sm mt-1">Visualize clusters of vehicle risk across regions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Heatmap Grid */}
        <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-zinc-300">Regional Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {grid.map((row, ri) =>
                row.map((cell, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={`aspect-square rounded-md ${getHeatColor(cell)} flex items-center justify-center text-xs font-medium transition-colors duration-300 hover:ring-2 hover:ring-cyan-500/50 cursor-pointer`}
                  >
                    {cell > 0 && <span className="text-white/70">{cell}</span>}
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500/30" />
                <span className="text-xs text-zinc-500">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500/60" />
                <span className="text-xs text-zinc-500">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500/80" />
                <span className="text-xs text-zinc-500">High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Summary */}
        <div className="space-y-4">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-400">{dangerVehicles.length}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-300">High Risk Vehicles</p>
                  <p className="text-xs text-zinc-500">Require immediate action</p>
                </div>
              </div>
              {dangerVehicles.length > 0 && (
                <div className="mt-3 space-y-1">
                  {dangerVehicles.map(v => (
                    <p key={v.id} className="text-xs text-zinc-400">• {v.name} ({v.id})</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-400">{warningVehicles.length}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-300">Warning Vehicles</p>
                  <p className="text-xs text-zinc-500">Monitor closely</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-400">{safeVehicles.length}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-300">Safe Vehicles</p>
                  <p className="text-xs text-zinc-500">Operating normally</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
