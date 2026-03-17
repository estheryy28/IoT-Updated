import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Driver, Vehicle } from "@/hooks/useFleetData";
import { Heart, Brain, Timer, ArrowLeft } from "lucide-react";

interface DriverHubProps {
  drivers: Driver[];
  vehicles: Vehicle[];
}

const behaviorColors: Record<Driver["behaviorType"], string> = {
  Passive: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Normal: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Aggressive: "text-red-400 bg-red-500/10 border-red-500/30",
};

const fatigueColors: Record<Driver["fatigueLevel"], string> = {
  Low: "text-emerald-400",
  Moderate: "text-amber-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};

function MiniGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#27272a" strokeWidth="5" />
          <circle cx="30" cy="30" r="24" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(value / 100) * 150.8} 150.8`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}

export function DriverHub({ drivers, vehicles }: DriverHubProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  if (selectedDriver) {
    const v = vehicles.find(v => v.id === selectedDriver.vehicleId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDriver(null)} className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedDriver.name}</h2>
            <p className="text-zinc-400 text-sm">{selectedDriver.id} • Vehicle: {v?.name || selectedDriver.vehicleId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vitals */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" /> Health & Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8 justify-center py-4">
                <MiniGauge value={selectedDriver.alertnessScore} label="Alertness" color="#22d3ee" />
                <MiniGauge value={100 - selectedDriver.stressScore} label="Calm Level" color="#a78bfa" />
                <MiniGauge value={selectedDriver.safetyScore} label="Safety" color="#34d399" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{selectedDriver.heartRate}</p>
                  <p className="text-xs text-zinc-500">BPM (Heart Rate)</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <Timer className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{selectedDriver.drivingDuration}h</p>
                  <p className="text-xs text-zinc-500">Driving Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Analysis */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" /> Behavior Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Behavior Type</span>
                <Badge variant="outline" className={behaviorColors[selectedDriver.behaviorType]}>{selectedDriver.behaviorType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Fatigue Level</span>
                <span className={`text-sm font-medium ${fatigueColors[selectedDriver.fatigueLevel]}`}>{selectedDriver.fatigueLevel}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Stress Score</span>
                  <span className="text-zinc-300">{selectedDriver.stressScore}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all" style={{ width: `${selectedDriver.stressScore}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Alertness Score</span>
                  <span className="text-zinc-300">{selectedDriver.alertnessScore}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${selectedDriver.alertnessScore}%` }} />
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-800 space-y-2 text-sm mt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rapid Accelerations:</span>
                  <span className="text-amber-400 font-bold">{selectedDriver.rapidAccelerationEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Harsh Braking:</span>
                  <span className="text-red-400 font-bold">{selectedDriver.harshBrakingEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Lane Variations:</span>
                  <span className="text-orange-400 font-bold">{selectedDriver.laneVariationEvents}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Driver Monitoring Hub</h2>
        <p className="text-zinc-400 text-sm mt-1">Monitor driver behavior, safety scores, and fatigue levels</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-zinc-900 z-10">
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Driver</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Vehicle</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Behavior</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Safety Score</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Fatigue</th>
                  <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">Heart Rate</th>
                  <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => {
                  const v = vehicles.find(v => v.id === driver.vehicleId);
                  return (
                    <tr key={driver.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => setSelectedDriver(driver)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            {driver.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{driver.name}</p>
                            <p className="text-xs text-zinc-500">{driver.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{v?.name || driver.vehicleId}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${behaviorColors[driver.behaviorType]}`}>{driver.behaviorType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${driver.safetyScore >= 70 ? "text-emerald-400" : driver.safetyScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {driver.safetyScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${fatigueColors[driver.fatigueLevel]}`}>{driver.fatigueLevel}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-zinc-300">{driver.heartRate} BPM</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 text-xs">View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
