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
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const loadMonths = async () => {
      if (!account || !window.ethereum) {
        setMonthOptions([]);
        setSelectedMonth("");
        return;
      }
      try {
        const web3 = window.web3 || new Web3(window.ethereum);
        const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
        const currentMonthRaw = await poolContract.methods.getCurrentMonthId().call();
        const currentMonth = Number(currentMonthRaw || 0);
        const months = Array.from({ length: currentMonth + 1 }, (_, idx) => currentMonth - idx);
        setMonthOptions(months);
        setSelectedMonth(String(currentMonth));
      } catch (error) {
        setMonthOptions([]);
        setSelectedMonth("");
      }
    };
    loadMonths();
  }, [account]);

  const handleClaimPool = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }
    if (selectedMonth === "") {
      toast.error("Please select month");
      return;
    }

    try {
      setIsClaiming(true);
      const web3 = window.web3 || new Web3(window.ethereum);
      const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
      const tx = await poolContract.methods
        .claimMonthlyReward(Number(selectedMonth))
        .send({ from: account });

      if (!tx?.status) {
        throw new Error("Claim pool failed");
      }
      toast.success("Pool claimed successfully");
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
                  <th>Claim Pool</th>
                </div>
              </div>

              <div className="col-12">
                <div className="card bg-theme1 rounded-2">
                  <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap align-items-center">
                      <select
                        className="form-select"
                        style={{ maxWidth: "220px" }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {monthOptions.map((month) => (
                          <option key={month} value={month}>
                            Month {month}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleClaimPool}
                        disabled={isClaiming || !account || selectedMonth === ""}
                      >
                        {isClaiming ? "Processing..." : "Claim Pool"}
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

export default ClaimPool;
