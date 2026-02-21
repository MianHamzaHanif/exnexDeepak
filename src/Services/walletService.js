import { BrowserProvider } from "ethers";
import { getActiveChainConfig } from "./chains";

const getEthereumProvider = () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }
  return window.ethereum;
};

export const getBrowserProvider = async () => {
  const ethereum = getEthereumProvider();
  return new BrowserProvider(ethereum);
};

export const requestWalletAccounts = async () => {
  const ethereum = getEthereumProvider();
  const existingAccounts = await ethereum.request({ method: "eth_accounts" });
  if (Array.isArray(existingAccounts) && existingAccounts.length > 0) {
    return existingAccounts;
  }
  return ethereum.request({ method: "eth_requestAccounts" });
};

export const switchOrAddChain = async (chainConfig = getActiveChainConfig()) => {
  const ethereum = getEthereumProvider();
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.chainIdHex }],
    });
  } catch (error) {
    if (error.code !== 4902) {
      throw error;
    }
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainConfig.chainIdHex,
          chainName: chainConfig.chainName,
          nativeCurrency: chainConfig.nativeCurrency,
          rpcUrls: chainConfig.rpcUrls,
          blockExplorerUrls: chainConfig.blockExplorerUrls,
        },
      ],
    });
  }
};

export const ensureCorrectNetwork = async () => {
  const provider = await getBrowserProvider();
  const chainConfig = getActiveChainConfig();
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);

  if (currentChainId !== chainConfig.chainIdDecimal) {
    await switchOrAddChain(chainConfig);
  }

  return {
    chainId: chainConfig.chainIdDecimal,
    chainConfig,
  };
};
