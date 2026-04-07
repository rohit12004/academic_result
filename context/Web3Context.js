"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CHAIN_ID } from '../lib/constants';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const checkNetwork = useCallback((id) => {
    // Some providers return chainId as a hex string, others as a number
    const currentChainId = typeof id === 'string' ? id.toLowerCase() : `0x${id.toString(16)}`;
    const isSepolia = currentChainId === SEPOLIA_CHAIN_ID.toLowerCase();
    setIsCorrectNetwork(isSepolia);
    return isSepolia;
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        setError(null);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const network = await provider.getNetwork();

        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(network.chainId);
        checkNetwork(network.chainId);
      } catch (err) {
        console.error("Connection error:", err);
        setError(err.message);
      } finally {
        setIsConnecting(false);
      }
    } else {
      setError("Please install MetaMask!");
    }
  };

  const switchToSepolia = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (err) {
        if (err.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }],
            });
          } catch (addError) {
            console.error("Add network error:", addError);
          }
        }
      }
    }
  };

  const switchAccount = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // This forces the "Select Account" popup in MetaMask
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // Update provider/signer for the new account
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        setSigner(provider.getSigner());
      } catch (err) {
        if (err.code === 4001) {
          console.log("User cancelled account switching.");
        } else {
          console.error("Switch account error:", err);
          setError(err.message);
        }
      }
    }
  };


  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectNetwork(false);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // 1. Check if already authorized (Persistence on refresh)
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts) => {
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const network = await provider.getNetwork();

            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            setChainId(network.chainId);
            checkNetwork(network.chainId);
          }
        })
        .catch(console.error);

      // 2. Check initial network
      window.ethereum.request({ method: 'eth_chainId' })
        .then(id => checkNetwork(id))
        .catch(console.error);

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          setSigner(provider.getSigner());
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (id) => {
        setChainId(id);
        checkNetwork(id);
        // We don't always need a full reload if we handle state correctly, 
        // but for ethers.js sanity, a reload is often safer.
        // window.location.reload(); 
      });
    }
  }, [checkNetwork]);

  return (
    <Web3Context.Provider value={{
      account,
      provider,
      signer,
      chainId,
      isCorrectNetwork,
      isConnecting,
      error,
      connectWallet,
      disconnectWallet,
      switchToSepolia,
      switchAccount
    }}>

      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

