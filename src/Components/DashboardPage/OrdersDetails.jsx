// src/Components/DashboardPage/OrdersDetails.jsx 
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import "./OrdersDetails.css";

const OrdersDetails = () => {
  const listRef = useRef(null);
  const web3State = useSelector((state) => state.web3State);
  const dashboardData = web3State.dashboardData || {};

  // FIXED: Build orders array from real data with correct direct count
  const orders = [
    {
      id: "My Direct",
      class: "success",
      desc: dashboardData.directReferrals || "0", // Correct: actual count (1)
    },
    {
      id: "My Team",
      class: "info",
      desc: (dashboardData.levelCounts || [])
        .reduce((a, b) => a + b, 0)
        .toString(),
    },
    {
      id: "Trading Income",
      class: "danger",
      desc: `$${dashboardData.tradingIncome || "0.00"}`,
    },
    {
      id: "Level Income",
      class: "info",
      desc: `$${dashboardData.levelIncome || "0.00"}`,
    },
  ];

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let idx = 0;

    const interval = setInterval(() => {
      idx++;
      list.style.transform = `translateY(-${idx * 100}px)`;
      list.style.transition = "0.8s ease-in-out";

      if (idx === orders.length) {
        setTimeout(() => {
          list.style.transition = "none";
          list.style.transform = "translateY(0px)";
          idx = 0;
        }, 900);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [orders.length]);

  return (
    <div className="order-detail-card card">
      <h5 className="pa-s-20 pt-3">My Team</h5>

      <div className="card-body custom-slider-wrapper">
        <div className="custom-slider" ref={listRef}>
          {orders.map((o, i) => (
            <ul key={i} className="order-content-list slider-item">
              <li className={`bg-${o.class}-300`}>
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className={`text-${o.class}-dark f-w-700 mb-0`}>
                    📦{o.id}
                  </h6>
                </div>

                <p
                  className={`text-${o.class} mb-0 fs-4 txt-ellipsis-2 text-black fw-bold`}
                >
                  {o.desc}
                </p>
              </li>
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersDetails;