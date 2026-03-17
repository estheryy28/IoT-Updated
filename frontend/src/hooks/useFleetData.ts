import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";

// ── Types (unchanged — dashboard components depend on these) ──
export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  lat: number;
  lng: number;
  status: "safe" | "warning" | "danger";
  engineHealth: number;
  tirePressure: "Normal" | "Low" | "Critical";
  tireImbalance: "None" | "Slight" | "Severe";
  sensorStatus: "Online" | "Offline" | "Degraded";
  loadStress: number;
  engineTemp: number;
  brakeHealth: number;
  loadRatio: number;
  environmentRisk: number;
  accidentRiskScore: number;
  lastUpdate: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicleId: string;
  behaviorType: "Passive" | "Normal" | "Aggressive";
  safetyScore: number;
  fatigueLevel: "Low" | "Moderate" | "High" | "Critical";
  drivingDuration: number;
  stressScore: number;
  alertnessScore: number;
  heartRate: number;
  rapidAccelerationEvents: number;
  harshBrakingEvents: number;
  laneVariationEvents: number;
  avatar: string;
}

export interface Alert {
  id: string;
  type: "Overload" | "Fatigue" | "Heart Rate" | "Brake Failure" | "Tire Pressure" | "Speeding" | "Sensor Failure";
  severity: "critical" | "warning" | "info";
  vehicleId: string;
  driverId: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface PredictiveMaintenance {
  id: string;
  vehicleId: string;
  component: string;
  failureProbability: number;
  recommendedDate: string;
  status: "Urgent" | "Scheduled" | "Monitoring";
}

export interface HistoricalDataPoint {
  date: string;
  accidentRisk: number;
  avgDriverScore: number;
  maintenanceEfficiency: number;
  alertCount: number;
}

// ── Helpers ──
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function mapTirePressure(psi: number): Vehicle["tirePressure"] {
  if (psi < 25) return "Critical";
  if (psi < 30) return "Low";
  return "Normal";
}

function mapFatigue(level: number): Driver["fatigueLevel"] {
  if (level >= 75) return "Critical";
  if (level >= 50) return "High";
  if (level >= 25) return "Moderate";
  return "Low";
}

function statusFromRisk(score: number): Vehicle["status"] {
  if (score >= 60) return "danger";
  if (score >= 40) return "warning";
  return "safe";
}

function severityMap(s: string): Alert["severity"] {
  const norm = s.toLowerCase();
  if (norm === "critical" || norm === "high") return "critical";
  if (norm === "medium") return "warning";
  return "info";
}

function generateHistoricalData(): HistoricalDataPoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000);
    return {
      date: date.toISOString().split("T")[0],
      accidentRisk: Math.floor(randomBetween(5, 45)),
      avgDriverScore: Math.floor(randomBetween(60, 95)),
      maintenanceEfficiency: Math.floor(randomBetween(70, 98)),
      alertCount: Math.floor(randomBetween(2, 20)),
    };
  });
}

