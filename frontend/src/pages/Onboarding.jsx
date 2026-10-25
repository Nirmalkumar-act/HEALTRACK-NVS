import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import "../styles/Onboarding.css";

/* ── Feature data (step-by-step instructions for every feature) ── */
const FEATURES = [
  {
    id: "welcome",
    icon: "🏥",
    color: "#00d2ff",
    gradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)",
    title: "Welcome to HealTrack HMS",
    subtitle: "Your Complete Hospital Management Solution",
    description:
      "HealTrack is an all-in-one Hospital Management System designed to streamline patient care, appointment booking, doctor workflows, and hospital operations. Follow this quick tour to get started in just a few minutes.",
    steps: [
      { icon: "1️⃣", text: "Sign up or log in with your credentials (Patient, Doctor, or Management role)." },
      { icon: "2️⃣", text: "You'll be taken to your personalized Home Dashboard based on your role." },
      { icon: "3️⃣", text: "Use the Navbar at the top to navigate between all features." },
      { icon: "4️⃣", text: "The 🌐 floating button lets you translate the entire app into 8 languages." },
    ],
    tip: "💡 Your role determines which features you can access — Patient, Doctor, or Management.",
  },
  {
    id: "login",
    icon: "🔐",
    color: "#7b2ff7",
    gradient: "linear-gradient(135deg, #7b2ff7 0%, #e040fb 100%)",
    title: "Login & Signup",
    subtitle: "Secure Access to Your Account",
    description:
      "HealTrack uses secure authentication to protect your medical data. Whether you're a Patient, Doctor, or Hospital Manager, your account is role-based and encrypted.",
    steps: [
      { icon: "📧", text: "Go to the Login page and enter your registered Email and Password." },
      { icon: "👁️", text: "Click the Eye icon to toggle password visibility." },
      { icon: "✅", text: "Click 'Login' — you'll see a 'Server Ready' indicator confirming connection." },
      { icon: "🆕", text: "New user? Click 'Sign Up', fill in your details and choose your role (Patient / Doctor / Management)." },
      { icon: "🔄", text: "First load may take up to 30 seconds as the server wakes up (free tier hosting)." },
    ],
    tip: "💡 Your role (Patient / Doctor / Management) controls which pages and features you can access.",
  },
  {
    id: "home",
    icon: "🏠",
    color: "#00b894",
    gradient: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
    title: "Home Dashboard",
    subtitle: "Your Personal Health Hub",
    description:
      "The Home page gives you a quick overview of all available features and quick-access cards. It adapts to your role — patients see appointment options, doctors see their patient queue.",
    steps: [
      { icon: "👀", text: "After login, you land on the Home page automatically." },
      { icon: "🗂️", text: "Feature cards are displayed with icons — click any card to navigate to that feature." },
      { icon: "🔔", text: "Important notifications or alerts (like Emergency) appear highlighted at the top." },
      { icon: "📊", text: "Scroll down to see your latest health stats, appointment status, and quick links." },
    ],
    tip: "💡 The Home page is fully responsive — works on phones, tablets, and desktops.",
  },
  {
    id: "booking",
    icon: "📅",
    color: "#fdcb6e",
    gradient: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
    title: "Appointment Booking",
    subtitle: "Book Doctor Appointments Easily",
    description:
      "Patients can book appointments with any registered doctor. The system shows available time slots, prevents double-booking, and sends a confirmation with a unique booking ID.",
    steps: [
      { icon: "1️⃣", text: "Click 'Booking' in the Navbar or Home page card." },
      { icon: "2️⃣", text: "Select the Department and then choose a Doctor from the list." },
      { icon: "3️⃣", text: "Pick an available Date and Time Slot shown in the calendar." },
      { icon: "4️⃣", text: "Fill in your Name, Age, Phone Number, and Reason for visit." },
      { icon: "5️⃣", text: "Click 'Confirm Booking' — you'll receive a Booking Confirmation with a QR Code." },
      { icon: "6️⃣", text: "Save or screenshot your QR Code — you'll need it at the hospital reception." },
    ],
    tip: "💡 You can check your booking status anytime under 'Appointment Status' in the menu.",
  },
  {
    id: "appointment-status",
    icon: "📋",
    color: "#a29bfe",
    gradient: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
    title: "Appointment Status",
    subtitle: "Track Your Queue in Real-Time",
    description:
      "Never wonder 'Am I next?' — HealTrack's live queue tracker shows exactly where you stand in the doctor's queue, expected waiting time, and appointment status updates.",
    steps: [
      { icon: "🔍", text: "Go to 'Appointment Status' from the menu or Home dashboard." },
      { icon: "🪪", text: "Enter your Booking ID (from your confirmation QR Code or email)." },
      { icon: "📊", text: "View your current position in the queue and estimated wait time." },
      { icon: "🔄", text: "Status updates automatically — no need to refresh manually." },
      { icon: "✅", text: "When status shows 'Your Turn', proceed to the doctor's cabin." },
    ],
    tip: "💡 Doctors update the queue status from their dashboard in real-time.",
  },
  {
    id: "emergency",
    icon: "🚨",
    color: "#ff4757",
    gradient: "linear-gradient(135deg, #ff4757 0%, #c44569 100%)",
    title: "Emergency Services",
    subtitle: "Instant SOS & Emergency Alerts",
    description:
      "In a medical emergency, every second counts. HealTrack's Emergency feature lets you trigger instant SOS alerts, find the nearest hospital, and contact emergency services with one tap.",
    steps: [
      { icon: "⚠️", text: "Click 'Emergency' in the Navbar — it's always one tap away." },
      { icon: "📍", text: "Allow location access when prompted so nearby hospitals can be found." },
      { icon: "🆘", text: "Press the big red 'SOS' button to send an emergency alert to registered contacts." },
      { icon: "🏥", text: "View nearby emergency hospitals with directions and phone numbers." },
      { icon: "📞", text: "Tap any hospital's phone number to call directly from the app." },
    ],
    tip: "⚠️ In a real emergency, always call 108 (India) or your local emergency number first.",
  },
  {
    id: "nearby-hospitals",
    icon: "🗺️",
    color: "#74b9ff",
    gradient: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
    title: "Nearby Hospitals",
    subtitle: "Find Hospitals Near You",
    description:
      "Locate hospitals, clinics, and medical centers on an interactive map. View ratings, distance, contact information, and directions — all in one place.",
    steps: [
      { icon: "📍", text: "Click 'Nearby Hospitals' from the menu." },
      { icon: "🔓", text: "Allow browser location access for accurate results." },
      { icon: "🗺️", text: "An interactive map shows all hospitals within your area." },
      { icon: "📌", text: "Click any map pin or list item to see hospital details (phone, address, hours)." },
      { icon: "🧭", text: "Click 'Get Directions' to open Google Maps navigation to that hospital." },
      { icon: "🔎", text: "Use the search bar to filter hospitals by name or specialty." },
    ],
    tip: "💡 The map auto-centers on your current location for the most relevant results.",
  },
  {
    id: "health-dashboard",
    icon: "💊",
    color: "#55efc4",
    gradient: "linear-gradient(135deg, #55efc4 0%, #00b894 100%)",
    title: "Health Dashboard",
    subtitle: "Monitor Your Complete Health Profile",
    description:
      "The Health Dashboard aggregates all your medical data in one view — vitals trends, medications, upcoming appointments, and health score. Think of it as your personal health command center.",
    steps: [
      { icon: "1️⃣", text: "Navigate to 'Health Dashboard' from the menu." },
      { icon: "2️⃣", text: "View your Health Score (0–100) based on vitals and medication adherence." },
      { icon: "3️⃣", text: "Check charts for Blood Pressure, Heart Rate, and SpO2 trends over time." },
      { icon: "4️⃣", text: "See a summary of upcoming appointments and medication schedules." },
      { icon: "5️⃣", text: "Click 'View Details' on any card to dive deeper into that health metric." },
    ],
    tip: "💡 Keep your vitals updated daily for accurate health trend analysis.",
  },
  {
    id: "vitals",
    icon: "❤️",
    color: "#ff7675",
    gradient: "linear-gradient(135deg, #ff7675 0%, #d63031 100%)",
    title: "Vitals Tracker",
    subtitle: "Record & Monitor Your Health Vitals",
    description:
      "Log daily health readings like Blood Pressure, Heart Rate, Blood Sugar, SpO2, and Temperature. HealTrack visualizes your trends with color-coded charts so you can spot changes early.",
    steps: [
      { icon: "➕", text: "Go to 'Vitals Tracker' and click 'Add New Reading'." },
      { icon: "📝", text: "Enter values for BP, Heart Rate, Blood Sugar, SpO2, Temperature, and Weight." },
      { icon: "📅", text: "The date/time is auto-filled but you can adjust it if recording past readings." },
      { icon: "💾", text: "Click 'Save' — the reading appears in your chart immediately." },
      { icon: "📈", text: "Toggle between Daily, Weekly, and Monthly views to see trends." },
      { icon: "🔴", text: "Readings outside normal range are highlighted in red for quick attention." },
    ],
    tip: "💡 Consistent daily logging gives doctors better insight into your health patterns.",
  },
  {
    id: "medicine-reminder",
    icon: "⏰",
    color: "#ffeaa7",
    gradient: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
    title: "Medicine Reminder",
    subtitle: "Never Miss a Dose Again",
    description:
      "Set up reminders for all your medications with custom timing and repeat schedules. HealTrack sends browser notifications at the right time so you never miss a dose.",
    steps: [
      { icon: "➕", text: "Go to 'Medicine Reminder' and click 'Add Reminder'." },
      { icon: "💊", text: "Enter the Medicine Name, Dosage (e.g., 500mg), and Frequency (Once/Twice/Thrice daily)." },
      { icon: "🕐", text: "Set the Time(s) for each dose — you can add multiple daily times." },
      { icon: "📅", text: "Set the Start Date and End Date for the medication course." },
      { icon: "🔔", text: "Allow browser notifications when prompted — reminders will pop up at the right time." },
      { icon: "✅", text: "When a reminder appears, click 'Taken' to log adherence, or 'Snooze' for 15 minutes." },
    ],
    tip: "💡 Keep your browser tab open or add HealTrack to your home screen for reliable notifications.",
  },
  {
    id: "doctor-dashboard",
    icon: "🩺",
    color: "#00cec9",
    gradient: "linear-gradient(135deg, #00cec9 0%, #3a7bd5 100%)",
    title: "Doctor Dashboard",
    subtitle: "Manage Patients & Appointments (Doctors Only)",
    description:
      "Doctors get a dedicated dashboard showing today's appointment queue, patient details, and tools to update appointment status, write prescriptions, and view patient history.",
    steps: [
      { icon: "👨‍⚕️", text: "Log in with a Doctor account to access the Doctor Dashboard." },
      { icon: "📋", text: "See today's appointments listed in queue order with patient name and reason." },
      { icon: "▶️", text: "Click 'Start Consultation' to mark a patient as 'In Progress'." },
      { icon: "✅", text: "After consultation, click 'Mark Complete' to move to the next patient." },
      { icon: "📝", text: "Click 'Write Prescription' to open the prescription form for that patient." },
      { icon: "📜", text: "View 'Patient History' to see all past visits, vitals, and prescriptions." },
    ],
    tip: "💡 The queue updates in real-time — patients can see their turn on their own devices.",
  },
  {
    id: "prescription",
    icon: "📝",
    color: "#6c5ce7",
    gradient: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
    title: "Prescription Form",
    subtitle: "Digital Prescriptions (Doctors Only)",
    description:
      "Doctors can create, save, and share digital prescriptions directly within HealTrack. Patients receive a copy in their records instantly — no paper needed.",
    steps: [
      { icon: "1️⃣", text: "From the Doctor Dashboard, click 'Write Prescription' for a patient." },
      { icon: "2️⃣", text: "Patient details are pre-filled. Add Diagnosis in the Diagnosis field." },
      { icon: "3️⃣", text: "Click 'Add Medicine' and enter: Medicine Name, Dosage, Frequency, Duration, and Instructions." },
      { icon: "4️⃣", text: "Add multiple medicines using the '+' button." },
      { icon: "5️⃣", text: "Add any additional notes or follow-up date at the bottom." },
      { icon: "6️⃣", text: "Click 'Save Prescription' — it appears in the patient's records immediately." },
    ],
    tip: "💡 Patients can view their prescriptions anytime under 'Patient Records'.",
  },
  {
    id: "patient-records",
    icon: "🗂️",
    color: "#fd79a8",
    gradient: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
    title: "Patient Records",
    subtitle: "Access Your Complete Medical History",
    description:
      "All your medical history in one secure place — prescriptions, diagnoses, past appointments, lab reports, and doctor notes. Fully searchable and filterable.",
    steps: [
      { icon: "📂", text: "Navigate to 'Patient Records' from the menu." },
      { icon: "🔍", text: "Use the Search bar to find records by date, doctor name, or diagnosis." },
      { icon: "📋", text: "Click any record card to expand full details — medicines, notes, and follow-ups." },
      { icon: "⬇️", text: "Click 'Download' on any record to save it as a PDF." },
      { icon: "📤", text: "Click 'Share' to send a record to another doctor (by email or link)." },
    ],
    tip: "💡 Your records are private and encrypted — only you and your treating doctors can see them.",
  },
  {
    id: "patient-history",
    icon: "📜",
    color: "#e17055",
    gradient: "linear-gradient(135deg, #e17055 0%, #d63031 100%)",
    title: "Patient History Viewer",
    subtitle: "Full History View (Doctors & Management)",
    description:
      "Doctors and Management staff can view the complete medical history of any patient — across all visits, departments, and prescriptions. Powered by searchable records.",
    steps: [
      { icon: "🔍", text: "Go to 'Patient History' from the Doctor or Management menu." },
      { icon: "🪪", text: "Search for a patient by Name, ID, or Phone Number." },
      { icon: "📋", text: "View all their visits, diagnoses, prescriptions, and vitals in a timeline." },
      { icon: "📅", text: "Filter by date range or department to narrow results." },
      { icon: "🖨️", text: "Click 'Print Report' to generate a printable patient summary." },
    ],
    tip: "💡 All access to patient history is logged for privacy compliance.",
  },
  {
    id: "qr-scanner",
    icon: "📷",
    color: "#00b894",
    gradient: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
    title: "QR Scanner",
    subtitle: "Fast Patient Check-in via QR Code",
    description:
      "Hospital staff and doctors can use the QR Scanner to instantly pull up a patient's details by scanning their appointment QR Code at reception — zero manual entry needed.",
    steps: [
      { icon: "📷", text: "Open 'QR Scanner' from the menu." },
      { icon: "🔓", text: "Allow camera access when prompted." },
      { icon: "📄", text: "Point the camera at the patient's Appointment QR Code." },
      { icon: "⚡", text: "Patient details and appointment info load instantly on screen." },
      { icon: "✅", text: "Confirm check-in by clicking 'Mark Arrived' — the doctor's queue updates live." },
    ],
    tip: "💡 Works with both printed and digital (phone screen) QR codes.",
  },
  {
    id: "gantrade",
    icon: "🪪",
    color: "#a29bfe",
    gradient: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
    title: "GantradeCard",
    subtitle: "Digital Health ID Card",
    description:
      "GantradeCard is your digital health identity card — like a passport for your medical life. It stores key health data, emergency contacts, and QR-accessible records.",
    steps: [
      { icon: "🪪", text: "Navigate to 'Gantrade Card' from the menu." },
      { icon: "📝", text: "Fill in your basic details: Blood Group, Allergies, Emergency Contacts, Insurance ID." },
      { icon: "💾", text: "Click 'Save Card' to generate your digital health card." },
      { icon: "📱", text: "Your card has a QR Code — emergency responders can scan it to see critical info." },
      { icon: "⬇️", text: "Download your card as an image or PDF to keep on your phone." },
    ],
    tip: "💡 Always keep your GantradeCard updated — it can be life-saving in emergencies.",
  },
  {
    id: "medwaste",
    icon: "♻️",
    color: "#00b894",
    gradient: "linear-gradient(135deg, #55efc4 0%, #00b894 100%)",
    title: "Medical Waste Tracker",
    subtitle: "Eco-Responsible Waste Management (Management Only)",
    description:
      "Management staff can track, categorize, and schedule disposal of medical waste in compliance with bio-hazard regulations. Helps hospitals maintain environmental standards.",
    steps: [
      { icon: "🏥", text: "Log in with a Management account to access Medical Waste Tracker." },
      { icon: "➕", text: "Click 'Log Waste Entry' and enter: Waste Type, Quantity (kg/L), Department, and Date." },
      { icon: "🗂️", text: "Waste is auto-categorized: Infectious, Pharmaceutical, Sharps, General, Radioactive." },
      { icon: "📅", text: "Schedule disposal runs by clicking 'Schedule Pickup' on any entry." },
      { icon: "📊", text: "View the Monthly Waste Report to track trends and ensure compliance." },
    ],
    tip: "💡 Regular logging ensures your hospital stays compliant with CPCB bio-waste regulations.",
  },
  {
    id: "data-export",
    icon: "📤",
    color: "#74b9ff",
    gradient: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
    title: "Data Export",
    subtitle: "Export Hospital Data (Management Only)",
    description:
      "Management can export any hospital data — patient lists, appointment logs, billing records, waste logs — in CSV or PDF format for reporting and compliance.",
    steps: [
      { icon: "📂", text: "Go to 'Data Export' (Management menu only)." },
      { icon: "🗂️", text: "Choose the data category: Patients, Appointments, Waste Logs, or Billing." },
      { icon: "📅", text: "Set a Date Range for the export (e.g., last 30 days)." },
      { icon: "📋", text: "Select output format: CSV (for Excel) or PDF (for reports)." },
      { icon: "⬇️", text: "Click 'Export Now' — file downloads to your device automatically." },
    ],
    tip: "💡 All exports are time-stamped and logged for audit purposes.",
  },
  {
    id: "mdr-dashboard",
    icon: "🧬",
    color: "#fd79a8",
    gradient: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
    title: "MDR Dashboard",
    subtitle: "Medicine & Drug Reaction Tracking",
    description:
      "Track Multi-Drug Resistant (MDR) cases, adverse drug reactions, and antibiotic resistance patterns in your hospital. Helps clinical teams make evidence-based prescribing decisions.",
    steps: [
      { icon: "1️⃣", text: "Access 'MDR Dashboard' from the Management or Doctor menu." },
      { icon: "2️⃣", text: "View active MDR case alerts and flagged drug combinations." },
      { icon: "3️⃣", text: "Click any alert to see which patient, drug, and reaction was reported." },
      { icon: "4️⃣", text: "Doctors can report new adverse drug reactions using the 'Report ADR' button." },
      { icon: "5️⃣", text: "Management can view monthly trends in drug resistance patterns." },
    ],
    tip: "💡 Early detection of MDR patterns helps prevent hospital-acquired infections.",
  },
  {
    id: "chatbot",
    icon: "🤖",
    color: "#00cec9",
    gradient: "linear-gradient(135deg, #00cec9 0%, #00d2ff 100%)",
    title: "AI Health Chatbot",
    subtitle: "24/7 AI-Powered Health Assistant",
    description:
      "HealTrack's built-in AI Chatbot answers your health questions, helps you understand your reports, and guides you through app features — available 24/7, no waiting.",
    steps: [
      { icon: "💬", text: "Click the Chat icon (bottom-right bubble) on any page, or go to 'Chatbot' in the menu." },
      { icon: "❓", text: "Type your health question — e.g., 'What does high blood pressure mean?' or 'How to book an appointment?'." },
      { icon: "⚡", text: "The AI responds instantly with simple, clear explanations." },
      { icon: "📋", text: "Ask it to summarize your recent vitals or explain your prescription medications." },
      { icon: "🔒", text: "All conversations are private and not stored on external servers." },
    ],
    tip: "💡 The chatbot is an assistant, not a doctor — always consult a real doctor for medical decisions.",
  },
  {
    id: "translate",
    icon: "🌐",
    color: "#fdcb6e",
    gradient: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
    title: "Language Translation",
    subtitle: "Use HealTrack in Your Language",
    description:
      "HealTrack supports 8 languages with one-click translation. Powered by Google Translate — the entire app content switches instantly.",
    steps: [
      { icon: "🌐", text: "Click the 🌐 floating button at the bottom-right of any page." },
      { icon: "🔽", text: "A language dropdown appears — select your preferred language." },
      { icon: "✅", text: "Available languages: English, Spanish, French, German, Chinese, Tamil, Hindi, Arabic." },
      { icon: "🔄", text: "The entire page translates instantly — navigation, buttons, and content included." },
      { icon: "↩️", text: "To switch back to English, click the 🌐 button again and select 'English'." },
    ],
    tip: "💡 Some dynamic content (real-time data) may need a page refresh after language change.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef(null);
  const totalSteps = FEATURES.length;

  const goTo = (index, direction = "next") => {
    if (isAnimating || index < 0 || index >= totalSteps) return;
    setAnimDir(direction);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setIsAnimating(false);
    }, 300);
  };

  const goNext = () => goTo(current + 1, "next");
  const goPrev = () => goTo(current - 1, "prev");

  // After tour, mark as done and go to Home
  const handleFinish = () => {
    localStorage.setItem("ht_onboarding_done", "1");
    navigate("/");
  };

  // Skip tour — also mark done so it won't show again
  const handleSkip = () => {
    localStorage.setItem("ht_onboarding_done", "1");
    navigate("/");
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, isAnimating]);

  // Hide the global floating language selector while onboarding is open
  useEffect(() => {
    const floatingLang = document.querySelector('.lang-wrap.lang-floating');
    if (floatingLang) floatingLang.style.display = 'none';
    return () => {
      const fl = document.querySelector('.lang-wrap.lang-floating');
      if (fl) fl.style.display = '';
    };
  }, []);

  const feat = FEATURES[current];
  const progress = ((current + 1) / totalSteps) * 100;

  return (
    <div className="onb-overlay">
      {/* ── Dynamic Ambient Background ── */}
      <div className="onb-bg-orb onb-bg-orb-1" style={{ background: feat.color }} />
      <div className="onb-bg-orb onb-bg-orb-2" />
      <div className="onb-bg-orb onb-bg-orb-3" style={{ background: feat.color }} />
      <div className="onb-bg-grid" />

      {/* ── Header ── */}
      <div className="onb-header">
        <div className="onb-logo">
          <span className="onb-logo-heal">Heal</span>
          <span className="onb-logo-track">Track</span>
          <span className="onb-logo-badge">HMS</span>
          <span className="onb-live-badge">● TOUR</span>
        </div>
        <div className="onb-progress-wrap">
          <div
            className="onb-progress-bar"
            style={{ width: `${progress}%`, background: feat.gradient }}
          >
            <div className="onb-progress-shimmer" />
          </div>
        </div>
        <span className="onb-step-counter">
          Step <strong>{current + 1}</strong> of {totalSteps}
        </span>

        {/* Skip button */}
        <div className="onb-header-actions">
          <button className="onb-skip-btn" onClick={handleSkip} title="Exit Tour and go to Dashboard">
            Skip Tour ✕
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        ref={contentRef}
        key={current}
        className={`onb-content ${isAnimating ? `onb-slide-out-${animDir}` : "onb-slide-in"}`}
      >
        {/* Feature hero card */}
        <div
          className="onb-hero-card"
          style={{
            "--feat-gradient": feat.gradient,
            "--feat-color": feat.color,
          }}
        >
          <div className="onb-hero-glow" style={{ background: feat.gradient }} />
          <div className="onb-hero-icon-wrap">
            <div className="onb-hero-icon-bg" style={{ background: feat.gradient }} />
            <div className="onb-hero-icon-aura" style={{ borderColor: feat.color }} />
            <span className="onb-hero-icon">{feat.icon}</span>
          </div>
          <div className="onb-hero-text">
            <span className="onb-hero-badge" style={{ background: feat.gradient }}>
              ✨ Feature {current + 1} of {totalSteps}
            </span>
            <h2 className="onb-hero-title">{feat.title}</h2>
            <p className="onb-hero-subtitle">{feat.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="onb-desc">{feat.description}</p>

        {/* Steps */}
        <div className="onb-steps-section">
          <h3 className="onb-steps-heading">
            <span className="onb-steps-heading-icon">📖</span> Step-by-Step Instructions
          </h3>
          <div className="onb-steps-list">
            {feat.steps.map((step, i) => (
              <div
                key={i}
                className="onb-step-item"
                style={{
                  animationDelay: `${i * 0.07}s`,
                  "--step-color": feat.color,
                }}
              >
                <div
                  className="onb-step-icon-wrap"
                  style={{
                    background: `${feat.color}20`,
                    borderColor: `${feat.color}55`,
                  }}
                >
                  <span className="onb-step-icon">{step.icon}</span>
                </div>
                <div className="onb-step-text-wrap">
                  <span className="onb-step-num" style={{ color: feat.color }}>
                    Step {i + 1}
                  </span>
                  <p className="onb-step-text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tip */}
        <div
          className="onb-tip"
          style={{
            borderColor: `${feat.color}60`,
            background: `linear-gradient(135deg, ${feat.color}15, rgba(255,255,255,0.02))`,
          }}
        >
          <span className="onb-tip-text">{feat.tip}</span>
        </div>

        {/* Thumbnail dots for quick navigation */}
        <div className="onb-dots-wrap">
          {FEATURES.map((f, i) => (
            <button
              key={i}
              className={`onb-dot ${i === current ? "onb-dot-active" : ""}`}
              style={i === current ? { background: feat.gradient } : {}}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              title={`${i + 1}. ${f.title}`}
            />
          ))}
        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div className="onb-footer">
        <button
          className="onb-nav-btn onb-prev-btn"
          onClick={goPrev}
          disabled={current === 0}
        >
          <span className="onb-btn-arrow">←</span>
          <span>Previous</span>
        </button>

        <div className="onb-footer-center">
          <div className="onb-feature-pills">
            {FEATURES.slice(Math.max(0, current - 2), Math.min(totalSteps, current + 3)).map((f, i) => {
              const realIdx = Math.max(0, current - 2) + i;
              return (
                <button
                  key={realIdx}
                  className={`onb-pill ${realIdx === current ? "onb-pill-active" : ""}`}
                  style={realIdx === current ? { background: feat.gradient } : {}}
                  onClick={() => goTo(realIdx, realIdx > current ? "next" : "prev")}
                  title={`${realIdx + 1}. ${f.title}`}
                >
                  {f.icon}
                </button>
              );
            })}
          </div>
          <span className="onb-keyboard-hint">Tip: Use Arrow keys ← →</span>
        </div>

        {/* Right side: Next Button + Language Selector */}
        <div className="onb-footer-right">
          <div className="onb-next-container">
            {current < totalSteps - 1 ? (
              <button
                className="onb-nav-btn onb-next-btn"
                style={{
                  background: feat.gradient,
                  "--btn-accent": feat.color,
                }}
                onClick={goNext}
              >
                <span>Next</span>
                <span className="onb-btn-arrow onb-arrow-next">→</span>
                <span className="onb-btn-shimmer" />
              </button>
            ) : (
              <button
                className="onb-nav-btn onb-finish-btn"
                style={{
                  background: feat.gradient,
                  "--btn-accent": feat.color,
                }}
                onClick={handleFinish}
              >
                <span>🚀 Get Started</span>
                <span className="onb-btn-shimmer" />
              </button>
            )}
          </div>
          <LanguageSelector inline />
        </div>
      </div>
    </div>
  );
}
