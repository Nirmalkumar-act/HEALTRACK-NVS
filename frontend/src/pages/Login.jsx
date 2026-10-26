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

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast,        setToast]        = useState("");
  const [toastType,    setToastType]    = useState("info");
  const [loading,      setLoading]      = useState(false);
  const [serverReady,  setServerReady]  = useState(false);
  const [waking,       setWaking]       = useState(true);

  const showToast = (msg, type = "info") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 5000);
  };

  // ── Pre-warm Render server as soon as page loads ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    const warmUp = async () => {
      try {
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
    if (loading) return;
    setLoading(true);
    setToast("");

    // Basic client-side validation
    if (!email.trim() || !password.trim()) {
      showToast("❌ Email and password are required.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      // Read response body as text first (safe for both JSON and plain text)
      const rawText = await response.text();

      if (!response.ok) {
        // Try to extract message from JSON error body (Spring Boot sends JSON for 500s)
        let errorMsg = rawText;
        try {
          const errJson = JSON.parse(rawText);
          errorMsg = errJson.message || errJson.error || rawText;
        } catch {
          // rawText is plain text — use as is
        }

        if (response.status === 401) {
          showToast("❌ Invalid email or password. Please try again.", "error");
        } else if (response.status === 500) {
          showToast("⚠️ Server error. Please try again in a moment.", "error");
        } else {
          showToast(`❌ ${errorMsg || "Login failed. Please try again."}`, "error");
        }
        setLoading(false);
        return;
      }

      // Parse as JSON (login success)
      let user;
      try {
        user = JSON.parse(rawText);
      } catch {
        showToast("⚠️ Unexpected server response. Please try again.", "error");
        setLoading(false);
        return;
      }

      login(user);
      showToast("✅ Login successful!", "success");
      setTimeout(() => navigate("/onboarding"), 700);

    } catch (err) {
      showToast("⚠️ Cannot reach server. Please wait a moment and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toastBg =
    toastType === "success"
      ? "linear-gradient(135deg, #00b894, #00cec9)"
      : toastType === "error"
      ? "linear-gradient(135deg, #d63031, #e17055)"
      : "linear-gradient(135deg, #6c63ff, #56ccf2)";

  return (
    <div className="auth-page">
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            style={{ background: toastBg }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              disabled={loading}
            />
            <span
              className="show-pass-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
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
