import { useEffect, useState } from "react";
import "./home.css";
import Header from "../header/Header";
import Hero from "./Hero/Hero";
import Features from "./Features/Features";
import Product from "./Product/Product";
import Marketing from "./Marketing/Marketing";
import Contact from "./Contact/Contact";
import Share from "./Share/Share";
import OurSupport from "./OurSupporter/OurSupport";
import Participated from "./Participated/Participated";
import FAQ from "./faq/FAQ";
import Footer from "./Footer/Footer";

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="page_wrapper overflow-x-hidden">
        <Header />
        <section className="Homepage overflow-x-hidden">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 pageBg">
                <Hero />
                <Features />
                <Product />
                <Marketing />
                <Contact />
                {/* <Share /> */}
                <OurSupport />
                {/* <Participated /> */}
                <FAQ />
                <Footer />
              </div>
            </div>
          </div>
        </section>

        <div className="home-float-icons">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="home-float-btn home-float-telegram"
            aria-label="telegram"
          >
            <i className="bi bi-telegram" />
          </a>

          <a
            href="https://wa.me/12025550147"
            target="_blank"
            rel="noreferrer"
            className="home-float-btn home-float-whatsapp"
            aria-label="whatsapp"
          >
            <i className="bi bi-whatsapp" />
          </a>
        </div>

        {showScrollTop ? (
          <button
            type="button"
            className="home-scroll-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="scroll-to-top"
          >
            <i className="bi bi-arrow-up" />
          </button>
        ) : null}
      </div>
    </>
  );
};

export default Home;
