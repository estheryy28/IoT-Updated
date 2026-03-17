import { useState, useEffect } from "react";
import { useFleetData } from "@/hooks/useFleetData";
import { cn } from "@/lib/utils";
import {
  Gauge, Heart, Thermometer, MapPin, Bell,
  AlertTriangle, Timer, Activity, Zap, LogOut, Power, Wind
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DriverDashboardProps {
  onLogout: () => void;
}

// Reusable Circular Gauge for Dashboard
function CircularGauge({ value, max, label, color, unit, size = 120 }: { value: number; max: number; label: string; color: string; unit: string; size?: number }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-black/10 dark:text-white/10" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none">{Math.round(value)}</span>
          <span className="text-[10px] font-medium opacity-70">{unit}</span>
        </div>
      </div>
      <span className="text-xs mt-2 font-medium tracking-wide uppercase opacity-70">{label}</span>
    </div>
  );
}

export function DriverDashboard({ onLogout }: DriverDashboardProps) {
  const { drivers, vehicles, alerts } = useFleetData();
  
  const driver = drivers[0];
  const vehicle = vehicles.find(v => v.id === driver?.vehicleId);

  const [speed, setSpeed] = useState(65); 
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => Math.max(0, Math.min(100, prev + (Math.random() * 4 - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!driver) return;
    const hasCritical = alerts.some(a => a.driverId === driver.id && a.severity === "critical" && !a.resolved);
    setShowCriticalAlert(hasCritical);
  }, [alerts, driver]);

  if (!driver || !vehicle) {
    return <div className="h-screen flex items-center justify-center">Loading Operator Profile...</div>;
  }

  const driverAlerts = alerts.filter(a => a.driverId === driver.id && !a.resolved);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans",
      "bg-gray-200 text-gray-700"
    )}>
      
      {/* Critical Alert Overlay Banner */}
      {showCriticalAlert && (
        <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-center gap-3 animate-pulse shadow-lg z-50">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-bold text-sm">CRITICAL WARNING: Check Alert Hub Immediately</p>
        </div>
      )}

      {/* Main Container */}
      <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-8">
        
        {/* Header - Neumorphic Inset Panel */}
        <header className={cn(
          "flex items-center justify-between p-4 md:p-6 rounded-2xl transition-all duration-300",
          "bg-gray-200 shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300",
              "bg-gray-200 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] text-blue-600"
            )}>
              {driver.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl">{driver.name}</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  ON DUTY • {vehicle.plate}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 text-red-500",
                "bg-gray-200 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
              )}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Cockpit */}
          <div className={cn(
            "col-span-1 xl:col-span-2 rounded-3xl p-6 md:p-8 transition-colors duration-300",
            "bg-gray-200 shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff]"
          )}>
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <Gauge className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold">Driving Overview</h2>
            </div>
            
            <div className={cn(
               "rounded-2xl p-8 flex flex-col md:flex-row items-center justify-around gap-8 transition-colors duration-300",
               "bg-gray-200 shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]"
            )}>
              <CircularGauge value={speed} max={120} label="Speed" color={speed > 80 ? "#ef4444" : "#3b82f6"} unit="MPH" size={150} />
              
              <div className={cn(
                "w-40 h-40 rounded-full flex flex-col items-center justify-center",
                "bg-gray-200 shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
              )}>
                <Timer className="w-8 h-8 text-amber-500 mb-2" />
                <span className="text-3xl font-bold">{driver.drivingDuration}h</span>
                <span className="text-xs uppercase tracking-widest mt-1 opacity-70">Driving</span>
              </div>

              <CircularGauge value={driver.safetyScore} max={100} label="Accident Risk" color={driver.safetyScore < 60 ? "#ef4444" : "#10b981"} unit="SCORE" size={150} />
            </div>
          </div>

          {/* Trip Planner */}
          <div className={cn(
            "rounded-3xl p-6 md:p-8 transition-colors duration-300",
            "bg-gray-200 shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff]"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <MapPin className="w-5 h-5 text-violet-500" />
              </div>
              <h2 className="text-xl font-bold">Trip Planner</h2>
            </div>
            
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-2xl flex justify-between items-center",
                "shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]"
              )}>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1 opacity-60">Distance Left</p>
                  <p className="text-3xl font-bold">245 <span className="text-lg font-normal opacity-60">mi</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider mb-1 opacity-60">Est. Arrival</p>
                  <p className="text-2xl font-bold text-violet-500">14:30</p>
                </div>
              </div>

              <div className={cn(
                "p-5 rounded-2xl",
                "shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
              )}>
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-semibold flex items-center gap-2"><Timer className="w-4 h-4"/> Time to Rest</span>
                  <span className="font-bold text-amber-500">{Math.max(0, 8 - driver.drivingDuration).toFixed(1)} hrs</span>
                </div>
                <div className={cn(
                  "w-full h-3 rounded-full overflow-hidden",
                  "shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] bg-gray-200"
                )}>
                  <div className={`h-full bg-amber-500 ${driver.drivingDuration > 7 ? 'animate-pulse bg-red-500' : ''}`} style={{ width: `${(driver.drivingDuration / 8) * 100}%` }} />
                </div>
              </div>
              
              <div className={cn(
                "p-5 rounded-2xl text-center",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <p className="text-xs font-semibold mb-1 opacity-60">Next Recommended Stop</p>
                <p className="text-sm font-bold">Pilot Travel Center (Exit 42)</p>
                <p className="text-[10px] opacity-60 mt-1">in 45 miles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Health & Vitals */}
          <div className={cn(
            "rounded-3xl p-6 transition-colors duration-300",
            "bg-gray-200 shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff]"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Vitals</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className={cn(
                "rounded-2xl p-4 text-center flex flex-col items-center justify-center",
                "shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
              )}>
                <Heart className="w-6 h-6 text-red-500 mb-2 animate-pulse" />
                <p className="text-xl font-bold">{driver.heartRate}</p>
                <p className="text-[10px] uppercase opacity-60 mt-1">BPM</p>
              </div>
              <div className={cn(
                "rounded-2xl p-4 text-center flex flex-col items-center justify-center",
                "shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
              )}>
                <Activity className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-xl font-bold">{driver.stressScore}%</p>
                <p className="text-[10px] uppercase opacity-60 mt-1">Stress</p>
              </div>
              <div className={cn(
                "rounded-2xl p-4 text-center flex flex-col items-center justify-center",
                "shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]"
              )}>
                <Wind className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-xl font-bold">{driver.alertnessScore}%</p>
                <p className="text-[10px] uppercase opacity-60 mt-1">Alerts</p>
              </div>
            </div>
          </div>

          {/* Vehicle Status */}
          <div className={cn(
            "rounded-3xl p-6 transition-colors duration-300",
            "bg-gray-200 shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff]"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <Power className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold">Vehicle Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <div className="flex items-center gap-3">
                  <Thermometer className={`w-5 h-5 ${vehicle.engineTemp > 105 ? 'text-red-500' : 'text-blue-500'}`} />
                  <span className="font-semibold">Engine Temp</span>
                </div>
                <span className={`text-lg font-bold ${vehicle.engineTemp > 105 ? 'text-red-500' : ''}`}>{vehicle.engineTemp.toFixed(3)}°C</span>
              </div>
              
              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl",
                "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              )}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${vehicle.tirePressure === 'Critical' ? 'border-red-500' : 'border-zinc-500'}`}>
                    <span className="text-[8px] font-bold">PSI</span>
                  </div>
                  <span className="font-semibold">Tire Pressure</span>
                </div>
                <span className={`text-sm font-bold ${vehicle.tirePressure === 'Critical' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {vehicle.tirePressure}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts Hub */}
          <div className={cn(
            "col-span-1 md:col-span-2 xl:col-span-1 rounded-3xl p-6 transition-colors duration-300",
            "bg-gray-200 shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff]",
            driverAlerts.length > 0 && ("border border-red-500/20")
          )}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
                )}>
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold">Alert Hub</h2>
              </div>
              {driverAlerts.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {driverAlerts.length} Active
                </span>
              )}
            </div>
            
            <div className={cn(
              "rounded-2xl p-2 h-[200px]",
              "shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]"
            )}>
              <ScrollArea className="h-full">
                {driverAlerts.length === 0 ? (
                  <div className="h-[180px] flex flex-col items-center justify-center opacity-50">
                    <Bell className="w-10 h-10 mb-2" />
                    <p className="font-semibold">All Clear</p>
                  </div>
                ) : (
                  <div className="space-y-3 p-2">
                    {driverAlerts.map(alert => (
                      <div key={alert.id} className={cn(
                        "p-4 rounded-xl flex gap-4",
                        "shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]"
                      )}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{alert.type}</span>
                            <span className="text-[10px] opacity-60 flex-shrink-0">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className={`text-sm ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
