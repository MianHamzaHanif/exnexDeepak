import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const TradingCard = ({ coin }) => {
  const { symbol, explorerUrl, icon } = coin;
  const [entryPrice, setEntryPrice] = useState(null);
  const entryRef = useRef(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [pl, setPL] = useState(0);
  const [diff, setDiff] = useState(0);

  // ✅ correct 24h stats
  const [change24h, setChange24h] = useState(0);
  const [change24hPrice, setChange24hPrice] = useState(0);

  const [leverage, setLeverage] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  const [direction, setDirection] = useState("long");

  useEffect(() => {
    const symbolLower = symbol.toLowerCase();

    // ------------------------------
    // 1️⃣ FETCH CORRECT 24H CHANGE
    // ------------------------------
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        setChange24h(parseFloat(data.priceChangePercent)); // 24h %
        setChange24hPrice(parseFloat(data.priceChange)); // 24h difference
      });

    const update24h = async () => {
      try {
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          .then((res) => res.json())
          .then((data) => {
            setChange24h(parseFloat(data.priceChangePercent)); // 24h %
            setChange24hPrice(parseFloat(data.priceChange)); // 24h difference
          });

        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
          .then((res) => res.json())
          .then((data) => {
            const price = parseFloat(data.price);
            setEntryPrice(price);
            entryRef.current = price;
            setLatestPrice(price);
          });
      } catch (error) {
        console.log("Error in update 24h", error);
      }
    };
    // ------------------------------
    // 2️⃣ FETCH ENTRY PRICE
    // ------------------------------
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        const price = parseFloat(data.price);
        setEntryPrice(price);
        entryRef.current = price;
        setLatestPrice(price);
      });

    // ------------------------------
    // 3️⃣ WEBSOCKET LIVE PRICE
    // ------------------------------
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbolLower}@trade`,
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const livePrice = parseFloat(data.p);

      setLatestPrice(livePrice);

      if (!entryRef.current) return;

      const entry = entryRef.current;
      const priceDiff = livePrice - entry;

      const percentage =
        ((livePrice - entry) / entry) * 100 * (direction === "short" ? -1 : 1);

      setDiff(priceDiff);
      setPL(percentage);
    };

    // ------------------------------
    // 4️⃣ TIME + LEVERAGE
    // ------------------------------
    const interval = setInterval(() => {
      const now = new Date();
      const florida = now.toLocaleString("en-US", {
        timeZone: "America/New_York",
      });

      const formatted = new Date(florida)
        .toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(",", "");

      setCurrentDate(formatted);

      setLeverage(Math.floor(Math.random() * 10) + 1);
      update24h();
    }, 3000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, [symbol, direction]);

  const is24hProfit = change24h >= 0;

  return (
    <div className="col-12">
      <div className="card tradingcard">
        <div className="card-body">
          <div className="cardheader">
            <div className="d-flex align-items-center gap-2">
              <h5 className="cardtitle">
                <span className="position-relative">
                  {/* <img
                    src={USDTIC}
                    alt="usdt"
                    className="w-100 h-100 rounded-pill "
                  /> */}
                  <img
                    src={icon}
                    alt="icon"
                    className="w-100 h-100 iconupp position-absolute rounded-pill"
                  />
                </span>
                {/* {symbol} */}
                <span>
                  <button
                    onClick={() =>
                      setDirection(direction === "long" ? "short" : "long")
                    }
                    className={`btn ${is24hProfit ? "Postive" : "negative"}`}
                  >
                    {/* {direction === "long" ? "closeLong" : "closeShort"} */}
                  </button>
                </span>
              </h5>
            </div>

            <p>
              {/* <span>P&L</span> */}
              <span className="bg-transparent">
                <Link to={explorerUrl} target="_blank">
                  {/* <i className="fa-solid fa-arrow-up-right-from-square text-white"></i> */}
                  {/* <i className="bi bi-box-arrow-up-right" /> */}
                  <span>Trading Gain</span>
                </Link>
              </span>
            </p>
          </div>

          <div className="card-bottm">
            {/* Entry */}
            <div className="box">
              <div className="bootmheading">Entry Price</div>
              <div className="anount">
                {entryPrice ? entryPrice.toFixed(4) : ("trade.loading")}
              </div>
            </div>

            {/* Live */}
            <div className="box">
              {/* <div className="bootmheading">Profit/Loss</div> */}
              {/* <div className={`Amount ${is24hProfit ? "Positve" : "Negtive"}`}>
                {change24hPrice.toFixed(4)}
              </div> */}
            </div>

            {/* P/L */}
            <div className="box">
              <div className="date">{currentDate} (UTC-5)</div>

              <div className={`Amount ${is24hProfit ? "Positve" : "Negtive"}`}>
                {is24hProfit ? "+" : ""}
                {change24h.toFixed(4)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingCard;
