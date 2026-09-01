import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useTranslation, SUPPORTED_LANGUAGES, type SupportedLang } from "../utils/i18n";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const handleSelect = async (code: SupportedLang) => {
    await setLang(code);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        id="language-switcher-btn"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: compact ? "6px 10px" : "8px 14px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "10px",
          color: "white",
          cursor: "pointer",
          fontSize: compact ? "12px" : "13px",
          fontWeight: 500,
          backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        <Globe size={compact ? 14 : 16} />
        <span>{currentLang.flag} {compact ? currentLang.code.toUpperCase() : currentLang.nativeLabel}</span>
        <ChevronDown size={12} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 998 }}
          />
          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              overflow: "hidden",
              zIndex: 999,
              minWidth: "160px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {SUPPORTED_LANGUAGES.map(language => (
              <button
                key={language.code}
                id={`lang-option-${language.code}`}
                onClick={() => handleSelect(language.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "12px 16px",
                  background: lang === language.code ? "#f0fdf4" : "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: lang === language.code ? "#16a34a" : "#1f2937",
                  fontWeight: lang === language.code ? 600 : 400,
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => {
                  if (lang !== language.code) e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = lang === language.code ? "#f0fdf4" : "white";
                }}
              >
                <span style={{ fontSize: "18px" }}>{language.flag}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{language.nativeLabel}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>{language.label}</div>
                </div>
                {lang === language.code && (
                  <span style={{ marginLeft: "auto", color: "#16a34a", fontSize: "16px" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
