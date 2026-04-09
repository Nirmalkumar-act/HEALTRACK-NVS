// src/pages/DataExport.jsx
// Exports all HealTrack data to separate Excel sheets
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import api from "../api/api";
import "../styles/DataExport.css";

// ── Helper: convert JSON array to Excel worksheet with timestamp header ────────
const toSheet = (data, columns, sheetLabel) => {
  const generatedAt = new Date().toLocaleString("en-IN");
  const headerMeta  = [[`${sheetLabel} — Generated: ${generatedAt}`]];
  const columnRow   = [columns.map(c => c.label)];

  if (!data || data.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([...headerMeta, [], ...columnRow]);
    ws["!merges"] = [{ s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: 0 } }];
    return ws;
  }

  const rows = data.map(row =>
    columns.reduce((obj, col) => {
      obj[col.label] = row[col.key] ?? "";
      return obj;
    }, {})
  );

  const ws = XLSX.utils.aoa_to_sheet([...headerMeta, []]);
  XLSX.utils.sheet_add_json(ws, rows, { header: columns.map(c => c.label), origin: 2 });
  ws["!merges"] = [{ s: { c: 0, r: 0 }, e: { c: columns.length - 1, r: 0 } }];
  ws["!cols"]   = columns.map(c => ({ wch: Math.max(c.label.length + 4, 18) }));
  return ws;
};

