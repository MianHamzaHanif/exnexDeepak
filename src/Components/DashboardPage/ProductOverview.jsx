// src/Components/DashboardPage/ProductOverview.jsx
import React from "react";
import ReactApexChart from "react-apexcharts";

const ProductOverview = () => {
  const series = [
    {
      name: "Calories Burned",
      data: [150, 220, 350, 180, 270, 160],
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 320,
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "40%",
      },
    },

    colors: [
      "rgba(var(--primary),1)",
      "rgba(var(--primary),.3)",
      "rgba(var(--primary),1)",
      "rgba(var(--primary),1)",
      "rgba(var(--danger),.3)",
      "rgba(var(--danger-dark),1)",
    ],

    xaxis: {
      categories: ["26 Feb", "29 Feb", "1 Mar", "2 Mar", "3 Mar", "4 Mar"],
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: 600,
          colors: "rgba(var(--dark),1)",
        },
      },
    },

    yaxis: {
      show: false,
    },

    grid: { show: false },

    legend: { show: false },

    dataLabels: { enabled: false },
  };

  return (
    <div className="card">
      <div className="card-body p-0">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={320}
        />
      </div>
    </div>
  );
};

export default ProductOverview;
