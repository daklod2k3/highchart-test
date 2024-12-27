"use client";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEvent,
} from "react";

const RealTimeChart: React.FC = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const [range, setVisibleRange] = useState<number>(20);

  const data = chartRef.current?.chart.series[0].data;

  const handleZoom = useCallback(
    (direction: "in" | "out", factor: number = 0.05) => {
      setVisibleRange((prev) => {
        const step = Math.max(1, Math.floor(prev * factor));
        if (direction === "in" && prev > 10) {
          return Math.max(0, prev - step);
        } else if (direction === "out") {
          return Math.min(20, prev + step);
        }
        return prev;
      });
    },
    [data]
  );

  console.log(range);

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? "out" : "in";
      const zoomFactor = Math.abs(event.deltaY) / 1500;
      handleZoom(direction, zoomFactor);
    },

    [handleZoom]
  );

  const chartOptions: Highcharts.Options = {
    chart: {
      marginTop: 20,
      animation: false,
      events: {
        load: function () {
          const series = this.series[0];
          const scatterSeries = this.series[1];

          const x = new Date().getTime();
          const y = Math.random();
          series.addPoint([x, y], true, false);
          scatterSeries.addPoint(
            {
              x: x,
              y: y,
              marker: {
                radius: 6,
                fillColor: "#FF0000",
              },
              custom: {
                open: 0,
              },
            },
            true,
            false
          );

          setInterval(() => {
            const x = new Date().getTime();
            const y = Math.random();
            series.addPoint([x, y], true, false);

            if (series.data.length % 10 === 0) {
              this.xAxis[0].removePlotLine("close-x");
              this.yAxis[0].removePlotLine("close-y");
              this.xAxis[0].addPlotLine({
                id: "close-x",
                value: x,
                label: {
                  text: "Current",
                },
              });
              this.yAxis[0].addPlotLine({
                id: "close-y",
                value: y,
                label: {
                  text: `${y.toFixed(2)}`,
                  align: "right",
                },
              });

              scatterSeries.addPoint(
                {
                  x: x,
                  y: y,
                  marker: {
                    radius: 6,
                    fillColor: "#FF0000",
                  },
                  custom: {
                    open: scatterSeries.data.at(-1)?.y?.toFixed(2) || 0,
                  },
                },
                true,
                false
              );
            }
            if ((series.data.length + 5) % 10 === 0) {
              this.xAxis[0].addPlotLine({
                id: "close-x",
                value: x + 1000 * 5,
                label: {
                  text: "End",
                },
              });
            }
            // this.xAxis[0].setExtremes(
            //   series.data.at(-range + 20)?.x,
            //   x + 1000 * 5
            // );
          }, 1000);
        },
      },
    },
    legend: {
      enabled: false,
    },
    title: {
      text: "",
    },
    xAxis: {
      type: "datetime",
      maxPadding: 0.3,
    },
    yAxis: {
      opposite: true,
      minPadding: 1,
      maxPadding: 1,
    },
    tooltip: {
      enabled: true,
      formatter: function () {
        if (this.series.name === "Special Points") {
          return `
          open: ${this.point.options.custom.open}<br/>
          close: ${this.y.toFixed(2)}
          `;
        }
        return false;
      },
    },
    // tooltip: {
    //   m: false,
    //   formatter: function () {
    //     if (
    //       this.series.name === "Special Points" ||
    //       this.point.x === this.series.xData[this.series.xData.length - 1]
    //     ) {
    //       return `<b>${this.series.name}</b><br/>
    //               ${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x)}<br/>
    //               ${this.y.toFixed(2)}`;
    //     }
    //     return false;
    //   },
    // },

    series: [
      {
        name: "Random Data",
        type: "line",
        data: [],
        dataLabels: {
          enabled: true,
          formatter: function () {
            // Check if the current point is the last point
            if (this.point.index === this.series.data.length - 1) {
              return this.y?.toFixed(2); // Display the current value
            }
            return ""; // No label for other points
          },
        },
        tooltip: {},
        states: {
          select: {
            enabled: false,
          },
          hover: {
            enabled: false, // Disable hover state
          },
        },
      },
      {
        name: "Special Points",
        type: "scatter",
        data: [],
        marker: {
          radius: 5,
        },
        tooltip: {
          enabled: true,
        },
      },
    ],
    plotOptions: {
      series: {
        pointStart: Date.now(),
        pointInterval: 1000, // 1 second
        states: {
          hover: {
            enabled: false, // Disable hover state
          },
        },
      },
      scatter: {
        point: {
          events: {
            mouseOver: function () {
              this.series.chart.tooltip.refresh([this]); // Show tooltip for nearest point
            },
          },
        },
      },
    },
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default RealTimeChart;
