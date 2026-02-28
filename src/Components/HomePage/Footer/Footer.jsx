import React from "react";
import "./Footer.css";
import logo from "/webimg/logo.png";

export const Footer = () => {
  return (
    <footer id="footer" className="footer light-background">
      <div className="footer-top">
        <div className="footer-grid">
          <div className="footer-about">
            <a href="/" className="footer-logo-link">
              <img
                src={logo}
                className="footer-logo"
                alt="Exnex"
              />
            </a>

            <div className="footer-contact-block">
              <p className="footer-contact-text">Exnex</p>
              <p className="footer-contact-text">Exnex Trading</p>
              <p className="footer-address">
                Global digital trading infrastructure powered by Exnex Token on Binance Smart Chain.
              </p>

              <p className="footer-line">
                <i className="bi bi-telephone me-1 icon-1" />
                <span className="text-1">
                  <a href="tel:+12025550147">+1 (202) 555-0147</a>
                </span>
              </p>

              <p className="footer-line">
                <i className="bi bi-envelope me-1 icon-1" />
                <span className="text-1">
                  <a href="mailto:info@exnex.com">info@exnex.com</a>
                </span>
              </p>
            </div>
          </div>

          <div className="footer-links-wrap">
            <div className="footer-link-group">
              <h4>Contact Us</h4>
              <a href="https://wa.me/6281953934694" target="_blank" rel="noreferrer">
                Customer Support
              </a>
              <a href="mailto:info@exnex.com">Email Support</a>
              <a href="#contact">
                Contact Form
              </a>
            </div>

            <div className="footer-link-group">
              <h4>About Us</h4>
              <a href="#featured-services">
                Why Exnex
              </a>
              <a href="#marketing">
                Trading Insights
              </a>
              <a href="#product">
                Plans
              </a>
            </div>

            <div className="footer-link-group">
              <h4>Resources</h4>
              <a
                href="#faq"
              >
                FAQ
              </a>
              <a href="#contact">Get Started</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
