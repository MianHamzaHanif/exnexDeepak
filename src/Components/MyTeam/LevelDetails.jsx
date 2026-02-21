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
import "./MyTeam.css";

const MAX_LEVEL_FILTER = 10;
const LEVEL_OPTIONS = Array.from(
  { length: MAX_LEVEL_FILTER },
  (_, index) => index + 1,
);

const LevelDetails = () => {
  const dispatch = useDispatch();
  const web3State = useSelector((state) => state.web3State);
  const [referrals, setReferrals] = useState([]);
  const [levelFilter, setLevelFilter] = useState(1);
  const [statusFilter, setStatusFilter] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const itemsPerPage = 10;

  const getLevelUserAddress = async (contract, walletAddress, level, index) => {
    try {
      return await contract.methods.levelUsers(walletAddress, level, index).call();
    } catch (levelUsersError) {
      return await contract.methods
        .getLevelUserAt(walletAddress, level, index)
        .call();
    }
  };

  const fetchReferralDetails = async () => {
    if (!web3State.isConnected || !web3State.account || !window.ethereum) {
      setReferrals([]);
      return;
    }

    setIsLoadingReferrals(true);
    try {
      const web3 = window.web3 || new Web3(window.ethereum);
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const rows = [];

      const countRaw = await contract.methods
        .getLevelCount(web3State.account, levelFilter)
        .call();
      const count = Number(countRaw || 0);

      for (let i = 0; i < count; i += 1) {
        const userAddress = await getLevelUserAddress(
          contract,
          web3State.account,
          levelFilter,
          i,
        );

        if (!userAddress || /^0x0{40}$/i.test(userAddress)) {
          continue;
        }

        const userData = await contract.methods.users(userAddress).call();

        const isRegistered = Array.isArray(userData)
          ? Boolean(userData[0])
          : Boolean(userData?.isRegistered);
        const userAddressFromStruct = Array.isArray(userData)
          ? userData[2]
          : userData?.userAddress;
        const packageAmountRaw = Array.isArray(userData)
          ? userData[4]
          : userData?.packageAmount;
        const registeredAtRaw = Array.isArray(userData)
          ? userData[5]
          : userData?.registeredAt;

        let userId = Array.isArray(userData)
          ? userData[1]?.toString?.() || "N/A"
          : userData?.id?.toString?.() || "N/A";

        if (userId === "N/A") {
          try {
            const fetchedId = await contract.methods.addressToId(userAddress).call();
            userId = fetchedId?.toString?.() || "N/A";
          } catch (e) {
            userId = "N/A";
          }
        }

        const packageAmount = packageAmountRaw
          ? web3.utils.fromWei(packageAmountRaw.toString(), "ether")
          : "0";
        const registrationDate =
          Number(registeredAtRaw) > 0
            ? new Date(Number(registeredAtRaw) * 1000).toLocaleString()
            : "N/A";

        rows.push({
          userId,
          address: userAddressFromStruct || userAddress,
          registrationDate,
          level: levelFilter,
          isActive: isRegistered,
          status: isRegistered ? "Active" : "Inactive",
          package: packageAmount,
        });
      }

      setReferrals(rows);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch level users:", error);
      toast.error("Failed to fetch level details");
      setReferrals([]);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  useEffect(() => {
    fetchReferralDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3State.isConnected, web3State.account, levelFilter]);

  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      const interval = setInterval(() => {
        fetchReferralDetails();
      }, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3State.isConnected, web3State.account, levelFilter]);

  const handleRefresh = () => {
    fetchReferralDetails();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [levelFilter, statusFilter]);

  const handleConnectWallet = async () => {
    try {
      const result = await dispatch(connectWallet());
      if (result.payload && result.payload.account) {
        toast.success("Wallet connected successfully!");
        setTimeout(() => {
          fetchReferralDetails();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  let filtered = referrals;
  filtered = filtered.filter((item) => Number(item.level) === levelFilter);
  if (statusFilter !== 2) {
    filtered = filtered.filter((item) => item.isActive === (statusFilter === 1));
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handlePageChange = (page) => {
    const safeTotalPages = Math.max(totalPages, 1);
    const safePage = Math.min(Math.max(page, 1), safeTotalPages);
    setCurrentPage(safePage);
  };

  return (
    <div className="app-wrapper LevelDetailsPage">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid ActivationPage">
            <div className="row g-3">
              <div className="col-12">
                <div className="heading text-start d-flex justify-content-between align-items-center flex-wrap">
                  <span>Level Details</span>
                  {web3State.isConnected && (
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ padding: "10px 10px", fontSize: "12px" }}
                      onClick={handleRefresh}
                      disabled={isLoadingReferrals}
                    >
                      {isLoadingReferrals ? (
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
                      <span>Please connect your wallet to view level details.</span>
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
                      {LEVEL_OPTIONS.map((level) => (
                        <option key={level} value={level}>
                          Level {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(Number(e.target.value))}
                      disabled={!web3State.isConnected}
                    >
                      <option value={2}>All Status</option>
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={handleRefresh}
                      disabled={!web3State.isConnected || isLoadingReferrals}
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
                            <th>Current Package</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          {isLoadingReferrals ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4 bg-transparent">
                                <div className="spinner-border text-primary" role="status"></div>
                                <div>Loading...</div>
                              </td>
                            </tr>
                          ) : !web3State.isConnected ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4 bg-transparent">
                                <i className="fa-solid fa-wallet fa-2x mb-2 text-muted"></i>
                                <div>Please connect your wallet to view level details</div>
                              </td>
                            </tr>
                          ) : filtered.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4 bg-transparent">
                                No records found
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, idx) => (
                              <tr key={idx}>
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>{item.userId || "N/A"}</td>
                                <td>
                                  {item.address
                                    ? `${item.address.substring(0, 6)}...${item.address.substring(item.address.length - 4)}`
                                    : "N/A"}
                                </td>
                                <td>{item.registrationDate || "N/A"}</td>
                                <td>{item.level || "N/A"}</td>
                                <td>
                                  <span
                                    className={`badge ${item.status === "Active" ? "bg-success" : "bg-danger"}`}
                                  >
                                    {item.status || "N/A"}
                                  </span>
                                </td>
                                <td>{item.package !== "0" ? `$ ${item.package}` : "N/A"}</td>
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
                        Page {Math.min(currentPage, Math.max(totalPages, 1))} / {Math.max(totalPages, 1)}
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

export default LevelDetails;
