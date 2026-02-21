import React from "react";
import "./Features.css";
import feature1 from "/webimg/feature-1.png";
import feature2 from "/webimg/feature-2.png";
import feature3 from "/webimg/feature-3.png";
import feature4 from "/webimg/feature-4.png";
import coins from "/webimg/feature-coins.png";

export const Features = () => {
  return (
    <section className="features-section">
      
      <div className="feature-row">
        <div className="feature-text">
          <h2>Features</h2>
          <p className="description">
            Exnex is best investment platform in todays market our traders trade with tecnology with Bot Accuracy
          </p>
        </div>
        <div className="feature-image">
          <img src={feature1} alt="Feature 1" />
        </div>
      </div>

      <div className="feature-row middle">
        <div className="feature-text">
          <h2>Features</h2>
          <p className="subTitle">Genius At Work</p>
          <p className="description">
            All investment in the market are professionaly trade by experiense traders
          </p>
        </div>
        <div className="feature-image">
          <img src={feature2} alt="Feature 2" />
        </div>
      </div>

      <div className="feature-row bottom">
        <div className="feature-text">
          <h2>Features</h2>
          {/* <p className="subTitle">Price Appreciation</p> */}
          <p className="description">
          Our vision is to become a Leading. impactful , and future - ready organization that sets new standards in innovation and sustainability.we aspire to empower people , create long-term positive change , and build a better and more successful future for everyone connected with us.
          </p>
        </div>
        <div className="feature-image">
          <img src={feature3} alt="Feature 3" />
        </div>
      </div>

      <div className="feature-row taking-profit">
        <div className="feature-text">
          <h2>Features</h2>
        </div>
        <div className="feature-image">
          <img src={feature4} alt="Feature 4" />
        </div>
      </div>

      <div className="feature-row coin-section">
        <div className="feature-text">
          <p className="subTitle">Taking Profit</p>
          <p className="description">
          Locking in profits is often the hardest part of investing its easy to buy , but knowing when to say " enough is enough " requires a disciplined strategy. Without a plan , you risk watching a 50% gain evaporate back to 0% 
          Here are we provide  effective ways to investors on him/her they invested and got regular (Return on investment) and Generate good profits
          </p>
        </div>
        <div className="feature-image">
          <img src={coins} alt="Coins" />
        </div>
      </div>

    </section>
  );
};

export default Features;
