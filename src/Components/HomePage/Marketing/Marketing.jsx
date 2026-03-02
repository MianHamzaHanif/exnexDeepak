import React, { useMemo, useState } from "react";
import "./Marketing.css";

const tabData = [
  {
    id: "tab1",
    label: "TOKEN TRENDS",
    heading: "Track USDT Market Momentum in Real Time",
    description:
      "Follow token momentum, liquidity changes, and price behavior to improve timing and strategy precision.",
    points: [
      {
        title: "Daily Token Pulse",
        text: "Review USDT pair movement and broader crypto trend direction.",
      },
      {
        title: "Context-Based Analysis",
        text: "Understand how market structure affects your trading plan.",
      },
      {
        title: "Execution Signals",
        text: "Use data-backed cues to refine entries and exits.",
      },
      {
        title: "Risk Alerts",
        text: "Stay prepared during sharp volatility and liquidity events.",
      },
    ],
    image: "https://www.moneymallfutures.com/fe/assets/img/img1.webp",
  },
  {
    id: "tab2",
    label: "PRICE BEHAVIOR",
    heading: "Understand Price Structure Before You Execute",
    description:
      "Study closing levels, rejection zones, and continuation patterns before committing capital.",
    points: [
      {
        title: "Closing Levels",
        text: "Use daily and weekly closes to identify directional bias.",
      },
      {
        title: "Historical Mapping",
        text: "Compare past moves to current conditions for better context.",
      },
      {
        title: "Volatility Zones",
        text: "Mark ranges where risk expansion is likely to happen.",
      },
      {
        title: "Technical Anchors",
        text: "Build rule-based analysis around consistent reference levels.",
      },
    ],
    image: "https://www.moneymallfutures.com/fe/assets/img/img.webp",
  },
  {
    id: "tab3",
    label: "EVENT CALENDAR",
    heading: "Plan Around High-Impact Market Events",
    description:
      "Schedule your MONEY MALL plan execution around macro events that influence crypto-wide liquidity and risk appetite.",
    points: [
      {
        title: "Forecast vs. Outcome",
        text: "Adjust your setup when real data diverges from expectations.",
      },
      {
        title: "Relevant Filters",
        text: "Focus only on events that can impact your active positions.",
      },
      {
        title: "Impact Ratings",
        text: "Rank upcoming events by expected volatility and risk.",
      },
      {
        title: "Live Reaction",
        text: "Respond with discipline when data hits the market.",
      },
    ],
    image: "https://www.moneymallfutures.com/fe/assets/img/img3.webp",
  },
  {
    id: "tab4",
    label: "PLAN DASHBOARD",
    heading: "Interactive Metrics for Trading Performance",
    description:
      "Track strategy outcomes, capital efficiency, and position quality with a practical performance dashboard.",
    points: [
      {
        title: "Custom Views",
        text: "Organize metrics that matter to your exact trading style.",
      },
      {
        title: "Multi-Timeframe Comparison",
        text: "Measure consistency across daily, weekly, and monthly windows.",
      },
      {
        title: "Export Ready",
        text: "Use clean data exports for deeper review and journaling.",
      },
      {
        title: "Smart Filters",
        text: "Focus on plan, pair, and setup quality with one click.",
      },
    ],
    image: "https://www.moneymallfutures.com/fe/assets/img/img4.webp",
  },
  {
    id: "tab5",
    label: "ENTRY TOOLS",
    heading: "Precision Entry and Exit Framework",
    description:
      "Use structured technical tools to define entries, targets, and stop levels before each trade.",
    points: [
      {
        title: "Retracement & Extension",
        text: "Map potential support and resistance for USDT-based setups.",
      },
      {
        title: "Chart Integration",
        text: "Overlay levels directly on live charts for quick decisions.",
      },
      {
        title: "Auto & Manual Controls",
        text: "Combine automation with manual control for cleaner execution.",
      },
      {
        title: "Rule-Based Guidance",
        text: "Apply clear entry, target, and stop rules for every position.",
      },
    ],
    image: "https://www.moneymallfutures.com/fe/assets/img/img5.png",
  },
];

const stepsData = [
  {
    image: "https://www.moneymallfutures.com/fe/assets/img/illustration.png",
    title: "Choose a Trading Plan",
    text: "Select the MONEY MALL plan that matches your capital and risk preference.",
  },
  {
    image: "https://www.moneymallfutures.com/fe/assets/img/illustration2.png",
    title: "Connect Your Wallet",
    text: "Set up a supported wallet and verify your USDT readiness in a few steps.",
  },
  {
    image: "https://www.moneymallfutures.com/fe/assets/img/illustration3.png",
    title: "Execute with Discipline",
    text: "Follow your plan, apply risk controls, and manage entries and exits with structure.",
  },
  {
    image: "https://www.moneymallfutures.com/fe/assets/img/illustration4.png",
    title: "Scale Consistently",
    text: "Track performance, refine your strategy, and compound results over time.",
  },
];

const Marketing = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const activeData = useMemo(
    () => tabData.find((item) => item.id === activeTab) || tabData[0],
    [activeTab]
  );

  return (
    <section id="marketing" className="marketing-section">
      <div className="marketing-container">
        <p className="marketing-subhead">MONEY MALL Research Center</p>
        <p className="marketing-head">Plan Trading Insights</p>

        <div className="marketing-body">
          <div className="marketing-tabs">
            {tabData.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <i className="fa fa-chevron-right" />
              </button>
            ))}
          </div>

          <div className="marketing-content">
            <div className="marketing-copy">
              <p className="marketing-content-head">{activeData.heading}</p>
              <p className="marketing-content-text">{activeData.description}</p>
              <ul className="marketing-list">
                {activeData.points.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <br />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="marketing-image-wrap">
              <img src={activeData.image} alt={activeData.heading} className="marketing-image" />
            </div>
          </div>
        </div>

        <div className="steps-section">
          <p className="marketing-subhead center">Simple Steps</p>
          <p className="marketing-head center">How MONEY MALL Plan Works with USDT</p>

          <div className="steps-grid">
            {stepsData.map((step, index) => (
              <article key={step.title} className="step-card">
                <img src={step.image} alt={step.title} />
                <p className="step-title">
                  <span className="step-text">Step {index + 1}</span> -{" "}
                  <span className="step-text-2">{step.title}</span>
                </p>
                <p className="step-content-text">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Marketing;
