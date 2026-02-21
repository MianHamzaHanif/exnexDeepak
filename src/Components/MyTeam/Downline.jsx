/* eslint-disable no-unused-vars */
// src/Components/MyTeam/Downline.jsx 
import React, { useEffect, useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchReferrals, connectWallet } from "../../Redux/Web3Slice";
import toast from "react-hot-toast";

const Downline = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const referrals = web3State.referrals || [];
  const [levelFilter, setLevelFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initial load
  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      dispatch(fetchReferrals());
    }
  }, [dispatch, web3State.isConnected, web3State.account]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      const interval = setInterval(() => {
        dispatch(fetchReferrals());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, web3State.isConnected, web3State.account]);

  // Manual refresh
  const handleRefresh = () => {
    if (web3State.isConnected && web3State.account) {
      dispatch(fetchReferrals());
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        // Fetch data after connecting
        setTimeout(() => {
          dispatch(fetchReferrals());
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  const filtered = levelFilter == 0 || levelFilter == 1 ? referrals : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
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
                  <span>Downline</span>
                  {web3State.isConnected && (
                    <button 
                      className="btn btn-sm btn-primary"
                      style={{ padding: '10px 10px', fontSize: '12px' }}
                      onClick={handleRefresh}
                      disabled={web3State.loadingReferrals}
                    >
                      {web3State.loadingReferrals ? (
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
                      <span>Please connect your wallet to view downline.</span>
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
                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <select 
                      className="form-control" 
                      value={levelFilter} 
                      onChange={(e) => setLevelFilter(Number(e.target.value))}
                      disabled={!web3State.isConnected}
                    >
                      <option value={0}>All Level</option>
                      <option value={1}>Level 1</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={handleRefresh}
                      disabled={!web3State.isConnected || web3State.loadingReferrals}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card tablecard">
                  <div className="card-body p-1 p-sm-2">
                    <div className="custom-table-container table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>User ID</th>
                            <th>Wallet</th>
                            <th>Registration Date</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Package</th>
                            <th>Activation Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {web3State.loadingReferrals ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4 bg-transparent">
                                <div className="spinner-border text-primary" role="status"></div>
                                <div>Loading...</div>
                              </td>
                            </tr>
                          ) : !web3State.isConnected ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-wallet fa-2x mb-2 text-muted"></i>
                                <div>Please connect your wallet to view downline</div>
                              </td>
                            </tr>
                          ) : filtered.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4 bg-transparent">
                                No records found. Note: Only direct referrals (level 1) are available.
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, idx) => (
                              <tr key={idx}>
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>{item.userId || "N/A"}</td>
                                <td>{item.address ? `${item.address.substring(0, 6)}...${item.address.substring(item.address.length - 4)}` : "N/A"}</td>
                                <td>{item.registrationDate || "N/A"}</td>
                                <td>{item.level || "N/A"}</td>
                                <td>
                                  <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                    {item.status || "N/A"}
                                  </span>
                                </td>
                                <td>{item.package !== '0' ? `$ ${item.package}` : 'N/A'}</td>
                                <td>{item.activationDate || "N/A"}</td>
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

export default Downline;