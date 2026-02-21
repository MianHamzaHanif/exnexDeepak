/* eslint-disable no-unused-vars */
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

const VestingHistory = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchVestingHistory = async () => {
    if (!web3State.isConnected || !web3State.account || !window.ethereum) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    try {
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const lengthRaw = await contract.methods
        .getRoiWasteHistoryLength(web3State.account)
        .call();
      const length = Number(lengthRaw || 0);
      const rows = [];

      for (let i = 0; i < length; i += 1) {
        const row = await contract.methods
          .userRoiWasteHistory(web3State.account, i)
          .call();
        const depositIndexRaw = Array.isArray(row) ? row[0] : row?.depositIndex;
        const amountRaw = Array.isArray(row) ? row[1] : row?.amount;
        const wastedAtRaw = Array.isArray(row) ? row[2] : row?.wastedAt;

        rows.push({
          depositIndex: Number(depositIndexRaw || 0),
          amount: web3.utils.fromWei((amountRaw || "0").toString(), "ether"),
          wastedAt:
            Number(wastedAtRaw) > 0
              ? new Date(Number(wastedAtRaw) * 1000).toLocaleString()
              : "N/A",
          timestamp: Number(wastedAtRaw || 0),
        });
      }

      rows.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(rows);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to fetch vesting history");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVestingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3State.isConnected, web3State.account]);

  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        setTimeout(() => {
          fetchVestingHistory();
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
                  <span>Vesting History</span>
                  {web3State.isConnected && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={fetchVestingHistory}
                      disabled={isLoading}
                    >
                      {isLoading ? "Refreshing..." : "Refresh"}
                    </button>
                  )}
                </div>
              </div>

              {!web3State.isConnected && (
                <div className="col-12">
                  <div className="alert alert-warning d-flex justify-content-between align-items-center">
                    <span>Please connect your wallet to view vesting history.</span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleConnectWallet}
                      disabled={web3State.isConnecting}
                    >
                      {web3State.isConnecting ? "Connecting..." : "Connect Wallet"}
                    </button>
                  </div>
                </div>
              )}

              <div className="col-12">
                <div className="card tablecard">
                  <div className="card-body p-1 p-sm-2">
                    <div className="custom-table-container table-responsive">
                      <table className="custom-table vesting-history-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Deposit Index</th>
                            <th>Amount</th>
                            <th>Wasted At</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          {isLoading ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4 bg-transparent">
                                Loading...
                              </td>
                            </tr>
                          ) : history.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4 bg-transparent">
                                No records found
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, idx) => (
                              <tr key={`${item.depositIndex}-${item.timestamp}-${idx}`}>
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>{item.depositIndex}</td>
                                <td>$ {Number(item.amount || 0).toFixed(4)}</td>
                                <td>{item.wastedAt || "N/A"}</td>
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
                            className={`btn btn-sm ${currentPage === page ? "btn-primary" : "btn-outline-primary"} me-1`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    )}
                    <style>{`
                      .vesting-history-table tbody tr td {
                        color: #fff !important;
                      }
                      .vesting-history-table tbody tr:hover td {
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

export default VestingHistory;
