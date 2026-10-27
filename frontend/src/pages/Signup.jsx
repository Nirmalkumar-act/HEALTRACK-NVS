import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, WifiOff } from "lucide-react";
import "../styles/Auth.css";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

const WAKE_STATE = {
  WAKING: "waking",
  READY:  "ready",
  FAILED: "failed",
};

export default function Signup() {
  const navigate = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role,         setRole]         = useState("User");
  const [toast,        setToast]        = useState("");
  const [toastType,    setToastType]    = useState("info");
  const [loading,      setLoading]      = useState(false);
  const [wakeState,    setWakeState]    = useState(WAKE_STATE.WAKING);
  const [wakeSeconds,  setWakeSeconds]  = useState(0);

  const showToast = useCallback((msg, type = "info") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 5000);
  }, []);

  // ── Pre-warm Render backend as soon as Signup page mounts ─────────────────
  useEffect(() => {
    let cancelled = false;
    let timerId;

    const countdownId = setInterval(() => {
      setWakeSeconds(s => s + 1);
    }, 1000);

    const tryWakeUp = async () => {
      try {
        await fetch(`${BASE}/auth/register`, {
          method: "OPTIONS",
          signal: AbortSignal.timeout(28000),
        });
        if (!cancelled) {
          setWakeState(WAKE_STATE.READY);
          clearInterval(countdownId);
        }
      } catch {
        if (!cancelled) {
          setWakeState(WAKE_STATE.FAILED);
          clearInterval(countdownId);
        }
      }
    };

    tryWakeUp();

    timerId = setTimeout(() => {
      if (!cancelled) {
        setWakeState(prev => prev === WAKE_STATE.WAKING ? WAKE_STATE.FAILED : prev);
        clearInterval(countdownId);
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      clearInterval(countdownId);
    };
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setToast("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      showToast("❌ Email and password are required.", "error");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      showToast("❌ Password must be at least 6 characters.", "error");
      setLoading(false);
      return;
    }

    const doRegister = async () => {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, role }),
        signal: AbortSignal.timeout(40000), // 40s for cold-start
      });
      return res;
    };

    try {
      let res;
      try {
        res = await doRegister();
      } catch {
        // Auto-retry once on timeout/network error
        await new Promise(r => setTimeout(r, 1500));
        res = await doRegister();
      }

      const text = await res.text();

      // Mark server ready now that we got a response
      setWakeState(WAKE_STATE.READY);

      if (res.status === 409) {
        showToast("⚠️ This email is already registered. Please login instead.", "error");
        return;
      }

      if (!res.ok) {
        showToast(`❌ ${text || "Registration failed. Please try again."}`, "error");
        return;
      }

      showToast("✅ Account created! Redirecting to login…", "success");
      setTimeout(() => navigate("/login"), 1400);

    } catch {
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
        <h1>Create Account</h1>
        <p className="subtitle">Join the HMS platform</p>

        {/* ── Server wake-up status banner ── */}
        <AnimatePresence mode="wait">
          {wakeState === WAKE_STATE.WAKING && (
            <motion.div
              key="waking"
              className="wake-banner wake-banner--waking"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="wake-icon wake-spin">⏳</span>
              <span>
                Waking up server
                <span className="wake-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </span>
              {wakeSeconds > 5 && (
                <span className="wake-tip">
                  (Render free tier — may take ~{Math.max(0, 30 - wakeSeconds)}s)
                </span>
              )}
            </motion.div>
          )}

          {wakeState === WAKE_STATE.READY && (
            <motion.div
              key="ready"
              className="wake-banner wake-banner--ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle size={14} />
              <span>Server ready — you can sign up now</span>
            </motion.div>
          )}

          {wakeState === WAKE_STATE.FAILED && (
            <motion.div
              key="failed"
              className="wake-banner wake-banner--failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WifiOff size={14} />
              <span>Server might be slow — try signing up anyway</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSignup} className="auth-form">
          {/* Email */}
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

          {/* Password */}
          <div className="form-group password-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
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

          {/* Role */}
          <div className="form-group role-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
              <option value="User">User</option>
              <option value="Doctor">Doctor</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            disabled={loading}
            style={{ opacity: loading ? 0.72 : 1 }}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Creating account…
              </span>
            ) : (
              "Sign Up"
            )}
          </motion.button>

          <p className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
