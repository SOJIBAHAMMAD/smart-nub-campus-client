"use client";

import { useId } from "react";
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
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

export type ChartType = "line" | "bar" | "area";

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSeries {
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
  /** Optional tick formatter for the x axis (e.g. to truncate long labels). */
  xTickFormatter?: (value: string) => string;
  /** Additional CSS classes applied to the card container. */
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

const CHART_MARGIN = { top: 12, right: 8, left: 0, bottom: 0 };

const AXIS_TICK = { fontSize: 12, fill: "var(--muted-foreground)" };

/** Accessible, token-aware tooltip used across chart types. */
function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ fill: "var(--muted)", opacity: 0.45 }}
      contentStyle={{
        backgroundColor: "var(--popover)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--card-shadow-hover)",
        color: "var(--popover-foreground)",
        fontSize: "12px",
        padding: "8px 10px",
      }}
      labelStyle={{
        color: "var(--muted-foreground)",
        fontWeight: 600,
        marginBottom: 4,
      }}
      itemStyle={{ color: "var(--foreground)" }}
    />
  );
}

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
  xTickFormatter,
  className,
}: AdminChartProps) {
  const titleId = useId();

  /** Render the appropriate chart type based on the `type` prop. */
  const renderChart = (ariaLabel: string) => {
    const commonElements = (
      <>
        <CartesianGrid
          vertical={false}
          strokeDasharray="4 4"
          stroke="var(--border)"
        />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={xTickFormatter}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          allowDecimals={false}
          tick={AXIS_TICK}
        />
        <ChartTooltip />
      </>
    );

    switch (type) {
      case "bar":
        return (
          <BarChart data={data} margin={CHART_MARGIN} aria-label={ariaLabel}>
            {commonElements}
            {series.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={data} margin={CHART_MARGIN} aria-label={ariaLabel}>
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
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      case "line":
      default:
        return (
          <LineChart data={data} margin={CHART_MARGIN} aria-label={ariaLabel}>
            {commonElements}
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <CardTitle id={titleId} className="text-base">
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>

        {/* Legend chips */}
        <ul
          aria-label={`Legend for ${title}`}
          className="flex max-w-full flex-wrap items-center justify-end gap-1.5"
        >
          {series.map((s) => (
            <li
              key={s.dataKey}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate">{s.name}</span>
            </li>
          ))}
        </ul>
      </CardHeader>

      <CardContent className="min-w-0">
        {data.length === 0 ? (
          <div className="flex items-center justify-center" style={{ minHeight: height }}>
            <Empty className="py-8">
              <EmptyMedia variant="icon">
                <Inbox className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No data yet</EmptyTitle>
                <EmptyDescription>
                  There&apos;s nothing to chart for this period. Check back once
                  activity starts coming in.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={height}>
              {renderChart(`${title} chart`)}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
