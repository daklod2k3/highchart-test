"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealTimeData } from "@/hook/useRealtimeData";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEvent,
} from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      time: number;
      value: number;
      open?: number;
      close?: number;
    };
  }>;
}

const formatXAxis = (timestamp: number) => {
  return new Date(timestamp).toISOString().substr(11, 8);
};

export default function RealTimeChart() {
  const data = useRealTimeData();
  const [visibleRange, setVisibleRange] = useState<number | null>(null);
  const [isTooltipActive, setIsTooltipActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    useEffect(() => {
      setIsTooltipActive(!!active);
    }, [active]);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-2 border border-border rounded shadow-md">
          <p className="font-semibold">{formatXAxis(data.time)}</p>
          <p>Value: {data.value.toFixed(2)}</p>
          {data.open !== undefined && <p>Open: {data.open.toFixed(2)}</p>}
          {data.close !== undefined && <p>Close: {data.close.toFixed(2)}</p>}
          {data.open === undefined && data.close !== undefined && (
            <p>Open: {data.value.toFixed(2)}</p>
          )}
          {data.close === undefined && data.open !== undefined && (
            <p>Close: {data.value.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    setVisibleRange(data.length);
  }, [data.length]);

  const handleZoom = useCallback(
    (direction: "in" | "out", factor: number = 0.05) => {
      setVisibleRange((prev) => {
        if (prev === null) return data.length;
        const step = Math.max(1, Math.floor(prev * factor));
        if (direction === "in" && prev > 10) {
          return Math.max(10, prev - step);
        } else if (direction === "out") {
          return Math.min(data.length, prev + step);
        }
        return prev;
      });
    },
    [data.length]
  );

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? "out" : "in";
      const zoomFactor = Math.abs(event.deltaY) / 1500;
      handleZoom(direction, zoomFactor);
    },
    [handleZoom]
  );

  const resetZoom = useCallback(() => {
    setVisibleRange(data.length);
  }, [data.length]);

  const visibleData = useMemo(() => {
    if (visibleRange === null) return data;
    return data.slice(-visibleRange);
  }, [data, visibleRange]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (chartRef.current && visibleData.length > 0) {
        const chartRect = chartRef.current.getBoundingClientRect();
        const mouseX = e.clientX - chartRect.left;
        const chartWidth = chartRect.width;
        const dataIndex = Math.round(
          (mouseX / chartWidth) * (visibleData.length - 1)
        );
        setActiveIndex(dataIndex);
      }
    },
    [visibleData]
  );

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Real-Time Data Chart</CardTitle>
        <CardDescription>
          Real-time visualization with markers for open/close data and
          auto-hover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-4">
          <Button onClick={() => handleZoom("in")}>Zoom In</Button>
          <Button onClick={() => handleZoom("out")}>Zoom Out</Button>
          <Button onClick={resetZoom}>Reset Zoom</Button>
        </div>
        <div
          ref={chartRef}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: "100%", height: 400 }}
          role="application"
          aria-label="Real-time data chart with markers for open/close data and auto-hover"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                domain={["dataMin", "dataMax"]}
                type="number"
                padding={{ left: 30, right: 30 }}
              />
              <YAxis padding={{ top: 20, bottom: 20 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="linear"
                dataKey="value"
                stroke="hsl(var(--primary))"
                tooltipType="none"
                dot={false}
                // dot={(props) => {
                //   const { payload, cx, cy } = props;
                //   if (
                //     payload.open !== undefined ||
                //     payload.close !== undefined
                //   ) {
                //     return (
                //       <circle
                //         cx={cx}
                //         cy={cy}
                //         r={4}
                //         fill="hsl(var(--primary))"
                //         stroke="white"
                //         strokeWidth={2}
                //       />
                //     );
                //   }
                //   return null;
                // }}
                // activeDot={{
                //   r: 8,
                //   fill: "red",
                //   stroke: "white",
                //   strokeWidth: 2,
                // }}
                isAnimationActive={false}
              />
              {activeIndex !== null && (
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="transparent"
                  dot={(props) => {
                    const { cx, cy, index } = props;
                    if (index === activeIndex) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="hsl(var(--primary))"
                          stroke="white"
                          strokeWidth={2}
                        />
                      );
                    }
                    return null;
                  }}
                  activeDot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
