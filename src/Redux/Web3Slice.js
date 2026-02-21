/* eslint-disable no-unused-vars */
// src/Redux/Web3Slice.js - FIXED VERSION WITH REQUEST COALESCING

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Web3 from 'web3';
import {
  exnexDeepakAddress as ContractAddress_Main,
  exnexDeepakAbi as Abi_Main,
} from '../Services/exnexDeepakAddress';
import {
  tokenAddress as USDT_Address,
  tokenAbi as USDT_Abi,
} from '../Services/tokenAddress';
import { ensureCorrectNetwork, getBrowserProvider, requestWalletAccounts } from '../Services/walletService';

// OPTIMIZATION: Request coalescing - merge multiple simultaneous fetchContractData calls
let pendingFetchContractDataPromise = null;
let fetchContractDataPendingCount = 0;
const MAX_FETCH_QUEUE_TIME = 500; // ms - wait up to 500ms to coalesce requests

// FIXED: Helper to detect if contract is in test mode (minutes) or production (days)
const detectTimeUnit = (durationValue) => {
  // return durationValue < 100 ? 60 : 86400; 
  return 86400;
};

// Helper function to format time remaining
const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return "Completed";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Helper to format ERC20 amounts with variable decimals (without precision loss in JS float math)
const formatTokenAmount = (rawValue, decimals = 18) => {
  try {
    const value = (rawValue ?? '0').toString();
    const safeDecimals = Number.isFinite(Number(decimals)) ? Number(decimals) : 18;

    if (safeDecimals <= 0) return value;

    const padded = value.padStart(safeDecimals + 1, '0');
    const whole = padded.slice(0, -safeDecimals).replace(/^0+(?=\d)/, '');
    const fraction = padded.slice(-safeDecimals).replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole;
  } catch {
    return '0';
  }
};

// Initial state
const initialState = {
  account: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  balances: {
    usdt: '0',
    withdrawable: '0',
    totalSupply: '0',
    symbol: 'USDT',
  },
  userInfo: {
    isActive: false,
    isRegistered: false,
    hasUsedBuy: false,
    hasPurchased: false,
    userId: null,
  },
  plans: [],
  isLoading: false,
  lastUpdated: null,
  usdtContractAddress: USDT_Address,
  dashboardData: {},
  loadingDashboard: false,
  activationHistory: [],
  loadingActivationHistory: false,
  referralHistory: [],
  loadingReferralHistory: false,
  referrals: [],
  loadingReferrals: false,
  multiLevelReferrals: [],
  withdrawalHistory: [],
  loadingWithdrawalHistory: false,
  loadingWithdraw: false,
  activateButtonLoading: false,
  upgradeButtonLoading: false,
  reinvestButtonLoading: false,
  activeInvestments: [],
  investmentHistory: [],
  loadingInvestmentHistory: false,
  contractTimeUnit: 86400, // NEW: Store detected time unit (60 for minutes, 86400 for days)
  maxPageSize: 50, // NEW: Store max items per page from contract
};

