
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatusItem = {
  name: string;
  count: number;
  fill: string;
};

type MonthlyItem = {
  month: string;
  applications: number;
};

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "12px",
  color: "#fff",
};

export function StatusPieChart({ data }: { data: StatusItem[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-slate-400">
        Add applications to see your chart.
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm text-slate-300">
              {item.name}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyItem[] }) {
  return (
    <div className="mt-5 h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            vertical={false}
          />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="applications"
            name="Applications"
            fill="#60a5fa"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
