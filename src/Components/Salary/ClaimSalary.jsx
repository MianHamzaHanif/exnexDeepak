import React, { useEffect, useMemo, useState } from "react";
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
  const [totalWithdrawSalary, setTotalWithdrawSalary] = useState("0.0000");
  const [pendingMonths, setPendingMonths] = useState([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const walletStatus = useMemo(
    () => (account ? "Connected" : "Not Connected"),
    [account]
  );
  const totalPages = Math.max(1, Math.ceil(pendingMonths.length / itemsPerPage));
  const paginatedPendingMonths = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return pendingMonths.slice(start, end);
  }, [pendingMonths, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pendingMonths.length]);

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);
  };

  useEffect(() => {
    const fetchSalaryData = async () => {
      if (!account || !window.ethereum) {
        setSalaryEarned("0.0000");
        setTotalWithdrawSalary("0.0000");
        setPendingMonths([]);
        return;
      }

      try {
        const web3 = window.web3 || new Web3(window.ethereum);
        const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
        const poolContract = new web3.eth.Contract(
          poolContractAbi,
          poolContractAddress
        );

        const [salaryRaw, pendingData, salaryHistoryLengthRaw] = await Promise.all([
          contract.methods.userSalaryEarned(account).call().catch(() => "0"),
          poolContract.methods
            .getUserPendingApprovedSalaryMonths(account)
            .call()
            .catch(() => [[], [], []]),
          contract.methods.getSalaryHistoryLength(account).call().catch(() => "0"),
        ]);

        const months = pendingData?.months ?? pendingData?.[0] ?? [];
        const amounts = pendingData?.amounts ?? pendingData?.[2] ?? [];

        const pendingTotal = amounts.reduce((sum, amountRaw) => {
          const amount = Number(
            web3.utils.fromWei((amountRaw || "0").toString(), "ether")
          );
          return sum + (Number.isFinite(amount) ? amount : 0);
        }, 0);

        const salaryValue = Number(
          web3.utils.fromWei((salaryRaw || "0").toString(), "ether")
        );
        setSalaryEarned((pendingTotal - salaryValue).toFixed(4));

        const rows = months.map((month, index) => {
          const amountRaw = amounts[index] ?? "0";
          const amountFormatted = Number(
            web3.utils.fromWei((amountRaw || "0").toString(), "ether")
          ).toFixed(2);
          return {
            month: Number(month),
            amount: amountFormatted,
          };
        });
        setPendingMonths(rows);

        const salaryHistoryLength = Number(salaryHistoryLengthRaw || 0);
        let withdrawnTotal = 0;
        for (let i = 0; i < salaryHistoryLength; i += 1) {
          const row = await contract.methods.userSalaryHistory(account, i).call();
          const rowAmount = Array.isArray(row) ? row[2] : row?.amount;
          withdrawnTotal += Number(
            web3.utils.fromWei((rowAmount || "0").toString(), "ether")
          );
        }
        setTotalWithdrawSalary(withdrawnTotal.toFixed(4));
      } catch (error) {
        setSalaryEarned("0.0000");
        setTotalWithdrawSalary("0.0000");
        setPendingMonths([]);
      }
    };

    fetchSalaryData();
  }, [account, web3State?.lastUpdated]);

  const handleClaimSalary = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect wallet first");
      return;
    }
    try {
      setIsClaiming(true);
      const web3 = window.web3 || new Web3(window.ethereum);
      const poolContract = new web3.eth.Contract(
        poolContractAbi,
        poolContractAddress
      );
      const tx = await poolContract.methods
        .claimMonthlySalary()
        .send({ from: account });

      if (!tx?.status) {
        throw new Error("Claim salary failed");
      }
      toast.success("Salary claimed successfully");

      // Refresh page data
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const [salaryRaw, pendingData, salaryHistoryLengthRaw] = await Promise.all([
        contract.methods.userSalaryEarned(account).call().catch(() => "0"),
        poolContract.methods
          .getUserPendingApprovedSalaryMonths(account)
          .call()
          .catch(() => [[], [], []]),
        contract.methods.getSalaryHistoryLength(account).call().catch(() => "0"),
      ]);

      const months = pendingData?.months ?? pendingData?.[0] ?? [];
      const amounts = pendingData?.amounts ?? pendingData?.[2] ?? [];
      const pendingTotal = amounts.reduce((sum, amountRaw) => {
        const amount = Number(
          web3.utils.fromWei((amountRaw || "0").toString(), "ether")
        );
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);

      const salaryValue = Number(
        web3.utils.fromWei((salaryRaw || "0").toString(), "ether")
      );
      setSalaryEarned((pendingTotal - salaryValue).toFixed(4));

      setPendingMonths(
        months.map((month, index) => ({
          month: Number(month),
          amount: Number(
            web3.utils.fromWei((amounts[index] || "0").toString(), "ether")
          ).toFixed(2),
        }))
      );

      const salaryHistoryLength = Number(salaryHistoryLengthRaw || 0);
      let withdrawnTotal = 0;
      for (let i = 0; i < salaryHistoryLength; i += 1) {
        const row = await contract.methods.userSalaryHistory(account, i).call();
        const rowAmount = Array.isArray(row) ? row[2] : row?.amount;
        withdrawnTotal += Number(
          web3.utils.fromWei((rowAmount || "0").toString(), "ether")
        );
      }
      setTotalWithdrawSalary(withdrawnTotal.toFixed(4));
    } catch (error) {
      toast.error(error?.message || "Claim salary failed");
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
                  <th>Claim Salary</th>
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
                        <h6 className="card-title">Total Withdraw Salary</h6>
                        <h3 className="mb-0">$ {totalWithdrawSalary}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6 className="card-title">Wallet Status</h6>
                        <h3 className="mb-0">{walletStatus}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="text-center py-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClaimSalary}
                    disabled={isClaiming || !account}
                  >
                    {isClaiming ? "Processing..." : "Claim Salary"}
                  </button>
                </div>
              </div>

              <div className="col-12">
                <div className="card bg-theme1 rounded-2">
                  <div className="card-body">
                    <h5 className="text-white mb-3">Pending Approved Salary Months</h5>
                    <div className="table-responsive">
                      <table className="table table-dark align-middle mb-0 claim-salary-table">
                        <thead>
                          <tr>
                            <th className="text-white">Month</th>
                            <th className="text-white">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingMonths.length === 0 ? (
                            <tr>
                              <td className="text-white text-center" colSpan={2}>
                                No pending approved salary months found.
                              </td>
                            </tr>
                          ) : (
                            paginatedPendingMonths.map((row, index) => (
                              <tr key={`${row.month}-${index}`}>
                                <td className="text-white">{row.month}</td>
                                <td className="text-white">$ {row.amount}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {pendingMonths.length > 0 && (
                      <div className="pagination mt-3 d-flex justify-content-center align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          Previous
                        </button>
                        <span className="text-white">
                          Page {currentPage} / {totalPages}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}
                    <style>{`
                      .claim-salary-table tbody tr td,
                      .claim-salary-table thead tr th {
                        color: #fff !important;
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

export default ClaimSalary;