// Connect wallet
export const connectWallet = createAsyncThunk(
  'web3/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      const accounts = await requestWalletAccounts();

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const { chainId } = await ensureCorrectNetwork();

      const ethersProvider = await getBrowserProvider();
      window.ethersProvider = ethersProvider;

      const web3Instance = new Web3(window.ethereum);
      window.web3 = web3Instance;

      return {
        account: accounts[0].toLowerCase(),
        chainId,
      };
    } catch (error) {
      console.error('Connect wallet error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// OPTIMIZATION: Fetch contract data with request coalescing
// Multiple simultaneous calls will be merged into one request
export const fetchContractData = createAsyncThunk(
  'web3/fetchContractData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account } = web3State;

      if (!account || !window.web3) {
        throw new Error('Wallet not connected');
      }

      // OPTIMIZATION: If there's already a pending fetch request, wait for it instead of making a new one
      if (pendingFetchContractDataPromise) {
        console.log('Reusing pending fetchContractData request');
        fetchContractDataPendingCount++;
        try {
          const result = await pendingFetchContractDataPromise;
          return result;
        } finally {
          fetchContractDataPendingCount--;
        }
      }

      // Mark that we're starting a new fetch
      fetchContractDataPendingCount = 1;

      // Create the actual fetch promise
      const fetchPromise = (async () => {
        const web3 = window.web3;
        const mainContract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

        const [usdtAddrFromContract, maxPageSize] = await Promise.all([
          mainContract.methods.usdtToken().call(),
          mainContract.methods.MAX_ITEMS_PER_PAGE().call(),
        ]);

        const activeTokenAddress = usdtAddrFromContract || USDT_Address;
        const usdtContract = new web3.eth.Contract(USDT_Abi, activeTokenAddress);

        const [
          usdtBalance,
          withdrawable,
          userData,
          tokenDecimalsRaw,
          tokenSymbolRaw,
          tokenTotalSupplyRaw,
        ] = await Promise.all([
          usdtContract.methods.balanceOf(account).call(),
          mainContract.methods.getTotalWithdrawable(account).call(),
          mainContract.methods.getUserByAddress(account).call(),
          usdtContract.methods.decimals().call().catch(() => '18'),
          usdtContract.methods.symbol().call().catch(() => 'USDT'),
          usdtContract.methods.totalSupply().call().catch(() => '0'),
        ]);

      const tokenDecimals = Number(tokenDecimalsRaw || 18);
      const usdtFormatted = formatTokenAmount(usdtBalance, tokenDecimals);
      const withdrawableFormatted = formatTokenAmount(withdrawable, tokenDecimals);
      const totalSupplyFormatted = formatTokenAmount(tokenTotalSupplyRaw, tokenDecimals);

      const isActive = !!Number(userData[8]);
      const isRegistered = !!Number(userData[9]);
      const hasPurchased = !!Number(userData[10]);
      const hasUsedBuy = !!Number(userData[11]);
      const userId = userData[0].toString();

      // Fetch plans and detect time unit
      const planIds = [30, 60, 90];
      const planPromises = planIds.map(id =>
        mainContract.methods.getPlanInfo(id).call()
          .then(info => ({
            id,
            duration: info[0].toString(),
            roi: info[1].toString(),
            totalReturn: info[2].toString(),
            name: info[3] || `Plan ${id}`,
            label: `${info[3] || 'Plan'} - ${info[0]} days, ROI: ${info[1]}%, Total: ${info[2]}%`,
          }))
          .catch(() => null)
      );

      const plansData = (await Promise.all(planPromises)).filter(p => p && Number(p.duration) > 0);
      
      // FIXED: Detect time unit from first plan
      const timeUnit = plansData.length > 0 ? detectTimeUnit(Number(plansData[0].duration)) : 86400;

      return {
        balances: {
          usdt: usdtFormatted,
          withdrawable: withdrawableFormatted,
          totalSupply: totalSupplyFormatted,
          symbol: tokenSymbolRaw || 'USDT',
        },
        userInfo: {
          isActive,
          isRegistered,
          hasPurchased,
          hasUsedBuy,
          userId,
        },
        plans: plansData,
        usdtContractAddress: activeTokenAddress,
        lastUpdated: Date.now(),
        contractTimeUnit: timeUnit, // NEW: Store detected time unit
        maxPageSize: Number(maxPageSize), // NEW: Store max page size
      };
      })();

      // Set the pending promise for other callers to reuse
      pendingFetchContractDataPromise = fetchPromise;

      // Wait a bit for additional requests to queue up, then clear the pending flag
      fetchPromise.finally(() => {
        setTimeout(() => {
          pendingFetchContractDataPromise = null;
          fetchContractDataPendingCount = 0;
        }, MAX_FETCH_QUEUE_TIME);
      });

      return await fetchPromise;
    } catch (error) {
      console.error('Fetch contract data error:', error);
      pendingFetchContractDataPromise = null;
      fetchContractDataPendingCount = 0;
      return rejectWithValue(error.message);
    }
  }
);

