"use client";

import { useState } from 'react';
import Navbar from "../../components/Navbar";
import { useContract } from "../../hooks/useContract";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Loader2, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Verify() {
  const { isCorrectNetwork, account, switchToSepolia } = useWeb3();
  const [formData, setFormData] = useState({
    rollNumber: '',
    semester: '',
    examSession: '',
    sgpa: '',
    resultStatus: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const resultVerification = useContract('ResultVerification');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!resultVerification) return;

    try {
      setIsVerifying(true);
      setVerificationResult(null);

      // sgpa is stored as uint16 (e.g. 825 for 8.25)
      const sgpaFloat = parseFloat(formData.sgpa);
      if (isNaN(sgpaFloat) || sgpaFloat < 0 || sgpaFloat > 10) {
        throw new Error("Invalid SGPA");
      }
      const sgpaValue = Math.round(sgpaFloat * 100);

      // Step 1: Generate Hash locally (Industry Standard: deterministic hashing)
      const hash = ethers.utils.solidityKeccak256(
        ['string', 'uint8', 'string', 'uint16', 'string'],
        [formData.rollNumber, parseInt(formData.semester), formData.examSession, sgpaValue, formData.resultStatus]
      );

      // Step 2: Compare with NEW ResultVerification Contract Anchor
      toast.loading('Verifying with Blockchain...', { id: 'verify' });
      const isValid = await resultVerification.verifyResult(
        formData.rollNumber,
        parseInt(formData.semester),
        hash
      );

      if (isValid) {
        toast.success('Successfully Verified!', { id: 'verify' });
      } else {
        toast.error('Verification Failed!', { id: 'verify' });
      }

      setVerificationResult(isValid ? 'valid' : 'invalid');
    } catch (err) {
      toast.error('An error occurred during verification');
      console.error("Verification error:", err);
      setVerificationResult('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadVerifiedMarksheet = async () => {
    const { generateMarksheetPDF } = await import('../../lib/pdfExport');
    const sgpaValue = Math.round(parseFloat(formData.sgpa) * 100);
    const hash = ethers.utils.solidityKeccak256(
      ['string', 'uint8', 'string', 'uint16', 'string'],
      [formData.rollNumber, parseInt(formData.semester), formData.examSession, sgpaValue, formData.resultStatus]
    );

    const studentInfo = {
      name: "Verified Student", // We don't have the name in the verify form, but we can fetch it if needed
      roll: formData.rollNumber
    };

    const result = {
      semester: formData.semester,
      session: formData.examSession,
      sgpa: parseFloat(formData.sgpa).toFixed(2),
      status: formData.resultStatus,
      blockchainHash: hash
    };

    await generateMarksheetPDF(studentInfo, result);
  };

  return (
    <main className="h-screen flex flex-col bg-[#0a0a0c] text-slate-200 overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-hidden flex flex-col max-w-[95%] mx-auto w-full px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-10 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Trust Verification</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight">Verify official credentials against blockchain anchors.</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 pb-8">
            {/* Form Column */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              <form onSubmit={handleVerify} className="space-y-3 sm:space-y-4">
                <input
                  required placeholder="Student Roll No"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-medium"
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
                <select
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-medium"
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  <option value="" className="bg-[#0a0a0c]">Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-[#0a0a0c]">Sem {s}</option>)}
                </select>

                <div className="flex flex-col">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-1">Exam Session</label>
                  <input
                    type="month"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-cyan-500/50 text-sm font-medium text-slate-300"
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      const date = new Date(year, month - 1);
                      const formatted = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                      setFormData({ ...formData, examSession: formatted });
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <input
                    required type="number" step="0.01" min="0" max="10" placeholder="SGPA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none text-sm font-medium"
                    onChange={(e) => setFormData({ ...formData, sgpa: e.target.value })}
                  />
                  <select
                    required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none text-sm font-medium"
                    onChange={(e) => setFormData({ ...formData, resultStatus: e.target.value })}
                  >
                    <option value="" className="bg-[#0a0a0c]">Status</option>
                    <option value="Pass" className="bg-[#0a0a0c]">Pass</option>
                    <option value="Fail" className="bg-[#0a0a0c]">Fail</option>
                  </select>
                </div>

                <button
                  disabled={isVerifying}
                  className="w-full py-3 sm:py-3.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>RUN VERIFICATION</span>
                </button>
              </form>

              {account && !isCorrectNetwork && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <p className="text-[9px] text-amber-500 font-bold mb-2 uppercase tracking-widest">Network Mismatch</p>
                  <button onClick={switchToSepolia} className="w-full py-2 bg-amber-500 text-black text-[9px] font-black rounded-lg hover:bg-amber-400 uppercase tracking-widest transition-all">Switch to Sepolia</button>
                </div>
              )}
            </div>

            {/* Result Column */}
            <div className="md:col-span-3 min-h-[300px] md:min-h-0">
              <AnimatePresence mode="wait">
                {verificationResult ? (
                  <motion.div
                    key={verificationResult}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`h-full flex flex-col items-center justify-center p-6 sm:p-8 border rounded-2xl ${verificationResult === 'valid'
                        ? 'bg-emerald-500/5 border-emerald-500/10'
                        : 'bg-red-500/5 border-red-500/10'
                      }`}
                  >
                    {verificationResult === 'valid' ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-2">Record Authentic</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 mb-6 max-w-xs mx-auto">This credential matches the blockchain anchor and is verified as untampered.</p>
                        <button
                          onClick={downloadVerifiedMarksheet}
                          className="flex items-center space-x-2 bg-white text-black px-5 py-2.5 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all mx-auto"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Original PDF</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-2">Verification Failed</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 max-w-xs mx-auto">Data mismatch detected. The document or record may have been forged or altered.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[300px] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 sm:p-8 opacity-40">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 mb-4" />
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Verification Input</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
