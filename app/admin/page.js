"use client";

import { useState } from 'react';
import Navbar from "../../components/Navbar";
import { useContract, useIsAdmin } from "../../hooks/useContract";
import { useWeb3 } from "../../context/Web3Context";
import { STUDENT_RECORD_ADDRESS, DEPARTMENTS } from "../../lib/constants";
import { motion } from 'framer-motion';
import { UserPlus, FileSpreadsheet, Send, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { account, isCorrectNetwork, switchToSepolia } = useWeb3();
  const { isAdmin, isLoading } = useIsAdmin();

  const [registerForm, setRegisterForm] = useState({ name: '', roll: '', dept: '' });
  const [resultForm, setResultForm] = useState({ roll: '', sem: '', session: '', sgpa: '', status: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAddingResult, setIsAddingResult] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const studentRecord = useContract('StudentRecord');
  const resultVerification = useContract('ResultVerification');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!studentRecord) return;
    try {
      setTxStatus(null);
      setIsRegistering(true);
      setTxStatus('Registering Student...');
      const tx = await studentRecord.registerStudent(
        registerForm.name,
        registerForm.roll,
        registerForm.dept
      );
      toast.loading('Confirming transaction...', { id: 'reg' });
      await tx.wait();
      toast.success('Student Registered Successfully!', { id: 'reg' });
      setTxStatus('Student Registered Successfully!');
    } catch (err) {
      toast.error(`Registration failed: ${err.message.substring(0, 50)}`);
      setTxStatus(`Error: ${err.message.substring(0, 50)}...`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    if (!resultVerification) return;
    try {
      setTxStatus(null);
      setIsAddingResult(true);
      setTxStatus('Saving to Database...');

      const sgpaFloat = parseFloat(resultForm.sgpa);
      if (isNaN(sgpaFloat) || sgpaFloat < 0 || sgpaFloat > 10) {
        throw new Error("SGPA must be a number between 0 and 10");
      }

      // Step 1: Save to Database & Get Hash
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: resultForm.roll,
          semester: resultForm.sem,
          examSession: resultForm.session,
          sgpa: Math.round(sgpaFloat * 100),
          resultStatus: resultForm.status
        })
      });

      const { success, hash, data: savedData, error } = await response.json();
      if (!success) throw new Error(`DB Error: ${error}`);

      // Step 2: Post ONLY Hash to ResultVerification Contract
      try {
        setTxStatus('Securing on Blockchain...');
        const tx = await resultVerification.storeResultHash(
          resultForm.roll,
          parseInt(resultForm.sem),
          hash
        );
        toast.loading('Securing result on-chain...', { id: 'res' });
        await tx.wait();
        toast.success('Result Posted & Secured!', { id: 'res' });
        setTxStatus('Result Posted to DB & Secured on Verification Contract!');
      } catch (bcError) {
        // ROLLBACK: If blockchain fails, delete from DB to maintain consistency
        console.error("Blockchain transaction failed. ID to rollback:", savedData?.id);
        toast.error('Blockchain failed. Rolling back database record...', { id: 'res' });

        const rollBackResponse = await fetch('/api/results', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: savedData?.id })
        });

        const rollBackResult = await rollBackResponse.json();
        console.log("Rollback result:", rollBackResult);

        throw bcError;
      }
    } catch (err) {
      toast.error(`Operation failed: ${err.message.substring(0, 50)}`);
      setTxStatus(`Error: ${err.message.substring(0, 50)}...`);
    } finally {
      setIsAddingResult(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
    </div>
  );

  if (!account) return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 mt-32 text-center">
        <ShieldAlert className="w-16 h-16 mx-auto mb-6 text-amber-500" />
        <h1 className="text-3xl font-bold mb-4">Connect Wallet Required</h1>
        <p className="text-slate-400">Please connect your authorized administrator wallet to access this portal.</p>
      </div>
    </main>
  );

  // Network Mismatch View
  if (account && !isCorrectNetwork) return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 mt-32 text-center">
        <ShieldAlert className="w-16 h-16 mx-auto mb-6 text-amber-500" />
        <h1 className="text-3xl font-bold mb-4">Wrong Network Detected</h1>
        <p className="text-slate-400 mb-8 text-lg">Your wallet is connected, but not to the <strong>Sepolia Testnet</strong>.</p>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 max-w-xl mx-auto text-left">
          <h3 className="font-semibold mb-4 text-amber-400 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5" />
            <span>Required Action:</span>
          </h3>
          <ul className="text-sm text-slate-300 space-y-3 mb-8">
            <li className="flex items-start space-x-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>The contracts are deployed on Sepolia. Admin actions will fail on other networks.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>Please click the button below to switch your MetaMask to Sepolia.</span>
            </li>
          </ul>

          <button
            onClick={switchToSepolia}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-amber-600/20"
          >
            Switch to Sepolia Network
          </button>
        </div>
      </div>
    </main>
  );

  // Access Denied View (Correct Network but not Admin)
  if (account && isCorrectNetwork && !isAdmin && !isLoading) return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 mt-32 text-center">
        <ShieldAlert className="w-16 h-16 mx-auto mb-6 text-red-500" />
        <h1 className="text-3xl font-bold mb-4 text-red-500">Authorized Admin Only</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-2xl mx-auto text-left mb-8">
          <h3 className="font-semibold mb-4 text-red-400">Identity Details:</h3>
          <p className="text-sm text-slate-300 mb-2 font-mono"><strong>Wallet:</strong> {account}</p>
          <p className="text-sm text-slate-300 mb-6">
            This account does not have administrator privileges on the StudentRecord contract.
            If you are the owner, ensure you are using the deployment account.
          </p>

          <div className="p-4 bg-black/40 rounded-lg border border-white/5 space-y-2">
            <p className="text-xs text-slate-500 uppercase font-black">Target Contract</p>
            <p className="text-xs font-mono text-slate-400 break-all">{STUDENT_RECORD_ADDRESS}</p>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main className="h-screen flex flex-col bg-[#0a0a0c] text-slate-200 overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-hidden flex flex-col max-w-[95%] mx-auto w-full px-4 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 shrink-0 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Console</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight">Auth: <span className="text-cyan-400 font-mono">{account}</span></p>
          </div>
          {txStatus && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 py-1.5 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-cyan-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
              <CheckCircle className="w-3 h-3" />
              <span>{txStatus}</span>
            </motion.div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Register */}
            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-6 sm:mb-8">
                <UserPlus className="w-5 h-5 text-cyan-500" />
                <h2 className="text-lg font-bold">Register Student</h2>
              </div>
              <form onSubmit={handleRegister} className="space-y-4 grow">
                <input
                  required placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-medium"
                  onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
                <input
                  required placeholder="Roll Number (e.g. 2024CS01)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-medium"
                  onChange={e => setRegisterForm({ ...registerForm, roll: e.target.value })}
                />
                <select
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-medium"
                  onChange={e => setRegisterForm({ ...registerForm, dept: e.target.value })}
                >
                  <option value="" className="bg-[#0a0a0c]">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="bg-[#0a0a0c] font-medium">{dept}</option>
                  ))}
                </select>
                <div className="pt-4 mt-auto">
                  <button disabled={isRegistering} className="w-full py-3 sm:py-3.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                    {isRegistering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>REGISTER IDENTITY</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Result */}
            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-6 sm:mb-8">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold">Publish Result</h2>
              </div>
              <form onSubmit={handleAddResult} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required placeholder="Roll Number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                    onChange={e => setResultForm({ ...resultForm, roll: e.target.value })}
                  />
                  <select
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                    onChange={e => setResultForm({ ...resultForm, sem: e.target.value })}
                  >
                    <option value="" className="bg-[#0a0a0c]">Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-[#0a0a0c]">Sem {s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-1">Exam Session</label>
                  <input
                    type="month"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium text-slate-300"
                    onChange={e => {
                      const [year, month] = e.target.value.split('-');
                      const date = new Date(year, month - 1);
                      const formatted = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                      setResultForm({ ...resultForm, session: formatted });
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    required type="number" step="0.01" min="0" max="10" placeholder="SGPA"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500/50 text-sm font-medium"
                    onChange={e => setResultForm({ ...resultForm, sgpa: e.target.value })}
                  />
                  <select
                    required className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500/50 text-sm font-medium"
                    onChange={e => setResultForm({ ...resultForm, status: e.target.value })}
                  >
                    <option value="" className="bg-[#0a0a0c]">Status</option>
                    <option value="Pass" className="bg-[#0a0a0c]">Pass</option>
                    <option value="Fail" className="bg-[#0a0a0c]">Fail</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button disabled={isAddingResult} className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                    {isAddingResult ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>SEAL & PUBLISH</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center">
            <p className="text-[9px] text-slate-700 font-black tracking-widest uppercase">
              Permanent Records Layer • Ethereum Sepolia Network
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
