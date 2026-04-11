import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [toast, setToast] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setToast("");

    // Build clean base URL (strip trailing slash)
    const base = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

    try {
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setToast(`❌ ${msg || "Registration failed"}`);
        return;
      }

      setToast("✅ Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);

    } catch (err) {
      setToast("⚠️ Cannot reach server. Check your connection or try again.");
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <h1>Create Account</h1>
        <p className="subtitle">Join the HMS platform</p>

        {toast && <p className="toast">{toast}</p>}

        <form onSubmit={handleSignup} className="auth-form">
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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <div className="form-group role-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="User">User</option>
              <option value="Doctor">Doctor</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </motion.button>

          <p className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
