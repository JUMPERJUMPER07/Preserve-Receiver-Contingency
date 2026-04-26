import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        {/* Glow Effects */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Inner shadow for shield */}
        <filter id="inset-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="3" result="offset-blur" />
          <feComposite
            operator="out"
            in="SourceGraphic"
            in2="offset-blur"
            result="inverse"
          />
          <feFlood floodColor="black" floodOpacity="0.7" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>

        {/* Gradients */}
        <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" /> {/* cyan-400 */}
          <stop offset="100%" stopColor="#1d4ed8" /> {/* blue-700 */}
        </linearGradient>

        <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" /> {/* slate-900 */}
          <stop offset="100%" stopColor="#020617" /> {/* slate-950 */}
        </linearGradient>

        <linearGradient id="heartbeatLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#67e8f9" /> {/* cyan-200 */}
          <stop offset="50%" stopColor="#ffffff" /> {/* white */}
          <stop offset="100%" stopColor="#67e8f9" /> {/* cyan-200 */}
        </linearGradient>
      </defs>

      {/* Background ambient glow */}
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="#06b6d4"
        opacity="0.15"
        filter="url(#glow)"
      />

      {/* Main Shield Outer Border */}
      <path
        d="M50 12 L18 22 C18 45 28 72 50 88 C72 72 82 45 82 22 Z"
        fill="none"
        stroke="url(#shieldBorder)"
        strokeWidth="6"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Inner Shield Body */}
      <path
        d="M50 15 L21 24 C21 45 30 69 50 83 C70 69 79 45 79 24 Z"
        fill="url(#shieldInner)"
        filter="url(#inset-shadow)"
      />

      {/* Left side highlight on shield for 3D effect */}
      <path
        d="M50 15 L21 24 C21 45 23 58 35 70 C35 70 50 83 50 83 Z"
        fill="#ffffff"
        opacity="0.05"
      />

      {/* The Heartbeat / ECG Line */}
      {/* Starting from left, goes flat, spikes up, drops down deep, spikes back up to middle, goes flat right */}
      <path
        d="M20 48 L38 48 L45 28 L55 68 L62 48 L80 48"
        fill="none"
        stroke="url(#heartbeatLine)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
    </svg>
  );
};
