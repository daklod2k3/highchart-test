// components/RealtimeChart.js
import {
  CategoryScale,
  ChartData,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  zoomPlugin
);

interface ClosePointData {
  open: number;
  close: number;
}

const RealtimeChart = () => {
  const chartRef = useRef(null);
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: "Real-time Data",
        data: [],
        borderColor: "blue",
        borderWidth: 2,
        pointRadius: (context) => {
          const index = context.dataIndex;
          const dataLength = context.dataset.data.length;
          return index === dataLength - 1 ? 5 : 0; // Highlight the newest point
        },
        pointBackgroundColor: "blue",
      },
      {
        type: "scatter",
        label: "Special Points",
        data: [],
        pointBackgroundColor: "red",
        pointRadius: 5,
      },
    ],
  });

  console.log(data.datasets[1]);

  const [range, setVisibleRange] = useState<number>(20);

  const handleZoom = useCallback(
    (direction: "in" | "out", factor: number = 0.05) => {
      setVisibleRange((prev) => {
        if (prev === null) return data.datasets[0].data.length;
        const step = Math.max(1, Math.floor(prev * factor));
        if (direction === "in" && prev > 10) {
          return Math.max(10, prev - step);
        } else if (direction === "out") {
          return Math.min(data.datasets[0].data.length, prev + step);
        }
        return prev;
      });
    },
    [data.datasets[0].data.length]
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

  useEffect(() => {
    // Generate fake real-time data
    const interval = setInterval(() => {
      setData((prevData) => {
        const newTime = new Date().toLocaleTimeString();
        const newValue = Math.random() * 100;

        const closeNode = {};
        if (prevData.labels.length % 10 === 0) {
          closeNode.x = newTime;
          closeNode.y = newValue;
          closeNode.open = prevData.datasets[0].data.at(
            prevData.labels.length - 10
          );
        }

        return {
          labels: [...prevData.labels, newTime],
          datasets: [
            {
              ...prevData.datasets[0],
              data: [...prevData.datasets[0].data, newValue],
            },
            {
              ...prevData.datasets[1],
              data: [...prevData.datasets[1].data, closeNode], // Special points remain static
            },
          ],
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    animation: false, // Disable animations
    plugins: {
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Special Points") {
              return `Special Point: ${context.raw}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        min: Math.max(0, data.datasets[0].data.length - range),
        suggestedMax: 10,
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Line
        onWheel={handleWheel}
        ref={chartRef}
        data={data}
        options={options}
      />
    </div>
  );
};

export default RealtimeChart;
