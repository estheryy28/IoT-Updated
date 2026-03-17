import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { HistoricalDataPoint } from "@/hooks/useFleetData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area,
} from "recharts";
import { BarChart3, TrendingUp, Shield, AlertTriangle } from "lucide-react";

interface AnalyticsProps {
  historicalData: HistoricalDataPoint[];
}

const chartColors = {
  grid: "#27272a",
  axis: "#71717a",
  tooltipBg: "#18181b",
  tooltipBorder: "#3f3f46",
};

export function Analytics({ historicalData }: AnalyticsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Historical Analytics & Reports</h2>
        <p className="text-zinc-400 text-sm mt-1">Long-term trends and data-driven insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Accident Risk History */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Accident Risk History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={10} tickFormatter={d => d.slice(5)} />
                  <YAxis stroke={chartColors.axis} fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="accidentRisk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={2} name="Risk %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Driver Score Trends */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> Driver Score Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={10} tickFormatter={d => d.slice(5)} />
                  <YAxis stroke={chartColors.axis} fontSize={10} domain={[50, 100]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="avgDriverScore" stroke="#22d3ee" strokeWidth={2} dot={false} name="Avg Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Efficiency */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Maintenance Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={10} tickFormatter={d => d.slice(5)} />
                  <YAxis stroke={chartColors.axis} fontSize={10} domain={[60, 100]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="maintenanceEfficiency" stroke="#34d399" fill="url(#mainGrad)" strokeWidth={2} name="Efficiency %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alert Frequency */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" /> Daily Alert Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" stroke={chartColors.axis} fontSize={10} tickFormatter={d => d.slice(5)} />
                  <YAxis stroke={chartColors.axis} fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: "8px" }} />
                  <Bar dataKey="alertCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Alerts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
