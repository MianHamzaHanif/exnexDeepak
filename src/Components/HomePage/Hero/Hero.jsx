import React, { useEffect, useMemo, useState } from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import { tokenAddress } from "../../../Services/tokenAddress";
import exnexLogo from "/webimg/logo.png";

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
        title: "About Exnex",
        subtitle:
          "Exnex is a trading-focused ecosystem built to make token-based portfolio growth more structured and transparent.",
        cta: "Read About Exnex",
        href: "#about",
        image: exnexLogo,
      },
      {
        title: "Our Vision",
        subtitle:
          "Our vision is to scale disciplined Exnex Token participation with practical strategy, strong risk control, and long-term market confidence.",
        cta: "Explore Vision",
        href: "#about",
        image: exnexLogo,
      },
      {
        title: "Trade with Exnex Token, Backed by Strategy",
        subtitle:
          `Plan-driven trading with Exnex Token on BSC. Contract: ${tokenAddress}`,
        cta: "View Plans",
        href: "#product",
        image: getSlideImage("anggota_resmi_icdx"),
      },
      {
        title: "Built for Disciplined Traders",
        subtitle:
          "Use structured entries, risk controls, and token-based portfolio management to trade with confidence.",
        cta: "Start Trading",
        href: "/login",
        image: getSlideImage("pengumuman_resmi"),
      },
      {
        title: "Secure Exnex Token Workflow",
        subtitle:
          "Track balances, rewards, and trading performance with transparent data and secure wallet integrations.",
        cta: "Learn Security",
        href: "#featured-services",
        image: getSlideImage("stay_safe_from_scams"),
      },
      {
        title: "Token Utility Across Trading Plans",
        subtitle:
          "Exnex Token is integrated into plan access, reward flows, and long-term strategy participation.",
        cta: "Talk to Team",
        href: "https://wa.me/6281953934694",
        image: getSlideImage("rekening_segregated_account"),
      },
      {
        title: "Choose the Right Trading Route",
        subtitle:
          "Pick a plan that fits your capital size, risk appetite, and monthly income goals.",
        cta: "Open Account",
        href: "#contact",
        image: getSlideImage("choose_&_bring_your_gift_now"),
      },
      {
        title: "Smart Leverage, Controlled Risk",
        subtitle:
          "Optimize capital efficiency while keeping drawdown under control through tested trading frameworks.",
        cta: "Learn More",
        href: "#marketing",
        image: getSlideImage("smart_leverage_untuk_semua_trader"),
      },
      {
        title: "Plan Selection by Trading Style",
        subtitle:
          "Compare spreads, leverage, and execution style to match your day-trade or swing-trade objectives.",
        cta: "Compare Plans",
        href: "#product",
        image: getSlideImage("mulai trading cerdas hari ini"),
      },
      {
        title: "Grow with Exnex Token Trading",
        subtitle:
          "Start now with a practical framework designed for steady performance, clear reporting, and smart execution.",
        cta: "Start Trading Now",
        href: "/login",
        image: getSlideImage("empower your financial journey"),
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
                    activeSlide?.title === "About Exnex" || activeSlide?.title === "Our Vision"
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
