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
      <div className="home-main-nav">
        <div className="home-main-nav-inner">
          <Link to="/" className="home-brand">
            <img src={logo} alt="logo" />
            <div>
              {/* <h4>EXNEX</h4> */}
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
