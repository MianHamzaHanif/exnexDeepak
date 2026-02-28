import React from "react";
import "./header.css";
import { Link } from "react-router-dom";
import logo from "/webimg/logo.png";

const Header = () => {
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();

    if (window.location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const section = document.getElementById(sectionId);
    if (!section) return;

    const offset = 130;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <header className="homepageheader">
      <div className="home-topbar">
        <div className="home-topbar-inner">
          <div className="home-top-left">
            <a href="tel:+12025550147">
              <i className="bi bi-telephone" /> +1 (202) 555-0147
            </a>
            <a href="mailto:info@exnex.com">
              <i className="bi bi-envelope" /> info@exnex.com
            </a>
          </div>
          <div className="home-top-right">
            <span>Follow Us</span>
            <a href="https://www.youtube.com/channel/UCimtAunOgLl8v2YlpWZDimg" target="_blank" rel="noreferrer" aria-label="youtube">
              <i className="bi bi-youtube" />
            </a>
            <a href="https://www.instagram.com/moneymallfutures" target="_blank" rel="noreferrer" aria-label="instagram">
              <i className="bi bi-instagram" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61563581315872" target="_blank" rel="noreferrer" aria-label="facebook">
              <i className="bi bi-facebook" />
            </a>
            <a href="https://www.tiktok.com/@moneymallfutures" target="_blank" rel="noreferrer" aria-label="tiktok">
              <i className="bi bi-twitter-x" />
            </a>
            <span className="home-lang">English</span>
          </div>
        </div>
      </div>

      <div className="home-main-nav">
        <div className="home-main-nav-inner">
          <Link to="/" className="home-brand">
            <img src={logo} alt="logo" />
            <div>
              <h4>EXNEX</h4>
              {/* <p>PT. GATRA MEGA BERJANGKA</p> */}
            </div>
          </Link>

          <div className="home-nav-links">
            <a href="/">Home</a>
            <a href="#product" onClick={(e) => scrollToSection(e, "product")}>
              Trading Support
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
              Contact
            </a>
          </div>

          <Link to="/signup" className="member-btn">
            <i className="bi bi-person" /> LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
