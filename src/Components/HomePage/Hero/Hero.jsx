import React from "react";
import "./Hero.css";
import rightImg from "/webimg/hero–img.png";
import icon1 from "/webimg/icon-1.png";
import icon2 from "/webimg/icon-2.png";
import icon3 from "/webimg/icon-3.png";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="navbar-wrapper">
          <Navbar />
        </div>
        <div className="hero-wrapper">
          <div className="hero-left">
            <div className="heading">
              <h1>
                Your <span className="span">Hero</span> <br />{" "}
                <span className="shadow">for risk-free yields</span>
              </h1>
            </div>
            <div className="subTitle">
              <p>
                First cross-chain arbitrage algorithms that appreciate your
                capital with zero trading risk.
              </p>
            </div>
            <div className="btn-section">
              <Link to="/signup" className="active btn">
                Login
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-right-img">
              <img src={rightImg} alt="Hero" className="rightImg" />
            </div>
          </div>
        </div>

        <div className="hero-right-content">
          <div className="icon-wrapper">
            <div className="icon">
              <div className="icon-bg icon-bg-1"></div>
              <div className="icon-bg icon-bg-2"></div>
              <img src={icon2} alt="" className="icon-img" />
            </div>
            <div className="icon-content">
              <h3>$10 Min</h3>
              <p>For Investor</p>
            </div>
          </div>

          <div className="icon-wrapper">
            <div className="icon">
              <div className="icon-bg icon2-bg-1"></div>
              <div className="icon-bg icon2-bg-2"></div>
              <img src={icon1} alt="" className="icon-img" />
            </div>
            <div className="icon-content">
              <h3> 20%-30% </h3>
              <p>Bot Trading</p>
            </div>
          </div>

          <div className="icon-wrapper">
            <div className="icon">
              <div className="icon-bg icon3-bg-1"></div>
              <div className="icon-bg icon3-bg-2"></div>
              <img src={icon3} alt="" className="icon-img" />
            </div>
            <div className="icon-content">
              <h3> 1-11 Level</h3>
              <p>Team Building </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
