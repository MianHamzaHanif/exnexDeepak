// src/Components/Login/Login.jsx
import React, { useState, useEffect } from "react";
import "./Login.css";
import "../Dashboard/Dash.css";
import "../Dashboard/responsive.css";
import Logo from "/webimg/logo.png";
import Loginimage from "/webimg/login-img.png";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet, disconnectWallet } from "../../Redux/Web3Slice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [walletAddressInput, setWalletAddressInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const web3State = useSelector((state) => state.web3State);
  const auth = useSelector((state) => state.UserAuth);

  useEffect(() => {
    if (auth.isAuth) {
      // navigate("/dashboard");
    }
  }, [auth.isAuth, navigate]);

  useEffect(() => {
    const handleAccountChange = () => {
      if (web3State.isConnected) {
        toast.error("Wallet address changed. Disconnecting...");
        dispatch(disconnectWallet());
        setWalletAddressInput("");
      }
    };

    window.ethereum?.on("accountsChanged", handleAccountChange);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChange);
    };
  }, [web3State.isConnected, dispatch]);

  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      setWalletAddressInput(web3State.account);
    }
  }, [web3State.isConnected, web3State.account]);

  const shortenAddress = (address) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const result = await dispatch(connectWallet()).unwrap();
      setWalletAddressInput(result?.account || "");
      toast.success("Wallet connected successfully.");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(error || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!web3State.isConnected) {
      toast.error("Please connect wallet first");
      return;
    }

    if (!walletAddressInput) {
      toast.error("Wallet address not found");
      return;
    }

    navigate("/signup");
  };

  const handleDisconnectWallet = () => {
    dispatch(disconnectWallet());
    setWalletAddressInput("");
    toast.success("Wallet disconnected.");
  };

  return (
    <>
      <div className="login-ui">
        <div className="login-ui-wrapper">
          <div className="login-ui-left">
            <div className="logoimg">
              <img src={Logo} alt="Logo" className="signup-logo w-100 h-100" />
            </div>
          </div>

          <div className="login-ui-right">
            <form
              className="app-form rounded-control"
              onSubmit={handleRegister}
            >
              <div className="row g-3">
                <div className="col-12"></div>
                <div className="col-12">
                  <div className="mb-2 text-center">
                    <h2 className="text-white fw-bold text-center">
                      Please Login to Your Account
                    </h2>
                  </div>
                </div>

                <div className="col-12 text-center">
                  <button
                    type="button"
                    className="wallet-btn"
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting
                      ? "Connecting..."
                      : web3State.isConnected
                        ? `Connected: ${shortenAddress(walletAddressInput || web3State.account)}`
                        : "Connect Wallet"}
                  </button>
                </div>

                {web3State.isConnected && (
                  <div className="col-12 text-center">
                    <button
                      type="button"
                      className="wallet-btn disconnect-btn"
                      onClick={handleDisconnectWallet}
                    >
                      Disconnect
                    </button>
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
                      className="form-control text-white"
                      id="walletAddress"
                      placeholder="Wallet Address (auto-filled after connection)"
                      type="text"
                      value={walletAddressInput}
                      readOnly
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <button
                      type="submit"
                      className="btn btn-light-info text-white w-100"
                      disabled={!web3State.isConnected || !walletAddressInput}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <div className="text-center text-white">
                    Don&apos;t Have Your Account yet?
                    <a
                      className="text-decoration-underline ms-1 text-white"
                      href="/signup"
                    >
                      Sign up
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

export default Login;
