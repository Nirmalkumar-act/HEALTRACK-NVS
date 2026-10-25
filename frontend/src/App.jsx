import React, { useEffect, useContext, useState } from "react";
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContext } from "./context/AuthContext";
import SplashScreen from "./components/SplashScreen";
import Onboarding from "./pages/Onboarding";
import LanguageSelector from "./components/LanguageSelector";

// ── Core Components ────────────────────────────────────────────────────────
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

// ── Pages ──────────────────────────────────────────────────────────────────
import Home from "./pages/Home";
import About from "./pages/About";
import Emergency from "./pages/Emergency";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import ScanId from "./pages/ScanId";
import PatientReview from "./pages/PatientReview";
import DoctorDashboard from "./pages/DoctorDashboard";
import Confirmation from "./pages/BookingConfirmation";
import WaitingDisplay from "./pages/WaitingDisplay";
import HospitalTracker from "./pages/HospitalTracker";
import NearbyHospitals from "./pages/NearbyHospitals";
import GantradeCard from "./pages/GantradeCard";
import QRScanner from "./pages/QRScanner";
import MedWaste from "./pages/MedWaste";
import MDRDashboard from "./pages/MDRDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HealthDashboard from "./pages/HealthDashboard";
import AppointmentStatus from "./pages/AppointmentStatus";

// ── New Feature Pages ──────────────────────────────────────────────────────
import PrescriptionForm from "./pages/PrescriptionForm";
import PatientRecords from "./pages/PatientRecords";
import MedicineReminder from "./pages/MedicineReminder";
import VitalsTracker from "./pages/VitalsTracker";
import DataExport from "./pages/DataExport";
import PatientHistoryViewer from "./pages/PatientHistoryViewer";

// ── Config ─────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// ── Protected Route ────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isLoggedIn, user } = useContext(AuthContext);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

function AuthContentWrapper({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  if (!isLoggedIn) return null;
  return children;
}

// ── App ────────────────────────────────────────────────────────────────────
// Flow:  Splash (outside Router) → Login → /onboarding (first time, inside Router) → /
// Onboarding MUST be inside <Router> so useNavigate() works — this fixes the crash.
function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Google Translate setup
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,ta,hi,te,ml,kn,es,fr,de,ar",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      } catch (err) {
        console.warn("Google Translate init error:", err);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // ── Step 1: Splash screen (no Router needed here) ─────────────────────────
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // ── Step 2: Full app — Router wraps everything including Onboarding ────────
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app-wrapper">
          <AuthContentWrapper><Navbar /></AuthContentWrapper>

          {/* Hidden Google Translate container (managed offscreen by CSS) */}
          <div id="google_translate_element" />

          {/* Floating Language Selector (Always visible across all pages) */}
          <LanguageSelector />

          <main className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Onboarding — inside Router so useNavigate() works correctly */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* All logged-in users */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><ScanId /></ProtectedRoute>} />
              <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
              <Route path="/waiting" element={<ProtectedRoute><WaitingDisplay /></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute><HospitalTracker /></ProtectedRoute>} />
              <Route path="/nearby" element={<ProtectedRoute><NearbyHospitals /></ProtectedRoute>} />
              <Route path="/gantrade" element={<ProtectedRoute><GantradeCard /></ProtectedRoute>} />
              <Route path="/qrscanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
              <Route path="/mdr-dashboard" element={<ProtectedRoute><MDRDashboard /></ProtectedRoute>} />
              <Route path="/review" element={<ProtectedRoute><PatientReview /></ProtectedRoute>} />

              {/* Patient Features */}
              <Route path="/records" element={<ProtectedRoute><PatientRecords /></ProtectedRoute>} />
              <Route path="/vitals" element={<ProtectedRoute><VitalsTracker /></ProtectedRoute>} />
              <Route path="/reminder" element={<ProtectedRoute><MedicineReminder /></ProtectedRoute>} />
              <Route path="/health" element={<ProtectedRoute><HealthDashboard /></ProtectedRoute>} />
              <Route path="/status" element={<ProtectedRoute><AppointmentStatus /></ProtectedRoute>} />

              {/* Doctor / Management */}
              <Route path="/dashboard"
                element={<ProtectedRoute roles={["Doctor", "Management"]}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/prescription"
                element={<ProtectedRoute roles={["Doctor", "Management"]}><PrescriptionForm /></ProtectedRoute>} />
              <Route path="/patient-history"
                element={<ProtectedRoute roles={["Doctor", "Management"]}><PatientHistoryViewer /></ProtectedRoute>} />
              <Route path="/export"
                element={<ProtectedRoute roles={["Management"]}><DataExport /></ProtectedRoute>} />

              {/* Management only */}
              <Route path="/medwaste"
                element={<ProtectedRoute roles={["Management"]}><MedWaste /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <AuthContentWrapper><Footer /></AuthContentWrapper>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
