import React, { useState, useEffect } from "react";
import "../styles/MedWaste.css";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Bell, Activity, Flame, Clock, Zap, Calendar } from "lucide-react";

export default function MedWaste() {
  const binCapacity = 100;
  const conversionFactor = 3.5;

  // Target values after 20 seconds
  const targetPlastic = 25;
  const targetWaste = 70;

  // Initial state
  const [plasticWaste, setPlasticWaste] = useState(15);
  const [currentWaste, setCurrentWaste] = useState(60);
  const [notifications, setNotifications] = useState([
    { type: "success", message: "✅ System initialized." },
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [categories, setCategories] = useState([
    { type: "Infectious", qty: 10, color: "infectious" },
    { type: "Sharps", qty: 5, color: "sharps" },
    { type: "Pathological", qty: 10, color: "pathological" },
    { type: "General", qty: 10, color: "general" },
    { type: "Plastic", qty: 15, color: "plastic" },
  ]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Smooth fractional increment
  useEffect(() => {
    const incrementSteps = 0.1; // increment per tick
    const minInterval = 1000; // 0.1s
    const maxInterval = 4000; // 0.4s

    const randomInterval = () =>
      Math.random() * (maxInterval - minInterval) + minInterval;

    const interval = setInterval(() => {
      setPlasticWaste(prev =>
        Math.min(prev + incrementSteps, targetPlastic)
      );
      setCurrentWaste(prev =>
        Math.min(prev + incrementSteps, targetWaste)
      );

      setCategories(prev =>
        prev.map(cat =>
          cat.type === "Plastic"
            ? { ...cat, qty: Math.min(plasticWaste + incrementSteps, targetPlastic) }
            : cat
        )
      );

      // Add notifications if bin > 80%
      if (currentWaste / binCapacity > 0.8) {
        setNotifications(prev => [
          { type: "warning", message: "⚠️ Bin is almost full!" },
          ...prev.slice(0, 4),
        ]);
      }

      // Stop incrementing when target reached
      if (plasticWaste >= targetPlastic && currentWaste >= targetWaste) {
        clearInterval(interval);
      }
    }, randomInterval());

    return () => clearInterval(interval);
  }, [plasticWaste, currentWaste]);

  const formattedDate = currentTime.toLocaleDateString();
  const formattedTime = currentTime.toLocaleTimeString();
  const electricityProduced = (plasticWaste * conversionFactor).toFixed(1);

  const wastePercentage = (currentWaste / binCapacity) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (wastePercentage / 100) * circumference;

  const handleDisposal = () => {
    setNotifications(prev => [
      { type: "info", message: "♻️ Disposal cycle started..." },
      ...prev,
    ]);

    setTimeout(() => {
      setCurrentWaste(0);
      setPlasticWaste(0);
      setCategories(prev =>
        prev.map(cat => (cat.type === "Plastic" ? { ...cat, qty: 0 } : cat))
      );
      setNotifications(prev => [
        { type: "success", message: "✅ Disposal completed. Bin empty." },
        ...prev,
      ]);
    }, 2000);
  };

  const yesterdayHistory = {
    date: new Date(Date.now() - 86400000).toLocaleDateString(),
    wasteProcessed: "50 kg",
    plasticWaste: 40,
    electricity: 38 * conversionFactor + " kWh",
  };
  
  return (
    <div className="med-container">
      <motion.div
        className="med-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Plasma Pyrolysis – Medical Waste Dashboard</h1>
        <button className="trigger-btn" onClick={handleDisposal}>
          ⚡ Trigger Disposal Cycle
        </button>
      </motion.div>

      <div className="med-grid">
        <motion.div className="med-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Activity className="icon safe" />
          <h3>Total Waste Today</h3>
          <p>{currentWaste.toFixed(1)} kg</p>
        </motion.div>

        <motion.div className="med-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Clock className="icon clock" />
          <h3>Current Cycle Time</h3>
          <p>{formattedDate} – {formattedTime}</p>
        </motion.div>

        <motion.div className="med-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Flame className="icon flame" />
          <h3>Status</h3>
          <p className={currentWaste < binCapacity * 0.8 ? "safe" : "warning"}>
            {currentWaste < binCapacity * 0.8 ? "Safe ✅" : "High Load ⚠️"}
          </p>
        </motion.div>

        <motion.div className="med-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Zap className="icon energy" />
          <h3>Electricity from Plastic</h3>
          <p>{electricityProduced} kWh ⚡</p>
        </motion.div>
      </div>

      <motion.div className="med-section bin-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h2>🗑️ Trash Bin Capacity</h2>
        <div className="circle-wrapper">
          <svg width="200" height="200">
            <circle cx="100" cy="100" r={radius} stroke="#e0e0e0" strokeWidth="15" fill="none" />
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#ff4d4d"
              strokeWidth="15"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.000000001s linear" }}
            />
          </svg>
          <div className="circle-text">
            <h3>{wastePercentage.toFixed(1)}% Full</h3>
            <p>{currentWaste.toFixed(1)} kg / {binCapacity} kg</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="med-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <h2><Trash2 className="inline-icon" /> Waste Categories</h2>
        <div className="categories">
          {categories.map((item) => (
            <motion.div key={item.type} className={`category ${item.color}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <span>{item.type}</span>
              <span>{item.qty.toFixed(1)} kg</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="med-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <h2><Calendar className="inline-icon" /> Previous Day History</h2>
        <div className="history-card">
          <p><strong>Date:</strong> {yesterdayHistory.date}</p>
          <p><strong>Total Waste:</strong> {yesterdayHistory.wasteProcessed}</p>
          <p><strong>Plastic Waste:</strong> {yesterdayHistory.plasticWaste} kg</p>
          <p><strong>Electricity Generated:</strong> {yesterdayHistory.electricity}</p>
        </div>
      </motion.div>

      <motion.div className="med-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <h2><Bell className="inline-icon" /> Notifications & Alerts</h2>
        <AnimatePresence>
          {notifications.map((note, i) => (
            <motion.div key={i} className={`notification ${note.type}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
              {note.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
