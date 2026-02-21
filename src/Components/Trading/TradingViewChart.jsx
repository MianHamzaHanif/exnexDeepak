import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const TradingViewChart = ({ symbol = "BINANCE:BTCUSDT", height = "500px" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing scripts when component re-renders
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          symbol,
          interval: "15",
          container_id: "tv_chart_container",
          library_path: "/charting_library/",
          autosize: true,
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#000000",
          hide_top_toolbar: false,
          hide_legend: false,
          enable_publishing: false,
          allow_symbol_change: true,
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <>
      <div className="row">
        <Link to="/Trading">
          <h3 className="title">
            Live Trading Data
            <span>
              <i className="fa fa-line-chart text-white fs-5"></i>
            </span>
          </h3>
        </Link>

        <div
          id="tv_chart_container"
          ref={containerRef}
          style={{
            width: "100%",
            height,
            borderRadius: "10px",
            overflow: "hidden",
          }}
        ></div>
      </div>
    </>
  );
};

export default TradingViewChart;
