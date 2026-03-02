import React, { useEffect, useState } from "react";
import Web3 from "web3";
import toast from "react-hot-toast";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { useSelector } from "react-redux";
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from "../../Services/exnexDeepakAddress";
import {
  poolContractAddress,
  poolContractAbi,
} from "../../Services/poolAddress";

const ClaimSalary = () => {
  const web3State = useSelector((state) => state.web3State);
  const account = web3State?.account || "";
  const [salaryEarned, setSalaryEarned] = useState("0.0000");
  const [approvedPendingSalary, setApprovedPendingSalary] = useState("0.0000");
  const [claimedSalary, setClaimedSalary] = useState("0.0000");
  const [salaryPreview, setSalaryPreview] = useState(null);
  const [salaryCompletionAt, setSalaryCompletionAt] = useState(0);
  const [remainingToComplete, setRemainingToComplete] = useState("0d 00:00:00");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const actionBtnStyle = {
    width: "170px",
    height: "42px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const resetSalaryState = () => {
    setSalaryEarned("0.0000");
    setApprovedPendingSalary("0.0000");
    setClaimedSalary("0.0000");
    setSalaryPreview(null);
    setSalaryCompletionAt(0);
    setRemainingToComplete("0d 00:00:00");
  };

  const toAmount = (web3, raw) => {
    const parsed = Number(web3.utils.fromWei((raw || "0").toString(), "ether"));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatRemainingTime = (secondsLeft) => {
    const safe = Math.max(Number(secondsLeft || 0), 0);
    const days = Math.floor(safe / 86400);
    const hours = Math.floor((safe % 86400) / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const loadSalaryData = async () => {
    if (!account || !window.ethereum) {
      resetSalaryState();
      return;
    }

    try {
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);

      const [salaryRaw, approvedPendingRaw, previewRaw, windowRaw, salaryCycleRaw] = await Promise.all([
        contract.methods.userSalaryEarned(account).call().catch(() => "0"),
        poolContract.methods.getUserPendingApprovedSalary(account).call().catch(() => null),
        contract.methods.getSalaryRequestPreview(account).call().catch(() => null),
        contract.methods
          .getSalaryRequestPreviewWithWindow(account)
          .call()
          .catch(() => null),
        contract.methods.salaryCycle().call().catch(() => "0"),
      ]);

      const previewMonthId = Number(previewRaw?.monthId ?? previewRaw?.[0] ?? 0);
      const previewMonthCompleted = Boolean(
        previewRaw?.monthCompleted ?? previewRaw?.[1]
      );
      const previewRank = Number(previewRaw?.rank ?? previewRaw?.[2] ?? 0);
      const previewRewardRaw = previewRaw?.reward ?? previewRaw?.[3] ?? "0";
      const previewReward = toAmount(web3, previewRewardRaw);
      const previewEligible = Boolean(previewRaw?.eligible ?? previewRaw?.[4]);
      const previewApproved = Boolean(previewRaw?.approved ?? previewRaw?.[5]);
      const previewClaimed = Boolean(previewRaw?.claimed ?? previewRaw?.[6]);
      const approvedPendingRawAmount =
        approvedPendingRaw?.totalAmount ?? approvedPendingRaw?.[0] ?? "0";

      setSalaryPreview({
        monthId: previewMonthId,
        monthCompleted: previewMonthCompleted,
        rank: previewRank,
        reward: previewReward.toFixed(4),
        eligible: previewEligible,
        approved: previewApproved,
        claimed: previewClaimed,
      });

      const onChainEarned = toAmount(web3, salaryRaw);
      const approvedValue = toAmount(web3, approvedPendingRawAmount);

      setSalaryEarned(previewReward.toFixed(4));
      setApprovedPendingSalary(approvedValue.toFixed(4));
      setClaimedSalary(onChainEarned.toFixed(4));

      const startAt = Number(windowRaw?.startAt ?? windowRaw?.[0] ?? 0);
      const nextWindowAt = Number(windowRaw?.nextWindowAt ?? windowRaw?.[1] ?? 0);
      const salaryCycle = Number(salaryCycleRaw || 0);
      const computedCompletionAt =
        nextWindowAt > 0
          ? nextWindowAt
          : startAt > 0 && salaryCycle > 0
            ? startAt + salaryCycle
            : 0;

      setSalaryCompletionAt(computedCompletionAt);

    } catch (error) {
      resetSalaryState();
    }
  };

  useEffect(() => {
    if (!salaryCompletionAt) {
      setRemainingToComplete("0d 00:00:00");
      return undefined;
    }

    const updateRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(salaryCompletionAt - now, 0);
      setRemainingToComplete(formatRemainingTime(remaining));
    };

    updateRemaining();
    const timerId = setInterval(updateRemaining, 1000);
    return () => clearInterval(timerId);
  }, [salaryCompletionAt]);

  useEffect(() => {
    const fetchSalaryData = async () => {
      await loadSalaryData();
    };

    fetchSalaryData();
  }, [account, web3State?.lastUpdated]);

  const handleClaimSalary = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }

    const approvedValue = Number(approvedPendingSalary || 0);
    if (!Number.isFinite(approvedValue) || approvedValue <= 0) {
      toast.error("Approved salary should be greater than 0");
      return;
    }

    try {
      setIsClaiming(true);
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const tx = await contract.methods
        .claimMonthlySalary()
        .send({ from: account });

      if (!tx?.status) {
        throw new Error("Claim salary failed");
      }
      toast.success("Salary claimed successfully");
      await loadSalaryData();
    } catch (error) {
      toast.error(error?.message || "Claim salary failed");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleRequestSalary = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }

    const salaryValue = Number(salaryEarned || 0);
    if (!Number.isFinite(salaryValue) || salaryValue <= 0) {
      toast.error("Salary earned should be greater than 0");
      return;
    }

    try {
      setIsRequesting(true);
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const tx = await contract.methods.requestMonthlySalary().send({ from: account });

      if (!tx?.status) {
        throw new Error("Salary request failed");
      }

      toast.success("Salary requested successfully");
      await loadSalaryData();
    } catch (error) {
      toast.error(error?.message || "Salary request failed");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRefreshSalary = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }

    try {
      setIsRefreshing(true);
      await loadSalaryData();
      toast.success("Data refreshed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="app-wrapper ClaimSalaryPage">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row g-3">
              <div className="col-12">
                <div className="heading text-start d-flex justify-content-between align-items-center">
                  <span>Claim Salary</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-info"
                    onClick={handleRefreshSalary}
                    disabled={isRefreshing || !account || isRequesting || isClaiming}
                    title="Refresh"
                  >
                    <i className="fa-solid fa-rotate-right" />
                  </button>
                </div>
              </div>

              <div className="col-12">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6 className="card-title">Salary Earned</h6>
                        <h3 className="mb-0">$ {salaryEarned}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6 className="card-title">Approved</h6>
                        <h3 className="mb-0">$ {approvedPendingSalary}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6 className="card-title">Claimed Salary</h6>
                        <h3 className="mb-0">$ {claimedSalary}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="row g-3">
                  {/* <div className="col-md-3">
                    <div className="card bg-theme1 text-white border-0">
                      <div className="card-body">
                        <h6 className="card-title">Preview Month</h6>
                        <h5 className="mb-0">{salaryPreview?.monthId ?? 0}</h5>
                      </div>
                    </div>
                  </div> */}
                  <div className="col-md-3">
                    <div className="card bg-theme1 text-white border-0">
                      <div className="card-body">
                        <h6 className="card-title">Rank</h6>
                        <h5 className="mb-0">{salaryPreview?.rank ?? 0}</h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-theme1 text-white border-0">
                      <div className="card-body">
                        <h6 className="card-title">Reward</h6>
                        <h5 className="mb-0">$ {salaryPreview?.reward ?? "0.0000"}</h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-theme1 text-white border-0">
                      <div className="card-body">
                        <h6 className="card-title">Time Remaining</h6>
                        <h6 className="mb-0">{remainingToComplete}</h6>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-theme1 text-white border-0">
                      <div className="card-body">
                        <h6 className="card-title">Status</h6>
                        <h6 className="mb-0">
                          {salaryPreview?.claimed
                            ? "Claimed"
                            : salaryPreview?.approved
                              ? "Approved"
                              : salaryPreview?.eligible
                                ? "Eligible"
                                : "Pending"}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="text-center py-2">
                  <button
                    type="button"
                    className="btn salary-action-btn me-2"
                    style={actionBtnStyle}
                    onClick={handleRequestSalary}
                    disabled={isRequesting || !account || Number(salaryEarned || 0) <= 0}
                  >
                    {isRequesting ? "Requesting..." : "Request Salary"}
                  </button>
                  <button
                    type="button"
                    className="btn salary-action-btn"
                    style={actionBtnStyle}
                    onClick={handleClaimSalary}
                    disabled={
                      isClaiming ||
                      !account ||
                      isRequesting ||
                      isRefreshing ||
                      Number(approvedPendingSalary || 0) <= 0
                    }
                  >
                    {isClaiming ? "Processing..." : "Claim Salary"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClaimSalary;
