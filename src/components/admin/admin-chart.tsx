"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

export type ChartType = "line" | "bar" | "area";

interface ChartDataPoint {
  [key: string]: string | number;
}

interface ChartSeries {
  /** Key in the data object for this series. */
  dataKey: string;
  /** Display name for the legend/tooltip. */
  name: string;
  /** Stroke/fill color. */
  color: string;
}

interface AdminChartProps {
  /** Chart title displayed above the chart. */
  title: string;
  /** Type of chart to render. */
  type: ChartType;
  /** Array of data points for the chart. */
  data: ChartDataPoint[];
  /** Series configuration (one per line/bar/area). */
  series: ChartSeries[];
  /** Optional subtitle/description. */
  description?: string;
  /** Height of the chart container in pixels. Default 300. */
  height?: number;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable chart component wrapping recharts.
 * Supports line, bar, and area chart types with multiple series.
 * Used in the admin dashboard for stats visualization.
 */
export function AdminChart({
  title,
  type,
  data,
  series,
  description,
  height = 300,
}: AdminChartProps) {
  /** Render the appropriate chart type based on the `type` prop. */
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 20, left: 0, bottom: 5 },
    };

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        {series.length > 1 && <Legend />}
      </>
    );

    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            {commonElements}
            {series.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            {commonElements}
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.15}
              />
            ))}
          </AreaChart>
        );
      case "line":
      default:
        return (
          <LineChart {...commonProps}>
            {commonElements}
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
