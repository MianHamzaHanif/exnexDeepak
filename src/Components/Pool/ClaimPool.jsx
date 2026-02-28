import React, { useEffect, useState } from "react";
import Web3 from "web3";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { poolContractAddress, poolContractAbi } from "../../Services/poolAddress";

const ClaimPool = () => {
  const account = useSelector((state) => state.web3State?.account || "");
  const [monthOptions, setMonthOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [poolStatus, setPoolStatus] = useState(null);
  const [salaryCycleSeconds, setSalaryCycleSeconds] = useState(0);
  const [nextMonthCompleteAt, setNextMonthCompleteAt] = useState(0);
  const [remainingToNextMonth, setRemainingToNextMonth] = useState("0d 00:00:00");
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const claimableAmount = Number(poolStatus?.claimableAmount || 0);
  const canClaim =
    !isClaiming &&
    !isStatusLoading &&
    !!account &&
    selectedMonth !== "" &&
    claimableAmount > 0;

  const formatRemainingTime = (secondsLeft) => {
    const safe = Math.max(Number(secondsLeft || 0), 0);
    const days = Math.floor(safe / 86400);
    const hours = Math.floor((safe % 86400) / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const loadMonths = async () => {
      if (!account || !window.ethereum) {
        setMonthOptions([]);
        setSelectedMonth("");
        setSalaryCycleSeconds(0);
        setNextMonthCompleteAt(0);
        return;
      }
      try {
        const web3 = window.web3 || new Web3(window.ethereum);
        const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
        const [currentMonthRaw, salaryCycleRaw, deployedAtRaw] = await Promise.all([
          poolContract.methods.getCurrentMonthId().call(),
          poolContract.methods.salaryCycle().call().catch(() => "0"),
          poolContract.methods.deployedAt().call().catch(() => "0"),
        ]);
        const currentMonth = Number(currentMonthRaw || 0);
        const salaryCycle = Number(salaryCycleRaw || 0);
        const deployedAt = Number(deployedAtRaw || 0);
        const months =
          currentMonth > 0
            ? Array.from({ length: currentMonth }, (_, idx) => currentMonth - 1 - idx)
            : [];

        const computedNextMonthCompleteAt =
          deployedAt > 0 && salaryCycle > 0
            ? deployedAt + (currentMonth + 1) * salaryCycle
            : 0;

        setMonthOptions(months);
        setSelectedMonth(months.length > 0 ? String(months[0]) : "");
        setSalaryCycleSeconds(salaryCycle);
        setNextMonthCompleteAt(computedNextMonthCompleteAt);
      } catch (error) {
        setMonthOptions([]);
        setSelectedMonth("");
        setSalaryCycleSeconds(0);
        setNextMonthCompleteAt(0);
      }
    };
    loadMonths();
  }, [account]);

  useEffect(() => {
    if (!nextMonthCompleteAt) {
      setRemainingToNextMonth("0d 00:00:00");
      return undefined;
    }

    const updateRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(nextMonthCompleteAt - now, 0);
      setRemainingToNextMonth(formatRemainingTime(remaining));
    };

    updateRemaining();
    const timerId = setInterval(updateRemaining, 1000);
    return () => clearInterval(timerId);
  }, [nextMonthCompleteAt]);

  useEffect(() => {
    const loadPoolStatus = async () => {
      if (!account || !window.ethereum || selectedMonth === "") {
        setPoolStatus(null);
        return;
      }

      try {
        setIsStatusLoading(true);
        const web3 = window.web3 || new Web3(window.ethereum);
        const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
        const status = await poolContract.methods
          .getUserExnexDeepakRewardStatus(Number(selectedMonth), account)
          .call();

        const totalPoolAmountRaw = status?.totalPoolAmount ?? status?.[1] ?? "0";
        const qualifiedCountRaw = status?.qualifiedCount ?? status?.[2] ?? "0";
        const rewardPerUserRaw = status?.rewardPerUser ?? status?.[5] ?? "0";
        const claimableAmountRaw = status?.claimableAmount ?? status?.[6] ?? "0";

        setPoolStatus({
          monthSynced: Boolean(status?.monthSynced ?? status?.[0]),
          totalPoolAmount: Number(
            web3.utils.fromWei((totalPoolAmountRaw || "0").toString(), "ether")
          ).toFixed(4),
          qualifiedCount: Number(qualifiedCountRaw || 0),
          qualified: Boolean(status?.qualified ?? status?.[3]),
          claimed: Boolean(status?.claimed ?? status?.[4]),
          rewardPerUser: Number(
            web3.utils.fromWei((rewardPerUserRaw || "0").toString(), "ether")
          ).toFixed(4),
          claimableAmount: Number(
            web3.utils.fromWei((claimableAmountRaw || "0").toString(), "ether")
          ).toFixed(4),
        });
      } catch (error) {
        setPoolStatus(null);
      } finally {
        setIsStatusLoading(false);
      }
    };

    loadPoolStatus();
  }, [account, selectedMonth]);

  const handleClaimPool = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }
    if (selectedMonth === "") {
      toast.error("Please select month");
      return;
    }
    if (claimableAmount <= 0) {
      toast.error("Claimable amount must be greater than zero");
      return;
    }
    const selectedMonthNum = Number(selectedMonth);
    if (Number.isNaN(selectedMonthNum)) {
      toast.error("Invalid selected month");
      return;
    }

    try {
      setIsClaiming(true);
      const web3 = window.web3 || new Web3(window.ethereum);
      const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
      const tx = await poolContract.methods
        .claimMonthlyReward(selectedMonthNum)
        .send({ from: account });

      if (!tx?.status) {
        throw new Error("Claim pool failed");
      }
      toast.success("Pool claimed successfully");

      // Refresh current status after claim
      const status = await poolContract.methods
        .getUserExnexDeepakRewardStatus(selectedMonthNum, account)
        .call()
        .catch(() => null);
      if (status) {
        const totalPoolAmountRaw = status?.totalPoolAmount ?? status?.[1] ?? "0";
        const qualifiedCountRaw = status?.qualifiedCount ?? status?.[2] ?? "0";
        const rewardPerUserRaw = status?.rewardPerUser ?? status?.[5] ?? "0";
        const claimableAmountRaw = status?.claimableAmount ?? status?.[6] ?? "0";
        setPoolStatus({
          monthSynced: Boolean(status?.monthSynced ?? status?.[0]),
          totalPoolAmount: Number(
            web3.utils.fromWei((totalPoolAmountRaw || "0").toString(), "ether")
          ).toFixed(4),
          qualifiedCount: Number(qualifiedCountRaw || 0),
          qualified: Boolean(status?.qualified ?? status?.[3]),
          claimed: Boolean(status?.claimed ?? status?.[4]),
          rewardPerUser: Number(
            web3.utils.fromWei((rewardPerUserRaw || "0").toString(), "ether")
          ).toFixed(4),
          claimableAmount: Number(
            web3.utils.fromWei((claimableAmountRaw || "0").toString(), "ether")
          ).toFixed(4),
        });
      }
    } catch (error) {
      toast.error(error?.message || "Claim pool failed");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row g-3">
              <div className="col-12">
                <div className="heading text-start">
                  <h2 className="pool-title mb-1">Claim Pool</h2>
                  <p className="pool-subtitle mb-0">
                    Check month status and claim your eligible pool reward.
                  </p>
                </div>
              </div>

              <div className="col-12">
                <div className="card bg-theme1 rounded-2 pool-claim-card border-0">
                  <div className="card-body">
                    <div className="row g-3 align-items-end mb-4">
                      <div className="col-lg-4 col-md-6">
                        <label className="form-label text-white mb-2">Select Month</label>
                        <select
                          className="form-select"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          <option value="" disabled>
                            Select month
                          </option>
                          {monthOptions.map((month) => (
                            <option key={month} value={month}>
                              Month {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-8 col-md-6">
                        <div className="pool-meta">
                          <span className="pool-chip">
                            Wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not Connected"}
                          </span>
                          <span className="pool-chip">
                            Selected: {selectedMonth === "" ? "-" : `Month ${selectedMonth}`}
                          </span>
                          <span className="pool-chip">
                            Next Month Complete In: {remainingToNextMonth}
                          </span>
                          <span className="pool-chip">
                            Salary Cycle: {salaryCycleSeconds || 0}s
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      {isStatusLoading ? (
                        <div className="col-12 text-white">Loading status...</div>
                      ) : poolStatus ? (
                        <>
                          <div className="col-lg-3 col-md-4 col-6">
                            <div className="pool-stat-card">
                              <p>Month Synced</p>
                              <h6>{poolStatus.monthSynced ? "Yes" : "No"}</h6>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-4 col-6">
                            <div className="pool-stat-card">
                              <p>Qualified</p>
                              <h6>{poolStatus.qualified ? "Yes" : "No"}</h6>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-4 col-6">
                            <div className="pool-stat-card">
                              <p>Claimed</p>
                              <h6>{poolStatus.claimed ? "Yes" : "No"}</h6>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-4 col-6">
                            <div className="pool-stat-card">
                              <p>Qualified Count</p>
                              <h6>{poolStatus.qualifiedCount}</h6>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div className="pool-stat-card">
                              <p>Total Pool Amount</p>
                              <h6>$ {poolStatus.totalPoolAmount}</h6>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div className="pool-stat-card">
                              <p>Reward Per User</p>
                              <h6>$ {poolStatus.rewardPerUser}</h6>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6">
                            <div className="pool-stat-card pool-stat-card-highlight">
                              <p>Claimable Amount</p>
                              <h6>$ {poolStatus.claimableAmount}</h6>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-12 text-white">No status found.</div>
                      )}
                    </div>

                    <div className="d-flex justify-content-center">
                      <button
                        className="btn pool-claim-btn px-4"
                        type="button"
                        onClick={handleClaimPool}
                        disabled={!canClaim}
                      >
                        {isClaiming ? "Processing..." : "Claim"}
                      </button>
                    </div>
                  </div>
                </div>
                <style>{`
                  .pool-title {
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: 700;
                  }
                  .pool-subtitle {
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 0.92rem;
                  }
                  .pool-claim-card .pool-meta {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    flex-wrap: wrap;
                  }
                  .pool-claim-card .pool-chip {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 999px;
                    font-size: 12px;
                    padding: 6px 12px;
                  }
                  .pool-claim-card .pool-stat-card {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    padding: 12px;
                    height: 100%;
                    color: #fff;
                  }
                  .pool-claim-card .pool-stat-card p {
                    margin: 0 0 4px;
                    font-size: 12px;
                    opacity: 0.8;
                  }
                  .pool-claim-card .pool-stat-card h6 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                  }
                  .pool-claim-card .pool-stat-card-highlight {
                    border-color: rgba(13, 110, 253, 0.5);
                    background: rgba(13, 110, 253, 0.12);
                  }
                  .pool-claim-btn {
                    background: linear-gradient(90deg, #0d6efd, #0b5ed7);
                    border: 0;
                    color: #fff;
                    font-weight: 600;
                    min-width: 150px;
                    border-radius: 8px;
                  }
                  .pool-claim-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClaimPool;
