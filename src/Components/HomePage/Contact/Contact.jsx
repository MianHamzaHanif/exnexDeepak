import React, { useState } from "react";
import "./Contact.css";

const contactItems = [
  {
    icon: "https://www.moneymallfutures.com/fe/assets/img/clipboardtext.png",
    title: "Define Your Trading Objective",
    text: "Share your goals, risk tolerance, and preferred plan so we can guide your MONEY MALL strategy with USDT.",
  },
  {
    icon: "https://www.moneymallfutures.com/fe/assets/img/iconchats.png",
    title: "Get Strategy Guidance",
    text: "Our team reviews your profile and provides a practical trading roadmap within 24 hours.",
  },
  {
    icon: "https://www.moneymallfutures.com/fe/assets/img/note.png",
    title: "Start Trading with MONEY MALL Plan",
    text: "Once ready, activate your setup and begin execution with clear risk controls. All Income, Rewards, Salary, Pool Income, and Direct Income are handled in USDT.",
  },
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <p className="contact-head center">HOW IT WORKS</p>

        <p className="contact-head-big center">
          How to Start with MONEY MALL Plan (USDT)
        </p>

        <div className="contact-cards">
          {contactItems.map((item, index) => (
            <div className="contact-card-item" key={index}>
              <img src={item.icon} alt={item.title} />

              <h3>{item.title}</h3>

              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
