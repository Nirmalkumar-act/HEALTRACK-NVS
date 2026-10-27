import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Wifi, WifiOff, CheckCircle } from "lucide-react";
import "../styles/Auth.css";
import { AuthContext } from "../context/AuthContext";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

// Server warm-up states
const WAKE_STATE = {
  WAKING: "waking",   // trying to connect
  READY:  "ready",    // server responded
  FAILED: "failed",   // could not reach (still lets user try)
};

export default function Login() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // ── Pre-warm Render backend as soon as Login page mounts ──────────────────
  useEffect(() => {
    let cancelled = false;
    let timerId;

    // Countdown timer — shows user how long we've been waking
    const countdownId = setInterval(() => {
      setWakeSeconds(s => s + 1);
    }, 1000);

    const tryWakeUp = async () => {
      try {
        const res = await fetch(`${BASE}/auth/login`, {
          method: "OPTIONS",
          signal: AbortSignal.timeout(28000), // 28s max
        });
        if (!cancelled) {
          setWakeState(WAKE_STATE.READY);
          clearInterval(countdownId);
        }
      } catch {
        // Network fail or timeout — don't block user, just mark failed
        if (!cancelled) {
          setWakeState(WAKE_STATE.FAILED);
          clearInterval(countdownId);
        }
      }
    };

    tryWakeUp();

    // Hard cap: after 30s always allow user to proceed
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setToast("");

    if (!email.trim() || !password.trim()) {
      showToast("❌ Email and password are required.", "error");
      setLoading(false);
      return;
    }

    const doLogin = async () => {
      const response = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: AbortSignal.timeout(40000), // 40s for cold-start login
      });

      const rawText = await response.text();

      if (!response.ok) {
        let errorMsg = rawText;
        try {
          const errJson = JSON.parse(rawText);
          errorMsg = errJson.message || errJson.error || rawText;
        } catch { /* plain text — use as is */ }

        if (response.status === 401) {
          throw { type: "auth", msg: "❌ Invalid email or password. Please try again." };
        } else if (response.status === 500) {
          throw { type: "server", msg: "⚠️ Server error. Please try again in a moment." };
        } else {
          throw { type: "other", msg: `❌ ${errorMsg || "Login failed. Please try again."}` };
        }
      }

      return JSON.parse(rawText);
    };

    try {
      let user;
      try {
        user = await doLogin();
      } catch (err) {
        // Auto-retry once on network/timeout errors (cold start)
        if (err?.type) throw err; // known API error — don't retry
        await new Promise(r => setTimeout(r, 1500));
        user = await doLogin();
      }

      // Mark server as ready now that we got a real response
      setWakeState(WAKE_STATE.READY);
      login(user);
      showToast("✅ Login successful!", "success");
      setTimeout(() => navigate("/onboarding"), 700);

    } catch (err) {
      if (err?.type === "auth") {
        showToast(err.msg, "error");
      } else if (err?.type === "server") {
        showToast(err.msg, "error");
      } else if (err?.type === "other") {
        showToast(err.msg, "error");
      } else {
        showToast("⚠️ Cannot reach server. Please wait a moment and try again.", "error");
      }
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
              <span>Server ready — you can login now</span>
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
              <span>Server might be slow — try logging in anyway</span>
            </motion.div>
          )}
        </AnimatePresence>

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
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Logging in…
              </span>
            ) : (
              "Login"
            )}
          </motion.button>

          <p className="auth-links">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
