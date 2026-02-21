import React, { useEffect, useState, useRef, useCallback } from "react";
import "./Dash.css";
import "./responsive.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Product from "../DashboardPage/Product";
import OrdersDetails from "../DashboardPage/OrdersDetails";
import InvestmentTimer from "../DashboardPage/InvestmentTimer";
import { useDispatch, useSelector } from "react-redux";
import Web3 from "web3";
import {
  fetchDashboardData,
  connectWallet,
  fetchContractData,
} from "../../Redux/Web3Slice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OverviewStats from "./NewDashboard/Overview/OverviewStats";
import TradingViewChart from "../Trading/TradingViewChart";
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from "../../Services/exnexDeepakAddress";
import {
  tokenAddress as TokenAddress,
  tokenAbi as TokenAbi,
} from "../../Services/tokenAddress";

const UPGRADE_OPTIONS = ["50", "100"];

const toBaseUnits = (amount, decimals) => {
  const [whole = "0", fraction = ""] = String(amount).split(".");
  const safeFraction = fraction.slice(0, decimals).padEnd(decimals, "0");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "") || "0";
  return `${normalizedWhole}${safeFraction}`.replace(/^0+(?=\d)/, "") || "0";
};
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const web3State = useSelector((state) => state.web3State);
  const auth = useSelector((state) => state.UserAuth);
  const dashboardData = web3State.dashboardData || {};
  const planSummaries = dashboardData.planSummaries || {};
  const [onChainDirect, setOnChainDirect] = useState(null);
  const [onChainTeam, setOnChainTeam] = useState(null);
  const [onChainDirectIncome, setOnChainDirectIncome] = useState(null);
  const [onChainLevelIncome, setOnChainLevelIncome] = useState(null);
  const [onChainWalletBalance, setOnChainWalletBalance] = useState(null);
  const [onChainUserTopUp, setOnChainUserTopUp] = useState(null);
  const [onChainTotalWithdrawn, setOnChainTotalWithdrawn] = useState(null);
  const [onChainRoiLevelIncome, setOnChainRoiLevelIncome] = useState(null);
  const [onChainWithdrawLevelIncome, setOnChainWithdrawLevelIncome] = useState(null);
  const [onChainSalaryIncome, setOnChainSalaryIncome] = useState(null);
  const [onChainLevelIncomeByLevel, setOnChainLevelIncomeByLevel] = useState([]);
  const [selectedUpgradeAmount, setSelectedUpgradeAmount] = useState("50");
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const levelCounts = Array.isArray(dashboardData.levelCounts)
    ? dashboardData.levelCounts
    : [];
  const myDirectCount = Number(
    onChainDirect ?? dashboardData.directReferrals ?? levelCounts[0] ?? 0
  );
  const myTeamCount = Number(
    onChainTeam ??
      dashboardData.myTeamCount ??
      levelCounts.slice(0, 10).reduce((sum, count) => sum + Number(count || 0), 0)
  );
  const directIncomeValue =
    onChainDirectIncome ?? dashboardData.directReferralIncome ?? "0.00";
  const levelIncomeValue =
    onChainLevelIncome ?? dashboardData.levelIncome ?? "0.00";
  const totalDepositedValue =
    onChainUserTopUp ?? Number(dashboardData.totalInvested || 0).toFixed(2);
  const totalWithdrawnValue =
    onChainTotalWithdrawn ?? Number(dashboardData.totalWithdrawn || 0).toFixed(2);
  const totalRoiLevelIncomeValue = onChainRoiLevelIncome ?? "0.00";
  const totalWithdrawLevelIncomeValue = onChainWithdrawLevelIncome ?? "0.00";
  const totalSalaryIncomeValue = onChainSalaryIncome ?? "0.00";
  const tokenSymbol = web3State.balances?.symbol || "USDT";
  const parsedWalletTokenBalance = Number(
    onChainWalletBalance ?? web3State.balances?.usdt ?? 0
  );
  const walletTokenBalance = Number.isFinite(parsedWalletTokenBalance)
    ? parsedWalletTokenBalance.toFixed(2)
    : "0.00";
  const parsedTotalSupply = Number(web3State.balances?.totalSupply ?? 0);
  const totalTokenSupply = Number.isFinite(parsedTotalSupply)
    ? parsedTotalSupply.toFixed(2)
    : "0.00";
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasInitialFetch = useRef(false);
  const autoRefreshIntervalRef = useRef(null);
  const lastDashboardFetchRef = useRef(0); // OPTIMIZATION: Track last fetch time

  // OPTIMIZATION: Initial load with guards to prevent race conditions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Guard 1: Check auth
        if (!auth.isAuth) {
          console.log("Dashboard: Not authenticated");
          navigate("/");
          return;
        }

        // Guard 2: Prevent duplicate initialization
        if (hasInitialFetch.current) {
          console.log("Dashboard: Already initialized");
          return;
        }

        hasInitialFetch.current = true;

        // Guard 3: Connect wallet if needed
        if (!web3State.isConnected) {
          console.log("Dashboard: Connecting wallet...");
          try {
            await dispatch(connectWallet()).unwrap();
          } catch (error) {
            console.error(
              "Dashboard: Wallet connection failed:",
              error.message,
            );
            toast.error("Failed to connect wallet. Please try again.");
            hasInitialFetch.current = false;
            return;
          }
        }

        // Guard 4: Fetch contract data first (plans, balances, etc.)
        // OPTIMIZATION: This call will be coalesced if multiple components request it
        console.log("Dashboard: Fetching contract data...");
        try {
          await dispatch(fetchContractData());
        } catch (error) {
          console.error(
            "Dashboard: Contract data fetch failed:",
            error.message,
          );
          toast.error("Failed to fetch contract data");
          hasInitialFetch.current = false;
          return;
        }

        // Guard 5: Fetch dashboard data
        console.log("Dashboard: Fetching dashboard data...");
        try {
          await dispatch(fetchDashboardData());
          lastDashboardFetchRef.current = Date.now();
          console.log("Dashboard: Initial load complete");
        } catch (error) {
          console.error(
            "Dashboard: Dashboard data fetch failed:",
            error.message,
          );
          toast.error("Failed to fetch dashboard data");
          hasInitialFetch.current = false;
        }
      } catch (error) {
        console.error(
          "Dashboard: Unexpected error during initialization:",
          error,
        );
        hasInitialFetch.current = false;
        toast.error("An unexpected error occurred");
      }
    };

    // Only run once on mount
    if (!hasInitialFetch.current && auth.isAuth) {
      loadData();
    }

    // OPTIMIZATION: Auto-refresh every 5 seconds, but only actually fetch every 10+ seconds
    if (web3State.isConnected && hasInitialFetch.current) {
      autoRefreshIntervalRef.current = setInterval(() => {
        if (web3State.isLoading) {
          console.log("Dashboard: Skipping refresh, already loading");
          return;
        }

        const timeSinceLastFetch = Date.now() - lastDashboardFetchRef.current;

        // Only fetch if more than 10 seconds have passed since last fetch
        if (timeSinceLastFetch > 10000) {
          console.log("Dashboard: Auto-refreshing (smart fetch)");
          setIsRefreshing(true);
          Promise.all([
            dispatch(fetchContractData()),
            dispatch(fetchDashboardData()),
          ])
            .catch((err) =>
              console.warn("Dashboard: Auto-refresh failed:", err.message),
            )
            .finally(() => {
              setIsRefreshing(false);
              lastDashboardFetchRef.current = Date.now();
            });
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [
    dispatch,
    auth.isAuth,
    navigate,
    web3State.isConnected,
    web3State.isLoading,
  ]);

  // OPTIMIZATION: Smart refresh that debounces and checks timing
  const handleRefresh = useCallback(() => {
    const timeSinceLastFetch = Date.now() - lastDashboardFetchRef.current;

    // Prevent rapid consecutive refreshes
    if (timeSinceLastFetch < 2000) {
      toast.info("Please wait before refreshing again", { duration: 2000 });
      return;
    }

    setIsRefreshing(true);
    dispatch(fetchDashboardData()).finally(() => {
      setIsRefreshing(false);
      lastDashboardFetchRef.current = Date.now();
    });
  }, [dispatch]);

  const handleUpgradePackage = async () => {
    if (!web3State.isConnected || !web3State.account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }

    try {
      setIsUpgradeLoading(true);
      const toastId = toast.loading("Processing upgrade...");
      const web3 = window.web3 || new Web3(window.ethereum);
      const mainContract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const tokenContract = new web3.eth.Contract(TokenAbi, TokenAddress);

      // Pre-check: upgrade only when active cycle last index (closed) is true
      const activeCycle = await mainContract.methods
        .getActivePackageCycle(web3State.account)
        .call()
        .catch(() => null);

      const canUpgrade = Boolean(activeCycle?.closed ?? activeCycle?.[7] ?? false);
      if (!canUpgrade) {
        toast.dismiss(toastId);
        toast.error("Please claim ROI first and upgrade only after 25 days are completed.");
        return;
      }

      const decimalsRaw = await tokenContract.methods.decimals().call().catch(() => "18");
      const decimals = Number(decimalsRaw || 18);
      const amountInBaseUnits = toBaseUnits(selectedUpgradeAmount, decimals);

      const allowanceRaw = await tokenContract.methods
        .allowance(web3State.account, ContractAddress_Main)
        .call();

      if (BigInt(allowanceRaw || "0") < BigInt(amountInBaseUnits)) {
        await tokenContract.methods
          .approve(ContractAddress_Main, amountInBaseUnits)
          .send({ from: web3State.account });
      }

      const tx = await mainContract.methods
        .depositTopUp(amountInBaseUnits)
        .send({ from: web3State.account });

      if (!tx?.status) {
        throw new Error("Topup failed");
      }

      toast.dismiss(toastId);
      toast.success("Upgradeable package updated successfully");
      await Promise.all([dispatch(fetchContractData()), dispatch(fetchDashboardData())]);
    } catch (error) {
      console.error("Upgrade package failed:", error);
      toast.error(error?.message || "Upgradeable package failed");
    } finally {
      setIsUpgradeLoading(false);
    }
  };

  // Compute total earnings for proportion (optional, if you want dynamic bars)
  const totalEarnings =
    Object.values(planSummaries).reduce((sum, p) => sum + p.earnings, 0) || 1; // Avoid divide by zero
  // NEW: Referral link
  const referralLink = `${window.location.origin}/signup?ref=${web3State.account}`;
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  useEffect(() => {
    const fetchDirectAndTeam = async () => {
      if (!web3State.isConnected || !web3State.account || !window.ethereum) {
        setOnChainDirect(null);
        setOnChainTeam(null);
        setOnChainDirectIncome(null);
        setOnChainLevelIncome(null);
        setOnChainWalletBalance(null);
        setOnChainUserTopUp(null);
        setOnChainTotalWithdrawn(null);
        setOnChainRoiLevelIncome(null);
        setOnChainWithdrawLevelIncome(null);
        setOnChainSalaryIncome(null);
        setOnChainLevelIncomeByLevel([]);
        return;
      }

      try {
        const web3 = window.web3 || new Web3(window.ethereum);
        const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
        const countsRaw = await Promise.all(
          Array.from({ length: 10 }, (_, idx) =>
            contract.methods
              .getLevelCount(web3State.account, idx + 1)
              .call()
              .catch(() => "0")
          )
        );
        const counts = countsRaw.map((v) => Number(v || 0));
        setOnChainDirect(counts[0] || 0);
        setOnChainTeam(counts.reduce((sum, v) => sum + v, 0));

        const directIncomeRaw = await contract.methods
          .userDirectIncome(web3State.account)
          .call()
          .catch(() => "0");
        const directIncomeFormatted = web3.utils.fromWei(
          (directIncomeRaw || "0").toString(),
          "ether"
        );
        setOnChainDirectIncome(Number(directIncomeFormatted).toFixed(2));

        const levelIncomeRaw = await contract.methods
          .userLevelIncome(web3State.account)
          .call()
          .catch(() => "0");
        const levelIncomeFormatted = web3.utils.fromWei(
          (levelIncomeRaw || "0").toString(),
          "ether"
        );
        setOnChainLevelIncome(Number(levelIncomeFormatted).toFixed(2));

        const levelIncomeByLevelRaw = await Promise.all(
          Array.from({ length: 10 }, (_, idx) =>
            contract.methods
              .userLevelIncomeByLevel(web3State.account, idx + 1)
              .call()
              .catch(() => "0")
          )
        );
        setOnChainLevelIncomeByLevel(
          levelIncomeByLevelRaw.map((value) =>
            Number(
              web3.utils.fromWei((value || "0").toString(), "ether")
            ).toFixed(2)
          )
        );

        const userTopUpRaw = await contract.methods
          .userTopUp(web3State.account)
          .call()
          .catch(() => "0");
        const userTopUpFormatted = web3.utils.fromWei(
          (userTopUpRaw || "0").toString(),
          "ether"
        );
        setOnChainUserTopUp(Number(userTopUpFormatted).toFixed(2));

        const totalWithdrawnRaw = await contract.methods
          .userTotalWithdrawn(web3State.account)
          .call()
          .catch(() => "0");
        const totalWithdrawnFormatted = web3.utils.fromWei(
          (totalWithdrawnRaw || "0").toString(),
          "ether"
        );
        setOnChainTotalWithdrawn(Number(totalWithdrawnFormatted).toFixed(2));

        const [roiLevelIncomeRaw, withdrawLevelIncomeRaw, salaryIncomeRaw] =
          await Promise.all([
            contract.methods
              .userRoiLevelIncome(web3State.account)
              .call()
              .catch(() => "0"),
            contract.methods
              .userWithdrawalLevelIncome(web3State.account)
              .call()
              .catch(() => "0"),
            contract.methods
              .userSalaryEarned(web3State.account)
              .call()
              .catch(() => "0"),
          ]);

        setOnChainRoiLevelIncome(
          Number(
            web3.utils.fromWei((roiLevelIncomeRaw || "0").toString(), "ether")
          ).toFixed(2)
        );
        setOnChainWithdrawLevelIncome(
          Number(
            web3.utils.fromWei((withdrawLevelIncomeRaw || "0").toString(), "ether")
          ).toFixed(2)
        );
        setOnChainSalaryIncome(
          Number(
            web3.utils.fromWei((salaryIncomeRaw || "0").toString(), "ether")
          ).toFixed(2)
        );

        const tokenContract = new web3.eth.Contract(TokenAbi, TokenAddress);
        const [walletBalanceRaw, tokenDecimalsRaw] = await Promise.all([
          tokenContract.methods.balanceOf(web3State.account).call(),
          tokenContract.methods.decimals().call().catch(() => "18"),
        ]);
        const tokenDecimals = Number(tokenDecimalsRaw || 18);
        const divisor = 10 ** tokenDecimals;
        const formattedWalletBalance = Number(walletBalanceRaw || 0) / divisor;
        setOnChainWalletBalance(
          Number.isFinite(formattedWalletBalance)
            ? formattedWalletBalance.toFixed(2)
            : "0.00"
        );
      } catch (error) {
        console.error("Dashboard direct/team fetch failed:", error);
      }
    };

    fetchDirectAndTeam();
  }, [web3State.isConnected, web3State.account, web3State.lastUpdated]);
  return (
    <>
      <div className="app-wrapper Dashboardpage">
        <>
          <Sidebar></Sidebar>
          <div className="app-content">
            <Header></Header>
            <main>
              <div className="container-fluid mt-3 px-0 px-sm-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Dashboard</h4>
                  {web3State.isConnected && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleRefresh}
                      disabled={isRefreshing || web3State.isLoading}
                      title="Refresh data"
                    >
                      <i
                        className={`fa-solid fa-sync ${isRefreshing || web3State.isLoading ? "fa-spin" : ""}`}
                      ></i>
                      {(isRefreshing || web3State.isLoading) && (
                        <span className="ms-2">Loading...</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Loading State */}
                {web3State.isLoading && (
                  <div className="alert alert-info mb-3">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading dashboard data...
                  </div>
                )}

                {!web3State.isConnected ? (
                  <div className="alert alert-warning text-center">
                    <p className="mb-2">
                      Please connect your wallet to view dashboard
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => dispatch(connectWallet())}
                      disabled={web3State.isConnecting}
                    >
                      {web3State.isConnecting
                        ? "Connecting..."
                        : "Connect Wallet"}
                    </button>
                  </div>
                ) : (
                  // OLd Dashboard code - can be removed after new dashboard is fully tested
                  <div className="row d-none">
                    <div className="col-sm-6 col-lg-4 col-xxl-2 order--1-lg">
                      <div className="row mx-sm-0">
                        <div className="col-12">
                          <div className="card orders-provided-card">
                            <div className="card-body">
                              <i className="ph-bold ph-circle circle-bg-img" />
                              <div>
                                <p className="f-s-18 f-w-600 text-dark txt-ellipsis-1">
                                  📈 Deposit Amount
                                </p>
                                <h2 className="text-white mb-0">
                                  ${dashboardData.depositAmount || "0.00"}
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 ">
                          <div className="card bg-primary-300 product-sold-card">
                            <div className="card-body">
                              <div>
                                <h5 className="text-primary-dark f-w-600">
                                  Trading Income
                                </h5>
                                {/* <p className="text-dark f-w-600 mb-0 mt-2 txt-ellipsis-1">
                                  Current Earnings
                                </p> */}
                              </div>
                              <div className="my-4">
                                <h4 className="text-primary-dark"></h4>
                              </div>
                              <div className="custom-progress-container">
                                <div
                                  className="progress-bar productive"
                                  style={{
                                    width: `${(planSummaries[30]?.earnings / totalEarnings) * 100}%`,
                                  }}
                                />
                                <div
                                  className="progress-bar middle"
                                  style={{
                                    width: `${(planSummaries[60]?.earnings / totalEarnings) * 100}%`,
                                  }}
                                />
                                <div
                                  className="progress-bar idle"
                                  style={{
                                    width: `${(planSummaries[90]?.earnings / totalEarnings) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="progress-labels">
                                <span>
                                  30 days
                                  <br />
                                </span>
                                <span>
                                  60 days
                                  <br />
                                </span>
                                <span>
                                  90 days
                                  <br />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4 col-xxl-2 order--1-lg ">
                      <div className="row mx-sm-0 align-items-center">
                        <div className="col-12 d-none">
                          <Product />
                        </div>
                        <div className="col-12"></div>
                      </div>
                    </div>
                    <div className="col-md-5 col-lg-4 col-xxl-3 order--1-lg">
                      <OrdersDetails />
                    </div>
                    <div className="col-md-7 col-lg-5">
                      <div className="p-3">
                        <h5>My Team</h5>
                      </div>
                      <div className="card maincard">
                        <div className="card-body">
                          <ul className="customer-list badegebg">
                            {(
                              dashboardData.levelCounts || Array(11).fill(0)
                            ).map((count, index) => (
                              <li
                                key={index}
                                className="customer-list-item my-3"
                              >
                                <span
                                  className={`text-light-${index % 4 === 0 ? "primary" : index % 4 === 1 ? "danger" : index % 4 === 2 ? "warning" : "info"} f-w-600 h-30 w-30 d-flex-center b-r-50 customer-list-avtar`}
                                >
                                  {index + 1}
                                </span>
                                <div className="customer-list-content">
                                  <h6 className="mb-0 text-black">
                                    Level {index + 1}
                                  </h6>
                                </div>
                                <div>
                                  <span
                                    className={`badge text-light-${index % 4 === 0 ? "primary" : index % 4 === 1 ? "danger" : index % 4 === 2 ? "warning" : "info"} f-s-12 f-w-700`}
                                  >
                                    {count}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Referral Link Section */}
                    <div className="col-12 mt-4"></div>

                    <div className="px-3 row">
                      <div className="d-flex flex-column gap-3 col-md-9"></div>
                    </div>
                  </div>
                  // OLd Dashboard code - can be removed after new dashboard is fully tested
                )}
              </div>
              {/************************************ New Dashboard code start *******************************************/}

              <div className="container-fluid mt-3 px-0 px-sm-2">
                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-main">
                        User ID: {dashboardData.userId || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card maincard">
                      <div className="card-header bg-black text-white">
                        <h5 className="text-white pb-2">Your Referral Link</h5>
                      </div>
                      <div className="card-body">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={referralLink}
                            readOnly
                          />
                          <button
                            className="btn btn-primary"
                            onClick={copyReferralLink}
                          >
                            <i className="fa-solid fa-copy"></i> Copy
                          </button>
                        </div>
                        <small className="text-white mt-2 d-block">
                          Share this link to invite new users. They will
                          automatically have you as their referrer.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <div className="header-section mb-2">
                      <div className="row mx-0 align-items-center gy-4">
                        <div className="col-lg-12 col-md-12 d-flex gap-3 flex-column">
                          <div className="row">
                            <h2 className="header-title col-12 col-md-6">
                              Overall Portfolio
                            </h2>
                            <div className="col-lg-6 col-md-12 d-flex gap-3 justify-content-end">
                              <a href="/Withdrawal" className="btn-outline">
                                Withdraw
                              </a>
                              {/* <a
                                href="/activationContract"
                                className="btn-fill"
                              >
                                Activation
                              </a> */}
                            </div>
                          </div>
                          <div className="row stats-row g-2">
                            <div className="col-3">
                              <p className="label">
                                Total Deposit <span className="up"> &#9650;</span>
                              </p>
                              <h3>$ {totalDepositedValue}</h3>
                            </div>
                            <div className="col-3">
                              <p className="label">
                                My Team <span className="up"> &#9650;</span>
                              </p>
                              <h3>{myTeamCount}</h3>
                            </div>
                            <div className="col-3">
                              <p className="label">
                                Direct Income <span className="up"> &#9650;</span>
                              </p>
                              <h3>$ {directIncomeValue}</h3>
                            </div>
                            <div className="col-3">
                              <p className="label">
                                Level Income <span className="up"> &#9650;</span>
                              </p>
                              <h3>$ {levelIncomeValue}</h3>
                            </div>
                          </div>
                          <div className="row stats-row g-2 mt-0">
                            <div className="col-md-4 col-4">
                              <p className="label">
                                Total ROI Level Income <span className="up"> &#9650;</span>
                              </p>
                              <h3>$ {totalRoiLevelIncomeValue}</h3>
                            </div>
                            <div className="col-md-4 col-4">
                              <p className="label">
                                Total Withdraw Level Income <span className="up"> &#9650;</span>
                              </p>
                              <h3>$ {totalWithdrawLevelIncomeValue}</h3>
                            </div>
                            <div className="col-md-4 col-4">
                              <p className="label">
                                Total Salary Income <span className="up"> &#9650;</span>
                              </p>
                              <h3>$ {totalSalaryIncomeValue}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="card maincard">
                          <div className="card-body">
                            <h5 className="text-white mb-3">Upgradeable Package</h5>
                            <div className="d-flex gap-2 flex-wrap">
                              <select
                                className="form-select"
                                style={{ maxWidth: "220px" }}
                                value={selectedUpgradeAmount}
                                onChange={(e) => setSelectedUpgradeAmount(e.target.value)}
                              >
                                {UPGRADE_OPTIONS.map((value) => (
                                  <option key={value} value={value}>
                                    {value} USDT
                                  </option>
                                ))}
                              </select>
                              <button
                                className="btn btn-primary"
                                onClick={handleUpgradePackage}
                                disabled={isUpgradeLoading}
                              >
                                {isUpgradeLoading ? "Processing..." : "Upgrade Package"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row align-items-center g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3">
                      <h5>Level Incomes</h5>
                    </div>
                    <div className="card maincard overflow-hidden">
                      <div className="card-body px-0 pt-0">
                        <div className="table-responsive app-scroll dashtable overflow-x-hidden Dashtable">
                          <table className="table align-middle top-products-table mb-0">
                            <thead>
                              <tr>
                                <th className="bg-black text-white" scope="col">
                                  Sr.no
                                </th>
                                <th className="bg-black text-white" scope="col">
                                  Level
                                </th>
                                <th className="bg-black text-white" scope="col">
                                  Income
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(
                                onChainLevelIncomeByLevel.length
                                  ? onChainLevelIncomeByLevel
                                  : (dashboardData.levelIncomes || Array(10).fill("0.00")).slice(0, 10)
                              ).map((income, index) => (
                                <tr key={index}>
                                  <td className="bg-transparent">
                                    <div className="d-flex align-items-center">
                                      <h6 className="mb-0 text-white">
                                        {index + 1}
                                      </h6>
                                    </div>
                                  </td>
                                  <td className="f-w-600 text-white bg-transparent">
                                    Level {index + 1}
                                  </td>
                                  <td className="bg-transparent badegebg">
                                    <span
                                      className={`badge text-light-${index % 4 === 0 ? "success" : index % 4 === 1 ? "danger" : index % 4 === 2 ? "primary" : "danger"} f-s-12 f-w-700`}
                                    >
                                      ${income}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 exnex-trans-wrap">
                    <div className="exnex-trans-header">
                      <h5>Transactions</h5>
                    </div>

                    <div className="exnex-trans-card py-4">
                      <div className="exnex-trans-grid">
                        <div className="exnex-trans-item exnex-info">
                          <span>Total Deposited</span>
                          <h3>$ {totalDepositedValue}</h3>
                        </div>

                        <div className="exnex-trans-item exnex-primary">
                          <span>Total Withdrawn</span>
                          <h3>$ {totalWithdrawnValue}</h3>
                        </div>

                        <div className="exnex-trans-item exnex-danger">
                          <span>My Wallet Balance</span>
                          <h3>{walletTokenBalance} {tokenSymbol}</h3>
                          {/* <small className="d-block mt-1">
                            Total Supply: {totalTokenSupply} {tokenSymbol}
                          </small> */}
                        </div>

                        {/* <div className="exnex-trans-item exnex-warning">
                          <span>Withdrawable</span>
                          <h3>
                            $
                            {parseFloat(
                              dashboardData.withdrawalBalance,
                            ).toFixed(2) || "0.00"}
                          </h3>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </>
      </div>
    </>
  );
};
export default Dashboard;


