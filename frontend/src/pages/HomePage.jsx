import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import Hero from "../components/Hero";

const STATS = [
  { num: "3+", label: "Vuln Types" },
  { num: "Auth", label: "Aware Scanning" },
  { num: "3s", label: "Poll Interval" },
  { num: "Live", label: "Results Feed" },
];

const VULNS = [
  {
    icon: "search",
    name: "SQL Injection",
    desc: "Error-based, boolean-based, and time-based blind SQLi across all form inputs and URL parameters.",
  },
  {
    icon: "zap",
    name: "Cross-Site Scripting",
    desc: "Reflected and stored XSS by injecting and verifying payloads in HTTP responses automatically.",
  },
  {
    icon: "shield",
    name: "CSRF",
    desc: "State-changing forms are checked for missing or weak anti-CSRF tokens across authenticated sessions.",
  },
];

const STEPS = [
  {
    icon: "target",
    title: "Point it at a target",
    desc: "Paste the URL of a site you own. Got a login wall? Add credentials and WebGuard walks through the front door like a real user.",
  },
  {
    icon: "bug",
    title: "We crawl & poke",
    desc: "A friendly spider maps every page, form and parameter, then throws harmless test payloads at them. Nothing gets broken or stored.",
  },
  {
    icon: "activity",
    title: "Watch it live",
    desc: "Status updates roll in every few seconds, so you're never staring at a spinner wondering if it's alive.",
  },
  {
    icon: "clipboard",
    title: "Read the verdict",
    desc: "Findings land in the Results page ranked High, Medium and Low, with what we found, where, and how to fix it.",
  },
];

const LEGAL = [
  {
    icon: "check",
    title: "Only scan what's yours",
    desc: "Scan sites you own or have written permission to test. Poking at someone else's server without a yes isn't a hack, it's a crime.",
  },
  {
    icon: "lock",
    title: "Your secrets stay secret",
    desc: "Passwords you give us are used for the scan and nothing else. We don't sell data, and we don't peek.",
  },
  {
    icon: "flask",
    title: "Safe, but not magic",
    desc: "WebGuard finds common issues, not every issue. Think of it as a smoke alarm, not a full fire inspection.",
  },
  {
    icon: "users",
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

export default function HomePage({ setPage }) {
  return (
    <div className="page-content">
      <Hero setPage={setPage} />

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
      <div className="vuln-section" id="coverage">
        <Reveal>
          <div className="section-eyebrow">Coverage</div>
          <div className="section-title">What WebGuard detects</div>
        </Reveal>
        <div className="vuln-grid">
          {VULNS.map((v, i) => (
            <Reveal key={v.name} delay={i * 110}>
              <div className="vuln-card">
                <div className="vuln-icon"><Icon name={v.icon} size={20} /></div>
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
                  <div className="step-icon"><Icon name={s.icon} size={28} /></div>
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
                <div className="legal-icon"><Icon name={l.icon} size={26} /></div>
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
