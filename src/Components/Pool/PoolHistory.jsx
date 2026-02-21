import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useSelector } from "react-redux";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { poolContractAddress, poolContractAbi } from "../../Services/poolAddress";

const PoolHistory = () => {
  const account = useSelector((state) => state.web3State?.account || "");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPoolHistory = async () => {
      if (!account || !window.ethereum) {
        setHistory([]);
        return;
      }
      try {
        setIsLoading(true);
        const web3 = window.web3 || new Web3(window.ethereum);
        const poolContract = new web3.eth.Contract(poolContractAbi, poolContractAddress);
        const currentMonthRaw = await poolContract.methods.getCurrentMonthId().call();
        const currentMonth = Number(currentMonthRaw || 0);

        const rows = [];
        for (let month = currentMonth; month >= 0; month -= 1) {
          const [claimedRaw, monthInfoRaw] = await Promise.all([
            poolContract.methods.hasClaimed(month, account).call().catch(() => false),
            poolContract.methods.monthInfo(month).call().catch(() => null),
          ]);

          if (claimedRaw) {
            const totalAmountRaw = monthInfoRaw?.totalAmount ?? monthInfoRaw?.[0] ?? "0";
            const qualifiedCountRaw = monthInfoRaw?.qualifiedCount ?? monthInfoRaw?.[1] ?? "0";
            rows.push({
              month,
              totalAmount: Number(
                web3.utils.fromWei((totalAmountRaw || "0").toString(), "ether")
              ).toFixed(4),
              qualifiedCount: Number(qualifiedCountRaw || 0),
            });
          }
        }
        setHistory(rows);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoolHistory();
  }, [account]);

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
                  <th>Pool History</th>
                </div>
              </div>

              <div className="col-12">
                <div className="card bg-theme1 rounded-2">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-dark align-middle mb-0 pool-history-table">
                        <thead>
                          <tr>
                            <th className="text-white">Month</th>
                            <th className="text-white">Total Amount</th>
                            <th className="text-white">Qualified Users</th>
                            <th className="text-white">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td colSpan={4} className="text-white text-center">
                                Loading...
                              </td>
                            </tr>
                          ) : history.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-white text-center">
                                No pool history found.
                              </td>
                            </tr>
                          ) : (
                            history.map((row) => (
                              <tr key={row.month}>
                                <td className="text-white">{row.month}</td>
                                <td className="text-white">$ {row.totalAmount}</td>
                                <td className="text-white">{row.qualifiedCount}</td>
                                <td className="text-white">Claimed</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <style>{`
                      .pool-history-table tbody tr td {
                        color: #fff !important;
                      }
                      .pool-history-table tbody tr:hover td {
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

export default PoolHistory;
