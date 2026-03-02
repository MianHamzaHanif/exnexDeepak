import React from "react";
import aboutImage from "/webimg/about-img.png";
import coin from "/webimg/coin.png";
import "./About.css";
export const About = () => {
  return (
    <div id="about" className="about-section">
      <div className="about-wrapper">
        <div className="about-left">
          <div className="about-content">
            <h1 className="">About MONEY MALL</h1>
            <p>
              MONEY MALL is a structured trading plan built by experienced market operators to make
              growth more disciplined, transparent, and process-driven.
            </p>
          </div>

          <div className="mission-content">
            <h1>Our Mission</h1>
            <p>
              We have seen too many traders struggle in highly volatile markets, so we built a
              practical framework that balances opportunity with risk control.
              <br />
              MONEY MALL is for people who want disciplined execution, measured risk, and sustainable
              returns instead of random speculation.
            </p>
            <p>
              We use USDT as the core token inside the MONEY MALL plan so participation, tracking,
              and calculations for Income, Rewards, Salary, Pool Income, and Direct Income stay
              simple and transparent.
            </p>
          </div>
        </div>

        <div className="about-right">
          <img src={coin} alt="" className="icon" />
          <div className="about-image">
            <img src={aboutImage} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
