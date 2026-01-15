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

  // Chart dimensions
  const chartHeight = 280;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Calculate Y position for a value
  const getY = (value: number) => {
    return (
      padding.top +
      graphHeight -
      ((value - chartMin) / range) * graphHeight
    );
  };

  // Calculate X position for an index
  const getX = (index: number) => {
    if (readings.length === 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (readings.length - 1)) * graphWidth;
  };

  // Generate line path
  const generateLinePath = () => {
    if (readings.length === 0) return "";
    if (readings.length === 1) {
      const x = getX(0);
      const y = getY(readings[0].value);
      return `M ${x} ${y} L ${x} ${y}`;
    }

    return readings
      .map((reading, index) => {
        const x = getX(index);
        const y = getY(reading.value);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");
  };

  // Get color based on ketone level
  const getPointColor = (value: number) => {
    if (value >= 1.5) return "fill-green-500";
    if (value >= 0.5) return "fill-amber-500";
    return "fill-red-400";
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
          {/* Line Graph */}
          <div className="relative w-full overflow-x-auto">
            <svg
              width={chartWidth}
              height={chartHeight}
              className="w-full"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Grid lines */}
              {[chartMin, (chartMin + chartMax) / 2, chartMax].map((value) => {
                const y = getY(value);
                return (
                  <line
                    key={value}
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border opacity-20"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Reference lines for ketosis thresholds */}
              {1.5 >= chartMin && 1.5 <= chartMax && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(1.5)}
                    x2={chartWidth - padding.right}
                    y2={getY(1.5)}
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity={0.5}
                  />
                  <text
                    x={chartWidth - padding.right + 5}
                    y={getY(1.5) - 3}
                    className="text-[10px] fill-green-600"
                  >
                    Optimal (1.5)
                  </text>
                </g>
              )}

              {0.5 >= chartMin && 0.5 <= chartMax && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(0.5)}
                    x2={chartWidth - padding.right}
                    y2={getY(0.5)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity={0.5}
                  />
                  <text
                    x={chartWidth - padding.right + 5}
                    y={getY(0.5) - 3}
                    className="text-[10px] fill-amber-600"
                  >
                    Light (0.5)
                  </text>
                </g>
              )}

              {/* Line path */}
              <path
                d={generateLinePath()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />

              {/* Data points */}
              {readings.map((reading, index) => {
                const x = getX(index);
                const y = getY(reading.value);
                return (
                  <g key={index}>
                    {/* Hover circle (larger, invisible) */}
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="transparent"
                      className="cursor-pointer"
                    >
                      <title>
                        {reading.date}: {reading.value.toFixed(2)} mmol/L
                      </title>
                    </circle>
                    {/* Visible point */}
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      className={`${getPointColor(reading.value)} stroke-white stroke-2`}
                    />
                  </g>
                );
              })}

              {/* Y-axis labels */}
              {[chartMax, (chartMin + chartMax) / 2, chartMin].map((value) => {
                const y = getY(value);
                return (
                  <text
                    key={value}
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-muted-foreground"
                  >
                    {value.toFixed(1)}
                  </text>
                );
              })}

              {/* X-axis labels (dates) */}
              {readings.map((reading, index) => {
                const x = getX(index);
                const dateParts = reading.date.split(" ");
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - padding.bottom + 15}
                    textAnchor="middle"
                    className="text-[10px] fill-muted-foreground"
                  >
                    {dateParts.length > 1 ? dateParts[1] : dateParts[0]}
                  </text>
                );
              })}

              {/* Full date labels below (rotated) */}
              {readings.length <= 10 &&
                readings.map((reading, index) => {
                  const x = getX(index);
                  return (
                    <text
                      key={`full-${index}`}
                      x={x}
                      y={chartHeight - padding.bottom + 28}
                      textAnchor="middle"
                      className="text-[9px] fill-muted-foreground"
                    >
                      {reading.date}
                    </text>
                  );
                })}
            </svg>
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
