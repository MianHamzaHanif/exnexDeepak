import React from "react";
import "./Faq.css";
import faq1 from "/webimg/faq-icon-1.png";
import faq2 from "/webimg/faq-icon-2.png";
import faq3 from "/webimg/faq-icon-3.png";

const faqData = [
  {
    title: "How does Exnex Token fit into the trading plan?",
    desc: "Exnex Token is integrated into the strategy flow for plan access, tracking, and portfolio participation across supported trading setups.",
    icon: faq1,
  },
  {
    title: "Which wallets and chain are supported?",
    desc: "Exnex currently supports Binance Smart Chain (BSC) with wallets such as MetaMask, Trust Wallet, Token Pocket, and SafePal.",
    icon: faq2,
  },
  {
    title: "Why is Exnex different?",
    desc: "Exnex focuses on disciplined, plan-based execution with transparent metrics, practical risk control, and token-aligned strategy design.",
    icon: faq3,
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="faq-ui-section">
      <div className="faq-header">
        <h1>FAQ</h1>
      </div>

      <div className="faq-grid">
        {faqData.map((item, index) => (
          <div className="faq-glass-card" key={index}>
            <div className="faq-icon-wrap">
              <img src={item.icon} alt="" />
            </div>

            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
