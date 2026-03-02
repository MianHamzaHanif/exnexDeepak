import React from "react";
import "./Features.css";

export const Features = () => {
  return (
    <section id="featured-services" className="featured-services-section">
      <div className="featured-services-container">
        <div className="featured-services-top">
          <div className="featured-banner-wrap">
            <img
              src="https://www.moneymallfutures.com/fe/assets/img/img-feature.png"
              className="featured-banner"
              alt="moneymall feature title"
            />
          </div>

          <div className="featured-copy">
            <p className="feature-text-heading">MONEY MALL Plan Infrastructure</p>
            <p className="feature-text-heading-big">A Practical Framework for Consistent Crypto Execution</p>
            <hr className="feature-hr" />
            <p className="feature-text-content">
              MONEY MALL combines structured strategy, portfolio discipline, and a clear plan model to
              help traders navigate volatility with a clear process.
            </p>
            <p className="feature-text-content">
              Primary Token for Plan Activity: <strong>USDT</strong>
            </p>
            <p className="feature-text-content">
              All plan outcomes including Income, Rewards, Salary, Pool Income, and Direct Income are tracked in USDT.
            </p>
            <p>
              <a href="https://wa.me/6281953934694" target="_blank" rel="noreferrer" className="feature-link">
                Speak with an Advisor
                <svg
                  width="55.560547"
                  height="15.060547"
                  viewBox="0 0 55.5605 15.0605"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M47.5 0.53L54.5 7.53L47.5 14.53M54.5 7.53L0 7.53"
                    stroke="#23A0DB"
                    strokeOpacity="1"
                    strokeWidth="1.5"
                  />
                </svg>
              </a>
            </p>
          </div>
        </div>

        <div className="featured-items">
          <article className="feature-item-card">
            <img
              src="https://www.moneymallfutures.com/fe/assets/img/icon-1.png"
              alt="moneymall feature icon 1"
            />
            <p className="feature-item-head">USDT-BASED PLAN ACCESS</p>
            <p className="feature-item-content">
              Use USDT as the core token in a diversified setup built for long-term
              participation.
            </p>
          </article>

          <article className="feature-item-card">
            <img
              src="https://www.moneymallfutures.com/fe/assets/img/icon-2.png"
              alt="moneymall feature icon 2"
            />
            <p className="feature-item-head">PLAN-BASED DECISION SUPPORT</p>
            <p className="feature-item-content">
              Follow a trading plan backed by market structure, risk thresholds, and repeatable
              execution rules.
            </p>
          </article>

          <article className="feature-item-card">
            <img
              src="https://www.moneymallfutures.com/fe/assets/img/icon-3.png"
              alt="moneymall feature icon 3"
            />
            <p className="feature-item-head">SECURE WALLET FLOW</p>
            <p className="feature-item-content">
              Connect trusted wallets, verify transactions on-chain, and keep full visibility over
              your MONEY MALL plan activity.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Features;
