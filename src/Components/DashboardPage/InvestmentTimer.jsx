import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardData } from "../../Redux/Web3Slice";

const InvestmentTimer = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  
  const activeInvestments = useMemo(() => {
    return web3State.activeInvestments || [];
  }, [web3State.activeInvestments]);

  const contractTimeUnit = web3State.contractTimeUnit || 86400;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timers, setTimers] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  // FIXED: Update timers and available amounts in real-time with safety checks
  useEffect(() => {
    if (activeInvestments.length === 0) return;

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const newTimers = {};

      activeInvestments.forEach((investment, idx) => {
        // FIXED: Safety check for valid timestamps
        if (!investment.startTime || !investment.endTime || 
            isNaN(investment.startTime) || isNaN(investment.endTime)) {
          console.warn('Invalid investment timestamps:', investment);
          newTimers[idx] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isCompleted: false,
            currentAvailable: '0.0000',
            progress: '0.00',
            formatted: 'Invalid Time',
          };
          return;
        }

        const timeRemaining = Math.max(0, investment.endTime - currentTime);
        
        // Calculate elapsed time and progress with safety
        const elapsedTime = currentTime - investment.startTime;
        const totalDuration = investment.endTime - investment.startTime;
        const progress = totalDuration > 0 ? Math.min(1, Math.max(0, elapsedTime / totalDuration)) : 0;
        
        // Calculate current available amount based on elapsed time with safety
        const totalPayout = parseFloat(investment.totalPayout) || 0;
        const withdrawn = parseFloat(investment.withdrawn) || 0;
        const earnedSoFar = totalPayout * progress;
        const currentAvailable = Math.max(0, earnedSoFar - withdrawn);

        const days = Math.floor(timeRemaining / 86400);
        const hours = Math.floor((timeRemaining % 86400) / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = Math.floor(timeRemaining % 60);

        let formatted;
        if (timeRemaining === 0) {
          formatted = "Completed";
        } else if (contractTimeUnit === 60) {
          // Test mode: show minutes and seconds
          formatted = `${minutes}m ${seconds}s`;
        } else {
          // Production mode: full format
          if (days > 0) {
            formatted = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            formatted = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            formatted = `${minutes}m ${seconds}s`;
          }
        }

        newTimers[idx] = {
          days,
          hours,
          minutes,
          seconds,
          isCompleted: timeRemaining === 0,
          currentAvailable: currentAvailable.toFixed(4),
          progress: (progress * 100).toFixed(2),
          formatted,
        };
      });

      setTimers(newTimers);
    }, 1000); // Update every second for accurate display

    return () => clearInterval(interval);
  }, [activeInvestments, contractTimeUnit]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (activeInvestments.length <= 1) return;

    const slideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeInvestments.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [activeInvestments.length]);

  // FIXED: Sync with contract every 30 seconds to ensure accuracy
  useEffect(() => {
    if (activeInvestments.length === 0) return;

    const syncInterval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [activeInvestments.length, dispatch]);

  // Format amount to 4 decimals
  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(4);
  };

  if (activeInvestments.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(to right, rgb(12 12 12), rgb(12 12 12))",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          margin: "20px 0",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "15px" }}>
          📝 Active Investments
        </div>
        <div style={{ textAlign: "center", color: "#fff", padding: "20px" }}>
          No Active Plans
        </div>
      </div>
    );
  }

  const currentInvestment = activeInvestments[currentIndex];
  const currentTimer = timers[currentIndex] || {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    formatted: "Loading...",
    isCompleted: false,
    currentAvailable: "0.0000",
    progress: "0",
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        margin: "20px 0",
        overflow: "hidden",
      }}
    >
      {/* Clickable Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "20px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          borderBottom: isExpanded ? "1px solid #e0e0e0" : "none",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#28a745", marginBottom: "4px" }}>
            📝 Active Investment {currentIndex + 1}/{activeInvestments.length}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {currentInvestment.planName} - ${formatAmount(currentInvestment.amount)}
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            Started: {currentInvestment.startDate}
          </div>
          {/* FIXED: Show current available amount in header */}
          {parseFloat(currentTimer.currentAvailable) > 0 && (
            <div style={{ fontSize: "13px", color: "#28a745", marginTop: "4px", fontWeight: "600" }}>
              Available: ${currentTimer.currentAvailable}
            </div>
          )}
        </div>
        
        {/* Dropdown Arrow */}
        <div
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            fontSize: "20px",
            color: "#666",
          }}
        >
          ▼
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div style={{ padding: "20px" }}>
          {/* Slider Dots */}
          {activeInvestments.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              {activeInvestments.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: idx === currentIndex ? "#28a745" : "#ccc",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`View investment ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Progress Bar - NEW */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ 
              fontSize: "12px", 
              color: "#666", 
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between"
            }}>
              <span>Progress: {currentTimer.progress}%</span>
              <span>{contractTimeUnit === 60 ? "Test Mode (Minutes)" : "Production Mode (Days)"}</span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${currentTimer.progress}%`,
                height: "100%",
                backgroundColor: "#28a745",
                transition: "width 1s linear"
              }} />
            </div>
          </div>

          {/* Timer or Completed Status */}
          {currentTimer.isCompleted ? (
            <div
              style={{
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>✓ Completed</div>
              <div style={{ color: "#155724" }}>
                Plan ended on {currentInvestment.endDate}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {[
                { label: "Days", value: currentTimer.days },
                { label: "Hours", value: currentTimer.hours },
                { label: "Mins", value: currentTimer.minutes },
                { label: "Secs", value: currentTimer.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#f0f8f4",
                    borderRadius: "8px",
                    padding: "15px 10px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#28a745" }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Earnings Info - FIXED */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
                  {contractTimeUnit === 60 ? "Per Minute" : "Daily"} Payout
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                  ${currentInvestment.dailyPayout}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
                  Total Earned
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                  ${(parseFloat(currentInvestment.withdrawn) + parseFloat(currentTimer.currentAvailable)).toFixed(4)}
                </div>
              </div>
            </div>
            
            <div style={{ 
              borderTop: "1px solid #dee2e6", 
              paddingTop: "10px",
              marginTop: "10px"
            }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
                Withdrawn / Total Payout
              </div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
                ${formatAmount(currentInvestment.withdrawn)} / ${formatAmount(currentInvestment.totalPayout)}
              </div>
            </div>
          </div>

          {/* Available to Withdraw - FIXED: Use real-time calculated amount */}
          {parseFloat(currentTimer.currentAvailable) > 0 && (
            <div
              style={{
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.9 }}>
                💰 Available to withdraw now:
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>
                ${currentTimer.currentAvailable}
              </div>
              <div style={{ fontSize: "11px", marginTop: "8px", opacity: 0.8 }}>
                Updates in real-time every second
              </div>
            </div>
          )}
          
          {/* Contract Sync Info */}
          <div style={{ 
            textAlign: "center", 
            fontSize: "11px", 
            color: "#999", 
            marginTop: "15px" 
          }}>
            Last synced with contract: {new Date(web3State.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentTimer;