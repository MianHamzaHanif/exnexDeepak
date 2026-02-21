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
import {
  exnexDeepakAddress,
  exnexDeepakAbi,
} from "../../Services/exnexDeepakAddress";

const ApproveSalary = () => {
  const account = useSelector((state) => state.web3State?.account || "");
  const [monthOptions, setMonthOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [users, setUsers] = useState([]);
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
        const mainContract = new web3.eth.Contract(
          exnexDeepakAbi,
          exnexDeepakAddress
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

        const nextUserIdRaw = await mainContract.methods
          .nextUserId()
          .call()
          .catch(() => "1");
        const nextUserId = Number(nextUserIdRaw || 1);

        const userRows = [];
        for (let i = 1; i < nextUserId; i += 1) {
          const addr = await mainContract.methods
            .userAddressById(i)
            .call()
            .catch(() => "0x0000000000000000000000000000000000000000");

          if (
            addr &&
            addr !== "0x0000000000000000000000000000000000000000"
          ) {
            userRows.push({ id: i, address: addr });
          }
        }
        setUsers(userRows);
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

        const rows = await Promise.all(
          users.map(async (u) => {
            const preview = await poolContract.methods
              .previewUserMonthSalary(selectedMonthNum, u.address)
              .call()
              .catch(() => null);

            if (!preview) {
              return {
                id: u.id,
                address: u.address,
                monthCompleted: false,
                rank: 0,
                reward: "0.00",
                eligible: false,
                approved: false,
                claimed: false,
              };
            }

            const rewardRaw = preview.reward ?? preview[2] ?? "0";
            const reward = Number(
              web3.utils.fromWei((rewardRaw || "0").toString(), "ether")
            ).toFixed(2);

            return {
              id: u.id,
              address: u.address,
              monthCompleted: Boolean(preview.monthCompleted ?? preview[0]),
              rank: Number(preview.rank ?? preview[1] ?? 0),
              reward,
              eligible: Boolean(preview.eligible ?? preview[3]),
              approved: Boolean(preview.approved ?? preview[4]),
              claimed: Boolean(preview.claimed ?? preview[5]),
            };
          })
        );

        setPreviewRows(rows.filter((row) => row.rank > 0));
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviewTable();
  }, [account, selectedMonth, users]);

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
            ? { ...r, approved: true }
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
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row g-3">
              <div className="col-12">
                <div className="heading text-start">
                  <th>Approve Salary</th>
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
                            Total Users: {users.length}
                          </span>
                          <span className="badge bg-success px-3 py-2">
                            Rank &gt; 0: {previewRows.length}
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
                            <th className="text-white">User ID</th>
                            <th className="text-white">Address</th>
                            <th className="text-white">Rank</th>
                            <th className="text-white">Reward</th>
                            <th className="text-white">Approved</th>
                            <th className="text-white">Claimed</th>
                            <th className="text-white">Month Completed</th>
                            <th className="text-white">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.length === 0 && (
                            <tr>
                              <td colSpan={8} className="text-center text-white">
                                {isLoading
                                  ? "Loading..."
                                  : "No users found for selected month."}
                              </td>
                            </tr>
                          )}
                          {previewRows.map((row) => (
                            <tr key={`${row.id}-${row.address}`}>
                              <td className="text-white">{row.id}</td>
                              <td className="text-white">{row.address}</td>
                              <td className="text-white">{row.rank}</td>
                              <td className="text-white">$ {row.reward}</td>
                              <td className="text-white">{row.approved ? "Yes" : "No"}</td>
                              <td className="text-white">{row.claimed ? "Yes" : "No"}</td>
                              <td className="text-white">{row.monthCompleted ? "Yes" : "No"}</td>
                              <td className="text-white">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  style={{ padding: "2px 8px", fontSize: "12px" }}
                                  disabled={
                                    !isOwner ||
                                    row.approved ||
                                    approvingKey === `${row.id}-${row.address}`
                                  }
                                  onClick={() => handleApproveSalary(row)}
                                >
                                  {approvingKey === `${row.id}-${row.address}`
                                    ? "Approving..."
                                    : row.approved
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
