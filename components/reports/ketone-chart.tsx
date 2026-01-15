"use client";

import { Droplet, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KetoneReading {
  date: string;
  fullDate: string;
  value: number;
}

interface KetoneChartProps {
  readings: KetoneReading[];
  monthName: string;
}

export function KetoneChart({ readings, monthName }: KetoneChartProps) {
  // Calculate trend
  const getTrend = () => {
    if (readings.length < 2) return null;

    const firstHalf = readings.slice(0, Math.floor(readings.length / 2));
    const secondHalf = readings.slice(Math.floor(readings.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.2) return "up";
    if (diff < -0.2) return "down";
    return "stable";
  };

  const trend = getTrend();

  // Get min and max for chart scaling
  const minValue =
    readings.length > 0 ? Math.min(...readings.map((r) => r.value)) : 0;
  const maxValue =
    readings.length > 0 ? Math.max(...readings.map((r) => r.value)) : 3;
  const chartMin = Math.max(0, Math.floor(minValue * 2) / 2 - 0.5);
  const chartMax = Math.ceil(maxValue * 2) / 2 + 0.5;
  const range = chartMax - chartMin;

  // Calculate bar height percentage
  const getBarHeight = (value: number) => {
    return ((value - chartMin) / range) * 100;
  };

  // Get color based on ketone level
  const getBarColor = (value: number) => {
    if (value >= 1.5) return "bg-green-500";
    if (value >= 0.5) return "bg-amber-500";
    return "bg-red-400";
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Ketone Levels</h2>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
              trend === "up"
                ? "bg-green-500/10 text-green-600"
                : trend === "down"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {trend === "up" && <TrendingUp className="h-4 w-4" />}
            {trend === "down" && <TrendingDown className="h-4 w-4" />}
            {trend === "stable" && <Minus className="h-4 w-4" />}
            <span className="capitalize">{trend} trend</span>
          </div>
        )}
      </div>

      {readings.length > 0 ? (
        <>
          {/* Simple Bar Chart */}
          <div className="relative h-[280px] w-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 flex h-full w-12 flex-col justify-between py-4 text-right text-xs text-muted-foreground">
              <span>{chartMax.toFixed(1)}</span>
              <span>{((chartMax + chartMin) / 2).toFixed(1)}</span>
              <span>{chartMin.toFixed(1)}</span>
            </div>

            {/* Chart area */}
            <div className="ml-14 h-full">
              {/* Reference lines */}
              <div className="relative h-full rounded-lg border border-border bg-muted/20 p-2">
                {/* Optimal ketosis line (1.5) */}
                {1.5 >= chartMin && 1.5 <= chartMax && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-green-500/50"
                    style={{
                      bottom: `${getBarHeight(1.5)}%`,
                    }}
                  >
                    <span className="absolute right-1 -top-3 text-[10px] text-green-600">
                      Optimal (1.5)
                    </span>
                  </div>
                )}

                {/* Light ketosis line (0.5) */}
                {0.5 >= chartMin && 0.5 <= chartMax && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/50"
                    style={{
                      bottom: `${getBarHeight(0.5)}%`,
                    }}
                  >
                    <span className="absolute right-1 -top-3 text-[10px] text-amber-600">
                      Light (0.5)
                    </span>
                  </div>
                )}

                {/* Bars */}
                <div className="flex h-full items-end justify-around gap-1 px-2">
                  {readings.map((reading, index) => (
                    <div
                      key={index}
                      className="group relative flex flex-1 flex-col items-center"
                      style={{ maxWidth: "60px" }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-16 z-10 hidden rounded-lg border border-border bg-card px-2 py-1 text-center shadow-lg group-hover:block">
                        <p className="text-xs font-medium">{reading.date}</p>
                        <p className="text-sm font-bold text-blue-500">
                          {reading.value.toFixed(2)}
                        </p>
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[40px] rounded-t transition-all hover:opacity-80 ${getBarColor(reading.value)}`}
                        style={{
                          height: `${getBarHeight(reading.value)}%`,
                          minHeight: "4px",
                        }}
                      />

                      {/* X-axis label */}
                      <span className="mt-1 text-[10px] text-muted-foreground">
                        {reading.date.split(" ")[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-muted-foreground">
                Optimal Ketosis (≥1.5)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span className="text-muted-foreground">Light Ketosis (0.5-1.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-400" />
              <span className="text-muted-foreground">Below Ketosis (&lt;0.5)</span>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Lowest</p>
              <p className="text-lg font-semibold">
                {Math.min(...readings.map((r) => r.value)).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Highest</p>
              <p className="text-lg font-semibold">
                {Math.max(...readings.map((r) => r.value)).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Readings</p>
              <p className="text-lg font-semibold">{readings.length}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
          <Droplet className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No ketone readings for {monthName}
          </p>
          <p className="text-sm text-muted-foreground">
            Add ketone readings in your journal to see the chart
          </p>
        </div>
      )}
    </div>
  );
}
