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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        const lengthRaw = await poolContract.methods
          .getMonthlyRewardHistoryLength(account)
          .call();
        const length = Number(lengthRaw || 0);
        const rows = [];
        for (let idx = 0; idx < length; idx += 1) {
          const entry = await poolContract.methods
            .getMonthlyRewardHistoryAt(account, idx)
            .call()
            .catch(() => null);
          if (!entry) continue;

          const monthIdRaw = entry?.monthId ?? entry?.[0] ?? "0";
          const amountRaw = entry?.amount ?? entry?.[1] ?? "0";
          const claimedAtRaw = entry?.claimedAt ?? entry?.[2] ?? "0";
          const claimedAtSeconds = Number(claimedAtRaw || 0);

          rows.push({
            index: idx + 1,
            monthId: Number(monthIdRaw || 0),
            amountRaw: amountRaw?.toString?.() || "0",
            amount: Number(
              web3.utils.fromWei((amountRaw || "0").toString(), "ether")
            ).toFixed(4),
            claimedAtRaw: claimedAtRaw?.toString?.() || "0",
            claimedAt: claimedAtSeconds
              ? new Date(claimedAtSeconds * 1000).toLocaleString()
              : "-",
          });
        }

        rows.reverse();

        setHistory(rows);
        setCurrentPage(1);
      } catch (error) {
        setHistory([]);
        setCurrentPage(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoolHistory();
  }, [account]);

  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfFirstItem = (safeCurrentPage - 1) * itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const handlePageChange = (page) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
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
                            <th className="text-white">#</th>
                            <th className="text-white">Month</th>
                            <th className="text-white">Amount</th>
                            <th className="text-white">Amount Raw</th>
                            <th className="text-white">Claimed At</th>
                            <th className="text-white">Claimed At Raw</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td colSpan={6} className="text-white text-center">
                                Loading...
                              </td>
                            </tr>
                          ) : history.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-white text-center">
                                No pool history found.
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((row, idx) => (
                              <tr key={`${row.monthId}-${row.index}`}>
                                <td className="text-white">
                                  {indexOfFirstItem + idx + 1}
                                </td>
                                <td className="text-white">{row.monthId}</td>
                                <td className="text-white">$ {row.amount}</td>
                                <td className="text-white">{row.amountRaw}</td>
                                <td className="text-white">{row.claimedAt}</td>
                                <td className="text-white">{row.claimedAtRaw}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {history.length > 0 && (
                      <div className="pagination mt-3 d-flex justify-content-center align-items-center gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handlePageChange(safeCurrentPage - 1)}
                          disabled={safeCurrentPage <= 1}
                        >
                          Previous
                        </button>
                        <span className="text-white">
                          Page {safeCurrentPage} of {totalPages} ({history.length})
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handlePageChange(safeCurrentPage + 1)}
                          disabled={safeCurrentPage >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}
                    <style>{`
                      .pool-history-table tbody tr td {
                        color: #fff !important;
                      }
                      .pool-history-table thead tr th {
                        color: #fff !important;
                      }
                      .pool-history-table tbody tr:hover td {
                        color: #fff !important;
                        background-color: transparent !important;
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
