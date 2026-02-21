import { Link } from "react-router-dom";
import "./home.css";
import Header from "../header/Header";
import Hero from "./Hero/Hero";
import Features from "./Features/Features";
import About from "./About/About";
import Share from "./Share/Share";
import OurSupport from "./OurSupporter/OurSupport";
import Participated from "./Participated/Participated";
import FAQ from "./faq/FAQ";
import Footer from "./Footer/Footer";

const Home = () => {
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
                <About />
                {/* <Share /> */}
                <OurSupport />
                {/* <Participated /> */}
                <FAQ />
                <Footer />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
