import React, { useEffect, useState } from "react";
import "./Trading.css";
import { Link } from "react-router-dom";
import TradingCard from "./TradingCard";
import BTCUSDT from "../../../public/Dashboardimg/icontrading/BTCUSDT.png";
import ETHUSDT from "../../../public/Dashboardimg/icontrading/ETHUSDT.png";
import SOLUSDT from "../../../public/Dashboardimg/icontrading/SOLUSDT.png";
import BNBUSDT from "../../../public/Dashboardimg/icontrading/BNBUSDT.png";
import TRXUSDT from "../../../public/Dashboardimg/icontrading/TRXUSDT.png";
import XRPUSDT from "../../../public/Dashboardimg/icontrading/XRPUSDT.png";
import ADAUSDT from "../../../public/Dashboardimg/icontrading/ADAUSDT.png";
import DOGEUSDT from "../../../public/Dashboardimg/icontrading/DOGEUSDT.png";
import DOTUSDT from "../../../public/Dashboardimg/icontrading/DOTUSDT.png";
import LTCUSDT from "../../../public/Dashboardimg/icontrading/LTCUSDT.png";
import AVAXUSDT from "../../../public/Dashboardimg/icontrading/AVAXUSDT.png";
import TransLoader from "./TransLoader";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";

const Trading = () => {
  const [loading, setLoading] = useState(true);
  const coins = [
    {
      symbol: "BTCUSDT",
      explorerUrl: "https://www.blockchain.com/btc/",
      icon: BTCUSDT,
    },
    {
      symbol: "ETHUSDT",
      explorerUrl: "https://etherscan.io/",
      icon: ETHUSDT,
    },
    {
      symbol: "SOLUSDT",
      explorerUrl: "https://solscan.io/",
      icon: SOLUSDT,
    },
    {
      symbol: "BNBUSDT",
      explorerUrl: "https://bscscan.com/",
      icon: BNBUSDT,
    },
    {
      symbol: "TRXUSDT",
      explorerUrl: "https://tronscan.org/#/",
      icon: TRXUSDT,
    },
    {
      symbol: "XRPUSDT",
      explorerUrl: "https://xrpscan.com/",
      icon: XRPUSDT,
    },
    {
      symbol: "ADAUSDT",
      explorerUrl: "https://cardanoscan.io/transaction/",
      icon: ADAUSDT,
    },
    {
      symbol: "DOGEUSDT",
      explorerUrl: "https://dogechain.info/",
      icon: DOGEUSDT,
    },
    {
      symbol: "DOTUSDT",
      explorerUrl: "https://polkascan.io/polkadot/",
      icon: DOTUSDT,
    },
    {
      symbol: "LTCUSDT",
      explorerUrl: "https://blockchair.com/litecoin/",
      icon: LTCUSDT,
    },
    {
      symbol: "AVAXUSDT",
      explorerUrl: "https://snowtrace.io/",
      icon: AVAXUSDT,
    },
  ];

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid Trading">
            <div className="row g-3">
              <div className="col-12">
                {loading && <TransLoader />}

                <div className="container pb-5">
                  <div className="row g-2 pb-5">
                    <div className="col-12 text-center">
                      <h4 className="fw-bold text-center text-sm-start">
                       Trading History
                      </h4>
                    </div>

                    <div className="row g-2">
                      {coins.map((coin, index) => (
                        <TradingCard key={index} coin={coin} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Trading;
