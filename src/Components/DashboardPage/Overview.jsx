// src/Components/DashboardPage/Overview.jsx
import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

const Overview = () => {
  useEffect(() => {
    const options = {
      chart: {
        type: "bar",
        height: 260,
        toolbar: { show: false },
      },

      plotOptions: {
        bar: {
          columnWidth: "20%",
          borderRadius: 4,
          distributed: true,   // <-- different colors per bar
        },
      },

      colors: ["#4D0259", "#FFBDF7", "#5C4A07", "#F8F8D0"],

      series: [
        {
          data: [40, 55, 45, 35, 50, 60, 48, 52, 39, 44], // dummy values
        },
      ],

      legend: { show: false },
      dataLabels: { enabled: false },

      xaxis: {
        categories: ["", "", "", "", "", "", "", "", "", ""],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: { show: false },

      grid: { show: false },
    };

    const chart = new ApexCharts(
      document.querySelector("#salesChart"),
      options
    );
    chart.render();

    return () => chart.destroy();
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <div>
          <div id="salesChart" />
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="dropdown">
            <a
              aria-expanded="false"
              className="text-dark"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
            >
              <i className="iconoir-align-left f-s-20 f-w-600 text-dark-dark" />
              <i className="fa-solid fa-chevron-down ms-1 f-s-18 align-top" />
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item">Last Month</a></li>
              <li><a className="dropdown-item">Last Week</a></li>
              <li><a className="dropdown-item">Last Year</a></li>
            </ul>
          </div>

          <form className="app-form">
            <select className="form-select custom-form-select">
              <option selected>Jan</option>
              <option value="1">Feb</option>
              <option value="2">Mar</option>
              <option value="3">..</option>
              <option value="4">Dec</option>
            </select>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Overview;