// Activate contract
export const activateContract = createAsyncThunk(
  'web3/activateContract',
  async ({ planId, amount }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account } = web3State;
      const web3 = window.web3;

      if (!account || !web3) {
        throw new Error('Wallet not connected');
      }

      const mainContract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const usdtContract = new web3.eth.Contract(USDT_Abi, USDT_Address);

      const amountWei = web3.utils.toWei(amount, 'ether');

      const allowance = await usdtContract.methods
        .allowance(account, ContractAddress_Main)
        .call();

      if (BigInt(allowance) < BigInt(amountWei)) {
        const approveTx = await usdtContract.methods
          .approve(ContractAddress_Main, amountWei)
          .send({ from: account });
       
        if (!approveTx.status) {
          throw new Error('Approval failed');
        }
      }

      const buyTx = await mainContract.methods
        .buy(Number(planId), amountWei)
        .send({ from: account });

      if (!buyTx.status) {
        throw new Error('Activation failed');
      }

      await Promise.all([
        dispatch(fetchContractData()),
        dispatch(fetchDashboardData()),
        dispatch(fetchActivationHistory()),
      ]);

      return {
        success: true,
        txHash: buyTx.transactionHash,
      };
    } catch (error) {
      console.error('Activation error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Upgrade contract
export const upgradeContract = createAsyncThunk(
  'web3/upgradeContract',
  async ({ planId, amount }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account } = web3State;
      const web3 = window.web3;

      if (!account || !web3) {
        throw new Error('Wallet not connected');
      }

      const mainContract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const amountWei = web3.utils.toWei(amount, 'ether');

      const upgradeTx = await mainContract.methods
        .upgrade(Number(planId), amountWei)
        .send({ from: account });

      if (!upgradeTx.status) {
        throw new Error('Upgrade failed');
      }

      await Promise.all([
        dispatch(fetchContractData()),
        dispatch(fetchDashboardData()),
        dispatch(fetchActivationHistory()),
      ]);

      return {
        success: true,
        txHash: upgradeTx.transactionHash,
      };
    } catch (error) {
      console.error('Upgrade error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Reinvest contract
export const reinvestContract = createAsyncThunk(
  'web3/reinvestContract',
  async ({ planId, amount }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account } = web3State;
      const web3 = window.web3;

      if (!account || !web3) {
        throw new Error('Wallet not connected');
      }

      const mainContract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
      const usdtContract = new web3.eth.Contract(USDT_Abi, USDT_Address);

      const amountWei = web3.utils.toWei(amount, 'ether');

      const allowance = await usdtContract.methods
        .allowance(account, ContractAddress_Main)
        .call();

      if (BigInt(allowance) < BigInt(amountWei)) {
        const approveTx = await usdtContract.methods
          .approve(ContractAddress_Main, amountWei)
          .send({ from: account });
       
        if (!approveTx.status) {
          throw new Error('Approval failed');
        }
      }

      const reinvestTx = await mainContract.methods
        .reinvest(Number(planId), amountWei)
        .send({ from: account });

      if (!reinvestTx.status) {
        throw new Error('Reinvest failed');
      }

      await Promise.all([
        dispatch(fetchContractData()),
        dispatch(fetchDashboardData()),
        dispatch(fetchActivationHistory()),
      ]);

      return {
        success: true,
        txHash: reinvestTx.transactionHash,
      };
    } catch (error) {
      console.error('Reinvest error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch investment history - UPDATED for pagination and new ABI
export const fetchInvestmentHistory = createAsyncThunk(
  'web3/fetchInvestmentHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, contractTimeUnit, maxPageSize } = web3State;

      if (!account || !window.web3) throw new Error('Wallet not connected');

      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      const userData = await contract.methods.getUserByAddress(account).call();
      const userId = userData[0].toString();

      // Fetch all user investments paginated
      let offset = 0;
      const limit = maxPageSize;
      let hasMore = true;
      let allInvIds = [];
      let allPlanIds = [];
      let allAmounts = [];
      let allTotalPayouts = [];
      let allWithdrawns = [];
      let allAvailables = [];
      let allCompleteds = [];
      let allStartTimes = [];

      while (hasMore) {
        const investments = await contract.methods.getUserInvestments(account, offset, limit).call();
        allInvIds = [...allInvIds, ...investments[0]];
        allPlanIds = [...allPlanIds, ...investments[1]];
        allAmounts = [...allAmounts, ...investments[2]];
        allTotalPayouts = [...allTotalPayouts, ...investments[3]];
        allWithdrawns = [...allWithdrawns, ...investments[4]];
        allAvailables = [...allAvailables, ...investments[5]];
        allCompleteds = [...allCompleteds, ...investments[6]];
        allStartTimes = [...allStartTimes, ...investments[7]];
        hasMore = investments[9];
        offset += limit;
      }

      // Fetch all activation history paginated (for remarks)
      offset = 0;
      hasMore = true;
      let allHistAmounts = [];
      let allHistPlanIds = [];
      let allRemarks = [];
      let allHistTimestamps = [];

      while (hasMore) {
        const hist = await contract.methods.getActivationHistory(account, offset, limit).call();
        allHistAmounts = [...allHistAmounts, ...hist[0]];
        allHistPlanIds = [...allHistPlanIds, ...hist[1]];
        allRemarks = [...allRemarks, ...hist[2]];
        allHistTimestamps = [...allHistTimestamps, ...hist[3]];
        hasMore = hist[5];
        offset += limit;
      }

      if (allInvIds.length === 0) return [];

      if (allInvIds.length !== allRemarks.length) {
        console.warn('Investment and activation history length mismatch');
      }

      const currentTime = Math.floor(Date.now() / 1000);

      const formatted = await Promise.all(
        allInvIds.map(async (invId, idx) => {
          const struct = await contract.methods.investments(invId).call();

          const planId = Number(allPlanIds[idx]);
          const amountWei = allAmounts[idx].toString();
          const startTime = Number(allStartTimes[idx]);
          const dailyPayoutWei = struct[3].toString();
          const totalPayoutWei = allTotalPayouts[idx].toString();
          const withdrawnWei = allWithdrawns[idx].toString();
          const lastWithdrawTime = Number(struct[6]);
          const completed = allCompleteds[idx];
          const isUpgrade = struct[8];

          const planInfo = await contract.methods.getPlanInfo(planId).call();
          const durationDays = Number(planInfo[0]);
          
          // FIXED: Use correct time unit with safety check
          const safeTimeUnit = contractTimeUnit || 86400;
          const endTime = startTime + (durationDays * safeTimeUnit);
          const timeRemaining = Math.max(0, endTime - currentTime);

          // FIXED: Get available from fetched array
          const availableWei = allAvailables[idx].toString();

          // FIXED: Parse all values with safety checks
          const amount = parseFloat(web3.utils.fromWei(amountWei, 'ether') || 0).toFixed(4);
          const dailyPayout = parseFloat(web3.utils.fromWei(dailyPayoutWei, 'ether') || 0).toFixed(4);
          const totalPayout = parseFloat(web3.utils.fromWei(totalPayoutWei, 'ether') || 0).toFixed(4);
          const withdrawn = parseFloat(web3.utils.fromWei(withdrawnWei, 'ether') || 0).toFixed(4);
          const available = parseFloat(web3.utils.fromWei(availableWei, 'ether') || 0).toFixed(4);
          
          // FIXED: Calculate income with safety
          const withdrawnNum = parseFloat(withdrawn) || 0;
          const availableNum = parseFloat(available) || 0;
          const income = (withdrawnNum + availableNum).toFixed(4);

          // FIXED: Date formatting with safety
          const lastWithdrawDate = lastWithdrawTime > 0 ? new Date(lastWithdrawTime * 1000).toLocaleString() : 'N/A';
          const startDate = new Date(startTime * 1000).toLocaleString();
          const endDate = new Date(endTime * 1000).toLocaleString();

          const remark = allRemarks[idx] ? `${allRemarks[idx]} Plan ${planId} ${completed ? '(Completed)' : '(Active)'} ${isUpgrade ? '(Upgrade)' : ''}` : 'Unknown';

          return {
            userId,
            planId,
            amount,
            startTime: startDate,
            startTimeUnix: startTime,
            endTimeUnix: endTime,
            dailyPayout,
            totalPayout,
            withdrawn,
            lastWithdrawTime: lastWithdrawDate,
            completed: completed ? 'Yes' : 'No',
            isUpgrade: isUpgrade ? 'Yes' : 'No',
            available,
            income,
            onAmount: amount,
            remark,
            date: startDate,
            endTime: endDate,
            timeRemainingFormatted: formatTimeRemaining(timeRemaining),
            timeRemainingSeconds: timeRemaining,
          };
        })
      );

      formatted.sort((a, b) => b.startTimeUnix - a.startTimeUnix);

      return formatted;
    } catch (error) {
      console.error('Fetch investment history error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// UPDATED: Fetch dashboard data with pagination
export const fetchDashboardData = createAsyncThunk(
  'web3/fetchDashboardData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, plans, contractTimeUnit, maxPageSize } = web3State;

      // FIXED: Add comprehensive guards to prevent race conditions
      if (!account) throw new Error('Wallet address not available yet. Please wait.');
      if (!window.web3) throw new Error('Web3 instance not initialized');
      if (!plans || plans.length === 0) throw new Error('Plans data not loaded yet');
      if (!maxPageSize || maxPageSize <= 0) throw new Error('Max page size not initialized');
     
      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);
     
      const [data, userData, levelOneCount] = await Promise.all([
        contract.methods.getDashboardData(account).call(),
        contract.methods.getUserByAddress(account).call(),
        contract.methods.getLevelCount(account, 1).call().catch(() => null),
      ]);
     
      // Fetch referral history paginated
      let offset = 0;
      const limit = maxPageSize;
      let hasMore = true;
      let allFroms = [];
      let allFromIds = [];
      let allLevels = [];
      let allAmounts = [];
      let allOnAmounts = [];
      let allTimestamps = [];

      while (hasMore) {
        const referralHist = await contract.methods.getReferralHistory(account, offset, limit).call();
        allFroms = [...allFroms, ...referralHist[0]];
        allFromIds = [...allFromIds, ...referralHist[1]];
        allLevels = [...allLevels, ...referralHist[2]];
        allAmounts = [...allAmounts, ...referralHist[3]];
        allOnAmounts = [...allOnAmounts, ...referralHist[4]];
        allTimestamps = [...allTimestamps, ...referralHist[5]];
        hasMore = referralHist[7];
        offset += limit;
      }

      const levelUsers = Array(11).fill().map(() => new Set());
      const incomes = Array(11).fill(0);
     
      allLevels.forEach((level, idx) => {
        const lvl = Number(level) - 1;
        if (lvl >= 0 && lvl < 11) {
          const fromId = allFromIds[idx].toString();
          levelUsers[lvl].add(fromId);
          incomes[lvl] += Number(web3.utils.fromWei(allAmounts[idx].toString(), 'ether'));
        }
      });
     
      const levelCounts = levelUsers.map(set => set.size);

      // My Team count from on-chain level counts (Level 1 -> Level 10)
      const contractLevelCountsRaw = await Promise.all(
        Array.from({ length: 10 }, (_, idx) =>
          contract.methods
            .getLevelCount(account, idx + 1)
            .call()
            .catch(() => null)
        )
      );
      const contractLevelCounts = contractLevelCountsRaw.map((value, idx) =>
        Number(value ?? levelCounts[idx] ?? 0)
      );
      const myTeamCount = contractLevelCounts.reduce(
        (sum, count) => sum + Number(count || 0),
        0
      );
     
      // Fetch user investments paginated
      offset = 0;
      hasMore = true;
      let allInvIds = [];
      let allPlanIds = [];
      let allInvAmounts = [];
      let allInvTotalPayouts = [];
      let allInvWithdrawns = [];
      let allInvAvailables = [];
      let allInvCompleteds = [];
      let allInvStartTimes = [];

      while (hasMore) {
        const investments = await contract.methods.getUserInvestments(account, offset, limit).call();
        allInvIds = [...allInvIds, ...investments[0]];
        allPlanIds = [...allPlanIds, ...investments[1]];
        allInvAmounts = [...allInvAmounts, ...investments[2]];
        allInvTotalPayouts = [...allInvTotalPayouts, ...investments[3]];
        allInvWithdrawns = [...allInvWithdrawns, ...investments[4]];
        allInvAvailables = [...allInvAvailables, ...investments[5]];
        allInvCompleteds = [...allInvCompleteds, ...investments[6]];
        allInvStartTimes = [...allInvStartTimes, ...investments[7]];
        hasMore = investments[9];
        offset += limit;
      }

      const allInvestments = [];
      const currentTime = Math.floor(Date.now() / 1000);
     
      allInvIds.forEach((invId, i) => {
        const planId = Number(allPlanIds[i]);
        const amount = web3.utils.fromWei(allInvAmounts[i].toString(), 'ether');
        const startTime = Number(allInvStartTimes[i]);
        const completed = allInvCompleteds[i];
        const totalPayoutWei = allInvTotalPayouts[i].toString();
        const withdrawnWei = allInvWithdrawns[i].toString();
        const availableWei = allInvAvailables[i].toString();
       
        const plan = plans.find(p => Number(p.id) === planId);
        const durationDays = plan ? Number(plan.duration) : 0;
        
        // FIXED: Use contractTimeUnit instead of hardcoded 86400
        const endTime = startTime + (durationDays * contractTimeUnit);
        const timeRemaining = endTime - currentTime;
        
        // FIXED: Calculate elapsed time and current available based on time unit
        const elapsedTime = currentTime - startTime;
        const totalDuration = durationDays * contractTimeUnit;
        const progress = totalDuration > 0 ? Math.min(1, elapsedTime / totalDuration) : 0;
        
        const totalPayout = parseFloat(web3.utils.fromWei(totalPayoutWei, 'ether'));
        const withdrawn = parseFloat(web3.utils.fromWei(withdrawnWei, 'ether'));
        const contractAvailable = parseFloat(web3.utils.fromWei(availableWei, 'ether'));
        
        // FIXED: Calculate real-time available amount
        const earnedSoFar = totalPayout * progress;
        const currentAvailable = Math.max(0, earnedSoFar - withdrawn);
       
        allInvestments.push({
          investmentId: invId.toString(),
          planId,
          planName: `${durationDays} ${contractTimeUnit === 60 ? 'Minutes' : 'Days'} Plan`,
          amount: parseFloat(amount).toFixed(2),
          startTime,
          endTime,
          timeRemaining: Math.max(0, timeRemaining),
          timeRemainingFormatted: formatTimeRemaining(Math.max(0, timeRemaining)),
          totalPayout: totalPayout.toFixed(4),
          withdrawn: withdrawn.toFixed(4),
          available: currentAvailable.toFixed(4), // FIXED: Use calculated value
          contractAvailable: contractAvailable.toFixed(4), // Store contract value for comparison
          completed: completed,
          startDate: new Date(startTime * 1000).toLocaleString(),
          endDate: new Date(endTime * 1000).toLocaleString(),
          progress: (progress * 100).toFixed(2), // NEW: Progress percentage
          dailyPayout: (totalPayout / durationDays).toFixed(4), // NEW: Daily/per-unit payout
        });
      });
     
      const activeInvestments = allInvestments.filter(inv => inv.timeRemaining > 0);
     
      const planSummaries = {
        30: { count: 0, activeCount: 0, earnings: 0 },
        60: { count: 0, activeCount: 0, earnings: 0 },
        90: { count: 0, activeCount: 0, earnings: 0 },
      };
     
      allInvestments.forEach((inv) => {
        const pid = inv.planId;
        if (planSummaries[pid]) {
          planSummaries[pid].count++;
          const earned = parseFloat(inv.withdrawn) + parseFloat(inv.available);
          planSummaries[pid].earnings += earned;
          if (inv.timeRemaining > 0) planSummaries[pid].activeCount++;
        }
      });
     
      const calculatedTotalInvested = allInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2);
      const calculatedTotalWithdrawn = allInvestments.reduce((sum, inv) => sum + parseFloat(inv.withdrawn), 0).toFixed(2);
     
      // Direct referrals = Level 1 count
      const directReferrals = Number(levelOneCount ?? data[3] ?? 0);
     
      return {
        depositAmount: parseFloat(web3.utils.fromWei(data[0].toString(), 'ether')).toFixed(2),
        tradingIncome: parseFloat(web3.utils.fromWei(data[1].toString(), 'ether')).toFixed(2),
        levelIncome: parseFloat(web3.utils.fromWei(data[2].toString(), 'ether')).toFixed(2),
        directReferrals,
        withdrawalBalance: parseFloat(web3.utils.fromWei(data[4].toString(), 'ether')).toFixed(2),
        totalInvested: calculatedTotalInvested,
        totalWithdrawn: calculatedTotalWithdrawn,
        totalRefEarnings: parseFloat(web3.utils.fromWei(userData[7].toString(), 'ether')).toFixed(2),
        referrals: Number(userData[2]),
        activeInvestments,
        allInvestments,
        planSummaries,
        levelCounts: contractLevelCounts,
        levelIncomes: incomes.map(i => i.toFixed(2)),
        isActive: !!Number(userData[8]),
        userId: userData[0].toString(),
        currentEarnings: parseFloat(web3.utils.fromWei(data[1].toString(), 'ether')).toFixed(2),
        directReferralIncome: incomes[0].toFixed(2),
        myTeamCount,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch activation history - UPDATED for pagination
export const fetchActivationHistory = createAsyncThunk(
  'web3/fetchActivationHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, maxPageSize } = web3State;

      // FIXED: Add comprehensive guards to prevent race conditions
      if (!account) throw new Error('Wallet address not available yet. Please wait.');
      if (!window.web3) throw new Error('Web3 instance not initialized');
      if (!maxPageSize || maxPageSize <= 0) throw new Error('Max page size not initialized');

      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      // FIXED: Add timeout and error handling for address lookup
      let id;
      try {
        id = await Promise.race([
          contract.methods.addressToId(account).call(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('addressToId call timeout')), 5000)
          )
        ]);
      } catch (error) {
        console.warn('Failed to fetch user ID:', error);
        id = null; // Continue without ID if lookup fails
      }

      let offset = 0;
      const limit = Math.min(maxPageSize, 50); // Cap at 50 to avoid excessive data transfer
      let hasMore = true;
      let allAmounts = [];
      let allPlanIds = [];
      let allRemarks = [];
      let allTimestamps = [];
      let fetchAttempts = 0;
      const MAX_FETCH_ATTEMPTS = 10; // Prevent infinite loops

      while (hasMore && fetchAttempts < MAX_FETCH_ATTEMPTS) {
        try {
          const hist = await Promise.race([
            contract.methods.getActivationHistory(account, offset, limit).call(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('getActivationHistory call timeout')), 5000)
            )
          ]);
          
          allAmounts = [...allAmounts, ...hist[0]];
          allPlanIds = [...allPlanIds, ...hist[1]];
          allRemarks = [...allRemarks, ...hist[2]];
          allTimestamps = [...allTimestamps, ...hist[3]];
          hasMore = hist[5];
          offset += limit;
          fetchAttempts++;
        } catch (error) {
          console.error('Error fetching activation history batch:', error);
          break; // Exit loop on error instead of infinite retry
        }
      }

      if (allAmounts.length === 0) {
        console.log('No activation history found');
        return [];
      }

      const formatted = allAmounts.map((amt, idx) => ({
        userId: id ? id.toString() : 'N/A',
        amount: parseFloat(web3.utils.fromWei(amt.toString(), 'ether')).toFixed(2),
        planId: allPlanIds[idx].toString(),
        remark: allRemarks[idx],
        date: new Date(Number(allTimestamps[idx]) * 1000).toLocaleString(),
        timestamp: Number(allTimestamps[idx]),
      })).sort((a, b) => b.timestamp - a.timestamp);

      return formatted;
    } catch (error) {
      console.error('fetchActivationHistory error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referral history - UPDATED for pagination
export const fetchReferralHistory = createAsyncThunk(
  'web3/fetchReferralHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, maxPageSize } = web3State;

      if (!account || !window.web3) throw new Error('Wallet not connected');

      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      const id = await contract.methods.addressToId(account).call();

      let offset = 0;
      const limit = maxPageSize;
      let hasMore = true;
      let allFroms = [];
      let allFromIds = [];
      let allLevels = [];
      let allAmounts = [];
      let allOnAmounts = [];
      let allTimestamps = [];

      while (hasMore) {
        const hist = await contract.methods.getReferralHistory(account, offset, limit).call();
        allFroms = [...allFroms, ...hist[0]];
        allFromIds = [...allFromIds, ...hist[1]];
        allLevels = [...allLevels, ...hist[2]];
        allAmounts = [...allAmounts, ...hist[3]];
        allOnAmounts = [...allOnAmounts, ...hist[4]];
        allTimestamps = [...allTimestamps, ...hist[5]];
        hasMore = hist[7];
        offset += limit;
      }

      if (allFroms.length === 0) return [];

      const uniqueEntries = new Map();

      allFroms.forEach((from, idx) => {
        const key = `${from}-${allFromIds[idx]}-${allLevels[idx]}-${allAmounts[idx]}-${allOnAmounts[idx]}-${allTimestamps[idx]}`;
        if (!uniqueEntries.has(key)) {
          uniqueEntries.set(key, {
            userId: id ? id.toString() : 'N/A',
            fromId: allFromIds[idx].toString(),
            level: allLevels[idx].toString(),
            income: parseFloat(web3.utils.fromWei(allAmounts[idx].toString(), 'ether')).toFixed(2),
            onAmount: parseFloat(web3.utils.fromWei(allOnAmounts[idx].toString(), 'ether')).toFixed(2),
            date: new Date(Number(allTimestamps[idx]) * 1000).toLocaleString(),
            timestamp: Number(allTimestamps[idx]),
          });
        }
      });

      const formatted = Array.from(uniqueEntries.values()).sort((a, b) => b.timestamp - a.timestamp);

      return formatted;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referrals - UPDATED for pagination
export const fetchReferrals = createAsyncThunk(
  'web3/fetchReferrals',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, maxPageSize } = web3State;

      if (!account || !window.web3) throw new Error('Wallet not connected');

      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      let offset = 0;
      const limit = maxPageSize;
      let hasMore = true;
      let allAddresses = [];
      let allUserIds = [];
      let allActives = [];
      let allPackages = [];
      let allRegTimes = [];

      while (hasMore) {
        const referrals = await contract.methods.getMyReferrals(account, offset, limit).call();
        allAddresses = [...allAddresses, ...referrals[0]];
        allUserIds = [...allUserIds, ...referrals[1]];
        allActives = [...allActives, ...referrals[2]];
        allPackages = [...allPackages, ...referrals[3]];
        allRegTimes = [...allRegTimes, ...referrals[4]];
        hasMore = referrals[6];
        offset += limit;
      }

      if (allAddresses.length === 0) return [];

      const formatted = allAddresses.map((addr, idx) => ({
        address: addr,
        userId: allUserIds[idx].toString(),
        isActive: !!Number(allActives[idx]),
        package: parseFloat(web3.utils.fromWei(allPackages[idx].toString(), 'ether')).toFixed(2),
        registrationDate: new Date(Number(allRegTimes[idx]) * 1000).toLocaleString(),
        activationDate: allPackages[idx] !== '0' ? new Date(Number(allRegTimes[idx]) * 1000).toLocaleString() : 'N/A',
        level: '1',
        status: Number(allActives[idx]) ? 'Active' : 'Inactive',
        timestamp: Number(allRegTimes[idx]),
      })).sort((a, b) => b.timestamp - a.timestamp);

      return formatted;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch multi-level referrals - UPDATED for pagination
export const fetchMultiLevelReferrals = createAsyncThunk(
  'web3/fetchMultiLevelReferrals',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, maxPageSize } = web3State;

      if (!account || !window.web3) throw new Error('Wallet not connected');

      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      const multiLevel = [];
      let queue = [{ address: account, level: 0 }];

      while (queue.length > 0) {
        const current = queue.shift();
        if (current.level >= 11) continue;

        let offset = 0;
        const limit = maxPageSize;
        let hasMore = true;

        while (hasMore) {
          const referrals = await contract.methods.getMyReferrals(current.address, offset, limit).call();

          referrals[0].forEach((addr, i) => {
            const refData = {
              address: addr,
              userId: referrals[1][i].toString(),
              isActive: !!Number(referrals[2][i]),
              package: parseFloat(web3.utils.fromWei(referrals[3][i].toString(), 'ether')).toFixed(2),
              registrationDate: new Date(Number(referrals[4][i]) * 1000).toLocaleString(),
              activationDate: referrals[3][i] !== '0' ? new Date(Number(referrals[4][i]) * 1000).toLocaleString() : 'N/A',
              level: current.level + 1,
              status: Number(referrals[2][i]) ? 'Active' : 'Inactive',
            };
            multiLevel.push(refData);
            if (current.level + 1 < 11) {
              queue.push({ address: addr, level: current.level + 1 });
            }
          });

          hasMore = referrals[6];
          offset += limit;
        }
      }

      return multiLevel;
    } catch (error) {
      console.error('Fetch multi-level referrals error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch withdrawal history - UPDATED for pagination
export const fetchWithdrawalHistory = createAsyncThunk(
  'web3/fetchWithdrawalHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account, maxPageSize } = web3State;

      if (!account || !window.web3) throw new Error('Wallet not connected');

      const web3 = window.web3;
      const contract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      let offset = 0;
      const limit = maxPageSize;
      let hasMore = true;
      let allAmounts = [];
      let allTimestamps = [];
      let allStatuses = [];

      while (hasMore) {
        const hist = await contract.methods.getWithdrawalHistory(account, offset, limit).call();
        allAmounts = [...allAmounts, ...hist[0]];
        allTimestamps = [...allTimestamps, ...hist[1]];
        allStatuses = [...allStatuses, ...hist[2]];
        hasMore = hist[4];
        offset += limit;
      }

      if (allAmounts.length === 0) return [];

      const formatted = allAmounts.map((amt, idx) => ({
        amount: parseFloat(web3.utils.fromWei(amt.toString(), 'ether')).toFixed(2),
        timestamp: Number(allTimestamps[idx]),
        status: allStatuses[idx] || 'Paid',
        date: new Date(Number(allTimestamps[idx]) * 1000).toLocaleString(),
      })).sort((a, b) => b.timestamp - a.timestamp);

      return formatted;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Withdraw
export const withdraw = createAsyncThunk(
  'web3/withdraw',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { web3State } = getState();
      const { account } = web3State;
      const web3 = window.web3;

      if (!account || !web3) {
        throw new Error('Wallet not connected');
      }

      const mainContract = new web3.eth.Contract(Abi_Main, ContractAddress_Main);

      const tx = await mainContract.methods
        .withdraw()
        .send({ from: account });

      if (!tx.status) {
        throw new Error('Withdrawal failed');
      }

      await Promise.all([
        dispatch(fetchContractData()),
        dispatch(fetchDashboardData()),
        dispatch(fetchWithdrawalHistory()),
      ]);

      return {
        success: true,
        txHash: tx.transactionHash,
      };
    } catch (error) {
      console.error('Withdrawal error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const web3Slice = createSlice({
  name: 'web3State',
  initialState,
  reducers: {
    updateAccount: (state, action) => {
      state.account = action.payload.toLowerCase();
    },
    updateChainId: (state, action) => {
      state.chainId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    disconnectWallet: () => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.account = action.payload.account;
        state.chainId = action.payload.chainId;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload;
      })
      .addCase(fetchContractData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchContractData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balances = action.payload.balances;
        state.userInfo = action.payload.userInfo;
        state.plans = action.payload.plans;
        state.usdtContractAddress = action.payload.usdtContractAddress;
        state.lastUpdated = action.payload.lastUpdated;
        state.contractTimeUnit = action.payload.contractTimeUnit;
        state.maxPageSize = action.payload.maxPageSize; // NEW
        state.error = null;
      })
      .addCase(fetchContractData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(activateContract.pending, (state) => {
        state.activateButtonLoading = true;
      })
      .addCase(activateContract.fulfilled, (state) => {
        state.activateButtonLoading = false;
        state.error = null;
      })
      .addCase(activateContract.rejected, (state, action) => {
        state.activateButtonLoading = false;
        state.error = action.payload;
      })
      .addCase(upgradeContract.pending, (state) => {
        state.upgradeButtonLoading = true;
      })
      .addCase(upgradeContract.fulfilled, (state) => {
        state.upgradeButtonLoading = false;
        state.error = null;
      })
      .addCase(upgradeContract.rejected, (state, action) => {
        state.upgradeButtonLoading = false;
        state.error = action.payload;
      })
      .addCase(reinvestContract.pending, (state) => {
        state.reinvestButtonLoading = true;
      })
      .addCase(reinvestContract.fulfilled, (state) => {
        state.reinvestButtonLoading = false;
        state.error = null;
      })
      .addCase(reinvestContract.rejected, (state, action) => {
        state.reinvestButtonLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardData.pending, (state) => {
        state.loadingDashboard = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.dashboardData = action.payload;
        state.activeInvestments = action.payload.activeInvestments;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.error = action.payload;
      })
      .addCase(fetchInvestmentHistory.pending, (state) => {
        state.loadingInvestmentHistory = true;
      })
      .addCase(fetchInvestmentHistory.fulfilled, (state, action) => {
        state.loadingInvestmentHistory = false;
        state.investmentHistory = action.payload;
      })
      .addCase(fetchInvestmentHistory.rejected, (state, action) => {
        state.loadingInvestmentHistory = false;
        state.error = action.payload;
      })
      .addCase(fetchActivationHistory.pending, (state) => {
        state.loadingActivationHistory = true;
      })
      .addCase(fetchActivationHistory.fulfilled, (state, action) => {
        state.loadingActivationHistory = false;
        state.activationHistory = action.payload;
      })
      .addCase(fetchActivationHistory.rejected, (state, action) => {
        state.loadingActivationHistory = false;
        state.error = action.payload;
      })
      .addCase(fetchReferralHistory.pending, (state) => {
        state.loadingReferralHistory = true;
      })
      .addCase(fetchReferralHistory.fulfilled, (state, action) => {
        state.loadingReferralHistory = false;
        state.referralHistory = action.payload;
      })
      .addCase(fetchReferralHistory.rejected, (state, action) => {
        state.loadingReferralHistory = false;
        state.error = action.payload;
      })
      .addCase(fetchReferrals.pending, (state) => {
        state.loadingReferrals = true;
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.loadingReferrals = false;
        state.referrals = action.payload;
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.loadingReferrals = false;
        state.error = action.payload;
      })
      .addCase(fetchMultiLevelReferrals.pending, (state) => {
        state.loadingReferrals = true;
      })
      .addCase(fetchMultiLevelReferrals.fulfilled, (state, action) => {
        state.loadingReferrals = false;
        state.multiLevelReferrals = action.payload;
      })
      .addCase(fetchMultiLevelReferrals.rejected, (state, action) => {
        state.loadingReferrals = false;
        state.error = action.payload;
      })
      .addCase(fetchWithdrawalHistory.pending, (state) => {
        state.loadingWithdrawalHistory = true;
      })
      .addCase(fetchWithdrawalHistory.fulfilled, (state, action) => {
        state.loadingWithdrawalHistory = false;
        state.withdrawalHistory = action.payload;
      })
      .addCase(fetchWithdrawalHistory.rejected, (state, action) => {
        state.loadingWithdrawalHistory = false;
        state.error = action.payload;
      })
      .addCase(withdraw.pending, (state) => {
        state.loadingWithdraw = true;
      })
      .addCase(withdraw.fulfilled, (state) => {
        state.loadingWithdraw = false;
        state.error = null;
      })
      .addCase(withdraw.rejected, (state, action) => {
        state.loadingWithdraw = false;
        state.error = action.payload;
      });
  },
});

export const { updateAccount, updateChainId, clearError, disconnectWallet } = web3Slice.actions;
export default web3Slice.reducer;
