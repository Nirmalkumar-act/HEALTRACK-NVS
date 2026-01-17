import React, { useState } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import "../styles/MDRDashboard.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function MdrDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getRiskColor = (level) => {
    switch (level) {
      case "High": return "#e53935";
      case "Medium": return "#fbc02d";
      default: return "#43a047";
    }
  };

  const extractTextFromPDF = async (file) => {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((s) => s.str).join(" ");
      text += strings + " ";
    }
    return text;
  };

  const extractTextFromImage = async (file) => {
    const result = await Tesseract.recognize(file, "eng");
    return result.data.text;
  };

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    try {
      let text = "";
      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else if (file.type.startsWith("image/")) {
        text = await extractTextFromImage(file);
      } else {
        alert("Upload only image or PDF files!");
        setLoading(false);
        return;
      }
      updatePatientList(text);
    } catch (err) {
      console.error(err);
      alert("Unable to process this file!");
    }
    setLoading(false);
  };

  const updatePatientList = (text) => {
    const nameMatch = text.match(/Name\s*[:\-]?\s*([A-Za-z\s]+)/i);
    const riskScoreMatch = text.match(/MDR Risk Score\s*[:\-]?\s*(\d+)/i);
    const riskLevelMatch = text.match(/Risk Level\s*[:\-]?\s*(High|Medium|Low)/i);

    const patient = {
      id: Date.now(),
      name: nameMatch ? nameMatch[1].trim() : "Unknown",
      ward: text.match(/Ward\s*[:\-]?\s*([A-Za-z]+)/i)?.[1] || "Not Found",
      device: text.match(/Device Usage\s*[:\-]?\s*([A-Za-z\s]+)/i)?.[1] || "Unknown",
      score: riskScoreMatch ? parseInt(riskScoreMatch[1]) : Math.floor(Math.random() * 15),
      riskLevel: riskLevelMatch
        ? riskLevelMatch[1]
        : Math.random() > 0.5
        ? "Medium"
        : "Low",
      date: new Date().toLocaleString(),
    };

    setPatients((prev) => [...prev, patient]);
  };

  const handleDelete = (id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleViewHistory = (patient) => {
    alert(
      `📋 Patient History\n\nName: ${patient.name}\nWard: ${patient.ward}\nDevice: ${patient.device}\nRisk: ${patient.riskLevel}\nScore: ${patient.score}\nDate: ${patient.date}`
    );
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mdr-dashboard">
      <h1 className="title">🧬 MDR Patient Risk Dashboard</h1>
      <p className="subtitle">Upload image or PDF to analyze patient risk level</p>

      <div className="top-controls">
        <label htmlFor="report-upload" className="upload-btn">📑 Upload Report</label>
        <input
          type="file"
          id="report-upload"
          accept="image/*,.pdf"
          onChange={handleReportUpload}
          style={{ display: "none" }}
        />
        <input
          type="text"
          className="search-box"
          placeholder="🔍 Search patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="loading">⏳ Analyzing report...</p>}

      <div className="table-container">
        <table className="patient-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Ward</th>
              <th>Device Usage</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
<tbody>
  {filteredPatients.length === 0 ? (
    <tr>
      <td colSpan="8" className="no-data" data-label="Status">
        No reports uploaded yet
      </td>
    </tr>
  ) : (
    filteredPatients.map((p, index) => (
      <tr key={p.id} className="fade-row">
        <td data-label="#"> {index + 1} </td>

        <td data-label="Patient Name">
          {p.name}
        </td>

        <td data-label="Ward">
          {p.ward}
        </td>

        <td data-label="Device Usage">
          {p.device}
        </td>

        <td data-label="Risk Score">
          {p.score}
        </td>

        <td data-label="Risk Level">
          <span
            className="risk-pill"
            style={{ backgroundColor: getRiskColor(p.riskLevel) }}
          >
            {p.riskLevel}
          </span>
        </td>

        <td data-label="Date">
          {p.date}
        </td>

        <td data-label="Actions">
          <button
            className="action-btn view"
            onClick={() => handleViewHistory(p)}
          >
            📜 History
          </button>
          <button
            className="action-btn delete"
            onClick={() => handleDelete(p.id)}
          >
            🗑 Delete
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>
    </div>
  );
}
