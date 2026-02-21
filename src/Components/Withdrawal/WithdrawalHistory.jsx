/* eslint-disable no-unused-vars */
// src/Components/Withdrawal/WithdrawalHistory.jsx 
import React, { useEffect, useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet } from "../../Redux/Web3Slice";
import toast from "react-hot-toast";
import Web3 from "web3";
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from "../../Services/exnexDeepakAddress";

const WithdrawalHistory = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchWithdrawalHistory = async () => {
    if (!web3State.isConnected || !web3State.account || !window.ethereum) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    try {
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const lengthRaw = await contract.methods
        .getWithdrawalHistoryLength(web3State.account)
        .call();
      const length = Number(lengthRaw || 0);
      const rows = [];

      for (let i = 0; i < length; i += 1) {
        const row = await contract.methods
          .userWithdrawalHistory(web3State.account, i)
          .call();
        const grossAmountRaw = Array.isArray(row) ? row[0] : row?.grossAmount;
        const deductionRaw = Array.isArray(row) ? row[1] : row?.deductionAmount;
        const netAmountRaw = Array.isArray(row) ? row[2] : row?.netAmount;
        const withdrawnAtRaw = Array.isArray(row) ? row[3] : row?.withdrawnAt;

        rows.push({
          grossAmount: web3.utils.fromWei((grossAmountRaw || "0").toString(), "ether"),
          deductionAmount: web3.utils.fromWei((deductionRaw || "0").toString(), "ether"),
          netAmount: web3.utils.fromWei((netAmountRaw || "0").toString(), "ether"),
          withdrawnAt:
            Number(withdrawnAtRaw) > 0
              ? new Date(Number(withdrawnAtRaw) * 1000).toLocaleString()
              : "N/A",
          timestamp: Number(withdrawnAtRaw || 0),
        });
      }

      rows.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(rows);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch withdrawal history:", error);
      toast.error("Failed to fetch withdrawal history");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3State.isConnected, web3State.account]);

  const handleRefresh = () => {
    fetchWithdrawalHistory();
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        setTimeout(() => {
          fetchWithdrawalHistory();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
                <div className="heading text-start d-flex justify-content-between align-items-center flex-wrap">
                  <span>Withdrawal History</span>
                  {web3State.isConnected && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-sync me-1"></i>
                          Refresh
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!web3State.isConnected && (
                <div className="col-12">
                  <div className="alert alert-warning d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fa-solid fa-wallet me-2"></i>
                      <span>Please connect your wallet to view withdrawal history.</span>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleConnectWallet}
                      disabled={web3State.isConnecting}
                    >
                      {web3State.isConnecting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-plug me-1"></i>
                          Connect Wallet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="col-12">
                <div className="card tablecard">
                  <div className="card-body p-1 p-sm-2">
                    <div className="custom-table-container table-responsive">
                      <table className="custom-table withdrawal-history-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Gross Amount</th>
                            <th>Deduction Amount</th>
                            <th>Net Amount</th>
                            <th>Withdrawn At</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          {isLoading ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 bg-transparent">
                                <div className="spinner-border text-primary" role="status"></div>
                                <div className="mt-2">Loading...</div>
                              </td>
                            </tr>
                          ) : !web3State.isConnected ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-wallet fa-2x mb-2 text-white"></i>
                                <div>Please connect your wallet to view withdrawal history</div>
                              </td>
                            </tr>
                          ) : history.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-inbox fa-2x mb-2 text-white"></i>
                                <div>No records found</div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, idx) => (
                              <tr key={idx}>
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>$ {Number(item.grossAmount || 0).toFixed(4)}</td>
                                <td>$ {Number(item.deductionAmount || 0).toFixed(4)}</td>
                                <td>$ {Number(item.netAmount || 0).toFixed(4)}</td>
                                <td>{item.withdrawnAt || "N/A"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="pagination mt-3 d-flex justify-content-center">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'} me-1`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    )}
                    <style>{`
                      .withdrawal-history-table tbody tr td {
                        color: #fff !important;
                      }
                      .withdrawal-history-table tbody tr:hover td {
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

export default WithdrawalHistory;
