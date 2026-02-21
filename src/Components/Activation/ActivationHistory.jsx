/* eslint-disable no-unused-vars */
// src/Components/Activation/ActivationHistory.jsx 
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import "./Activation.css";
import { fetchActivationHistory, connectWallet } from "../../Redux/Web3Slice";
import toast from "react-hot-toast";
const ActivationHistory = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const { isConnected, loadingActivationHistory, activationHistory } = web3State;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // FIXED: Initialization tracking to prevent duplicate fetches
  const hasInitialFetch = useRef(false);
  const autoRefreshIntervalRef = useRef(null);

  // FIXED: Initial fetch with guards
  const fetchHistory = useCallback(() => {
    // Guard: Only fetch if wallet is connected
    if (!isConnected) {
      console.log('ActivationHistory: Wallet not connected');
      return;
    }

    console.log('ActivationHistory: Fetching history...');
    dispatch(fetchActivationHistory()).catch((err) =>
      console.error('ActivationHistory: Fetch failed:', err.message)
    );
  }, [dispatch, isConnected]);

  // FIXED: Load on mount once
  useEffect(() => {
    // Guard: Prevent duplicate initialization
    if (!hasInitialFetch.current && isConnected) {
      hasInitialFetch.current = true;
      console.log('ActivationHistory: Initial fetch');
      fetchHistory();
    }
  }, [fetchHistory, isConnected]);

  // FIXED: Auto-refresh every 10 seconds when connected
  useEffect(() => {
    if (isConnected && hasInitialFetch.current) {
      console.log('ActivationHistory: Setting up auto-refresh (10 seconds)');
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchHistory();
      }, 10000);

      return () => {
        if (autoRefreshIntervalRef.current) {
          clearInterval(autoRefreshIntervalRef.current);
        }
      };
    }
  }, [isConnected, fetchHistory]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        // Fetch data after connecting
        setTimeout(() => {
          dispatch(fetchActivationHistory());
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activationHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activationHistory.length / itemsPerPage);
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
                <div className="heading text-start d-flex justify-content-between align-items-center flex-wrap flex-wrap">
                  <span>Activation / Upgrade History</span>
                  {isConnected && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={fetchHistory}
                      disabled={loadingActivationHistory}
                    >
                      {loadingActivationHistory ? (
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
              {!isConnected && (
                <div className="col-12">
                  <div className="alert alert-warning d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fa-solid fa-wallet me-2"></i>
                      <span>Please connect your wallet to view history.</span>
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
                            <th>User ID</th>
                            <th>Amount</th>
                            <th>Plan ID</th>
                            <th>Remark</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingActivationHistory ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4 bg-transparent">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <div className="mt-2">Loading history...</div>
                              </td>
                            </tr>
                          ) : !isConnected ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-wallet fa-2x mb-2 text-muted"></i>
                                <div>Please connect your wallet to view history</div>
                              </td>
                            </tr>
                          ) : activationHistory.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-inbox fa-2x mb-2 text-white"></i>
                                <div className="text-white">No activation/upgrade records found</div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, idx) => (
                              <tr key={`${item.timestamp}-${idx}`}>
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>{item.userId || "N/A"}</td>
                                <td>${item.amount || "0.00"}</td>
                                <td>Plan {item.planId || "N/A"}</td>
                                <td>
                                  <span className={`badge ${
                                    item.remark.toLowerCase().includes('activate')
                                      ? 'bg-success'
                                      : 'bg-primary'
                                  }`}>
                                    {item.remark || "N/A"}
                                  </span>
                                </td>
                                <td>{item.date || "N/A"}</td>
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
export default ActivationHistory;