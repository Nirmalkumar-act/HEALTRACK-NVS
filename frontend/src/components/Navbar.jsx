import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaBookMedical, FaUserMd, FaClock, FaHospital,
  FaUserCircle, FaSignOutAlt, FaSignInAlt, FaHeartbeat,
  FaPrescriptionBottleAlt, FaBell, FaFileMedical, FaChevronDown,
  FaQrcode, FaMapMarkerAlt, FaRobot, FaAmbulance, FaSearch,
  FaCalendarCheck, FaChartLine,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";
import Logo from "../assets/logo.png";

/* ─── Dropdown helper component ──────────────────────────────────────────── */
function NavDropdown({ label, icon, isOpen, onToggle, children }) {
  return (
    <li className="nav-dropdown-wrap">
      <button
        className={`nav-dropdown-btn ${isOpen ? "active" : ""}`}
        onClick={onToggle}
      >
        {icon} {label}
        <FaChevronDown className={`chevron ${isOpen ? "open" : ""}`} />
      </button>
      {isOpen && <ul className="nav-submenu">{children}</ul>}
    </li>
  );
}

function SubItem({ icon, label, to, onClick }) {
  const navigate = useNavigate();
  return (
    <li onClick={() => { navigate(to); onClick(); }}>
      {icon} {label}
    </li>
  );
}

/* ─── Main Navbar ─────────────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout, isLoggedIn } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const navigate = useNavigate();
  const role = user?.role;
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setPatientOpen(false);
    setExploreOpen(false);
    setDoctorOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
    navigate("/login");
  };

  const toggle = (fn, ...others) => () => {
    others.forEach(f => f(false));
    fn(v => !v);
  };

  return (
    <nav ref={navRef} className={`navbar ${scrolled ? "scrolled" : ""}`}>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="navbar-logo" onClick={() => { navigate("/"); closeAll(); }}>
        <img src={Logo} alt="HealTrack" className="logo-img" />
        <span className="logo-text">HEAL TRACK</span>
      </div>

      {/* ── Hamburger ────────────────────────────────────────── */}
      <div
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle navigation"
      >
        <div /><div /><div />
      </div>

      {/* ── Links ────────────────────────────────────────────── */}
      <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>

        {/* Home */}
        <li>
          <NavLink to="/" className="nav-link" onClick={closeAll} end>
            <FaHome /> Home
          </NavLink>
        </li>

        {/* Booking (Hidden for Doctors) */}
        {role !== "Doctor" && (
          <li>
            <NavLink to="/booking" className="nav-link" onClick={closeAll}>
              <FaBookMedical /> Booking
            </NavLink>
          </li>
        )}

        {/* Queue */}
        <li>
          <NavLink to="/waiting" className="nav-link" onClick={closeAll}>
            <FaClock /> Queue
          </NavLink>
        </li>

        {/* ── 🏥 Patient Dropdown (User + Management only — NOT Doctor) ── */}
        {role !== "Doctor" && (
          <NavDropdown
            label="Patient"
            icon="🏥"
            isOpen={patientOpen}
            onToggle={toggle(setPatientOpen, setExploreOpen, setDoctorOpen, setProfileOpen)}
          >
            <SubItem icon={<FaFileMedical />} label="Medical Records" to="/records" onClick={closeAll} />
            <SubItem icon={<FaHeartbeat />} label="Vitals Tracker" to="/vitals" onClick={closeAll} />
            <SubItem icon={<FaBell />} label="Medicine Reminders" to="/reminder" onClick={closeAll} />
            <SubItem icon={<FaCalendarCheck />} label="Appointment Status" to="/status" onClick={closeAll} />
            <SubItem icon={<FaChartLine />} label="Health Dashboard" to="/health" onClick={closeAll} />
            <SubItem icon={"⭐"} label="Doctor Reviews" to="/review" onClick={closeAll} />
          </NavDropdown>
        )}

        {/* ── 🔍 Explore Dropdown ──────────────────────────── */}
        <NavDropdown
          label="Explore"
          icon="🔍"
          isOpen={exploreOpen}
          onToggle={toggle(setExploreOpen, setPatientOpen, setDoctorOpen, setProfileOpen)}
        >
          {/* All roles */}
          <SubItem icon={<FaHospital />} label="Hospital Tracker" to="/tracker" onClick={closeAll} />
          <SubItem icon={<FaAmbulance />} label="Emergency" to="/emergency" onClick={closeAll} />
          <SubItem icon={<FaSearch />} label="Services" to="/services" onClick={closeAll} />
          <SubItem icon={<FaRobot />} label="AI Chatbot" to="/chatbot" onClick={closeAll} />
          <SubItem icon={"🧬"} label="MDR Dashboard" to="/mdr-dashboard" onClick={closeAll} />
          <SubItem icon={"ℹ️"} label="About" to="/about" onClick={closeAll} />
          {/* Management only */}
          {role === "Management" && (
            <>
              <SubItem icon={<FaQrcode />} label="QR Scanner" to="/qrscanner" onClick={closeAll} />
              <SubItem icon={"🪙"} label="Gantrade Card" to="/gantrade" onClick={closeAll} />
            </>
          )}
        </NavDropdown>

        {/* ── 👨‍⚕️ Doctor Dropdown (Doctor / Management only) ── */}
        {(role === "Doctor" || role === "Management") && (
          <NavDropdown
            label="Doctor"
            icon={<FaUserMd />}
            isOpen={doctorOpen}
            onToggle={toggle(setDoctorOpen, setPatientOpen, setExploreOpen, setProfileOpen)}
          >
            <SubItem icon={<FaUserMd />} label="Dashboard" to="/dashboard" onClick={closeAll} />
            <SubItem icon={<FaPrescriptionBottleAlt />} label="Write Prescription" to="/prescription" onClick={closeAll} />
            {role === "Management" && (
              <>
                <SubItem icon={"📊"} label="Export to Excel" to="/export" onClick={closeAll} />
              </>
            )}
          </NavDropdown>
        )}

        {/* ── Profile ──────────────────────────────────────── */}
        <li className="profile-dropdown">
          <div
            className="profile-trigger"
            onClick={toggle(setProfileOpen, setPatientOpen, setExploreOpen, setDoctorOpen)}
          >
            <FaUserCircle className="profile-icon" />
            {user && <span className="profile-name">{user.name?.split(" ")[0]}</span>}
          </div>

          {profileOpen && (
            <ul className="dropdown-menu">
              {isLoggedIn && user && (
                <li className="dropdown-user-info">
                  <strong>{user.name}</strong>
                  <small>{role}</small>
                </li>
              )}
              {!isLoggedIn && (
                <li>
                  <NavLink to="/login" className="dropdown-link" onClick={closeAll}>
                    <FaSignInAlt /> Login
                  </NavLink>
                </li>
              )}
              {isLoggedIn && (
                <li className="dropdown-link" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </li>
              )}
            </ul>
          )}
        </li>

      </ul>
    </nav>
  );
}