import React, { useEffect, useState } from "react";
import { ShieldCheck, Server, Database, Wifi, Cpu, Zap } from "lucide-react";
import { Logo } from "./Logo";

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  const logs = [
    "INITIALIZING KERNEL...",
    "LOADING DICOM PROTOCOLS (TCP/104)...",
    "ESTABLISHING SECURE HANDSHAKE...",
    "CONNECTING TO PACS GATEWAY...",
    "VERIFYING RIS INTEGRITY...",
    "LOADING UI MODULES...",
    "SYSTEM READY.",
  ];

  useEffect(() => {
    // Progress Bar Animation
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Non-linear progression for realism
        const increment = Math.random() * 15;
        return Math.min(old + increment, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Log cycler
    if (progress < 100) {
      const logTimer = setInterval(() => {
        setLogIndex((prev) => (prev < logs.length - 1 ? prev + 1 : prev));
      }, 450);
      return () => clearInterval(logTimer);
    } else {
      // Finished
      setLogIndex(logs.length - 1);
      setTimeout(() => setShowLogo(true), 200);
      setTimeout(() => onComplete(), 2500); // Hold the final logo for a bit
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-mono text-cyan-500 selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Moving Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] animate-[pulse_4s_ease-in-out_infinite]"></div>

        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.5)] animate-[scan_3s_linear_infinite]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-8">
        {/* Central Logo Animation */}
        <div
          className={`transition-all duration-1000 transform ${showLogo ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10"}`}
        >
          <div className="flex items-center justify-center relative mb-6">
            <Logo size={120} />
          </div>

          <h1 className="text-3xl font-bold text-white text-center tracking-tighter mb-1">
            PRESERVE <span className="text-cyan-400">RECEIVER</span>
          </h1>
          <p className="text-xs text-slate-400 text-center uppercase tracking-[0.3em] mb-8">
            Contingency System v2.4
          </p>
        </div>

        {/* Boot Sequence Display (Hidden when logo appears fully) */}
        <div
          className={`w-full transition-opacity duration-500 ${showLogo ? "opacity-0 absolute" : "opacity-100"}`}
        >
          {/* Icons Row */}
          <div className="flex justify-center gap-8 mb-8 text-slate-600">
            <Server
              size={20}
              className={progress > 20 ? "text-cyan-500 animate-bounce" : ""}
            />
            <Wifi
              size={20}
              className={progress > 40 ? "text-cyan-500 animate-bounce" : ""}
              style={{ animationDelay: "100ms" }}
            />
            <Database
              size={20}
              className={progress > 60 ? "text-cyan-500 animate-bounce" : ""}
              style={{ animationDelay: "200ms" }}
            />
            <ShieldCheck
              size={20}
              className={progress > 80 ? "text-cyan-500 animate-bounce" : ""}
              style={{ animationDelay: "300ms" }}
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-2 relative">
            <div
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-end h-6">
            <span className="text-[10px] text-cyan-500/80 font-bold animate-pulse">
              {logs[logIndex]}
            </span>
            <span className="text-[10px] text-slate-500">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="absolute bottom-8 text-[9px] text-slate-600 uppercase tracking-widest flex gap-4">
        <span className="flex items-center gap-1">
          <Cpu size={10} /> MEM: OK
        </span>
        <span className="flex items-center gap-1">
          <Zap size={10} /> PWR: STABLE
        </span>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
