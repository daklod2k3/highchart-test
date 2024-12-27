"use client";
import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "react-apexcharts";

export const Apex = () => {
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null); // Reference to the ApexCharts component

  useEffect(() => {
    // Initializing chart data with 10 random data points
    const initialData = [];
    for (let i = 0; i < 10; i++) {
      initialData.push({
        x: new Date().getTime() + i * 1000,
        y: Math.floor(Math.random() * 100) + 1,
      });
    }
    setChartData(initialData);

    // Update the chart data every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newPoint = {
        x: now,
        y: Math.floor(Math.random() * 100) + 1,
      };

      setChartData((prevData) => {
        const updatedData = [...prevData, newPoint];
        if (updatedData.length > 10) {
          updatedData.shift(); // Keep only the last 10 points
        }
        return updatedData;
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const options = {
    chart: {
      type: "line",
      height: 350,
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: {
          speed: 1000,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      events: {
        // Capture the zoom state before the update
        zoomed: function (chartContext, { xaxis, yaxis }) {
          // Save the zoom state
          chartRef.current.zoomState = { xaxis, yaxis };
        },
        // On data update, restore the zoom state
        updated: function () {
          const zoomState = chartRef.current.zoomState;
          if (zoomState) {
            chartContext.zoom(zoomState);
          }
        },
      },
    },
    series: [
      {
        name: "Real-Time Data",
        data: chartData,
      },
    ],
    xaxis: {
      type: "datetime",
      range: 10000, // Show last 10 seconds
    },
  };

  return (
    <div>
      <ApexCharts
        options={options}
        series={options.series}
        type="line"
        height={350}
        ref={chartRef} // Attach ref to the ApexCharts component
      />
    </div>
  );
};
