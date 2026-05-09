'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#eab308'];

interface Slice {
  name: string;
  revenue: number;
}

export function SalesPieChart({ data }: { data: Slice[] }) {
  if (!data.length) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-neutral-500">
        No sales data yet.
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={72}
            innerRadius={36}
            paddingAngle={2}
            label={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#a3a3a3' }}
            itemStyle={{ color: '#fff' }}
            formatter={(v: unknown) => [`$${((v as number) / 100).toFixed(2)}`, 'Revenue']}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: '#a3a3a3', fontSize: 11 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
