import React, { useEffect, useState } from "react";
import Web3 from "web3";
import toast from "react-hot-toast";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { useSelector } from "react-redux";
import {
  poolContractAddress,
  poolContractAbi,
} from "../../Services/poolAddress";

const ApproveSalary = () => {
  const account = useSelector((state) => state.web3State?.account || "");
  const [monthOptions, setMonthOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [previewRows, setPreviewRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [poolOwner, setPoolOwner] = useState("");
  const [approvingKey, setApprovingKey] = useState("");

  const selectedMonthLabel = selectedMonth !== "" ? `Month ${selectedMonth}` : "-";
  const isOwner =
    !!account &&
    !!poolOwner &&
    account.toLowerCase() === poolOwner.toLowerCase();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!account || !window.ethereum) {
        setMonthOptions([]);
        setSelectedMonth("");
        setUsers([]);
        setPreviewRows([]);
        return;
      }

      try {
        setIsLoading(true);
        const web3 = window.web3 || new Web3(window.ethereum);
        const poolContract = new web3.eth.Contract(
          poolContractAbi,
          poolContractAddress
        );

        const currentMonthRaw = await poolContract.methods
          .getCurrentMonthId()
          .call()
          .catch(() => "0");
        const ownerRaw = await poolContract.methods.owner().call().catch(() => "");
        setPoolOwner(ownerRaw || "");
        const currentMonth = Number(currentMonthRaw || 0);
        const months = Array.from(
          { length: currentMonth + 1 },
          (_, idx) => currentMonth - idx
        );
        setMonthOptions(months);
        setSelectedMonth(String(currentMonth));
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [account]);

  useEffect(() => {
    const loadPreviewTable = async () => {
      if (!account || !window.ethereum || selectedMonth === "") {
        setPreviewRows([]);
        return;
      }

      const selectedMonthNum = Number(selectedMonth);
      if (Number.isNaN(selectedMonthNum)) {
        setPreviewRows([]);
        return;
      }

      try {
        setIsLoading(true);
        const web3 = window.web3 || new Web3(window.ethereum);
        const poolContract = new web3.eth.Contract(
          poolContractAbi,
          poolContractAddress
        );

        const pendingLengthRaw = await poolContract.methods
          .getPendingSalaryRequestMonthLength(selectedMonthNum)
          .call()
          .catch(() => "0");
        const pendingLength = Number(pendingLengthRaw || 0);

        const pendingAddresses = await Promise.all(
          Array.from({ length: pendingLength }, (_, idx) =>
            poolContract.methods
              .getPendingSalaryRequestMonthUserAt(selectedMonthNum, idx)
              .call()
              .catch(() => "0x0000000000000000000000000000000000000000")
          )
        );

        const validAddresses = pendingAddresses.filter(
          (addr) => addr && addr !== "0x0000000000000000000000000000000000000000"
        );

        const rows = await Promise.all(
          validAddresses.map(async (address, idx) => {
            const preview = await poolContract.methods
              .getUserSalaryPreview(selectedMonthNum, address)
              .call()
              .catch(() => null);

            const estimatedRewardRaw = preview?.estimatedReward ?? preview?.[4] ?? "0";
            const estimatedReward = Number(
              web3.utils.fromWei((estimatedRewardRaw || "0").toString(), "ether")
            ).toFixed(2);

            return {
              id: idx + 1,
              address,
              monthApproved: Boolean(preview?.monthApproved ?? preview?.[0]),
              userApproved: Boolean(preview?.userApproved ?? preview?.[1]),
              rank: Number(preview?.rank ?? preview?.[2] ?? 0),
              periods: Number(preview?.periods ?? preview?.[3] ?? 0),
              estimatedReward,
              canClaim: Boolean(preview?.canClaim ?? preview?.[5]),
            };
          })
        );

        setPreviewRows(rows);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviewTable();
  }, [account, selectedMonth]);

  const handleApproveSalary = async (row) => {
    if (!isOwner) {
      toast.error("Only owner can approve salary");
      return;
    }
    if (!selectedMonth) {
      toast.error("Please select month");
      return;
    }
    try {
      setApprovingKey(`${row.id}-${row.address}`);
      const web3 = window.web3 || new Web3(window.ethereum);
      const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
      const tx = await poolContract.methods
        .approveUserMonthSalary(Number(selectedMonth), row.address)
        .send({ from: account });

      if (!tx?.status) {
        throw new Error("Approve failed");
      }
      toast.success("Salary approved");
      setPreviewRows((prev) =>
        prev.map((r) =>
          r.id === row.id && r.address.toLowerCase() === row.address.toLowerCase()
            ? { ...r, userApproved: true }
            : r
        )
      );
    } catch (error) {
      toast.error(error?.message || "Approve failed");
    } finally {
      setApprovingKey("");
    }
  };

  return (
    <div className="app-wrapper ApproveSalaryPage">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row g-3">
              <div className="col-12">
                <div className="heading text-start">
                  <span>Approve Salary</span>
                </div>
              </div>
              <div className="col-12">
                <div className="card bg-theme1 rounded-2 border-0">
                  <div className="card-body text-white">
                    <div className="row g-3 align-items-end">
                      <div className="col-lg-4 col-md-6">
                        <label className="form-label">Select Month</label>
                        <select
                          className="form-select"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          {monthOptions.map((m) => (
                            <option key={m} value={m}>
                              Month {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-8 col-md-6">
                        <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                          <span className="badge bg-primary px-3 py-2">
                            {selectedMonthLabel}
                          </span>
                          <span className="badge bg-info px-3 py-2">
                            Pending Requests: {previewRows.length}
                          </span>
                          <span className="badge bg-success px-3 py-2">
                            Owner: {isOwner ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card bg-theme1 rounded-2">
                  <div className="card-body">
                    <h5 className="text-white mb-3">Salary Preview Details</h5>
                    <div className="table-responsive">
                      <table className="table table-dark align-middle mb-0 text-white approve-salary-table">
                        <thead>
                          <tr>
                            <th className="text-white">#</th>
                            <th className="text-white">Address</th>
                            <th className="text-white">Rank</th>
                            <th className="text-white">Periods</th>
                            <th className="text-white">Estimated Reward</th>
                            <th className="text-white">Month Approved</th>
                            <th className="text-white">User Approved</th>
                            <th className="text-white">Can Claim</th>
                            <th className="text-white">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.length === 0 && (
                            <tr>
                              <td colSpan={9} className="text-center text-white">
                                {isLoading
                                  ? "Loading..."
                                  : "No pending salary requests for selected month."}
                              </td>
                            </tr>
                          )}
                          {previewRows.map((row) => (
                            <tr key={`${row.id}-${row.address}`}>
                              <td className="text-white">{row.id}</td>
                              <td className="text-white">{row.address}</td>
                              <td className="text-white">{row.rank}</td>
                              <td className="text-white">{row.periods}</td>
                              <td className="text-white">$ {row.estimatedReward}</td>
                              <td className="text-white">{row.monthApproved ? "Yes" : "No"}</td>
                              <td className="text-white">{row.userApproved ? "Yes" : "No"}</td>
                              <td className="text-white">{row.canClaim ? "Yes" : "No"}</td>
                              <td className="text-white">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  style={{ padding: "2px 8px", fontSize: "12px" }}
                                  disabled={
                                    !isOwner ||
                                    row.userApproved ||
                                    approvingKey === `${row.id}-${row.address}`
                                  }
                                  onClick={() => handleApproveSalary(row)}
                                >
                                  {approvingKey === `${row.id}-${row.address}`
                                    ? "Approving..."
                                    : row.userApproved
                                      ? "Approved"
                                      : "Approve"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <style>{`
                      .approve-salary-table tbody tr td {
                        color: #fff !important;
                        background: rgba(255, 255, 255, 0.02) !important;
                      }
                      .approve-salary-table tbody tr:hover td {
                        color: #fff !important;
                        background: rgba(255, 255, 255, 0.02) !important;
                      }
                    `}</style>
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

export default ApproveSalary;
