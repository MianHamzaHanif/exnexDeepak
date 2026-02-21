const CHAINS = {
  bsc_testnet: {
    key: "bsc_testnet",
    chainIdDecimal: 97,
    chainIdHex: "0x61",
    chainName: "BSC Testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://data-seed-prebsc-2-s1.binance.org:8545",
    ],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    explorerBaseUrl: "https://testnet.bscscan.com",
  },
  bsc_mainnet: {
    key: "bsc_mainnet",
    chainIdDecimal: 56,
    chainIdHex: "0x38",
    chainName: "BNB Smart Chain Mainnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
    explorerBaseUrl: "https://bscscan.com",
  },
};

const DEFAULT_CHAIN_KEY = "bsc_testnet";

export const getActiveChainKey = () =>
  (import.meta.env.VITE_CHAIN_KEY || DEFAULT_CHAIN_KEY).toLowerCase();

export const getActiveChainConfig = () => {
  const selectedKey = getActiveChainKey();
  return CHAINS[selectedKey] || CHAINS[DEFAULT_CHAIN_KEY];
};

export { CHAINS, DEFAULT_CHAIN_KEY };