// ── Sheet definitions ─────────────────────────────────────────────────────────
const SHEETS = [
  {
    id:       "bookings",
    label:    "📋 Bookings",
    desc:     "All patient appointment bookings with token, doctor, status, and date.",
    icon:     "📋",
    color:    "green",
    endpoint: "/bookings",
    columns: [
      { key: "id",          label: "ID" },
      { key: "token",       label: "Token #" },
      { key: "name",        label: "Patient Name" },
      { key: "age",         label: "Age" },
      { key: "gender",      label: "Gender" },
      { key: "doctor",      label: "Doctor" },
      { key: "condition",   label: "Condition" },
      { key: "status",      label: "Status" },
      { key: "bookingDate", label: "Booking Date" },
      { key: "bookingTime", label: "Booking Time" },
      { key: "hospital",    label: "Hospital" },
      { key: "location",    label: "Location" },
      { key: "notes",       label: "Notes" },
    ],
  },
  {
    id:       "prescriptions",
    label:    "💊 Prescriptions",
    desc:     "All doctor-written prescriptions including medications, dosage, and diagnosis.",
    icon:     "💊",
    color:    "blue",
    endpoint: "/prescriptions",
    columns: [
      { key: "id",                 label: "ID" },
      { key: "patientName",        label: "Patient Name" },
      { key: "doctorName",         label: "Doctor Name" },
      { key: "bookingToken",       label: "Booking Token" },
      { key: "diagnosis",          label: "Diagnosis" },
      { key: "medications",        label: "Medications" },
      { key: "dosageInstructions", label: "Dosage & Instructions" },
      { key: "additionalNotes",    label: "Additional Notes" },
      { key: "createdAt",          label: "Created At" },
    ],
  },
  {
    id:       "reviews",
    label:    "⭐ Doctor Reviews",
    desc:     "All patient reviews and ratings submitted for doctors.",
    icon:     "⭐",
    color:    "orange",
    endpoint: "/reviews",
    columns: [
      { key: "id",          label: "ID" },
      { key: "doctorName",  label: "Doctor Name" },
      { key: "patientName", label: "Patient Name" },
      { key: "rating",      label: "Rating (1-5)" },
      { key: "comment",     label: "Comment" },
      { key: "createdAt",   label: "Date" },
    ],
  },
  {
    id:       "users",
    label:    "👤 User Accounts",
    desc:     "All registered user accounts — name, email, role. Passwords are always hidden.",
    icon:     "👤",
    color:    "pink",
    endpoint: "/auth/users",
    columns: [
      { key: "id",       label: "ID" },
      { key: "name",     label: "Full Name" },
      { key: "email",    label: "Email Address" },
      { key: "role",     label: "Role" },
      { key: "password", label: "Password" },   // Always returned as [protected]
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataExport() {
  const [data,        setData]        = useState({});   // { bookings: [...], ... }
  const [loading,     setLoading]     = useState({});   // { bookings: true, ... }
  const [exportingAll, setExportingAll] = useState(false);
  const [status,      setStatus]      = useState("");

  // Load record counts on mount
  useEffect(() => {
    SHEETS.forEach(sheet => {
      setLoading(prev => ({ ...prev, [sheet.id]: true }));
      api.get(sheet.endpoint)
        .then(res => setData(prev => ({ ...prev, [sheet.id]: res.data || [] })))
        .catch(() => setData(prev => ({ ...prev, [sheet.id]: [] })))
        .finally(() => setLoading(prev => ({ ...prev, [sheet.id]: false })));
    });
  }, []);

  // ── Export a single sheet ──────────────────────────────────────────────────
  const exportSheet = (sheet) => {
    const rows = data[sheet.id] || [];
    const ws   = toSheet(rows, sheet.columns, sheet.label);
    const wb   = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet.id);
    XLSX.writeFile(wb, `HealTrack_${sheet.id}_${today()}.xlsx`);
    showStatus(`✅ ${sheet.label} exported — ${rows.length} records`);
  };

  // ── Export ALL sheets into one workbook ────────────────────────────────────
  const exportAll = async () => {
    setExportingAll(true);
    try {
      const wb = XLSX.utils.book_new();
      for (const sheet of SHEETS) {
        let rows = data[sheet.id];
        if (!rows) {
          const res = await api.get(sheet.endpoint).catch(() => ({ data: [] }));
          rows = res.data || [];
        }
        const ws = toSheet(rows, sheet.columns, sheet.label);
        // Auto-width columns
        ws["!cols"] = sheet.columns.map(c => ({ wch: Math.max(c.label.length + 4, 16) }));
        XLSX.utils.book_append_sheet(wb, ws, sheet.label.replace(/[^\w ]/g, "").trim());
      }
      XLSX.writeFile(wb, `HealTrack_FullReport_${today()}.xlsx`);
      showStatus("✅ Full report exported! All sheets included.");
    } catch (e) {
      showStatus("❌ Export failed. Please try again.");
    } finally {
      setExportingAll(false);
    }
  };

  const today = () => new Date().toISOString().slice(0, 10);

  const showStatus = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <div className="export-wrapper">

      {/* Header */}
      <div className="export-header">
        <h1>📊 Data Export Center</h1>
        <p>Export all HealTrack data to Excel — each category in its own sheet</p>
      </div>

      {/* Export All Button */}
      <div style={{ textAlign: "center" }}>
        <button
          className="export-all-btn"
          onClick={exportAll}
          disabled={exportingAll}
        >
          {exportingAll
            ? <><span className="export-spinner" /> Generating Report…</>
            : <>📥 Export All Sheets — Full Report</>
          }
        </button>
      </div>

      {/* Individual Sheet Cards */}
      <div className="export-grid">
        {SHEETS.map((sheet, idx) => {
          const count   = data[sheet.id]?.length ?? "—";
          const isLoading = loading[sheet.id];
          return (
            <div
              className="export-card"
              key={sheet.id}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <span className="export-card-icon">{sheet.icon}</span>
              <h3>{sheet.label} Sheet</h3>
              <p>{sheet.desc}</p>

              <div className="export-card-footer">
                <span className="export-record-count">
                  Records: <strong>{isLoading ? "…" : count}</strong>
                </span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                  .xlsx
                </span>
              </div>

              <button
                className={`export-btn ${sheet.color}`}
                onClick={() => exportSheet(sheet)}
                disabled={isLoading || !data[sheet.id]}
              >
                {isLoading
                  ? <><span className="export-spinner" /> Loading…</>
                  : <>📥 Download {sheet.label} Sheet</>
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {status && <div className="export-status">{status}</div>}
    </div>
  );
}
