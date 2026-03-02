import React from "react";
import "./Faq.css";
import faq1 from "/webimg/faq-icon-1.png";
import faq2 from "/webimg/faq-icon-2.png";
import faq3 from "/webimg/faq-icon-3.png";

const faqData = [
  {
    title: "Which incomes are included in MONEY MALL plan?",
    desc: "MONEY MALL includes Income, Rewards, Salary, Pool Income, and Direct Income, and all of them are tracked in USDT.",
    icon: faq1,
  },
  {
    title: "Which wallets and chain are supported?",
    desc: "MONEY MALL supports Binance Smart Chain (BSC) wallets such as MetaMask, Trust Wallet, Token Pocket, and SafePal.",
    icon: faq2,
  },
  {
    title: "Why is MONEY MALL different?",
    desc: "MONEY MALL focuses on disciplined, plan-based execution with transparent metrics, practical risk control, and clear USDT-based flow.",
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
