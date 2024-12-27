import { useEffect, useState } from "react";

interface DataPoint {
  time: number;
  value: number;
  open?: number;
  close?: number;
}

export function useRealTimeData(initialDataPoints: number = 100) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Initialize data
    const initialData: DataPoint[] = Array.from(
      { length: initialDataPoints },
      (_, i) => {
        const value = Math.random() * 100;
        return {
          time: Date.now() - (initialDataPoints - i - 1) * 1000,
          value,
          open: Math.random() < 0.5 ? value - Math.random() * 5 : undefined,
          close: Math.random() < 0.5 ? value + Math.random() * 5 : undefined,
        };
      }
    );
    setData(initialData);

    // Update data every second
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastValue = prevData[prevData.length - 1].value;
        const newValue = Math.max(
          0,
          Math.min(100, lastValue + (Math.random() - 0.5) * 10)
        );
        const newData = [
          ...prevData.slice(1),
          {
            time: Date.now(),
            value: newValue,
            open:
              Math.random() < 0.5 ? newValue - Math.random() * 5 : undefined,
            close:
              Math.random() < 0.5 ? newValue + Math.random() * 5 : undefined,
          },
        ];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialDataPoints]);

  return data;
}
