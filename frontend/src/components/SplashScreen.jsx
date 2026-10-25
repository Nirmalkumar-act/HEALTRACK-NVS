import React, { useEffect, useState } from "react";
import "../styles/SplashScreen.css";

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState("enter"); // enter → pulse → exit

  useEffect(() => {
    // Phase 1: entrance animation (1.2s)
    const t1 = setTimeout(() => setPhase("pulse"), 1200);
    // Phase 2: pulse / hold (1.8s)
    const t2 = setTimeout(() => setPhase("exit"), 3000);
    // Phase 3: fade-out done → notify parent (0.8s for CSS transition)
    const t3 = setTimeout(() => onFinish && onFinish(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div className={`splash-overlay splash-${phase}`}>
      {/* Animated background particles */}
      <div className="splash-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="particle" style={{ "--i": i }} />
        ))}
      </div>

      {/* Glowing ring */}
      <div className="splash-ring splash-ring-outer" />
      <div className="splash-ring splash-ring-inner" />

      {/* Logo container */}
      <div className="splash-logo-wrap">
        {/* Heartbeat pulse icon */}
        <div className="splash-icon-wrap">
          <svg viewBox="0 0 100 100" className="splash-heartbeat-svg" fill="none">
            <defs>
              <linearGradient id="hbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="100%" stopColor="#7b2ff7" />
              </linearGradient>
            </defs>
            {/* Heart shape */}
            <path
              d="M50 80 C20 55 5 40 5 28 C5 15 15 8 27 8 C36 8 44 14 50 22 C56 14 64 8 73 8 C85 8 95 15 95 28 C95 40 80 55 50 80Z"
              fill="url(#hbGrad)"
              className="splash-heart-path"
            />
            {/* EKG line on heart */}
            <polyline
              points="18,50 28,50 33,38 38,62 43,44 48,52 52,52 57,42 62,50 72,50 82,50"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="splash-ekg-line"
            />
          </svg>
        </div>

        {/* App name */}
        <div className="splash-text-wrap">
          <h1 className="splash-title">
            <span className="splash-heal">Heal</span>
            <span className="splash-track">Track</span>
          </h1>
          <p className="splash-subtitle">Hospital Management System</p>
          <div className="splash-tagline-wrap">
            <span className="splash-dot" />
            <span className="splash-tagline">Smart · Secure · Seamless</span>
            <span className="splash-dot" />
          </div>
        </div>
      </div>

      {/* Loading bar */}
      <div className="splash-loader-track">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}
