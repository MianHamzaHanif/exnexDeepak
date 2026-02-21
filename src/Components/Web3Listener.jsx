// src/Components/Web3Listener.jsx - OPTIMIZED VERSION
// Compatible with MetaMask, TrustWallet, and all EVM wallets
import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { connectWallet, updateAccount, updateChainId, fetchContractData, disconnectWallet } from '../Redux/Web3Slice';
import { UpdateAuth } from '../Redux/AuthSlice';
import { getActiveChainConfig } from '../Services/chains';
import toast from 'react-hot-toast';

const AUTO_REFRESH_INTERVAL = 120000; // 120 seconds (2 minutes)
const PUBLIC_ROUTES = new Set(['/', '/home', '/signup', '/login', '/forget']);

const isPublicRoute = (pathname = '') => PUBLIC_ROUTES.has(pathname.toLowerCase());

const Web3Listener = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, account, isLoading: web3IsLoading } = useSelector((state) => state.web3State);
  const auth = useSelector((state) => state.UserAuth);
  const hasShownConnectionToast = useRef(false);
  const isInitialMount = useRef(true);
  const previousAccount = useRef(null);
  const isHandlingChange = useRef(false);
  const refreshIntervalRef = useRef(null);
  const connectionAttemptRef = useRef(false); // OPTIMIZATION: Prevent duplicate connection attempts
  const chainConfig = getActiveChainConfig();

  // OPTIMIZATION: Auto-refresh data every 120 seconds (only on dashboard and when connected)
  // Only run when wallet is fully connected and not loading
  useEffect(() => {
    if (isConnected && account && !web3IsLoading && location.pathname === '/dashboard') {
      console.log('Starting auto-refresh interval for dashboard');
      
      refreshIntervalRef.current = setInterval(() => {
        console.log('Auto-refreshing contract data');
        dispatch(fetchContractData()).catch((err) => {
          console.error('Auto-refresh failed:', err);
        });
      }, AUTO_REFRESH_INTERVAL);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          console.log('Cleared auto-refresh interval');
        }
      };
    }
  }, [isConnected, account, web3IsLoading, dispatch, location.pathname]);

  // Handle account changes - OPTIMIZED: prevent race conditions and duplicate requests
  const handleAccountsChanged = useCallback(
    async (accounts) => {
      // Prevent multiple simultaneous executions
      if (isHandlingChange.current) {
        console.log('Already handling wallet change, skipping...');
        return;
      }

      const isOnPublicPage = isPublicRoute(location.pathname);
      const currentAccount = accounts[0]?.toLowerCase();
      const prevAccount = previousAccount.current?.toLowerCase();

      console.log('Wallet change detected:', {
        currentAccount,
        prevAccount,
        isOnPublicPage,
        isAuthenticated: auth.isAuth,
      });

      if (accounts.length === 0) {
        // Wallet disconnected
        console.log('Wallet disconnected');
        toast.error('Wallet disconnected');
        dispatch(disconnectWallet());
        dispatch(UpdateAuth({
          isAuth: false,
          userId: null,
          jwtToken: null,
          ipAddress: null,
        }));
        hasShownConnectionToast.current = false;
        previousAccount.current = null;
        connectionAttemptRef.current = false;
        
        // Redirect to login if not already there
        if (!isOnPublicPage) {
          navigate('/signup');
        }
        return;
      }

      // Account changed to a different address
      if (currentAccount && currentAccount !== prevAccount && prevAccount !== null) {
        console.log('Account changed from', prevAccount, 'to', currentAccount);
        
        // Don't redirect if on auth pages (user is trying to connect)
        if (isOnPublicPage) {
          console.log('On auth page, updating account only');
          dispatch(updateAccount(currentAccount));
          previousAccount.current = currentAccount;
          return;
        }

        // If on dashboard or other protected pages, handle wallet change
        if (auth.isAuth) {
          isHandlingChange.current = true;
          
          toast('Wallet changed. Redirecting to login...', { icon: 'ℹ️', duration: 2000 });
          
          console.log('Clearing auth and disconnecting...');
          
          // Clear auth immediately
          dispatch(disconnectWallet());
          dispatch(UpdateAuth({
            isAuth: false,
            userId: null,
            jwtToken: null,
            ipAddress: null,
          }));
          
          // Wait a bit then check new wallet and redirect
          setTimeout(async () => {
            try {
              console.log('Connecting new wallet...');
              connectionAttemptRef.current = true;
              
              await dispatch(connectWallet()).unwrap();
              const contractData = await dispatch(fetchContractData()).unwrap();
              
              console.log('New wallet data:', contractData.userInfo);
              
              // Check if new wallet is registered
              if (contractData.userInfo.isRegistered) {
                navigate('/signup');
                toast.success(`User ID: ${contractData.userInfo.userId}. Please login.`, {
                  duration: 3000,
                });
              } else {
                navigate('/signup');
                toast('Wallet not registered. Please sign up.', { icon: 'ℹ️', duration: 3000 });
              }
            } catch (error) {
              console.error('Error checking new wallet:', error);
              navigate('/signup');
              toast.error('Please connect wallet to continue');
            } finally {
              isHandlingChange.current = false;
              connectionAttemptRef.current = false;
              previousAccount.current = currentAccount;
            }
          }, 1000);
        } else {
          // Not authenticated, just update account
          console.log('Not authenticated, updating account');
          dispatch(updateAccount(currentAccount));
          previousAccount.current = currentAccount;
        }
      } else {
        // First time setting account or same account
        previousAccount.current = currentAccount;
      }
    },
    [auth.isAuth, dispatch, navigate, location.pathname]
  );

  // Handle chain changes
  const handleChainChanged = useCallback(
    (chainIdHex) => {
      const newChainId = Number(chainIdHex);
      console.log('Chain changed to:', newChainId);
      
      if (newChainId !== chainConfig.chainIdDecimal) {
        toast.error(`Please switch to ${chainConfig.chainName}`);
        window.location.reload();
      } else {
        dispatch(updateChainId(newChainId));
        if (!isInitialMount.current) {
          toast.success(`Network changed to ${chainConfig.chainName}`);
        }
      }
    },
    [dispatch, chainConfig.chainIdDecimal, chainConfig.chainName]
  );

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    console.log('Wallet disconnect event triggered');
    toast.error('Wallet disconnected');
    dispatch(disconnectWallet());
    dispatch(UpdateAuth({
      isAuth: false,
      userId: null,
      jwtToken: null,
      ipAddress: null,
    }));
    hasShownConnectionToast.current = false;
    previousAccount.current = null;
    connectionAttemptRef.current = false;
    
    // Redirect to login
    if (!isPublicRoute(location.pathname)) {
      navigate('/signup');
    }
  }, [dispatch, navigate, location.pathname]);

  // Setup wallet event listeners - Works with all EVM wallets
  useEffect(() => {
    // Check if wallet is available
    if (!window.ethereum) {
      return;
    }

    console.log('Setting up wallet event listeners');
    
    // Setup listeners if wallet supports them
    if (typeof window.ethereum.on === 'function') {
      try {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
      } catch (error) {
        console.warn('Error setting up wallet listeners:', error);
      }
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up wallet event listeners');
      try {
        if (window.ethereum && typeof window.ethereum.removeListener === 'function') {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      } catch (error) {
        console.warn('Error removing wallet listeners:', error);
      }
      
      // Clear refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect]);

  // Auto-connect only on dashboard, not on login/signup - FIXED: Add timeout and better guards
  useEffect(() => {
    const checkConnection = async () => {
      const isOnPublicPage = isPublicRoute(location.pathname);
      
      // Don't auto-connect on public pages
      if (isOnPublicPage) {
        console.log('On public page, skipping auto-connect');
        return;
      }

      // Auto-connect if previously connected and authenticated
      if (window.ethereum && window.ethereum.selectedAddress && auth.isAuth && !isConnected) {
        console.log('Auto-connecting wallet on protected page');
        
        try {
          await dispatch(connectWallet()).unwrap();
          await dispatch(fetchContractData()).unwrap();
          
          if (!hasShownConnectionToast.current) {
            hasShownConnectionToast.current = true;
          }
          
          // Set initial account reference
          if (!previousAccount.current) {
            previousAccount.current = window.ethereum.selectedAddress.toLowerCase();
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
          // Avoid noisy false error toast on reload when wallet is already connected
          if (!window.ethereum?.selectedAddress) {
            toast.error('Failed to connect wallet. Please reconnect.');
          }
        }
      } else if (!auth.isAuth && !isOnPublicPage) {
        // Not authenticated and on protected page - redirect to login
        console.log('Not authenticated, redirecting to login');
        navigate('/signup');
      }
    };

    if (isInitialMount.current) {
      checkConnection();
      isInitialMount.current = false;
    }
  }, [dispatch, auth.isAuth, navigate, location.pathname, isConnected]);

  return children;
};

export default Web3Listener;
