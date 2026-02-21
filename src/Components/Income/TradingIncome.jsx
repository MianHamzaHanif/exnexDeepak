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
import "../MyTeam/MyTeam.css";

const TradingIncome = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDirectIncomeHistory = async () => {
    if (!web3State.isConnected || !web3State.account || !window.ethereum) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    try {
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      const getLength = async () => {
        if (contract.methods.getDirectIncomeHistoryLength) {
          return contract.methods
            .getDirectIncomeHistoryLength(web3State.account)
            .call();
        }
        if (contract.methods.getDirectIncomeHistoryLengthas) {
          return contract.methods
            .getDirectIncomeHistoryLengthas(web3State.account)
            .call();
        }
        throw new Error("Direct income length function not found in ABI");
      };

      const lengthRaw = await getLength();

      const length = Number(lengthRaw || 0);
      const rows = [];

      for (let i = 0; i < length; i += 1) {
        let row;
        try {
          if (contract.methods.userDirectIncomeHistory) {
            row = await contract.methods
              .userDirectIncomeHistory(web3State.account, i)
              .call();
          } else if (contract.methods.getDirectIncomeHistoryAt) {
            row = await contract.methods
              .getDirectIncomeHistoryAt(web3State.account, i)
              .call();
          } else {
            continue;
          }
        } catch (rowError) {
          console.warn(`Direct income row ${i} failed:`, rowError);
          continue;
        }

        const fromUser = Array.isArray(row) ? row[0] : row?.fromUser;
        const amountRaw = Array.isArray(row) ? row[1] : row?.amount;
        const paidAtRaw = Array.isArray(row) ? row[2] : row?.paidAt;

        rows.push({
          fromUser: fromUser || "N/A",
          income: amountRaw
            ? web3.utils.fromWei(amountRaw.toString(), "ether")
            : "0",
          date:
            Number(paidAtRaw) > 0
              ? new Date(Number(paidAtRaw) * 1000).toLocaleString()
              : "N/A",
          timestamp: Number(paidAtRaw || 0),
        });
      }

      rows.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(rows);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch direct income history:", error);
      toast.error("Failed to fetch direct income history");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectIncomeHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3State.isConnected, web3State.account]);

  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      const interval = setInterval(() => {
        fetchDirectIncomeHistory();
      }, 15000);
      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3State.isConnected, web3State.account]);

  const handleRefresh = () => {
    fetchDirectIncomeHistory();
  };

  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        setTimeout(() => {
          fetchDirectIncomeHistory();
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
    const safeTotalPages = Math.max(totalPages, 1);
    const safePage = Math.min(Math.max(page, 1), safeTotalPages);
    setCurrentPage(safePage);
  };

  return (
    <div className="app-wrapper DirectIncomePage">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row g-3">
              <div className="col-12">
                <div className="heading text-start d-flex justify-content-between align-items-center flex-wrap">
                  <span>Direct Income</span>
                  {web3State.isConnected && (
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ padding: "10px 10px", fontSize: "12px" }}
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
                      <span>Please connect your wallet to view direct income.</span>
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
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>From Wallet</th>
                            <th>Income</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          {isLoading ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4 bg-transparent">
                                <div className="spinner-border text-primary" role="status"></div>
                                <div className="mt-2">Loading...</div>
                              </td>
                            </tr>
                          ) : !web3State.isConnected ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-wallet fa-2x mb-2 text-muted"></i>
                                <div>Please connect your wallet to view direct income</div>
                              </td>
                            </tr>
                          ) : history.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-inbox fa-2x mb-2 text-white"></i>
                                <div>No records found</div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, idx) => (
                              <tr key={`${item.fromUser}-${item.timestamp}-${idx}`}>
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>
                                  {item.fromUser && item.fromUser !== "N/A"
                                    ? `${item.fromUser.substring(0, 6)}...${item.fromUser.substring(item.fromUser.length - 4)}`
                                    : "N/A"}
                                </td>
                                <td>$ {Number(item.income || 0).toFixed(4)}</td>
                                <td>{item.date || "N/A"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="pagination mt-3 d-flex justify-content-center align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </button>
                      <span className="text-white">
                        Page {Math.min(currentPage, Math.max(totalPages, 1))} /{" "}
                        {Math.max(totalPages, 1)}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= Math.max(totalPages, 1)}
                      >
                        Next
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

export default TradingIncome;
