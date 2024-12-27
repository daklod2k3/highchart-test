"use client";

import { TimerResetIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const useRealTimeData = (initialData: DataPoint[], interval = 1000) => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const timer = setInterval(() => {
      const newDataPoint: DataPoint = {
        time: new Date().toLocaleTimeString(),
        realtime: Math.floor(Math.random() * 100),
      };

      setData((prevData) => {
        if (prevData.length % 10 === 0) {
          newDataPoint.close = prevData[prevData.length - 11].realtime;
          newDataPoint.open = newDataPoint.realtime;
        }

        return [...prevData, newDataPoint];
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return data;
};

const chartConfig = {
  realtime: {
    label: "Real-time Data",
    color: "hsl(var(--chart-1))",
  },
  historical: {
    label: "Historical Data",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface DataPoint {
  time: string;
  realtime: number;
  close?: number;
  open?: number;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Only show tooltip for line2
    const line2Data = payload.find((p) => p.dataKey === "open");
    if (line2Data) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>{`${label}`}</p>
          <p>{`${line2Data.name}: ${line2Data.value}`}</p>
        </div>
      );
    }
  }
  return null;
};

export function ChartV3() {
  const initialData: DataPoint[] = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
    realtime: Math.floor(Math.random() * 100),
  }));

  const data = useRealTimeData(initialData);
  const [visiblePoints, setVisiblePoints] = useState(20);
  const chartRef = useRef<HTMLDivElement>(null);
  console.log(data);

  const handleZoom = useCallback((direction: "in" | "out") => {
    setVisiblePoints((prev) => {
      if (direction === "in" && prev > 5) {
        return prev - 1;
      } else if (direction === "out") {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? "out" : "in";
      handleZoom(direction);
    },
    [handleZoom]
  );

  useEffect(() => {
    const currentChartRef = chartRef.current;
    if (currentChartRef) {
      currentChartRef.addEventListener("wheel", handleWheel as any, {
        passive: false,
      });
    }
    return () => {
      if (currentChartRef) {
        currentChartRef.removeEventListener("wheel", handleWheel as any);
      }
    };
  }, [handleWheel]);

  const visibleData = data.slice(-visiblePoints);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Dual Line Chart</CardTitle>
        <CardDescription>
          Real-time vs Historical Data (Scroll to Zoom)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ChartContainer config={chartConfig} className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleData}
                onMouseMove={(state) => {
                  if (state && state.activePayload) {
                    // Find the nearest point based on mouse position
                    const { chartX } = state;
                    const { activePayload } = state;

                    // You can add custom logic here to determine the nearest point
                    // Based on chartX coordinate
                  }
                }}
              >
                <CartesianGrid />

                <XAxis
                  dataKey="time"
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  padding={{ right: 50 }}
                />
                <YAxis axisLine={true} tickMargin={8} />
                <ChartTooltip
                  trigger="hover"
                  shared={true}
                  position={{ x: "auto", y: "auto" }}
                  content={<CustomTooltip />}
                  filterNull={true}
                  formatter={(value, name) => name === "open" && [value, name]}
                />
                <Line
                  type="monotone"
                  dataKey="realtime"
                  stroke="var(--color-realtime)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="open"
                  stroke="var(--color-historical)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
