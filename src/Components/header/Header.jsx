import React, { useState } from "react";
import "./header.css";
import { Link } from "react-router-dom";
import logo from "/webimg/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();

    if (window.location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const section = document.getElementById(sectionId);

    if (!section) return;

    const offset = 100;

    const top = section.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });

    setMenuOpen(false);
  };

  return (
    <header className="homepageheader">
      <div className="home-main-nav">
        <div className="home-main-nav-inner">
          {/* LOGO */}

          <Link to="/" className="home-brand">
            <img src={logo} alt="logo" />
          </Link>

          {/* CENTER MENU */}

          <div className={`home-nav-links ${menuOpen ? "active" : ""}`}>
            <a href="/">Home</a>

            <a href="#product" onClick={(e) => scrollToSection(e, "product")}>
              Trading Support
            </a>

            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
              Contact
            </a>
          </div>

          {/* RIGHT BUTTON */}

          <div className="right-section">
            <Link to="/signup" className="member-btn">
              <i className="bi bi-person" /> LOGIN
            </Link>

            {/* MOBILE MENU */}

            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
