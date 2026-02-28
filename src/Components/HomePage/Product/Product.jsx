import React from "react";
import "./Product.css";

const productCards = [
  {
    title: "PRO",
    image: "https://www.moneymallfutures.com/fe/assets/img/pack-gold.webp",
    rows: [
      { label: "Plan Type", value: "Balanced Growth" },
      { label: "Entry Capital", value: "Flexible" },
      { label: "Execution Mode", value: "Guided Strategy" },
      { label: "Leverage Range", value: "1:100 - 1:500" },
      { label: "Risk Control", value: "20% - 75% Auto Cut" },
    ],
  },
  {
    title: "ZERO",
    image: "https://www.moneymallfutures.com/fe/assets/img/pack-diamond.webp",
    rows: [
      { label: "Plan Type", value: "Active Trading" },
      { label: "Entry Capital", value: "Flexible" },
      { label: "Execution Mode", value: "Low Friction" },
      { label: "Leverage Range", value: "1:100 - 1:500" },
      { label: "Risk Control", value: "20% - 75% Auto Cut" },
    ],
  },
];

const Product = () => {
  return (
    <section id="product" className="product-section">
      <div className="product-container">
        <p className="product-head">Exnex Token Trading Plans</p>
        <p className="product-head-big">Choose a Strategy That Fits Your Risk Profile</p>

        <div className="product-grid">
          {productCards.map((card) => (
            <article key={card.title} className="product-card">
              <div className="product-card-header">
                <span className="product-item-head">{card.title}</span>
                <img src={card.image} alt={`${card.title} package`} />
              </div>

              <hr />

              <div className="product-rows">
                {card.rows.map((row) => (
                  <div className="product-row" key={`${card.title}-${row.label}`}>
                    <div className="product-item-content-left">{row.label}</div>
                    <div className="product-item-content-right">{row.value}</div>
                  </div>
                ))}
              </div>

              <hr />

              {/* <a
                href="https://wa.me/6281953934694"
                target="_blank"
                rel="noreferrer"
                className="product-item-link"
              >
                START TRADING
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
              </a> */}
            </article>
          ))}
        </div>

        <p className="product-note">
          * Plan allocations and expected outcomes depend on market conditions and disciplined
          strategy execution. Please{" "}
          <a href="#contact">
            contact our team
          </a>
          {" "}for details.
        </p>
      </div>
    </section>
  );
};

export default Product;
