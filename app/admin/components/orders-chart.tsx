'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Point {
  date: string;
  orders: number;
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function sparsify(data: Point[], max = 8) {
  if (data.length <= max) return data;
  const step = Math.ceil(data.length / max);
  return data.filter((_, i) => i % step === 0 || i === data.length - 1);
}

export function OrdersChart({ data }: { data: Point[] }) {
  const ticks = sparsify(data).map((d) => d.date);

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tick={{ fontSize: 11, fill: '#737373' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtDate}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#737373' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#a3a3a3' }}
            itemStyle={{ color: '#fff' }}
            formatter={(v: unknown) => [String(v), 'Orders']}
            labelFormatter={(label) => fmtDate(label as string)}
          />
          <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
