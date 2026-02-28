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
            <h1 className="">About Exnex</h1>
            <p>
              Exnex is a trading-focused ecosystem designed by experienced crypto operators to
              make token-based portfolio growth more structured and transparent.
            </p>
          </div>

          <div className="mission-content">
            <h1>Our Mission</h1>
            <p>
              We have seen too many traders struggle in highly volatile markets, so we built a
              practical framework that balances opportunity with risk control.
              <br />
              Exnex is for people who want disciplined execution, measured risk, and sustainable
              returns instead of random speculation.
            </p>
            <p>
              As blockchain builders, we believe Exnex Token utility and structured trading can
              improve market participation and long-term adoption.
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
