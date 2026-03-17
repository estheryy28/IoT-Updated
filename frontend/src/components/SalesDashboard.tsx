import React, { useMemo } from 'react';
import type { FC } from 'react';
import { useRealtimeSalesData } from '@/hooks/useRealtimeSalesData';
import type { SaleDataPoint } from '@/hooks/useRealtimeSalesData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, Repeat2, TrendingUp, BarChart, Clock, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, unit = '', icon, description, valueClassName }) => (
  <Card className="flex-1 min-w-[250px]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueClassName}`}>
        {unit}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

interface RealtimeChartProps {
  data: SaleDataPoint[];
  title: string;
  dataKey: keyof SaleDataPoint;
  lineColor: string;
  tooltipFormatter?: (value: number) => string;
  legendName: string;
}

const RealtimeChart: FC<RealtimeChartProps> = React.memo(({ data, title, dataKey, lineColor, tooltipFormatter, legendName }) => {
  const chartData = useMemo(() => {
    const validData = data || [];
    if (validData.length === 0) return [];
    
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    
    const filteredData = validData.filter(point => {
      if (!point.time) return false;
      const timeParts = point.time.split(':');
      if (timeParts.length !== 3) return true;
      const pointTime = new Date();
      pointTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2]));
      return pointTime >= twoMinutesAgo;
    });
    
    return filteredData.length > 0 ? filteredData : validData.slice(-10);
  }, [data]);
    
  const chartKey = useMemo(() => `chart-${title}-${dataKey}`, [title, dataKey]);

  return (
    <Card className="flex-1 min-w-[300px] max-w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-blue-600" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              key={chartKey}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                fontSize={12}
                interval="preserveStartEnd"
                tickFormatter={(tick) => {
                  if (typeof tick === 'string' && tick.includes(':')) {
                    const parts = tick.split(':');
                    return parts.length >= 3 ? `${parts[1]}:${parts[2]}` : tick;
                  }
                  return tick;
                }}
              />
              <YAxis 
                fontSize={12}
                tickFormatter={tooltipFormatter || ((value) => value.toString())}
              />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={lineColor} 
                strokeWidth={2} 
                dot={false} 
                name={legendName}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export const SalesDashboard: FC = () => {
  const {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
  } = useRealtimeSalesData();

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight lg:text-5xl text-primary drop-shadow-lg">
        Active Sales Tracker
      </h1>
      <p className="text-center text-md md:text-lg text-muted-foreground mb-4">
        Real-time insights into your sales performance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={totalRevenue || 0}
          unit="$"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Cumulative revenue generated"
          valueClassName="text-emerald-500"
        />
        <MetricCard
          title="Total Transactions"
          value={salesCount || 0}
          icon={<Repeat2 className="h-4 w-4 text-muted-foreground" />}
          description="Number of sales recorded"
        />
        <MetricCard
          title="Average Sale"
          value={averageSale || 0}
          unit="$"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Average value per transaction"
          valueClassName="text-blue-400"
        />
        <Card className="flex-1 min-w-[250px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Live
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monitoring active feed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RealtimeChart 
          data={salesChartData} 
          title="Sales Velocity" 
          dataKey="sales" 
          lineColor="#3b82f6" 
          legendName="Sales Count"
        />
        <RealtimeChart 
          data={cumulativeRevenueData} 
          title="Revenue Growth" 
          dataKey="revenue" 
          lineColor="#8b5cf6" 
          tooltipFormatter={(val) => `$${val.toFixed(2)}`}
          legendName="Total Revenue"
        />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Latest Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {latestPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-bold">{payment.customer}</p>
                    <p className="text-sm text-muted-foreground">{payment.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">${payment.amount.toFixed(2)}</p>
                    <Badge variant="outline">{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
