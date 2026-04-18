import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";

const bannerImages = [
  "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/3845129/pexels-photo-3845129.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

const FEATURES = [
  { icon: "🏥", title: "Health Dashboard",    desc: "Your unified health hub — vitals, medicines & records at a glance.", path: "/health",   color: "#6c63ff" },
  { icon: "📑", title: "Book Appointment",    desc: "Online booking with date & time picker, voice fill & token system.",  path: "/booking",  color: "#56ccf2" },
  { icon: "📊", title: "Vitals Tracker",      desc: "Log BP, sugar, pulse & temperature with AI-powered health alerts.",   path: "/vitals",   color: "#43e97b" },
  { icon: "💊", title: "Medicine Reminder",   desc: "Set daily medication alerts with browser push notifications.",         path: "/reminder", color: "#f7971e" },
  { icon: "📂", title: "Medical Records",     desc: "View your complete prescription history written by your doctor.",      path: "/records",  color: "#e96c6c" },
  { icon: "🔖", title: "Check Appointment",   desc: "Real-time token tracker — see where you are in the queue.",           path: "/status",   color: "#ffd200" },
  { icon: "⭐", title: "Rate Your Doctor",    desc: "Star ratings & reviews — help others choose the right specialist.",    path: "/review",   color: "#a29bfe" },
  { icon: "🚨", title: "Emergency 108/112",   desc: "One-tap ambulance booking & emergency hospital locator.",              path: "/emergency",color: "#ff6b6b" },
  { icon: "🤖", title: "AI Health Chatbot",   desc: "Powered by Gemini AI — instant medical guidance & triage support.",   path: "/chatbot",  color: "#74b9ff" },
  { icon: "📍", title: "Nearby Hospitals",    desc: "Find hospitals near you on a live map with bed availability.",         path: "/nearby",   color: "#00cec9" },
  { icon: "🧬", title: "MDR Dashboard",       desc: "Monitor Multi-Drug Resistance patterns across wards in real time.",   path: "/mdr-dashboard", color: "#fd79a8" },
  { icon: "🗓️", title: "Waiting Room",        desc: "Live queue display — know exactly when your turn is coming.",         path: "/waiting",  color: "#fdcb6e" },
];

const STATS = [
  { value: "50K+", label: "Patients Served" },
  { value: "200+", label: "Specialist Doctors" },
  { value: "98%",  label: "Satisfaction Rate" },
  { value: "24/7", label: "Emergency Support" },
];

export default function Home() {
  const navigate    = useNavigate();
  const { user }    = useContext(AuthContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(i => (i + 1) % bannerImages.length);
      }, 4000);
    }
  };
  const stopAutoPlay = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };
  const prev = () => setCurrentIndex(i => (i - 1 + bannerImages.length) % bannerImages.length);
  const next = () => setCurrentIndex(i => (i + 1) % bannerImages.length);

  return (
    <div className="home">

      {/* ── HERO SLIDER ── */}
      <div className="hero" onMouseEnter={stopAutoPlay} onMouseLeave={startAutoPlay}>
        <div className="hero-slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {bannerImages.map((img, idx) => (
            <div className="hero-slide" key={idx}>
              <img
                src={img}
                alt={`Hospital banner ${idx + 1}`}
                className="hero-img"
                onError={e => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221600%22%20height%3D%22600%22%20viewBox%3D%220%200%201600%20600%22%3E%3Crect%20fill%3D%22%232a3b4c%22%20width%3D%221600%22%20height%3D%22600%22%2F%3E%3Ctext%20fill%3D%22%23ffffff%22%20font-family%3D%22sans-serif%22%20font-size%3D%2260%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EHealTrack%20Medical%20System%3C%2Ftext%3E%3C%2Fsvg%3E"; }}
              />
            </div>
          ))}
        </div>
        <button className="slider-arrow left" onClick={prev}>‹</button>
        <button className="slider-arrow right" onClick={next}>›</button>
        <div className="hero-overlay">
          <h1>Welcome to Heal Track 🏥</h1>
          <p style={{ color: "rgba(88, 13, 216, 0.85)", fontSize: "1.05rem", marginBottom: 20 }}>
            Smart Healthcare, Zero Waiting — Digital hospital management for the modern age
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="cta-btn cta-ai" onClick={() => navigate("/chatbot")}>
              🤖 AI ChatBot
            </button>
          </div>
        </div>
        <div className="slider-dots">
          {bannerImages.map((_, i) => (
            <button key={i} className={`dot ${i === currentIndex ? "active" : ""}`} onClick={() => setCurrentIndex(i)} />
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="stats-strip">
        {STATS.map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── MANAGEMENT / DOCTOR QUICK ACTIONS ── */}
      {(user?.role === "Management" || user?.role === "Doctor") && (
        <div className="features-section" style={{ paddingBottom: 0 }}>
          <h2 className="section-title">
            {user?.role === "Management" ? "🏥 Management Tools" : "👨‍⚕️ Doctor Tools"}
          </h2>
          <p className="section-sub">Quick access to your role-specific features</p>
          <div className="features-grid">
            <div className="feature-card" style={{ "--accent": "#6c63ff" }} onClick={() => navigate("/dashboard")}>
              <div className="fc-icon">👨‍⚕️</div>
              <h3 className="fc-title">Doctor Dashboard</h3>
              <p className="fc-desc">View today's patient queue and call next token.</p>
              <span className="fc-arrow">→</span>
            </div>
            <div className="feature-card" style={{ "--accent": "#00b894" }} onClick={() => navigate("/waiting")}>
              <div className="fc-icon">🕐</div>
              <h3 className="fc-title">Waiting Room</h3>
              <p className="fc-desc">Live queue display for the waiting area screen.</p>
              <span className="fc-arrow">→</span>
            </div>
            <div className="feature-card" style={{ "--accent": "#fdcb6e" }} onClick={() => navigate("/prescription")}>
              <div className="fc-icon">🧾</div>
              <h3 className="fc-title">Write Prescription</h3>
              <p className="fc-desc">Create and save digital prescriptions for patients.</p>
              <span className="fc-arrow">→</span>
            </div>
            <div className="feature-card" style={{ "--accent": "#56ccf2" }} onClick={() => navigate("/booking")}>
              <div className="fc-icon">📑</div>
              <h3 className="fc-title">Book Appointment</h3>
              <p className="fc-desc">Register a new patient and generate a token.</p>
              <span className="fc-arrow">→</span>
            </div>
            {user?.role === "Management" && (
              <>
                <div className="feature-card" style={{ "--accent": "#e17055" }} onClick={() => navigate("/medwaste")}>
                  <div className="fc-icon">🧪</div>
                  <h3 className="fc-title">Med Waste</h3>
                  <p className="fc-desc">Track and manage medical waste disposal records.</p>
                  <span className="fc-arrow">→</span>
                </div>
                <div className="feature-card" style={{ "--accent": "#a29bfe" }} onClick={() => navigate("/export")}>
                  <div className="fc-icon">📊</div>
                  <h3 className="fc-title">Export to Excel</h3>
                  <p className="fc-desc">Download bookings, prescriptions and user data.</p>
                  <span className="fc-arrow">→</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FEATURES GRID ── */}
      <div className="features-section">
        <h2 className="section-title">✨ Everything You Need</h2>
        <p className="section-sub">
          HealTrack bundles all hospital services into one intelligent platform
        </p>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div
              key={f.path}
              className="feature-card"
              style={{ "--accent": f.color }}
              onClick={() => navigate(f.path)}
            >
              <div className="fc-icon">{f.icon}</div>
              <h3 className="fc-title">{f.title}</h3>
              <p className="fc-desc">{f.desc}</p>
              <span className="fc-arrow">→</span>
            </div>
          ))}
        </div>
      </div>


      {/* ── ABOUT SECTION ── */}
      <div className="about clickable" onClick={() => navigate("/about")}>
        <h2>Why Choose HealTrack?</h2>
        <p>
          Our Hospital Management System provides a seamless experience for patients,
          doctors, and staff. From patient registration to digital prescriptions,
          everything is digitized for faster, smarter care.
        </p>
        <div className="about-features">
          <p>✅ Easy patient registration &amp; appointment booking</p>
          <p>📊 Real-time vitals tracking with health alerts</p>
          <p>💊 Smart medicine reminders with push notifications</p>
          <p>🤖 Gemini AI-powered health chatbot &amp; triage</p>
          <p>🔖 Live appointment queue tracking by token</p>
          <p>🚨 24/7 emergency response with 108/112 integration</p>
        </div>
      </div>

    </div>
  );
}
