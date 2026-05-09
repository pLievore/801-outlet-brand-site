'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { ChartPoint } from '../../../src/lib/admin';

function fmt(cents: number) {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`;
  return `$${(cents / 100).toFixed(0)}`;
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function linearTrend(data: ChartPoint[]): (number | null)[] {
  const n = data.length;
  if (n < 2) return data.map((d) => d.revenue);
  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.revenue);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
  const den = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return xs.map((x) => Math.max(0, Math.round(slope * x + intercept)));
}

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  const trend = linearTrend(data);
  const chartData = data.map((d, i) => ({ ...d, trend: trend[i] }));

  // Sparse X-axis: show at most 8 ticks
  const step = Math.max(1, Math.floor(data.length / 8));
  const ticks = data.filter((_, i) => i % step === 0).map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={fmtDate}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: '#171717',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            fontSize: 12,
            color: '#fff',
          }}
          formatter={(v, name) => [
            `$${((v as number) / 100).toFixed(2)}`,
            name === 'trend' ? 'Trend' : 'Revenue',
          ]}
          labelFormatter={(label) => fmtDate(label as string)}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#rev)"
          dot={false}
        />
        <Line
          type="linear"
          dataKey="trend"
          stroke="#fb923c"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
