// src/Components/DashboardPage/Product.jsx 
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ApexCharts from "apexcharts";

const Product = () => {
  const chartRef = useRef(null);
  const web3State = useSelector((state) => state.web3State);
  const dashboardData = web3State.dashboardData || {};

  useEffect(() => {
    // Get level incomes and create chart data
    const levelIncomes = dashboardData.levelIncomes || Array(11).fill(0);
    const chartData = levelIncomes.map(income => parseFloat(income) || 0);

    const options = {
      chart: {
        type: "line",
        height: 120,
        sparkline: { enabled: true },
      },
      stroke: {
        width: 3,
        curve: "smooth",
        colors: ["#7b2678"],
      },
      fill: {
        opacity: 1,
        colors: ["#7b2678"],
      },
      series: [
        {
          name: "Level Income",
          data: chartData,
        },
      ],
      tooltip: {
        enabled: true,
        custom: function({ series, seriesIndex, dataPointIndex }) {
          const value = series[seriesIndex][dataPointIndex];
          const level = dataPointIndex + 1;
          return `
            <div class="apexcharts-tooltip-custom" style="padding: 8px; background: #fff; border: 1px solid #e3e3e3; border-radius: 4px;">
              <strong>Level ${level}</strong><br/>
              <span>Income: $${value.toFixed(2)}</span>
            </div>
          `;
        },
      },
    };

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const chart = new ApexCharts(document.querySelector("#productSold"), options);
    chart.render();
    chartRef.current = chart;

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dashboardData.levelIncomes]);

  return (
    <div className="card  product-sold-card">
      <div className="card-body">
        <div>
          <h5 className="text-danger-dark f-w-600">
            Level Income
          </h5>
          {/* Graph Will Render Here */}
          <div id="productSold"></div>
        </div>

        <div>
          <h4>${dashboardData.levelIncome || "0.00"}</h4>
        </div>

        <a
          className="bg-danger h-35 w-35 d-flex-center b-r-50 product-sold-icon"
          href="/LevelIncome"
        >
          <i className="iconoir-arrow-right f-w-600 f-s-18 
              animate__pulse animate__fadeOutRight animate__infinite animate__slower" />
        </a>
      </div>
    </div>
  );
};

export default Product;