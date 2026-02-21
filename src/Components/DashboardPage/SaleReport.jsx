// src/Components/DashboardPage/SaleReport.jsx
import React from "react";
import ReactApexChart from "react-apexcharts";

const SaleReport = () => {
  const series = [44, 55, 41, 17, 15]; // Comedy, Action, SciFi, Drama, Horror

  const options = {
    chart: {
      type: "donut",
      height: 300,
      toolbar: { show: false },
    },

    labels: ["Comedy", "Action", "SciFi", "Drama", "Horror"],

    colors: [
      "rgba(var(--primary-dark),1)",     // Comedy
      "rgba(var(--primary),1)",          // Action
      "rgba(var(--danger-dark),1)",      // SciFi
      "rgba(var(--danger),.3)",          // Drama
      "rgba(var(--warning),1)",          // Horror
    ],

    legend: {
      show: true,
      position: "bottom",
      fontSize: "14px",
      labels: { colors: "rgba(var(--secondary),1)" },
      markers: {
        width: 14,
        height: 14,
        radius: 50,
      },
    },

    stroke: {
      show: true,
      width: 0,
    },

    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={300}
        />
      </div>
    </div>
  );
};

export default SaleReport;
