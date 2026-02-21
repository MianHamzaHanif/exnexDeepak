import "./OverviewStats.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaStar, FaCog } from "react-icons/fa";

const OverviewStats = () => {
  const chartData = [
    { date: "08/11", value: 26000 },
    { date: "09/11", value: 20000 },
    { date: "10/11", value: 30000 },
    { date: "11/11", value: 28000 },
    { date: "12/11", value: 15000 },
    { date: "13/11", value: 42000 },
    { date: "14/11", value: 32000 },
    { date: "15/11", value: 26000 },
  ];

  return (
    <div className="overview-card container-fluid">
      {/* HEADER */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h3 className="title">Overview Statistic</h3>

          <div className="sub-info">
            <span className="company">Origin Game EA Inc. (OREA)</span>
            <h4>
              $28,089.00 <span className="up">+26%</span>
            </h4>
          </div>
        </div>

        <div className="col-md-6 text-md-end mt-3 mt-md-0 d-flex flex-column ">
          <div className="icon-section mb-3">
            <span className="icon">
              <FaStar />
            </span>
            <span className="icon">
              <FaCog />
            </span>
          </div>
          <div className="timeline-section ">
            <span className="timeline-tab">1D</span>
            <span className="timeline-tab">1W</span>
            <span className="timeline-tab">1M</span>
            <span className="timeline-tab">1Y</span>
            <span className="timeline-tab">MAX</span>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}

      {/* CHART */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="#777" />
            <YAxis stroke="#777" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ff5f6d"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverviewStats;
