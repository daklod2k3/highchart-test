"use client";
import { useEffect, useState } from "react";

const useCryptoData = (symbol) => {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.append("vs_currency", "usd");
        params.append("ids", symbol);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?${params}`
        );
        console.log(response);
        const data = await response.json();
        const price = data[0].current_price;
        const time = new Date();

        setData((prev) => [...prev.slice(-20), [time, price]]);
        setLabels((prev) => [...prev.slice(-20), time]);
      } catch (error) {
        console.error("Error fetching crypto data", error);
      }
    };

    const interval = setInterval(fetchData, 5000); // fetch every 5 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  return { data, labels };
};

export default useCryptoData;