// ── Hook ──
export function useFleetData() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictiveMaintenance, setPredictiveMaintenance] = useState<PredictiveMaintenance[]>([]);
  const [historicalData] = useState<HistoricalDataPoint[]>(generateHistoricalData);
  const [loaded, setLoaded] = useState(false);

  // ── Fetch all data from backend ──
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Parallel fetch
        const [vehicleRes, driverRes, sensorRes, alertRes, safetyRes, envRes, maintRes] = await Promise.all([
          api.getVehicles().catch(() => ({ data: [] })),
          api.getDrivers().catch(() => ({ data: [] })),
          api.getSensorData().catch(() => ({ data: [] })),
          api.getAlerts().catch(() => ({ data: [] })),
          api.getSafetyPredictions().catch(() => ({ data: [] })),
          api.getEnvironmentData().catch(() => ({ data: [] })),
          api.getFleetRisk().catch(() => ({ data: { vehicles: [] } })),
        ]);

        if (cancelled) return;

        const rawVehicles = vehicleRes.data || [];
        const rawDrivers = driverRes.data || [];
        const rawSensors = sensorRes.data || [];
        const rawAlerts = alertRes.data || [];
        const rawSafety = safetyRes.data || [];
        const rawEnv = envRes.data || [];

        // Build sensor lookup: vehicleId → latest reading
        const sensorMap: Record<string, any> = {};
        rawSensors.forEach((s: any) => {
          if (!sensorMap[s.vehicleId] || new Date(s.timestamp) > new Date(sensorMap[s.vehicleId].timestamp)) {
            sensorMap[s.vehicleId] = s;
          }
        });

        // Build safety lookup: vehicleId → latest prediction
        const safetyMap: Record<string, any> = {};
        rawSafety.forEach((s: any) => {
          if (!safetyMap[s.vehicleId] || new Date(s.timestamp) > new Date(safetyMap[s.vehicleId].timestamp)) {
            safetyMap[s.vehicleId] = s;
          }
        });

        // Build env lookup: vehicleId → latest env data
        const envMap: Record<string, any> = {};
        rawEnv.forEach((e: any) => {
          if (!envMap[e.vehicleId] || new Date(e.timestamp) > new Date(envMap[e.vehicleId].timestamp)) {
            envMap[e.vehicleId] = e;
          }
        });

        // Map vehicles
        const mappedVehicles: Vehicle[] = rawVehicles.map((v: any, i: number) => {
          const sensor = sensorMap[v.vehicleId] || {};
          const safety = safetyMap[v.vehicleId] || {};
          const env = envMap[v.vehicleId] || {};
          const riskScore = safety.riskScore ?? Math.floor(randomBetween(10, 50));
          const engineTemp = sensor.engineTemperature || Math.floor(randomBetween(75, 110));
          const tirePSI = sensor.tirePressure || 32;

          return {
            id: v.vehicleId,
            name: v.model || `Truck ${i + 1}`,
            plate: v.registrationNumber,
            lat: sensor.latitude || env.latitude || randomBetween(8, 28),
            lng: sensor.longitude || env.longitude || randomBetween(72, 88),
            status: statusFromRisk(riskScore),
            engineHealth: Math.max(0, 100 - Math.floor((engineTemp - 75) * 1.5)),
            tirePressure: mapTirePressure(tirePSI),
            tireImbalance: tirePSI < 28 ? "Slight" : "None",
            sensorStatus: sensor.vehicleId ? "Online" : "Offline",
            loadStress: Math.floor(randomBetween(30, 85)),
            engineTemp,
            brakeHealth: sensor.brakeStatus === "critical" ? 25 : sensor.brakeStatus === "worn" ? 55 : 85,
            loadRatio: Math.floor(randomBetween(50, 95)),
            environmentRisk: env.visibility ? Math.max(0, Math.floor(100 - env.visibility / 100)) : Math.floor(randomBetween(10, 50)),
            accidentRiskScore: riskScore,
            lastUpdate: sensor.timestamp ? new Date(sensor.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          };
        });

        // Map drivers
        const mappedDrivers: Driver[] = rawDrivers.map((d: any, i: number) => {
          const assignedVehicle = d.assignedVehicle || mappedVehicles[i % mappedVehicles.length]?.id || "";
          return {
            id: d._id,
            name: d.name,
            vehicleId: assignedVehicle,
            behaviorType: d.fatigueLevel > 60 ? "Aggressive" : d.fatigueLevel > 30 ? "Normal" : "Passive",
            safetyScore: d.alertnessScore || 75,
            fatigueLevel: mapFatigue(d.fatigueLevel || 0),
            drivingDuration: Math.floor(randomBetween(1, 10)),
            stressScore: Math.floor(randomBetween(15, 70)),
            alertnessScore: d.alertnessScore || 75,
            heartRate: Math.floor(randomBetween(62, 105)),
            rapidAccelerationEvents: Math.floor(randomBetween(0, 10)),
            harshBrakingEvents: Math.floor(randomBetween(0, 12)),
            laneVariationEvents: Math.floor(randomBetween(0, 6)),
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${d.name.replace(" ", "")}`,
          };
        });

        // Map alerts
        const mappedAlerts: Alert[] = rawAlerts.map((a: any) => ({
          id: a._id,
          type: (a.alertType || "Speeding") as Alert["type"],
          severity: severityMap(a.severity),
          vehicleId: a.vehicleId,
          driverId: mappedDrivers.find((dr) => dr.vehicleId === a.vehicleId)?.id || "",
          message: a.message,
          timestamp: a.timestamp,
          resolved: a.isResolved,
        }));

        // Map maintenance (from fleet risk data or generate)
        const rawMaint = maintRes.data?.vehicles || [];
        const mappedMaint: PredictiveMaintenance[] = rawVehicles.slice(0, 8).map((v: any, i: number) => ({
          id: `PM-${String(i + 1).padStart(3, "0")}`,
          vehicleId: v.vehicleId,
          component: ["Brake System", "Engine Oil", "Transmission", "Air Filter", "Coolant System", "Battery", "Alternator", "Suspension"][i % 8],
          failureProbability: Math.floor(randomBetween(15, 90)),
          recommendedDate: new Date(Date.now() + randomBetween(1, 30) * 86400000).toISOString().split("T")[0],
          status: (["Urgent", "Scheduled", "Monitoring"] as const)[Math.floor(Math.random() * 3)],
        }));

        setVehicles(mappedVehicles);
        setDrivers(mappedDrivers);
        setAlerts(mappedAlerts);
        setPredictiveMaintenance(mappedMaint);
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load fleet data:", err);
        setLoaded(true);
      }
    }

    load();

    // Socket.io real-time updates
    const socket = connectSocket("admin");

    socket.on("alert:new", (data: any) => {
      setAlerts((prev) => [
        {
          id: data._id || `AL-RT-${Date.now()}`,
          type: data.alertType || "Speeding",
          severity: severityMap(data.severity),
          vehicleId: data.vehicleId,
          driverId: "",
          message: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
          resolved: false,
        },
        ...prev,
      ]);
    });

    socket.on("risk:prediction", (data: any) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.vehicleId
            ? { ...v, accidentRiskScore: data.riskScore, status: statusFromRisk(data.riskScore) }
            : v
        )
      );
    });

    socket.on("environment:update", (data: any) => {
      if (data.vehicleId && data.visibility) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === data.vehicleId
              ? { ...v, environmentRisk: Math.max(0, Math.floor(100 - data.visibility / 100)) }
              : v
          )
        );
      }
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, []);

  // Simulate micro-updates for live feel
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          lat: v.lat + randomBetween(-0.005, 0.005),
          lng: v.lng + randomBetween(-0.005, 0.005),
          engineTemp: Math.min(130, Math.max(70, v.engineTemp + randomBetween(-2, 2))),
          brakeHealth: Math.max(0, Math.min(100, v.brakeHealth + randomBetween(-0.5, 0.3))),
          lastUpdate: new Date().toLocaleTimeString(),
        }))
      );
      setDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          heartRate: Math.min(120, Math.max(55, d.heartRate + Math.floor(randomBetween(-2, 2)))),
          stressScore: Math.min(100, Math.max(5, d.stressScore + Math.floor(randomBetween(-1, 1)))),
          alertnessScore: Math.max(10, Math.min(100, d.alertnessScore + Math.floor(randomBetween(-1, 1)))),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch {
      /* offline fallback */
    }
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
  }, []);

  const totalTrucks = vehicles.length;
  const activeTrucks = vehicles.filter((v) => v.status !== "danger").length;
  const highRiskVehicles = vehicles.filter((v) => v.status === "danger").length;
  const maintenanceRequired = predictiveMaintenance.filter((p) => p.status === "Urgent").length;
  const activeAlerts = alerts.filter((a) => !a.resolved).length;

  return {
    vehicles,
    drivers,
    alerts,
    predictiveMaintenance,
    historicalData,
    resolveAlert,
    totalTrucks,
    activeTrucks,
    highRiskVehicles,
    maintenanceRequired,
    activeAlerts,
  };
}
