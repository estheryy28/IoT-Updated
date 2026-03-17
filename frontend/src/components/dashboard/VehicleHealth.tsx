import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/hooks/useFleetData";
import { Truck, Thermometer, Disc3, Weight, ArrowLeft, Gauge } from "lucide-react";

interface VehicleHealthProps {
  vehicles: Vehicle[];
}

function SensorBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300 font-medium">{value}{unit}</span>
      </div>
      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

export function VehicleHealth({ vehicles }: VehicleHealthProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  if (selectedVehicle) {
    const v = selectedVehicle;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedVehicle(null)} className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{v.name}</h2>
            <p className="text-zinc-400 text-sm">{v.id} • {v.plate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-3xl font-bold text-white">{v.engineTemp}°C</p>
              <p className="text-xs text-zinc-500 mt-1">Engine Temperature</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${v.engineTemp > 105 ? "bg-red-500" : v.engineTemp > 90 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${(v.engineTemp / 130) * 100}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Disc3 className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
              <p className="text-3xl font-bold text-white">{v.brakeHealth}%</p>
              <p className="text-xs text-zinc-500 mt-1">Brake Health</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${v.brakeHealth < 40 ? "bg-red-500" : v.brakeHealth < 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${v.brakeHealth}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Weight className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-3xl font-bold text-white">{v.loadRatio}%</p>
              <p className="text-xs text-zinc-500 mt-1">Load Ratio</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${v.loadRatio > 95 ? "bg-red-500" : v.loadRatio > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, v.loadRatio)}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" /> Full Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SensorBar label="Engine Health" value={v.engineHealth} max={100} unit="%" color={v.engineHealth < 50 ? "bg-red-500" : "bg-emerald-500"} />
            <SensorBar label="Engine Temperature" value={v.engineTemp} max={130} unit="°C" color={v.engineTemp > 105 ? "bg-red-500" : "bg-cyan-500"} />
            <SensorBar label="Brake Health" value={v.brakeHealth} max={100} unit="%" color={v.brakeHealth < 40 ? "bg-red-500" : "bg-emerald-500"} />
            <SensorBar label="Load Stress" value={v.loadStress} max={100} unit="%" color={v.loadStress > 80 ? "bg-red-500" : "bg-blue-500"} />
            <SensorBar label="Load Ratio" value={v.loadRatio} max={105} unit="%" color={v.loadRatio > 95 ? "bg-red-500" : "bg-violet-500"} />
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-sm text-zinc-400">Tire Pressure</span>
              <Badge variant="outline" className={
                v.tirePressure === "Normal" ? "text-emerald-400 border-emerald-500/30" :
                  v.tirePressure === "Low" ? "text-amber-400 border-amber-500/30" :
                    "text-red-400 border-red-500/30"
              }>{v.tirePressure}</Badge>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
              <span className="text-sm text-zinc-400">Tire Imbalance</span>
              <Badge variant="outline" className={
                v.tireImbalance === "None" ? "text-emerald-400 border-emerald-500/30" :
                  v.tireImbalance === "Slight" ? "text-amber-400 border-amber-500/30" :
                    "text-red-400 border-red-500/30"
              }>{v.tireImbalance}</Badge>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
              <span className="text-sm text-zinc-400">System Sensor Array</span>
              <Badge variant="outline" className={
                v.sensorStatus === "Online" ? "text-cyan-400 border-cyan-500/30" :
                  v.sensorStatus === "Degraded" ? "text-amber-400 border-amber-500/30" :
                    "text-red-400 border-red-500/30"
              }>{v.sensorStatus}</Badge>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
              <span className="text-sm text-zinc-400">Last Updated</span>
              <span className="text-sm text-zinc-300">{v.lastUpdate}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Vehicle Health Hub</h2>
        <p className="text-zinc-400 text-sm mt-1">Monitor mechanical state and sensor data for all vehicles</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-zinc-900 z-10">
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Vehicle</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Engine Health</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Tire Pressure</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Load Stress</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => setSelectedVehicle(v)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{v.name}</p>
                          <p className="text-xs text-zinc-500">{v.plate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.engineHealth < 50 ? "bg-red-500" : v.engineHealth < 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${v.engineHealth}%` }} />
                        </div>
                        <span className="text-xs text-zinc-400">{v.engineHealth}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${
                        v.tirePressure === "Normal" ? "text-emerald-400 border-emerald-500/30" :
                          v.tirePressure === "Low" ? "text-amber-400 border-amber-500/30" :
                            "text-red-400 border-red-500/30"
                      }`}>{v.tirePressure}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${v.loadStress > 80 ? "text-red-400" : v.loadStress > 60 ? "text-amber-400" : "text-zinc-300"}`}>{v.loadStress}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto ${v.status === "safe" ? "bg-emerald-500" : v.status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 text-xs">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
