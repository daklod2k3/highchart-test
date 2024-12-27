"use client";
import {
  CategoryScale,
  ChartData,
  ChartDataset,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const useCryptoData = (maxPoints = 20) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(true);
  const [open, setOpen] = useState<
    { open: number | undefined; close: number; x: string; y: number }[]
  >([]);

  useEffect(() => {
    const updateData = () => {
      if (isUpdating) {
        const now = new Date();
        const newLabel = now.toLocaleTimeString();
        const newPrice = Math.random() * 100 + 20000; // Simulated price

        if (labels.length % 10 === 0) {
          setOpen((prevOpen) => [
            ...prevOpen,
            {
              x: newLabel,
              y: newPrice,
              open: data.at(data.length - 11),
              close: newPrice,
            },
          ]);
        }

        setLabels((prevLabels) => [...prevLabels, newLabel]);

        setData((prevData) => [...prevData, newPrice]);
      }
    };

    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, [isUpdating, maxPoints]);

  const toggleUpdate = () => setIsUpdating((prev) => !prev);

  return { labels, data, isUpdating, toggleUpdate, open };
};

const ChartJSDemo = () => {
  const chartRef = useRef(null);
  const { labels, data, isUpdating, toggleUpdate, open } = useCryptoData(20); // Use the custom hook

  // Calculate max price for the y-axis
  const maxPrice = Math.max(...data, 0);

  console.log(labels, data);

  const chartData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "BTC/USD",
        data,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0,
      },
      {
        label: "open/close",
        data: open,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (USD)",
        },
        beginAtZero: false,
        suggestedMax: maxPrice + 10, // Add some padding
      },
    },
    plugins: {
      tooltip: {
        enabled: (context) => context.chart.id === "chart-0",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
  };

  return (
    <div style={{ width: "80%", margin: "50px auto" }}>
      <h1>Dynamic Y-Axis Real-Time Cryptocurrency Chart</h1>
      <button onClick={toggleUpdate}>
        {isUpdating ? "Pause Updates" : "Resume Updates"}
      </button>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default ChartJSDemo;
