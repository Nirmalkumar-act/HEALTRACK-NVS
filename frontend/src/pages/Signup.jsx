import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import "../styles/Auth.css";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

export default function Signup() {
  const navigate = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role,         setRole]         = useState("User");
  const [toast,        setToast]        = useState("");
  const [toastType,    setToastType]    = useState("info"); // "success" | "error" | "info"
  const [loading,      setLoading]      = useState(false);

  const showToast = (msg, type = "info") => {
    setToast(msg);
    setToastType(type);
    // Auto-hide after 5s
    setTimeout(() => setToast(""), 5000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setToast("");
    setLoading(true);

    // Basic client-side validation
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

    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, role }),
      });

      const text = await res.text();

      if (res.status === 409) {
        // Duplicate email — clear, friendly message
        showToast("⚠️ This email is already registered. Please login instead.", "error");
        return;
      }

      if (!res.ok) {
        showToast(`❌ ${text || "Registration failed. Please try again."}`, "error");
        return;
      }

      showToast("✅ Account created! Redirecting to login…", "success");
      setTimeout(() => navigate("/login"), 1400);

    } catch (err) {
      showToast("⚠️ Cannot reach server. Please check your connection and try again.", "error");
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
            {loading ? "⏳ Creating account…" : "Sign Up"}
          </motion.button>

          <p className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
