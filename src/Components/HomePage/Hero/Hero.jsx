import React, { useEffect, useMemo, useState } from "react";
import "./Hero.css";
import { Link } from "react-router-dom";

import slider1 from "../../../../public/Websiteimg/slider1.png";
import slider2 from "../../../../public/Websiteimg/slider2.png";
import slider3 from "../../../../public/Websiteimg/slider3.webp";
import slider4 from "../../../../public/Websiteimg/slider4.png";
import slider5 from "../../../../public/Websiteimg/slider5.png";
import slider6 from "../../../../public/Websiteimg/slider6.png";


export const Hero = () => {

  /* SLIDES DATA */

  const slides = useMemo(
    () => [
      {
        title: "Anggota Resmi ICDX & Indonesia Clearing House",
        subtitle:
          "Kami telah resmi terdaftar sebagai Anggota ICDX: Bursa Berjangka Komoditi & Derivatif dan Indonesia Clearing House sesuai peraturan yang berlaku pada 17 November 2025",
        cta: "Read About MONEY MALL",
        href: "/",
        image: slider1,
      },

      {
        title: "Pengumuman Resmi",
        subtitle:
          "PT Gatra Mega Berjangka menyampaikan bahwa Wakil Pialang Berjangkanya telah terdaftar di Bank Indonesia sebagai Wakil Pialang Berjangka Derivatif PUVA.",
        cta: "Read About MONEY MALL",
        href: "/",
        image: slider2,
      },

      {
        title: "Stay Safe from Scams and Fake Channels",
        subtitle:
          "Only follow official PT. Gatra Mega Berjangka channels to ensure security and authenticity.",
        cta: "Explore Vision",
        href: "/",
        image: slider3,
      },
      {
        title: "Rekening Segregated Account PT Gatra Mega Berjangka",
        subtitle:
          "Rekening resmi PT GATRA MEGA BERJANGKA ditampilkan pada gambar di samping. Selain rekening tersebut bukan milik perusahaan dan terindikasi penipuan.",
        cta: "Explore Vision",
        href: "/",
        image: slider4,
      },
      {
        title: "Smart Leverage untuk Semua Trader!!",
        subtitle:
          "Modal kecil oke, risiko tetap terukur. Cuan optimal hanya di Money Mall Futures",
        cta: "Explore Vision",
        href: "/",
        image: slider5,
      },

      {
        title: "Empower Your Financial Journey",
        subtitle:
          "Start trading with confidence on a platform built for growth, stability, and success.",
        cta: "Learn Security",
        href: "/",
        image: slider6,
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);


  /* AUTO SLIDER */

  useEffect(() => {

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);

  }, [slides.length]);


  const activeSlide = slides[activeIndex];


  return (
    <div className="hero-section">

      <div className="hero-content">

        <div className="hero-wrapper">

          {/* LEFT SIDE */}

          <div className="hero-left">

            <div className="heading">
              <h1>{activeSlide.title}</h1>
            </div>

            <div className="subTitle">
              <p>{activeSlide.subtitle}</p>
            </div>

            <div className="btn-section">

              <Link to="/signup" className="active btn">
                Login
              </Link>

            </div>

          </div>



          {/* RIGHT SIDE IMAGE */}

          <div className="hero-right">

            <div className="hero-right-img">

              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className={`rightImg ${
                  activeSlide.title === "About MONEY MALL" ||
                  activeSlide.title === "Our Vision"
                    ? "logo-slide-img"
                    : ""
                }`}
              />

            </div>

          </div>

        </div>



        {/* CONTROLS */}

        <div className="hero-controls">

          <button
            onClick={() =>
              setActiveIndex(
                (prev) => (prev - 1 + slides.length) % slides.length
              )
            }
          >
            <i className="bi bi-chevron-left" />
          </button>



          <div className="hero-dots">

            {slides.map((_, i) => (
              <span
                key={i}
                className={i === activeIndex ? "active-dot" : ""}
                onClick={() => setActiveIndex(i)}
              />
            ))}

          </div>



          <button
            onClick={() =>
              setActiveIndex(
                (prev) => (prev + 1) % slides.length
              )
            }
          >
            <i className="bi bi-chevron-right" />
          </button>

        </div>

      </div>

    </div>
  );
};

export default Hero;