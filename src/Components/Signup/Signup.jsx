import React, { useState, useEffect } from "react";
import "../Dashboard/Dash.css";
import "./Signup.css";
import "../Dashboard/responsive.css";
import Logo from "/webimg/logo.png";
import Loginimage from "/webimg/login-img.png";
import { useDispatch, useSelector } from "react-redux";
import {
  connectWallet,
  disconnectWallet,
  fetchContractData,
} from "../../Redux/Web3Slice";
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from "../../Services/exnexDeepakAddress";
import {
  tokenAddress as USDT_Address,
  tokenAbi as USDT_Abi,
} from "../../Services/tokenAddress";
import { UpdateAuth, updateStatus } from "../../Redux/AuthSlice";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Web3 from "web3";

const PACKAGE_OPTIONS = [
  { label: "50 USDT", value: "50" },
  { label: "100 USDT", value: "100" },
];

const PRIVILEGED_DASHBOARD_ADDRESS =
  "0x3b0a3638ab65d2bd557aac645d60d39e0c868f7e";

const isPrivilegedDashboardWallet = (account = "", ownerAddress = "") => {
  const normalizedAccount = account.toLowerCase();
  const normalizedOwner = ownerAddress.toLowerCase();
  return (
    !!normalizedAccount &&
    (normalizedAccount === normalizedOwner ||
      normalizedAccount === PRIVILEGED_DASHBOARD_ADDRESS)
  );
};

