import React, { useEffect, useContext } from "react";
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContext } from "./context/AuthContext";

// ── Core Components ────────────────────────────────────────────────────────
import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";
import Chatbot from "./components/Chatbot";

// ── Pages ──────────────────────────────────────────────────────────────────
import Home              from "./pages/Home";
import About             from "./pages/About";
import Emergency         from "./pages/Emergency";
import Services          from "./pages/Services";
import Booking           from "./pages/Booking";
import ScanId            from "./pages/ScanId";
import PatientReview     from "./pages/PatientReview";
import DoctorDashboard   from "./pages/DoctorDashboard";
import Confirmation      from "./pages/BookingConfirmation";
import WaitingDisplay    from "./pages/WaitingDisplay";
import HospitalTracker   from "./pages/HospitalTracker";
import NearbyHospitals   from "./pages/NearbyHospitals";
import GantradeCard      from "./pages/GantradeCard";
import QRScanner         from "./pages/QRScanner";
import MedWaste          from "./pages/MedWaste";
import MDRDashboard      from "./pages/MDRDashboard";
import Login             from "./pages/Login";
import Signup            from "./pages/Signup";
import HealthDashboard   from "./pages/HealthDashboard";
import AppointmentStatus from "./pages/AppointmentStatus";

// ── New Feature Pages ──────────────────────────────────────────────────────
import PrescriptionForm from "./pages/PrescriptionForm";
import PatientRecords   from "./pages/PatientRecords";
import MedicineReminder from "./pages/MedicineReminder";
import VitalsTracker    from "./pages/VitalsTracker";
import DataExport       from "./pages/DataExport";

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
function App() {
  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (!window.translateElementInitialized) {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", includedLanguages: "en,es,fr,de,zh,ta,hi,ar",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
            "google_translate_element"
          );
          window.translateElementInitialized = true;
        }
      };
    }
    if (!document.getElementById("google-translate-script")) {
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(s);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app-wrapper">
          <AuthContentWrapper><Navbar /></AuthContentWrapper>

          {/* ── Google Translate floating button (bottom-right) ── */}
          <div className="gt-float-wrap">
            <span className="gt-label">🌐</span>
            <div id="google_translate_element" />
          </div>

          <main className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* All logged-in users */}
              <Route path="/"              element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/about"         element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/emergency"     element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
              <Route path="/services"      element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/chatbot"       element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/booking"       element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/confirmation"  element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
              <Route path="/waiting"       element={<ProtectedRoute><WaitingDisplay /></ProtectedRoute>} />
              <Route path="/tracker"       element={<ProtectedRoute><HospitalTracker /></ProtectedRoute>} />
              <Route path="/nearby"        element={<ProtectedRoute><NearbyHospitals /></ProtectedRoute>} />
              <Route path="/review"        element={<ProtectedRoute roles={["User","Management"]}><PatientReview /></ProtectedRoute>} />

              {/* Management only — QR, Scan ID, Gantrade */}
              <Route path="/scan"          element={<ProtectedRoute roles={["Management"]}><ScanId /></ProtectedRoute>} />
              <Route path="/gantrade"      element={<ProtectedRoute roles={["Management"]}><GantradeCard /></ProtectedRoute>} />
              <Route path="/qrscanner"     element={<ProtectedRoute roles={["Management"]}><QRScanner /></ProtectedRoute>} />
              {/* MDR — User + Management */}
              <Route path="/mdr-dashboard" element={<ProtectedRoute roles={["User","Management"]}><MDRDashboard /></ProtectedRoute>} />

              {/* Patient Features — User + Management only (NOT Doctor) */}
              <Route path="/records"  element={<ProtectedRoute roles={["User","Management"]}><PatientRecords /></ProtectedRoute>} />
              <Route path="/vitals"   element={<ProtectedRoute roles={["User","Management"]}><VitalsTracker /></ProtectedRoute>} />
              <Route path="/reminder" element={<ProtectedRoute roles={["User","Management"]}><MedicineReminder /></ProtectedRoute>} />
              <Route path="/health"   element={<ProtectedRoute roles={["User","Management"]}><HealthDashboard /></ProtectedRoute>} />
              <Route path="/status"   element={<ProtectedRoute roles={["User","Management"]}><AppointmentStatus /></ProtectedRoute>} />

              {/* Doctor / Management */}
              <Route path="/dashboard"
                element={<ProtectedRoute roles={["Doctor","Management"]}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/prescription"
                element={<ProtectedRoute roles={["Doctor","Management"]}><PrescriptionForm /></ProtectedRoute>} />
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
