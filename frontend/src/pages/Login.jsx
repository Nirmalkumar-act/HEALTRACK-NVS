import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import "../styles/Auth.css";
import { AuthContext } from "../context/AuthContext";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

export default function Login() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPassword,setShowPassword]= useState(false);
  const [toast,       setToast]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [waking,      setWaking]      = useState(true);

  // ── Pre-warm Render server as soon as page loads ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    const warmUp = async () => {
      try {
        // A lightweight OPTIONS request wakes the server without auth
        await fetch(`${BASE}/auth/login`, { method: "OPTIONS" });
        if (!cancelled) { setServerReady(true); setWaking(false); }
      } catch {
        // Even if it fails, let the user try — server may still respond
        if (!cancelled) { setServerReady(true); setWaking(false); }
      }
    };
    warmUp();
    // Safety timeout — stop showing "waking" after 8 seconds no matter what
    const t = setTimeout(() => { if (!cancelled) { setServerReady(true); setWaking(false); } }, 8000);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast("");

    try {
      const response = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const msg = await response.text();
        setToast(`❌ ${msg || "Invalid email or password"}`);
        setLoading(false);
        return;
      }

      const user = await response.json();
      login(user);
      setToast("✅ Login successful!");
      setTimeout(() => navigate("/"), 800);

    } catch (err) {
      setToast("⚠️ Cannot reach server. Please wait a moment and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Welcome to HMS</h1>
        <p className="subtitle">Login to manage hospital efficiently</p>

        {/* Server wake-up indicator */}
        {waking && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: "0.82rem",
              color: "#fdcb6e",
              textAlign: "center",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span style={{ animation: "spin 1s linear infinite", display:"inline-block" }}>⏳</span>
            Connecting to server… (first load may take ~30s)
          </motion.p>
        )}

        {serverReady && !waking && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: "0.82rem", color: "#00cec9", textAlign: "center", marginBottom: "8px" }}
          >
            ✅ Server ready
          </motion.p>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
            <span
              className="show-pass-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            style={{ opacity: loading ? 0.75 : 1 }}
          >
            {loading ? "⏳ Logging in…" : "Login"}
          </motion.button>

          <p className="auth-links">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
