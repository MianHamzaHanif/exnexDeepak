/* eslint-disable no-unused-vars */
// src/Components/Withdrawal/Withdrawal.jsx 
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { useDispatch, useSelector } from "react-redux";
import Web3 from "web3";
import { fetchDashboardData, connectWallet, fetchContractData } from "../../Redux/Web3Slice";
import toast from "react-hot-toast";
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from "../../Services/exnexDeepakAddress";

const Withdrawal = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const [pendingRoiBalance, setPendingRoiBalance] = useState("0.0000");
  const [onChainTotalWithdrawn, setOnChainTotalWithdrawn] = useState("0.0000");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Memoize values to prevent unnecessary re-renders
  const { account, balances, dashboardData } = useMemo(() => ({
    account: web3State.account,
    balances: web3State.balances || {},
    dashboardData: web3State.dashboardData || {},
  }), [web3State.account, web3State.balances, web3State.dashboardData]);

  // Format amount to 4 decimal places
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(4);
  };

  // Fetch data immediately on mount
  useEffect(() => {
    const loadData = async () => {
      if (!web3State.isConnected) {
        try {
          await dispatch(connectWallet()).unwrap();
        } catch (error) {
          toast.error("Failed to connect wallet");
          return;
        }
      }
      // Fetch both for complete data
      await dispatch(fetchContractData());
      dispatch(fetchDashboardData());
    };
    loadData();
  }, [dispatch, web3State.isConnected]);

  // NEW: Auto-refresh every 3 seconds if connected
  useEffect(() => {
    if (web3State.isConnected) {
      const interval = setInterval(() => {
        dispatch(fetchContractData());
        dispatch(fetchDashboardData());
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [dispatch, web3State.isConnected]);

  useEffect(() => {
    const fetchPendingRoi = async () => {
      if (!web3State.isConnected || !account || !window.ethereum) {
        setPendingRoiBalance("0.0000");
        setOnChainTotalWithdrawn("0.0000");
        return;
      }

      try {
        const web3 = window.web3 || new Web3(window.ethereum);
        const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
        const pendingRoiRaw = await contract.methods
          .getTotalPendingRoi(account)
          .call();
        const pendingRoi = web3.utils.fromWei(
          (pendingRoiRaw || "0").toString(),
          "ether"
        );
        setPendingRoiBalance(formatAmount(pendingRoi));

        const totalWithdrawnRaw = await contract.methods
          .userTotalWithdrawn(account)
          .call();
        const totalWithdrawnValue = web3.utils.fromWei(
          (totalWithdrawnRaw || "0").toString(),
          "ether"
        );
        setOnChainTotalWithdrawn(formatAmount(totalWithdrawnValue));
      } catch (error) {
        console.error("Failed to fetch getTotalPendingRoi:", error);
        setPendingRoiBalance("0.0000");
        setOnChainTotalWithdrawn("0.0000");
      }
    };

    fetchPendingRoi();
  }, [web3State.isConnected, account, web3State.lastUpdated]);

  const handleWithdraw = async () => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }

    const available = Number(withdrawableBalance || 0);

    if (available <= 0) {
      toast.error("No balance to withdraw");
      return;
    }

    try {
      const toastId = toast.loading("Processing withdrawal...");
      setIsWithdrawing(true);

      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      const tx = await contract.methods
        .withdrawEarnings()
        .send({ from: account });

      if (!tx?.status) {
        throw new Error("Withdrawal failed");
      }

      toast.dismiss(toastId);
      toast.success("Withdrawal successful!");
      // Refresh data immediately after withdrawal
      await dispatch(fetchContractData());
      dispatch(fetchDashboardData());
    } catch (error) {
      toast.error(error?.message || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Memoize formatted values
  const withdrawableBalance = useMemo(
    () => pendingRoiBalance || formatAmount(balances.withdrawable),
    [pendingRoiBalance, balances.withdrawable]
  );
  const totalWithdrawn = useMemo(
    () => onChainTotalWithdrawn || formatAmount(dashboardData.totalWithdrawn),
    [onChainTotalWithdrawn, dashboardData.totalWithdrawn]
  );

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
                  <th>Working Withdrawal ROI</th>
                </div>
              </div>
              
              {/* Summary Cards with 4 decimal formatting */}
              <div className="col-12">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6 className="card-title">Total ROI Current Package</h6>
                        <h3 className="mb-0">$ {withdrawableBalance}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6 className="card-title">Total ROI Withdrawn</h6>
                        <h3 className="mb-0">$ {totalWithdrawn}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card bg-theme1 rounded-2">
                  <div className="card-body">
                    <div className="p-4 rounded currency-exchange-area text-center">
                      <h5 className="text-white mb-2">Instant Withdrawal</h5>
                      <p className="text-white-50 mb-4">
                        Click withdrawal to claim your available earnings.
                      </p>
                      <button
                        className="btn btn-primary px-4 py-2 text-white"
                        type="button"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || Number(withdrawableBalance) <= 0}
                      >
                        {isWithdrawing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          "Withdrawal"
                        )}
                      </button>
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

export default Withdrawal;
