import scannerImg from "../assets/scanner.jpg";

const STATS = [
  { num: "3+", label: "Vuln Types" },
  { num: "Auth", label: "Aware Scanning" },
  { num: "3s", label: "Poll Interval" },
  { num: "Live", label: "Results Feed" },
];

const VULNS = [
  {
    icon: "🔍",
    name: "SQL Injection",
    desc: "Error-based, boolean-based, and time-based blind SQLi across all form inputs and URL parameters.",
  },
  {
    icon: "⚡",
    name: "Cross-Site Scripting",
    desc: "Reflected and stored XSS by injecting and verifying payloads in HTTP responses automatically.",
  },
  {
    icon: "🛡",
    name: "CSRF",
    desc: "State-changing forms are checked for missing or weak anti-CSRF tokens across authenticated sessions.",
  },
];

export default function HomePage({ setPage }) {
  return (
    <div className="page-content">
      {/* Hero */}
      <div className="home-hero">
        <div>
          <div className="home-tag">Web Vulnerability Scanner</div>
          <h1 className="home-title">
            Secure your web apps with <span>WebGuard</span>
          </h1>
          <p className="home-desc">
            Automated scanning for SQL Injection, XSS, and CSRF vulnerabilities.
            Authenticated scans, live status tracking, and clear findings — all
            in one place.
          </p>
          <div className="home-btns">
            <button className="btn-solid" onClick={() => setPage("scanner")}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Scanning
            </button>
            <button className="btn-outline" onClick={() => setPage("results")}>
              View Results
            </button>
          </div>
        </div>

        <div className="home-img-wrap">
          <img
            src={scannerImg}
            alt="Security scanning"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.style.background = "var(--green-light)";
              e.target.parentElement.style.minHeight = "300px";
            }}
          />
          <div className="home-img-overlay" />
        </div>
      </div>

      {/* Stat strip */}
      <div className="stat-strip">
        <div className="stat-strip-inner">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vuln types */}
      <div className="vuln-section">
        <div className="section-label">Coverage</div>
        <div className="section-title">What WebGuard detects</div>
        <div className="vuln-grid">
          {VULNS.map((v) => (
            <div key={v.name} className="vuln-card">
              <div className="vuln-icon">{v.icon}</div>
              <div className="vuln-name">{v.name}</div>
              <div className="vuln-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
