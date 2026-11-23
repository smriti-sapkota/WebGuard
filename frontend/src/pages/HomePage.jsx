import { useEffect, useRef, useState } from "react";
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

const STEPS = [
  {
    icon: "🎯",
    title: "Point it at a target",
    desc: "Paste the URL of a site you own. Got a login wall? Add credentials and WebGuard walks through the front door like a real user.",
  },
  {
    icon: "🕷",
    title: "We crawl & poke",
    desc: "A friendly spider maps every page, form and parameter, then throws harmless test payloads at them. Nothing gets broken or stored.",
  },
  {
    icon: "📡",
    title: "Watch it live",
    desc: "Status updates roll in every few seconds, so you're never staring at a spinner wondering if it's alive.",
  },
  {
    icon: "📋",
    title: "Read the verdict",
    desc: "Findings land in the Results page ranked High, Medium and Low, with what we found, where, and how to fix it.",
  },
];

const LEGAL = [
  {
    icon: "✅",
    title: "Only scan what's yours",
    desc: "Scan sites you own or have written permission to test. Poking at someone else's server without a yes isn't a hack, it's a crime.",
  },
  {
    icon: "🔒",
    title: "Your secrets stay secret",
    desc: "Passwords you give us are used for the scan and nothing else. We don't sell data, and we don't peek.",
  },
  {
    icon: "🧪",
    title: "Safe, but not magic",
    desc: "WebGuard finds common issues, not every issue. Think of it as a smoke alarm, not a full fire inspection.",
  },
  {
    icon: "🤝",
    title: "You're the grown-up",
    desc: "You're responsible for how you use the results. Fix things, don't exploit them. Deal?",
  },
];

const TICKER = [
  "SQL Injection",
  "Cross-Site Scripting",
  "CSRF",
  "Authenticated Scans",
  "Live Status",
  "Severity Ranking",
  "Fix Suggestions",
];

const WORDS = ["SQL Injection", "XSS", "CSRF", "weak spots"];

/** Fade/slide children in once they scroll into view. */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Types out and deletes each word in turn. */
function Typewriter({ words }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[i];
    const done = !deleting && text === word;
    const empty = deleting && text === "";
    const t = setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (empty) {
          setDeleting(false);
          setI((i + 1) % words.length);
        } else {
          setText(
            deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1),
          );
        }
      },
      done ? 1300 : deleting ? 40 : 85,
    );
    return () => clearTimeout(t);
  }, [text, deleting, i, words]);
  return (
    <span className="typed">
      {text}
      <span className="caret" />
    </span>
  );
}

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
          <p className="home-sub">
            Hunting for <Typewriter words={WORDS} />
          </p>
          <p className="home-desc">
            Automated scanning for SQL Injection, XSS, and CSRF vulnerabilities.
            Authenticated scans, live status tracking, and clear findings — all
            in one place.
          </p>
          <div className="home-btns">
            <button className="btn-solid btn-cta" onClick={() => setPage("scanner")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
          <div className="scan-line" />
          <div className="float-chip chip-a">✔ No XSS found</div>
          <div className="float-chip chip-b">⚠ 2 issues</div>
        </div>
      </div>

      {/* Ticker */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot">◆</span> {t}
            </span>
          ))}
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
        <Reveal>
          <div className="section-eyebrow">Coverage</div>
          <div className="section-title">What WebGuard detects</div>
        </Reveal>
        <div className="vuln-grid">
          {VULNS.map((v, i) => (
            <Reveal key={v.name} delay={i * 110}>
              <div className="vuln-card">
                <div className="vuln-icon">{v.icon}</div>
                <div className="vuln-name">{v.name}</div>
                <div className="vuln-desc">{v.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="band">
        <div className="vuln-section">
          <Reveal>
            <div className="section-eyebrow">How it works</div>
            <div className="section-title">Four steps from "hmm" to "fixed"</div>
          </Reveal>
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="step">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="vuln-name">{s.title}</div>
                  <div className="vuln-desc">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Legal, plain English */}
      <div className="vuln-section">
        <Reveal>
          <div className="section-eyebrow">The fine print</div>
          <div className="section-title">Legal stuff, minus the legalese</div>
        </Reveal>
        <div className="legal-grid">
          {LEGAL.map((l, i) => (
            <Reveal key={l.title} delay={i * 100}>
              <div className="legal-card">
                <div className="legal-icon">{l.icon}</div>
                <div>
                  <div className="vuln-name">{l.title}</div>
                  <div className="vuln-desc">{l.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="legal-links">
            Want the grown-up version? Read the{" "}
            <a href="/terms-of-service.html">Terms of Service</a> and{" "}
            <a href="/privacy-policy.html">Privacy Policy</a>.
          </p>
        </Reveal>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="cta-band">
          <h2>Ready to see what's hiding in your app?</h2>
          <p>It takes about a minute to set up your first scan.</p>
          <button className="btn-solid btn-cta btn-cta-light" onClick={() => setPage("scanner")}>
            Scan your site now →
          </button>
        </div>
      </Reveal>
    </div>
  );
}
