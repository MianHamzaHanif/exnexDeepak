import React from "react";
import "./Contact.css";

const contactItems = [
  {
    icon: "https://www.moneymallfutures.com/fe/assets/img/clipboardtext.png",
    title: "Define Your Trading Objective",
    text: "Share your goals, risk tolerance, and preferred plan so we can guide your Exnex Token strategy.",
  },
  {
    icon: "https://www.moneymallfutures.com/fe/assets/img/iconchats.png",
    title: "Get Strategy Guidance",
    text: "Our team reviews your profile and provides a practical trading roadmap within 24 hours.",
  },
  {
    icon: "https://www.moneymallfutures.com/fe/assets/img/note.png",
    title: "Start Trading with Exnex Token",
    text: "Once ready, activate your setup and begin execution with clear risk controls and reporting.",
  },
];

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-grid">
          <div className="contact-left">
            <p className="contact-head">How It Works</p>
            <p className="contact-head-big">How to Start Trading with Exnex Token</p>

            <div className="contact-list">
              {contactItems.map((item) => (
                <article className="contact-list-item" key={item.title}>
                  <img src={item.icon} alt={item.title} />
                  <div>
                    <p className="contact-list-head">{item.title}</p>
                    <p className="contact-list-content">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="contact-right">
            <div className="contact-card">
              <p className="contact-form-head">CONTACT US</p>
              <p className="contact-form-subhead">
                Have questions about Exnex Token plans or trading setup? Our team is ready to help.
              </p>

              <form className="contact-form" method="post" action="https://www.moneymallfutures.com/contact/save">
                <input type="hidden" name="_token" value="wMSTrkxZfld7LZQhpXQSnVrZy41PyzMjaJPeflRm" />
                <input type="text" placeholder="Full Name" name="fullname" />

                <div className="contact-row">
                  <input type="email" placeholder="Email Address" name="email" />
                  <input type="text" placeholder="Phone Number" name="phone" />
                </div>

                <input type="text" placeholder="Message Content" name="message" />
                <button type="submit">SEND</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
