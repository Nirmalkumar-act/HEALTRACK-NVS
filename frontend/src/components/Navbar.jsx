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
     {/* Logo Image */}
      <div className="navbar-logo">
  <img src={Logo} alt="Heal Track Logo" className="logo-img" />
  <span className="logo-text">HEAL TRACK</span>
  </div>



      {/* Hamburger Menu */}
      <div
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Navbar Links */}
      <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaHome className="nav-icon" /> Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaBookMedical className="nav-icon" /> Booking
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaUserMd className="nav-icon" /> DD
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/waiting"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaClock className="nav-icon" /> WD
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tracker"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaHospital className="nav-icon" /> HT
          </NavLink>
        </li>
        

        <li>
          <NavLink to="/mdr-dashboard" className="nav-link">
            🧬 MDR
          </NavLink>
        </li>

       
        <li>
          <NavLink to="/medwaste" className="nav-link">
            🧪 MW
          </NavLink>
        </li>


        {/* Profile Dropdown */}
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
                    <FaSignInAlt style={{ marginRight: "8px" }} /> Login
                  </NavLink>
                </li>
              )}
              {isLoggedIn && (
                <li className="dropdown-link" onClick={handleLogout}>
                  <FaSignOutAlt style={{ marginRight: "8px" }} /> Logout
                </li>
              )}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}
