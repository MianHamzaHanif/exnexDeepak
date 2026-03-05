// src/Components/Dashboard/Header.jsx
import React from "react";
import "./Dash.css";
import "./responsive.css";
import Profile from "../../../public/Dashboardimg/logout.png";

const Header = () => {
  return (
    <>
      <>
        {/* Header Section starts */}
        <header className="header-main">
          <div className="container-fluid">
            <div className="row">
              <div className="col-6 col-sm-4 d-flex align-items-center header-left p-0">
                <span className="header-toggle me-3 mobilehed">
                  <i className="iconoir-view-grid" />
                </span>
              </div>
              <div className="col-6 col-sm-8 d-flex align-items-center justify-content-end header-right p-0">
                <ul className="d-flex align-items-center">
                <li className="header-left">
                     <span className="header-toggle me-3">
                  <i className="iconoir-view-grid" />
                </span>
                  </li>
                  <li className="header-profile">
                    <a className="d-block head-icon" href="/">
                      <img alt="avtar" className="b-r-50 h-35 w-35 bg-dark" src={Profile} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>
      </>
    </>
  );
};

export default Header;
