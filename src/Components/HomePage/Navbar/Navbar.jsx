import React from "react";
import "./Navbar.css";
import logo from "/webimg/logo.png";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <div className="navbar-section">
      <div className="navbar-content">
        <div className="logo-section">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
        </div>

        <div className="login-section">
          <p className="link-text">
            <Link className="link" to={"/signup"}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
