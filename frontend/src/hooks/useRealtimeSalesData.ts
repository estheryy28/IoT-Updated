import { useState, useEffect } from 'react';

export interface SaleDataPoint {
  time: string;
  revenue: number;
  sales: number;
}

export interface LatestPayment {
  id: string;
  customer: string;
  amount: number;
  status: string;
}

export function useRealtimeSalesData() {
  const [salesChartData, setSalesChartData] = useState<SaleDataPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [averageSale, setAverageSale] = useState(0);
  const [latestPayments, setLatestPayments] = useState<LatestPayment[]>([]);

  useEffect(() => {
    // Simulated realtime data
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      const newPoint: SaleDataPoint = {
        time: timeStr,
        revenue: Math.random() * 100,
        sales: Math.floor(Math.random() * 5) + 1
      };

      setSalesChartData(prev => [...prev.slice(-50), newPoint]);
      setTotalRevenue(prev => prev + newPoint.revenue);
      setSalesCount(prev => prev + newPoint.sales);
      
      const newPayment: LatestPayment = {
        id: Math.random().toString(36).substr(2, 9),
        customer: ["John Doe", "Jane Smith", "Kumar", "Arun", "Alice"][Math.floor(Math.random() * 5)],
        amount: newPoint.revenue,
        status: "Completed"
      };
      setLatestPayments(prev => [newPayment, ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (salesCount > 0) {
      setAverageSale(totalRevenue / salesCount);
    }
  }, [totalRevenue, salesCount]);

  return {
    totalRevenue,
    salesCount,
    averageSale,
    salesChartData,
    cumulativeRevenueData: salesChartData.reduce((acc, curr) => {
      const last = acc.length > 0 ? acc[acc.length - 1].revenue : 0;
      return [...acc, { ...curr, revenue: last + curr.revenue }];
    }, [] as SaleDataPoint[]),
    latestPayments
  };
}
