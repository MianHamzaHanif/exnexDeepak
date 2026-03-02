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
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setIsSubmitting(true);
      setFormMessage("");
      setFormMessageType("");

      await fetch("https://www.moneymallfutures.com/contact/save", {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });

      setFormMessage("Message sent successfully.");
      setFormMessageType("success");
      form.reset();
    } catch (error) {
      setFormMessage("Failed to send message. Please try again.");
      setFormMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-grid">
          <div className="contact-left">
            <p className="contact-head">How It Works</p>
            <p className="contact-head-big">How to Start with MONEY MALL Plan (USDT)</p>

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
                Have questions about MONEY MALL plans or USDT setup? Our team is ready to help.
              </p>

              <form
                className="contact-form"
                method="post"
                action="https://www.moneymallfutures.com/contact/save"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="_token" value="wMSTrkxZfld7LZQhpXQSnVrZy41PyzMjaJPeflRm" />
                <input type="text" placeholder="Full Name" name="fullname" required />

                <div className="contact-row">
                  <input type="email" placeholder="Email Address" name="email" required />
                  <input type="text" placeholder="Phone Number" name="phone" required />
                </div>

                <input type="text" placeholder="Message Content" name="message" required />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "SENDING..." : "SEND"}
                </button>
                {formMessage ? (
                  <p className={`contact-form-message ${formMessageType}`}>{formMessage}</p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
