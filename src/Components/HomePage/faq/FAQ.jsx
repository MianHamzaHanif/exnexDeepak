import React from "react";
import "./Faq.css";
import faq1 from "/webimg/faq-icon-1.png";
import faq2 from "/webimg/faq-icon-2.png";
import faq3 from "/webimg/faq-icon-3.png";
import faq4 from "/webimg/faq-icon-4.png";
import faq5 from "/webimg/faq-icon-5.png";

const faqData = [
  {
    title: "How can you achieve 0% trading risks?",
    desc: "Exnex is the first automated trading algorithm for market-making, farming rewards and arbitrage that executes zero trading risk strategies across all major CEXs and DEXs.",
    icon: faq1,
  },
  {
    title: "What are supported wallets/chains?",
    desc: "Support chain binance smart chain",
    icon: faq2,
  },
  {
    title: "Why Exnex in better?",
    desc: "Exnex algorithms are optimized for maximal yields achievable only with limited market cap in today’s market conditions.",
    icon: faq3,
  },
];

const FAQ = () => {
  return (
    <section className="faq-ui-section">
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
