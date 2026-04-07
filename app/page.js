"use client";

import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Shield, Search, CheckCircle, Database, ArrowRight } from "lucide-react";
import TransitionLink from "../components/TransitionLink";

export default function Home() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-cyan-400" />,
      title: "Tamper-Proof Security",
      description: "Academic records are stored on the Ethereum blockchain, ensuring permanent and immutable data integrity."
    },
    {
      icon: <Database className="w-8 h-8 text-blue-500" />,
      title: "Decentralized Storage",
      description: "No central authority can alter or delete student data. Records are distributed across the secure node network."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
      title: "Instant Verification",
      description: "Employers and institutions can verify result authenticity in seconds using our blockchain hashing tool."
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden px-4">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent -z-10 blur-[120px]" />

        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-agoma tracking-wide text-4xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Secure Your Academic <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                Legacy on Blockchain
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              The next generation of academic record management. Immutable, verifiable, and completely transparent for students and institutions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <TransitionLink
                href="/verify"
                className="w-full sm:w-auto group flex items-center justify-center space-x-2 bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all duration-300 shadow-[0_0_40px_rgba(6,182,212,0.1)]"
              >
                <span>VERIFY RESULT</span>
                <Search className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </TransitionLink>
              <TransitionLink
                href="/records"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <span>BROWSE RECORDS</span>
                <ArrowRight className="w-4 h-4" />
              </TransitionLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#0d0d10]">
        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div className="mb-8 p-4 bg-white/5 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer-like CTA */}
      <section className="py-20 text-center">
        <div className="max-w-[95%] mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 uppercase tracking-tighter">Built for Academic Integrity</h2>
          <p className="text-sm text-slate-400 mb-10 italic max-w-xl mx-auto opacity-70">
            "We believe that educational achievements should be as permanent and verifiable as the code that protects them."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-500">
            <span>Powered by Ethereum</span>
            <span className="hidden sm:block w-2 h-2 bg-slate-800 rounded-full" />
            <span>Smart Contracts v2.1</span>
          </div>
        </div>
      </section>
    </main>
  );
}
