/* eslint-disable no-unused-vars */
// src/Components/Activation/ActivationContract.jsx - UPDATED WITH ERROR DISPLAY AND TESTNET LINK

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import "./Activation.css";
import { tokenAddress as USDT_Address } from "../../Services/tokenAddress";
import {
  activateContract,
  upgradeContract,
  reinvestContract,
  fetchContractData,
  connectWallet,
} from "../../Redux/Web3Slice";
import toast from "react-hot-toast";

// FALLBACK: Hardcoded plans for RPC failures
const FALLBACK_PLANS = [
  {
    id: 30,
    duration: "30",
    roi: "20%",
    totalReturn: "120%",
    name: "Plan 30",
    label: "Plan 30 - 30 days, ROI: 20%, Total: 120%",
  },
  {
    id: 60,
    duration: "60",
    roi: "50%",
    totalReturn: "150%",
    name: "Plan 60",
    label: "Plan 60 - 60 days, ROI: 50%, Total: 150%",
  },
  {
    id: 90,
    duration: "90",
    roi: "90%",
    totalReturn: "190%",
    name: "Plan 90",
    label: "Plan 90 - 90 days, ROI: 90%, Total: 190%",
  },
];

const ActivationContract = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const {
    isConnected,
    balances,
    userInfo,
    plans,
    activateButtonLoading, 
    upgradeButtonLoading, 
    reinvestButtonLoading,
    isLoading,
    isConnecting,
    error,
  } = web3State;
  const [selectedPlan, setSelectedPlan] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [plansError, setPlansError] = useState(null);
  const [plansLoadTimeout, setPlansLoadTimeout] = useState(false);
  const [usingFallbackPlans, setUsingFallbackPlans] = useState(false);
  const hasFetchedRef = useRef(false);
  const timeoutRef = useRef(null);
  
  // Monitor plans loading timeout - 7 seconds
  useEffect(() => {
    if (isConnected && plans.length === 0 && !isLoading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchContractData());
      
      // Set timeout to show error if plans don't load
      timeoutRef.current = setTimeout(() => {
        if (plans.length === 0) {
          setPlansLoadTimeout(true);
          setPlansError("Network issue detected. Using fallback plans. Click refresh to retry network fetch.");
          setUsingFallbackPlans(true);
          console.warn('ActivationContract: Using fallback plans due to RPC timeout');
        }
      }, 7000);
    } else if (plans.length > 0) {
      // Plans loaded successfully, clear error
      setPlansError(null);
      setPlansLoadTimeout(false);
      setUsingFallbackPlans(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (!isConnected) {
      hasFetchedRef.current = false;
      setUsingFallbackPlans(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isConnected, plans.length, isLoading, dispatch]);
  
  // Validate amount
  const validateAmount = (amt) => {
    const numAmt = Number(amt);
    if (!amt) {
      setAmountError("Amount is required.");
      return false;
    }
    if (isNaN(numAmt)) {
      setAmountError("Please enter a valid number.");
      return false;
    }
    if (numAmt < 10) {
      setAmountError("Amount must be at least 10 USDT.");
      return false;
    }
    if (numAmt % 10 !== 0) {
      setAmountError("Amount must be a multiple of 10.");
      return false;
    }
    setAmountError("");
    return true;
  };
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/^0+/, '');
    setAmount(value);
    validateAmount(value);
  };
  
  // Professional deep refresh - clears state and reloads everything
  const handleDeepRefresh = useCallback(async () => {
    try {
      setPlansError(null);
      setPlansLoadTimeout(false);
      setUsingFallbackPlans(false);
      hasFetchedRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      console.log('ActivationContract: Performing deep refresh');
      
      if (isConnected) {
        // Show loading message
        const toastId = toast.loading("Refreshing contract data...");
        
        // Dispatch fetch and wait for it
        const result = await dispatch(fetchContractData()).unwrap();
        toast.dismiss(toastId);
        
        if (result && result.plans && result.plans.length > 0) {
          toast.success("Data refreshed successfully!");
          setUsingFallbackPlans(false);
        } else {
          // No plans from network, use fallback
          toast.warning("Using fallback plans due to network issues.");
          setUsingFallbackPlans(true);
        }
      } else {
        toast.error("Wallet not connected");
      }
    } catch (err) {
      console.error('Deep refresh error:', err);
      // Use fallback plans on error
      setUsingFallbackPlans(true);
      setPlansError("Network error. Using fallback plans.");
      toast.error("Failed to fetch from network. Using fallback plans.");
    }
  }, [dispatch, isConnected]);
  
  // OPTIMIZATION: Only fetch data manually when user clicks refresh button or after transaction
  const fetchData = useCallback(() => {
    console.log('ActivationContract: Manual refresh triggered');
    if (isConnected) {
      dispatch(fetchContractData());
    }
  }, [dispatch, isConnected]);

  // Get plans from Redux or use fallback
  const getPlansToDisplay = useCallback(() => {
    if (plans.length > 0) {
      return plans;
    }
    if (usingFallbackPlans) {
      return FALLBACK_PLANS;
    }
    return [];
  }, [plans, usingFallbackPlans]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        // Fetch data after connecting
        setTimeout(() => {
          dispatch(fetchContractData());
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  // Handle activation 
  const handleActivate = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a plan.");
      return;
    }
    if (!validateAmount(amount)) {
      toast.error(amountError || "Please enter a valid amount.");
      return;
    }
    const numAmt = Number(amount);
    const usdtBalance = Number(balances.usdt);
    if (numAmt > usdtBalance) {
      toast.error(`Insufficient USDT balance. Available: $${usdtBalance.toFixed(2)}`);
      return;
    }
    if (userInfo.hasUsedBuy) {
      toast.error("You have already activated. Use upgrade or reinvest.");
      return;
    }
    try {
      const toastId = toast.loading("Processing activation...");
      const result = await dispatch(
        activateContract({ planId: selectedPlan, amount })
      ).unwrap();
      toast.dismiss(toastId);
      toast.success(`Activation successful! Tx: ${result.txHash?.substring(0, 10)}...`);
      setAmount("");
      setSelectedPlan("");
      // ADDED: Refresh data after success
      fetchData();
    } catch (error) {
      toast.dismiss();
      if (error.message?.includes('User denied')) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes('insufficient funds')) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error(`Activation failed: ${error.message || error}`);
      }
    }
  };
  // Handle upgrade 
  const handleUpgrade = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a plan.");
      return;
    }
    if (!validateAmount(amount)) {
      toast.error(amountError || "Please enter a valid amount.");
      return;
    }
    const numAmt = Number(amount);
    const withdrawableAmt = Number(balances.withdrawable);
    if (withdrawableAmt < 10) {
      toast.error(`Withdrawable balance must be at least 10 USDT. Available: $${withdrawableAmt.toFixed(2)}`);
      return;
    }
    if (numAmt > withdrawableAmt) {
      toast.error(`Insufficient withdrawable balance. Available: $${withdrawableAmt.toFixed(2)}`);
      return;
    }
    if (!userInfo.hasUsedBuy) {
      toast.error("Please activate first before upgrading.");
      return;
    }
    try {
      const toastId = toast.loading("Processing upgrade...");
      const result = await dispatch(
        upgradeContract({ planId: selectedPlan, amount })
      ).unwrap();
      toast.dismiss(toastId);
      toast.success(`Upgrade successful! Tx: ${result.txHash?.substring(0, 10)}...`);
      setAmount("");
      setSelectedPlan("");
      // ADDED: Refresh data after success
      fetchData();
    } catch (error) {
      toast.dismiss();
      if (error.message?.includes('User denied')) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes('insufficient funds')) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error(`Upgrade failed: ${error.message || error}`);
      }
    }
  };
  // Handle reinvest
  const handleReinvest = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a plan.");
      return;
    }
    if (!validateAmount(amount)) {
      toast.error(amountError || "Please enter a valid amount.");
      return;
    }
    const numAmt = Number(amount);
    const usdtBalance = Number(balances.usdt);
    if (usdtBalance < 10) {
      toast.error(`USDT balance must be at least 10. Available: $${usdtBalance.toFixed(2)}`);
      return;
    }
    if (numAmt > usdtBalance) {
      toast.error(`Insufficient USDT balance. Available: $${usdtBalance.toFixed(2)}`);
      return;
    }
    try {
      const toastId = toast.loading("Processing reinvest...");
      const result = await dispatch(
        reinvestContract({ planId: selectedPlan, amount })
      ).unwrap();
      toast.dismiss(toastId);
      toast.success(`Reinvest successful! Tx: ${result.txHash?.substring(0, 10)}...`);
      setAmount("");
      setSelectedPlan("");
      // ADDED: Refresh data after success
      fetchData();
    } catch (error) {
      toast.dismiss();
      if (error.message?.includes('User denied')) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes('insufficient funds')) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error(`Reinvest failed: ${error.message || error}`);
      }
    }
  };
  // Format address
  const formatAddress = (addr) => {
    if (!addr) return "Not Connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  const isActivateDisabled = () => {
    return (
      !isConnected ||
      activateButtonLoading ||
      !selectedPlan ||
      !amount ||
      amountError ||
      userInfo.hasUsedBuy ||
      isLoading
    );
  };
  const isUpgradeDisabled = () => {
    const withdrawableAmt = Number(balances.withdrawable);
    return (
      !isConnected ||
      upgradeButtonLoading ||
      !selectedPlan ||
      !amount ||
      amountError ||
      withdrawableAmt < 10 ||
      !userInfo.hasUsedBuy ||
      isLoading
    );
  };
  const isReinvestDisabled = () => {
    const usdtAmt = Number(balances.usdt);
    return (
      !isConnected ||
      reinvestButtonLoading ||
      !selectedPlan ||
      !amount ||
      amountError ||
      usdtAmt < 10 ||
      isLoading
    );
  };
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row mb-4">
              <div className="col-12 d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <div className="heading text-start">Activation</div>
                {isConnected && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleDeepRefresh}
                      disabled={isLoading || plansLoadTimeout}
                      title="Deep refresh - reloads all contract data"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-arrows-rotate me-1"></i>
                          Deep Refresh
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!isConnected && (
              <div className="row mb-3">
                <div className="col-12">
                  <div className="alert alert-warning d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fa-solid fa-wallet me-2"></i>
                      <span>Please connect your wallet to continue.</span>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleConnectWallet}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-plug me-1"></i>
                          Connect Wallet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error && ( // ADDED: Show error if present
              <div className="alert alert-danger mb-3">
                Error loading data: {error}
              </div>
            )}
            {plansError && !isLoading && ( // ADDED: Plans timeout error with retry
              <div className={`alert ${usingFallbackPlans ? 'alert-warning' : 'alert-danger'} d-flex justify-content-between align-items-center mb-3`}>
                <div>
                  <i className={`fa-solid ${usingFallbackPlans ? 'fa-circle-info' : 'fa-exclamation-triangle'} me-2`}></i>
                  <span>{plansError}</span>
                </div>
                <button
                  className={`btn btn-sm ${usingFallbackPlans ? 'btn-warning' : 'btn-danger'} ms-2`}
                  onClick={handleDeepRefresh}
                >
                  <i className="fa-solid fa-redo me-1"></i>
                  Retry Network
                </button>
              </div>
            )}
            {usingFallbackPlans && !plansError && (
              <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
                <div>
                  <i className="fa-solid fa-shield-alt me-2"></i>
                  <span>Using fallback plans (Network unavailable)</span>
                </div>
                <button
                  className="btn btn-sm btn-info ms-2"
                  onClick={handleDeepRefresh}
                  disabled={isLoading}
                >
                  <i className="fa-solid fa-sync me-1"></i>
                  Reconnect
                </button>
              </div>
            )}
            {isLoading && isConnected && ( // ADDED: Global loading indicator
              <div className="alert alert-info d-flex align-items-center mb-3">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading plans and balances...
              </div>
            )}
            <div className="row g-3">
              <div className="col-12">
                <div className="card card-bg custom-card p-sm-3">
                  <div className="card-header border-0 rounded-2 py-2 bg-theme1">
                    <div className="card-title fs-4 fw-bold text-white">
                      Contract Activation / Upgrade
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <span className="form-label text-white mb-0">
                        USDT Balance: ${parseFloat(balances.usdt || 0).toFixed(2)}
                      </span>
                      <div className="position-relative">
                        <div className="p-2 border rounded d-flex flex-wrap align-items-center justify-content-between gap-3 mt-1 inputg ibtext">
                          <div className="gap-2 d-flex align-items-center ">
                            <div className="d-flex justify-content-center align-items-center">
                              <span className="avatar bg-custom p-1">
                                <i className="fa-solid fa-dollar-sign text-white fs-5" />
                              </span>
                            </div>
                            <div className="fw-medium text-white text-ellipse">
                              USDT BEP-20 Address
                            </div>
                          </div>
                          <div className="text-end">
                            <a
                              href={`https://bscscan.com/address/${USDT_Address}`} // FIXED: Consistent with testnet
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white text-decoration-none"
                            >
                              {formatAddress(USDT_Address)}
                              <i className="fa-solid fa-external-link-alt ms-2 large"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="form-label text-white mb-2 d-block">
                        Withdrawable Balance: ${parseFloat(balances.withdrawable || 0).toFixed(2)}
                        {Number(balances.withdrawable) < 10 && (
                          <span className="text-danger ms-2">
                            (Min 10 USDT required for upgrade)
                          </span>
                        )}
                      </span>
                      <span className="form-label text-white mb-2 d-block">
                        Status:{" "}
                        <span className={userInfo.isActive ? "text-success fw-bold" : "text-danger fw-bold"}>
                          {userInfo.isActive ? "✓ Active" : "✗ Inactive"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <select
                  className={`form-select mb-3 ${usingFallbackPlans ? 'border-warning' : ''} ${plansError ? 'is-invalid' : ''}`}
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  disabled={getPlansToDisplay().length === 0 || activateButtonLoading || upgradeButtonLoading || reinvestButtonLoading || isLoading}
                >
                  <option value="">
                    {isLoading
                      ? "Loading plans..."
                      : getPlansToDisplay().length === 0
                      ? "No plans available"
                      : usingFallbackPlans
                      ? "Select Plan (Fallback)"
                      : "Select Plan"}
                  </option>
                  {getPlansToDisplay().map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.label}
                    </option>
                  ))}
                </select>
                <div className="card-stacking-twos card-bg card text-white px-sm-4 px-2 py-sm-3 py-2">
                  <div className="d-flex">
                    <input
                      className="form-control me-2 shadow-none"
                      placeholder="Enter Amount (Min: 10 USDT, multiple of 10)"
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={activateButtonLoading || upgradeButtonLoading || reinvestButtonLoading || isLoading}
                      step="10"
                      min="10"
                    />
                  </div>
                  {amountError && <p className="text-danger mt-2 mb-0">{amountError}</p>}
                  <div className="row align-items-center justify-content-center mt-3 mx-0">
                    <div className="col-12 d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3">
                      {!userInfo.hasUsedBuy ? (
                        <button
                          className="btn btn-primary fw-bold"
                          onClick={handleActivate}
                          disabled={isActivateDisabled()}
                        >
                          {activateButtonLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            "Activate"
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary fw-bold"
                            onClick={handleUpgrade}
                            disabled={isUpgradeDisabled()}
                            title={
                              Number(balances.withdrawable) < 10
                                ? "Withdrawable balance must be at least 10 USDT"
                                : ""
                            }
                          >
                            {upgradeButtonLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                              </>
                            ) : (
                              "Upgrade"
                            )}
                          </button>
                          <button
                            className="btn btn-primary fw-bold"
                            onClick={handleReinvest}
                            disabled={isReinvestDisabled()}
                            title={
                              Number(balances.usdt) < 10
                                ? "USDT balance must be at least 10 USDT"
                                : ""
                            }
                          >
                            {reinvestButtonLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                              </>
                            ) : (
                              "Reinvest"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {Number(balances.withdrawable) < 10 && userInfo.hasUsedBuy && (
                    <div className="alert alert-info mt-3 mb-0 py-2 small textcen">
                      <i className="fa-solid fa-info-circle me-2"></i>
                      Upgrade requires minimum 10 USDT withdrawable balance
                    </div>
                  )}
                  {Number(balances.usdt) < 10 && (
                    <div className="alert alert-info mt-3 mb-0 py-2 small textcen">
                      <i className="fa-solid fa-info-circle me-2"></i>
                      Reinvest requires minimum 10 USDT wallet balance
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ActivationContract;
