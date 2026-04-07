"use client";

import Link from 'next/link';
import TransitionLink from './TransitionLink';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, LogOut, ShieldCheck, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, isConnecting, isCorrectNetwork, switchToSepolia, switchAccount } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <TransitionLink href="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-1.5 rounded-lg transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Academic Storage
              </span>
            </TransitionLink>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-[11px] font-black uppercase tracking-widest">
            <TransitionLink href="/verify" className="text-slate-500 hover:text-white transition-colors">Verify</TransitionLink>
            <TransitionLink href="/records" className="text-slate-500 hover:text-white transition-colors">Records</TransitionLink>
            <TransitionLink href="/admin" className="text-slate-500 hover:text-white transition-colors">Admin</TransitionLink>

            {account ? (
              <div className="flex items-center space-x-3">
                {account && !isCorrectNetwork && (
                  <button
                    onClick={switchToSepolia}
                    className="flex items-center space-x-1.5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/10 transition-all text-[9px] font-black"
                  >
                    <span>SWITCH TO SEPOLIA</span>
                  </button>
                )}

                <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  <div className="flex items-center space-x-2 px-3 py-1.5 border-r border-white/10 text-slate-400">
                    <User className="w-3 h-3 text-cyan-400" />
                    <span className="font-mono">{shortenAddress(account)}</span>
                  </div>
                  <button
                    onClick={switchAccount}
                    className="px-3 py-1.5 hover:bg-white/10 text-cyan-400 transition-all"
                  >
                    SWITCH
                  </button>
                </div>

                <button
                  onClick={disconnectWallet}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 bg-white text-black px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-200 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? '...' : 'Connect'}</span>
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 pt-4 pb-8 space-y-6">
              <div className="flex flex-col space-y-4 text-[11px] font-black uppercase tracking-[0.2em]">
                <TransitionLink href="/verify" onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-cyan-400 transition-colors py-2 border-b border-white/[0.03]">Verify</TransitionLink>
                <TransitionLink href="/records" onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-cyan-400 transition-colors py-2 border-b border-white/[0.03]">Records</TransitionLink>
                <TransitionLink href="/admin" onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-cyan-400 transition-colors py-2 border-b border-white/[0.03]">Admin</TransitionLink>
              </div>

              {account ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-mono text-slate-300">{shortenAddress(account)}</span>
                    </div>
                    <button
                      onClick={() => { switchAccount(); setIsOpen(false); }}
                      className="text-[9px] font-black text-cyan-500 uppercase tracking-widest"
                    >
                      Switch
                    </button>
                  </div>
                  <button
                    onClick={() => { disconnectWallet(); setIsOpen(false); }}
                    className="w-full py-3 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/20"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { connectWallet(); setIsOpen(false); }}
                  className="w-full flex justify-center items-center space-x-2 bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
