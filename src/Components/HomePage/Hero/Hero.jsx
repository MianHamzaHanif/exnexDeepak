import React, { useEffect, useMemo, useState } from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import moneyMallLogo from "/webimg/logo.png";

export const Hero = () => {
  const sliderImages = useMemo(
    () =>
      import.meta.glob("../../../assets/*slider.*", {
        eager: true,
        import: "default",
      }),
    []
  );

  const getSlideImage = (keyword) => {
    const match = Object.entries(sliderImages).find(([path]) =>
      path.toLowerCase().includes(keyword.toLowerCase())
    );
    return match?.[1] || "";
  };

  const slides = useMemo(
    () => [
      {
        title: "About MONEY MALL",
        subtitle:
          "MONEY MALL is a structured trading plan designed to help participants grow with a clear process and disciplined risk management.",
        cta: "Read About MONEY MALL",
        href: "#about",
        image: moneyMallLogo,
      },
      {
        title: "Our Vision",
        subtitle:
          "Our vision is to scale disciplined participation in the MONEY MALL plan using USDT as the primary token for transparent plan activity.",
        cta: "Explore Vision",
        href: "#about",
        image: moneyMallLogo,
      },
      {
        title: "Secure MONEY MALL Plan Workflow",
        subtitle:
          "Track Income, Rewards, Salary, Pool Income, and Direct Income in one place with secure wallet integration and USDT-based transactions.",
        cta: "Learn Security",
        href: "#featured-services",
        image: getSlideImage("stay_safe_from_scams"),
      },
    ],
    [sliderImages]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return undefined;
    const timerId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerId);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] || null;

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-wrapper">
          <div className="hero-left">
            <div className="heading">
              <h1>{activeSlide?.title || "Your Hero for risk-free yields"}</h1>
            </div>
            <div className="subTitle">
              <p>{activeSlide?.subtitle || ""}</p>
            </div>
            <div className="btn-section">
              <Link to="/signup" className="active btn">
                Login
              </Link>
              {/* {activeSlide?.href ? (
                <a
                  href={activeSlide.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hero-link-btn"
                >
                  {activeSlide.cta} <i className="bi bi-arrow-right" />
                </a>
              ) : null} */}
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-right-img">
              {activeSlide?.image ? (
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className={`rightImg ${
                    activeSlide?.title === "About MONEY MALL" || activeSlide?.title === "Our Vision"
                      ? "logo-slide-img"
                      : ""
                  }`}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="hero-controls">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
            }
            aria-label="Previous slide"
          >
            <i className="bi bi-chevron-left" />
          </button>

          <div className="hero-dots">
            {slides.map((_, idx) => (
              <span
                key={`dot-${idx}`}
                className={idx === activeIndex ? "active-dot" : ""}
                onClick={() => setActiveIndex(idx)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
            aria-label="Next slide"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
