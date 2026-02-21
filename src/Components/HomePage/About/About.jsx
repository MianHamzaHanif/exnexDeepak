import React from "react";
import aboutImage from "/webimg/about-img.png";
import coin from "/webimg/coin.png";
import "./About.css";
export const About = () => {
  return (
    <div className="about-section">
      <div className="about-wrapper">
        <div className="about-left">
          <div className="about-content">
            <h1 className="">About</h1>
            <p>
              Exnex is governed by world's Top investing group of companies (Decentralized autonomous organization) that was created by a group of experienced crypto enthusiasts to fulfill its mission.
            </p>
          </div>

          <div className="mission-content">
            <h1>Our Mission</h1>
            <p>
              We have seen too many investors and traders struggling in the
              extremely volatile crypto markets so we decided to create a safe
              haven for all those who prefer safe and still highly profitable
              investments.
              <br />
              We built Exnex  for those who went thru the hell of the markets
              and found out that their profit doesn't worth the time, stress and
              risk.
            </p>
            <p>
              And last but not least as blockchain lovers we deeply believe by
              doing this we will make the market more efficient, attract new
              investors and thereby help with the adoption of this
              world-chaining technology.
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
