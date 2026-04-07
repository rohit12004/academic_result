"use client";

import { useState } from 'react';
import Navbar from "../../components/Navbar";
import { useContract } from "../../hooks/useContract";
import { useWeb3 } from "../../context/Web3Context";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Calendar, Award, BadgeCheck, AlertCircle, Loader2, Download, ShieldCheck } from 'lucide-react';

export default function Records() {
  const { isCorrectNetwork, account, switchToSepolia } = useWeb3();
  const [searchRoll, setSearchRoll] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const studentRecord = useContract('StudentRecord');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentRecord || !searchRoll) return;

    try {
      setIsLoading(true);
      setError(null);
      setStudentInfo(null);
      setResults([]);

      // Fetch student basic info from blockchain
      const student = await studentRecord.students(searchRoll);
      if (!student.exists) {
        setError("No student found with this roll number.");
        return;
      }

      setStudentInfo({
        name: student.name,
        roll: student.rollNumber,
        dept: student.department
      });

      // Fetch all results from Database
      const response = await fetch(`/api/results?roll=${searchRoll}`);
      const { success, results: dbResults, error: dbError } = await response.json();

      if (!success) {
        setError(dbError || "Failed to fetch results from database.");
        return;
      }

      const formattedResults = dbResults.map(r => ({
        semester: r.semester,
        session: r.exam_session,
        sgpa: (r.sgpa / 100).toFixed(2),
        status: r.result_status,
        blockchainHash: r.blockchain_hash
      })).sort((a, b) => a.semester - b.semester);

      setResults(formattedResults);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while fetching records.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMarksheet = async (res) => {
    try {
      const { generateMarksheetPDF } = await import('../../lib/pdfExport');
      await generateMarksheetPDF(studentInfo, res);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <main className="h-screen flex flex-col bg-[#0a0a0c] text-slate-200 overflow-hidden">
      <Navbar />

      {/* Search Header - Compact */}
      <section className="border-b border-white/5 py-6 sm:py-8 shrink-0">
        <div className="max-w-[95%] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-left shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Record Browser</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight uppercase tracking-widest">Verified Academic Credentials</p>
            </div>

            <form onSubmit={handleSearch} className="relative w-full md:w-[400px] group">
              <input
                type="text"
                placeholder="Student Roll Number..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-11 focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-medium pr-24"
                onChange={(e) => setSearchRoll(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <button
                disabled={isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white text-black text-[9px] sm:text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 tracking-widest uppercase"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "SEARCH"}
              </button>
            </form>
          </div>

          {account && !isCorrectNetwork && (
            <div className="mt-4 p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-center space-x-3">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Connect to Sepolia</span>
              <button onClick={switchToSepolia} className="text-[9px] bg-amber-500 text-black px-2 py-1 rounded font-black hover:bg-amber-400 transition-colors">SWITCH</button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area - Scrollable internally */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-[95%] mx-auto w-full px-4 grow flex flex-col py-6 overflow-hidden">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center space-x-2 text-danger bg-danger/5 border border-danger/10 p-4 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode='wait'>
            {studentInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Compact Student Header */}
                <div className="bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-2xl flex items-center justify-between mb-4 sm:mb-6 shrink-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-white/5 p-2 sm:p-3 rounded-xl border border-white/10">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{studentInfo.name}</h2>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-tight">{studentInfo.roll} • {studentInfo.dept}</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Records Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
                    {results.length > 0 ? results.map((res, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-black text-slate-500 bg-white/5 px-2 py-1 rounded">SEM {res.semester}</span>
                          <div className="flex items-center space-x-1 text-emerald-500/80 text-[9px] font-black uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Score</p>
                              <p className="text-2xl font-black text-white leading-none">{res.sgpa}</p>
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-md border ${res.status === 'Pass' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
                              }`}>
                              {res.status.toUpperCase()}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[10px] font-medium text-slate-500">{res.session}</span>
                            <button
                              onClick={() => downloadMarksheet(res)}
                              className="text-[10px] font-bold text-cyan-400 flex items-center space-x-1 hover:underline outline-none"
                            >
                              <Download className="w-3 h-3" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-2xl">
                        <p className="text-slate-500 text-sm italic">Records list is empty for this student.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
