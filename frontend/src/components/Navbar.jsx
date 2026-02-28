import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBookMedical,
  FaUserMd,
  FaClock,
  FaHospital,
  FaUserCircle,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";
import Logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout, isLoggedIn } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const role = user?.role;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-logo">
        <img src={Logo} alt="Heal Track Logo" className="logo-img" />
        <span className="logo-text">HEAL TRACK</span>
      </div>

      <div
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>

        <li>
          <NavLink to="/" className="nav-link">
            <FaHome /> Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/booking" className="nav-link">
            <FaBookMedical /> Booking
          </NavLink>
        </li>

        {(role === "Doctor" || role === "Management") && (
          <li>
            <NavLink to="/dashboard" className="nav-link">
              <FaUserMd /> DD
            </NavLink>
          </li>
        )}

        <li>
          <NavLink to="/waiting" className="nav-link">
            <FaClock /> WD
          </NavLink>
        </li>

        <li>
          <NavLink to="/tracker" className="nav-link">
            <FaHospital /> HT
          </NavLink>
        </li>

        <li>
          <NavLink to="/mdr-dashboard" className="nav-link">
            🧬 MDR
          </NavLink>
        </li>

        {role === "Management" && (
          <li>
            <NavLink to="/medwaste" className="nav-link">
              🧪 MW
            </NavLink>
          </li>
        )}

        <li
          className="profile-dropdown"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <FaUserCircle className="profile-icon" />
          {dropdownOpen && (
            <ul className="dropdown-menu">
              {!isLoggedIn && (
                <li>
                  <NavLink to="/login" className="dropdown-link">
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