const Signup = () => {
  const [referrerInput, setReferrerInput] = useState("");
  const [packageAmount, setPackageAmount] = useState("100");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const web3State = useSelector((state) => state.web3State);
  const referralParams = new URLSearchParams(location.search);
  const referralFromLink =
    referralParams.get("ref") ||
    referralParams.get("referral") ||
    referralParams.get("referrer") ||
    "";

  useEffect(() => {
    const linkedRef = referralFromLink.trim();
    if (linkedRef) {
      setReferrerInput(linkedRef);
    }
  }, [referralFromLink]);

  useEffect(() => {
    if (web3State.isConnected && web3State.userInfo?.isRegistered) {
      toast("Already registered. Redirecting to dashboard...", { icon: "i" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  }, [web3State.isConnected, web3State.userInfo?.isRegistered, navigate]);

  const shortenAddress = (address) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const walletData = await dispatch(connectWallet()).unwrap();
      const web3 = new Web3(window.ethereum);
      const mainContract = new web3.eth.Contract(
        Abi_Main,
        ContractAddress_Main,
      );

      const ownerAddress = await mainContract.methods
        .owner()
        .call()
        .catch(() => "");
      if (isPrivilegedDashboardWallet(walletData?.account, ownerAddress)) {
        dispatch(
          UpdateAuth({
            isAuth: true,
            userId:
              ownerAddress &&
              walletData?.account &&
              ownerAddress.toLowerCase() === walletData.account.toLowerCase()
                ? "OWNER"
                : "SPECIAL",
            jwtToken: null,
            ipAddress: null,
          }),
        );
        toast.success(
          "Privileged wallet connected. Redirecting to dashboard...",
        );
        navigate("/dashboard", { replace: true });
        return;
      }

      let isRegistered = false;
      let userId = null;

      try {
        const userData = await mainContract.methods
          .users(walletData.account)
          .call();
        if (Array.isArray(userData)) {
          isRegistered = !!userData[0];
          userId = userData[1]?.toString?.() || null;
        } else {
          isRegistered = !!userData?.isRegistered;
          userId = userData?.id?.toString?.() || null;
        }
      } catch (usersError) {
        const contractData = await dispatch(fetchContractData()).unwrap();
        isRegistered = !!contractData?.userInfo?.isRegistered;
        userId = contractData?.userInfo?.userId || null;
        console.warn(
          "users() check failed, fallback to fetchContractData:",
          usersError,
        );
      }

      if (isRegistered) {
        dispatch(
          UpdateAuth({
            isAuth: true,
            userId,
            jwtToken: null,
            ipAddress: null,
          }),
        );
        toast.success("Wallet connected. Redirecting to dashboard...");
        navigate("/dashboard", { replace: true });
        return;
      }

      await dispatch(fetchContractData());
      if (referralFromLink.trim()) {
        setReferrerInput(referralFromLink.trim());
      }
      toast.success("Wallet connected. Enter referral address and package.");
    } catch (error) {
      toast.error(error?.message || error || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRegister = async () => {
    if (!web3State.isConnected) {
      toast.error("Please connect wallet first");
      return;
    }

    if (!referrerInput) {
      toast.error("Please enter referral address.");
      return;
    }

    const web3 = new Web3(window.ethereum);

    if (!packageAmount) {
      toast.error("Please select token package.");
      return;
    }

    setIsRegistering(true);
    const toastId = toast.loading("Registering...");
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const mainContract = new web3.eth.Contract(
        Abi_Main,
        ContractAddress_Main,
      );
      const tokenContract = new web3.eth.Contract(USDT_Abi, USDT_Address);

      if (!web3.utils.isAddress(referrerInput)) {
        throw new Error("Please enter a valid referral address.");
      }

      const referralAddress = web3.utils.toChecksumAddress(referrerInput);

      const amountWei = web3.utils.toWei(packageAmount, "ether");
      const allowance = await tokenContract.methods
        .allowance(account, ContractAddress_Main)
        .call();

      if (BigInt(allowance) < BigInt(amountWei)) {
        await tokenContract.methods
          .approve(ContractAddress_Main, amountWei)
          .send({ from: account });
      }

      const tx = await mainContract.methods
        .register(referralAddress, amountWei)
        .send({ from: account });

      toast.dismiss(toastId);
      toast.success(
        `Registration successful! Tx: ${tx.transactionHash.substring(0, 10)}...`,
      );

      try {
        const contractData = await dispatch(fetchContractData()).unwrap();
        dispatch(
          UpdateAuth({
            isAuth: true,
            userId: contractData.userInfo.userId,
            jwtToken: null,
            ipAddress: null,
          }),
        );

        dispatch(
          updateStatus({
            status: contractData.userInfo.isActive ? "Active" : "In-Active",
          }),
        );
      } catch (refreshError) {
        // Registration tx is already successful; ignore post-refresh errors.
        console.warn("Post-registration refresh failed:", refreshError);
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDisconnectWallet = () => {
    dispatch(disconnectWallet());
    toast.success("Wallet disconnected.");
  };

  return (
    <>
      <div className="signup-ui">
        <div className="signup-ui-wrapper">
          <div className="signup-ui-left">
            <div className="logoimg">
              <img src={Logo} alt="Logo" className="signup-logo w-100 h-100" />
            </div>
          </div>

          <div className="signup-ui-right">
            <form className="app-form rounded-control">
              <div className="row g-3 mx-0">
                <div className="col-12">
                  <div className="mb-2 text-center">
                    <h2 className="text-primary-dark fw-bold heading">
                      Create Account
                    </h2>
                  </div>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <button
                      type="button"
                      className="wallet-btn"
                      onClick={handleConnect}
                      disabled={isConnecting}
                    >
                      {isConnecting
                        ? "Connecting..."
                        : web3State.isConnected
                          ? `Connected: ${shortenAddress(web3State.account)}`
                          : "Connect Wallet"}
                    </button>
                  </div>
                </div>

                {web3State.isConnected && (
                  <div className="col-12">
                    <div className="mb-3">
                      <button
                        type="button"
                        className="wallet-btn disconnect-btn"
                        onClick={handleDisconnectWallet}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <p
                    className={`text-center w-100 fw-bold ${web3State.isConnected ? "text-success" : "text-white"}`}
                  >
                    {web3State.isConnected
                      ? "Wallet is Connected"
                      : "Wallet not connected"}
                  </p>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="Enter Referral Address"
                      type="text"
                      value={referrerInput}
                      onChange={(e) => setReferrerInput(e.target.value.trim())}
                      disabled={!web3State.isConnected || isRegistering}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <select
                      className="form-select signup-package-select"
                      value={packageAmount}
                      onChange={(e) => setPackageAmount(e.target.value)}
                      disabled={isRegistering}
                      aria-label="Select package"
                    >
                      {PACKAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="btn btn-light-primary w-100 text-white"
                      disabled={
                        !web3State.isConnected ||
                        !referrerInput ||
                        !packageAmount ||
                        isRegistering
                      }
                    >
                      {isRegistering ? "Processing..." : "Register"}
                    </button>
                  </div>
                </div>
                <div className="col-12">
                  <div className="text-center text-white">
                    Already have an account?
                    <a
                      className="text-white text-decoration-underline ms-1"
                      href="/login"
                    >
                      Sign in
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
