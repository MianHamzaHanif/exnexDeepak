import React from "react";
import logo from "/webimg/logo.png";
import "./Footer.css";
import icon1 from "/webimg/footer-icon-1.png";
import icon2 from "/webimg/footer-icon-2.png";
import icon3 from "/webimg/footer-icon-3.png";

export const Footer = () => {
  return (
    <div className="footer-outer">
      <div className="footer-wrapper">
        <div className="footer-headder">
          <div className="logo">
            <img src={logo} alt="EXNEX Logo" />
          </div>
          <h1>EXNEX</h1>
        </div>

        <div className="footer-icon">
          <div className="icon">
            <img src={icon1} alt="" />
          </div>
          <div className="icon">
            <img src={icon2} alt="" />
          </div>
          <div className="icon">
            <img src={icon3} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
