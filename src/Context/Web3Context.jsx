/* eslint-disable no-unused-vars */
// Disable fast refresh warning since this file exports both context provider and hook
/* @refresh reset */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectWallet,
  fetchContractData,
  disconnectWallet,
} from "../Redux/Web3Slice";
import toast from "react-hot-toast";

const Web3Context = createContext();

const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3Context must be used within Web3Provider");
  }
  return context;
};

const Web3Provider = ({ children }) => {
  const dispatch = useDispatch();
  const { isConnected, account, isLoading } = useSelector(
    (state) => state.web3State,
  );

  // Refs to prevent duplicate calls
  const connectionAttemptRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const fetchTimeoutRef = useRef(null);
  const pendingFetchRef = useRef(null);

  // OPTIMIZATION: Connect wallet only once
  const ensureConnected = useCallback(async () => {
    // Already connected
    if (isConnected && account) {
      return true;
    }

    // Already attempting connection
    if (connectionAttemptRef.current) {
      return false;
    }

    connectionAttemptRef.current = true;
    try {
      await dispatch(connectWallet()).unwrap();
      connectionAttemptRef.current = false;
      return true;
    } catch (error) {
      console.error("Connection failed:", error);
      connectionAttemptRef.current = false;
      return false;
    }
  }, [isConnected, account, dispatch]);

  // OPTIMIZATION: Debounce fetchContractData with request coalescing
  // Multiple simultaneous calls get merged into one
  const fetchContractDataDebounced = useCallback(() => {
    if (!isConnected || !account) {
      return;
    }

    // Cancel previous timeout if exists
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Check if we already have a pending fetch
    if (pendingFetchRef.current) {
      console.log("Fetch already pending, skipping duplicate request");
      return;
    }

    // Check if fetched recently (within 5 seconds)
    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    if (timeSinceLastFetch < 5000) {
      console.log("Fetch called too soon, debouncing...");
      // Debounce with 500ms delay
      fetchTimeoutRef.current = setTimeout(() => {
        if (isConnected && account && !pendingFetchRef.current) {
          pendingFetchRef.current = dispatch(fetchContractData());
          pendingFetchRef.current.finally(() => {
            pendingFetchRef.current = null;
            lastFetchTimeRef.current = Date.now();
          });
        }
      }, 500);
      return;
    }

    // Execute fetch
    lastFetchTimeRef.current = Date.now();
    pendingFetchRef.current = dispatch(fetchContractData());
    pendingFetchRef.current.finally(() => {
      pendingFetchRef.current = null;
    });
  }, [isConnected, account, dispatch]);

  // OPTIMIZATION: Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    isConnected,
    account,
    isLoading,
    ensureConnected,
    fetchContractDataDebounced,
    disconnect: () => dispatch(disconnectWallet()),
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export { Web3Provider, useWeb3Context };
