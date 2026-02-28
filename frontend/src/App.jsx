import React, { useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContext } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
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
import Signup from "./pages/Signup"; // ✅ added

// 🔒 Protected Route Wrapper

const ProtectedRoute = ({ children, roles }) => {
  const { isLoggedIn, user } = useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // ✅ Google Translate script loader (only loads once)
  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (!window.translateElementInitialized) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,fr,de,zh,ta,hi,ar",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
          window.translateElementInitialized = true;
        }
      };
    }

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <div className="app-wrapper flex flex-col min-h-screen bg-gray-50">
          {/* ✅ Show Navbar only when logged in */}
          <AuthContentWrapper>
            <Navbar />
          </AuthContentWrapper>

          {/* 🌍 Google Translate Dropdown */}
          <div
            id="google_translate_element"
            className="translate-container w-full text-center p-2 bg-blue-50 shadow-md"
          ></div>

          {/* Main Content */}
          <main className="main-content flex-1 p-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emergency"
                element={
                  <ProtectedRoute>
                    <Emergency />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <ProtectedRoute>
                    <ScanId />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review"
                element={
                  <ProtectedRoute>
                    <PatientReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["Doctor", "Management"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute>
                    <Confirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiting"
                element={
                  <ProtectedRoute>
                    <WaitingDisplay />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracker"
                element={
                  <ProtectedRoute>
                    <HospitalTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nearby"
                element={
                  <ProtectedRoute>
                    <NearbyHospitals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gantrade"
                element={
                  <ProtectedRoute>
                    <GantradeCard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qrscanner"
                element={
                  <ProtectedRoute>
                    <QRScanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medwaste"
                element={
                  <ProtectedRoute roles={["Management"]}>
                    <MedWaste />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mdr-dashboard"
                element={
                  <ProtectedRoute>
                    <MDRDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* ✅ Show footer only when logged in */}
          <AuthContentWrapper>
            <Footer />
          </AuthContentWrapper>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

// ✅ Helper: Hide Navbar/Footer when not logged in
function AuthContentWrapper({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  if (!isLoggedIn) return null;
  return children;
}

export default App;
