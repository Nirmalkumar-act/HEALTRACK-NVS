import React, { useState, useRef, useEffect } from "react";
import "./LanguageSelector.css";

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function getActiveLanguage() {
  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
  if (match && match[1]) {
    const found = LANGUAGES.find((l) => l.code === match[1]);
    if (found) return found;
  }
  return LANGUAGES[0]; // English by default
}

export function setLanguage(langCode) {
  const cookieValue = `/en/${langCode}`;

  // Set cookie for all domain variations
  document.cookie = `googtrans=${cookieValue}; path=/;`;
  document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/;`;
  if (window.location.hostname.includes(".")) {
    document.cookie = `googtrans=${cookieValue}; domain=.${window.location.hostname}; path=/;`;
  }

  // Try to find and trigger the Google Translate combo box
  const triggerTranslate = (attempts = 0) => {
    let select = document.querySelector(".goog-te-combo");
    if (!select) {
      const frames = document.querySelectorAll("iframe.goog-te-menu-frame");
      for (const f of frames) {
        try {
          const s = f.contentDocument?.querySelector(".goog-te-combo");
          if (s) { select = s; break; }
        } catch (e) { }
      }
    }

    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));

      // After translation, force-hide the Google Translate banner bar
      setTimeout(() => {
        document.body.style.top = "0px";
        const banners = document.querySelectorAll('.goog-te-banner-frame, iframe.goog-te-banner-frame');
        banners.forEach(b => {
          b.style.display = 'none';
          b.style.height = '0';
        });
      }, 100);
    } else if (attempts < 3) {
      // Retry after a short delay (GT may not be ready yet)
      setTimeout(() => triggerTranslate(attempts + 1), 300);
    } else {
      // Last resort: reload with cookie set
      window.location.reload();
    }
  };

  triggerTranslate();
}

export default function LanguageSelector({ inline = false }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => getActiveLanguage());
  const wrapRef = useRef(null);

  useEffect(() => {
    setCurrent(getActiveLanguage());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (lang) => {
    setCurrent(lang);
    setOpen(false);
    setLanguage(lang.code);
  };

  return (
    <div className={`lang-wrap ${inline ? "lang-inline" : "lang-floating"}`} ref={wrapRef}>
      {/* Trigger button */}
      <button
        type="button"
        className="lang-trigger"
        onClick={() => setOpen((o) => !o)}
        title="Change Language / மொழி மாற்று"
        aria-label="Select language"
      >
        <span className="lang-globe">🌐</span>
        <span className="lang-current-flag">{current.flag}</span>
        <span className="lang-current-label">{current.label}</span>
        <span className={`lang-chevron ${open ? "open" : ""}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`lang-dropdown lang-dropdown-up`}>
          <div className="lang-dropdown-header">
            <span>🌐 Select Language</span>
            <small style={{ display: "block", fontSize: "0.68rem", color: "#6366f1", marginTop: "2px" }}>
              (தமிழ் / English / हिंदी...)
            </small>
          </div>
          <div className="lang-options-scroll">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`lang-option ${lang.code === current.code ? "active" : ""}`}
                onClick={() => handleSelect(lang)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.label}</span>
                {lang.code === current.code && <span className="lang-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
