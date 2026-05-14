import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function BarChart({ data, xKey, yKey, barColor = "#3b82f6" }) {
  return (
    <div
      className="w-full h-[260px] mt-4 min-h-[260px] min-w-0"
      style={{ width: "100%", minWidth: 0, minHeight: 260 }}
    >
      <ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={0}>
        <RechartsBarChart data={data} barSize={38}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
          />

          <Bar dataKey={yKey} fill={barColor} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
