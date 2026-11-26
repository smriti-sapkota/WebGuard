const LogoMark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 2.5 4.5 7v8.2c0 7 4.8 12.4 11.5 14.3 6.7-1.9 11.5-7.3 11.5-14.3V7L16 2.5Z"
      stroke="#39FF65"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 11.5 12.5 21l3.5-6.5 3.5 6.5 3-9.5"
      stroke="#39FF65"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BannerShield = () => (
  <svg className="ft-banner-art" viewBox="0 0 220 170" fill="none" aria-hidden="true">
    <ellipse cx="110" cy="88" rx="98" ry="30" transform="rotate(-14 110 88)" stroke="rgba(57,255,101,.55)" strokeWidth="2" />
    <circle cx="26" cy="112" r="5" fill="#9dffb4" />
    <circle cx="194" cy="64" r="3.5" fill="#9dffb4" />
    <path
      d="M110 18 62 38v40c0 33 20 54 48 66 28-12 48-33 48-66V38L110 18Z"
      fill="rgba(57,255,101,.14)"
      stroke="#7dffa0"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <rect x="92" y="76" width="36" height="30" rx="5" fill="#eafff0" />
    <path d="M99 76V68a11 11 0 0 1 22 0v8" stroke="#eafff0" strokeWidth="6" strokeLinecap="round" />
    <circle cx="110" cy="90" r="4.5" fill="#1fae4d" />
    <ellipse cx="110" cy="158" rx="38" ry="4" fill="rgba(57,255,101,.45)" />
  </svg>
);

const QUESTIONS = [
  { label: "FAQ", href: "/faq.html" },
  { label: "How it works", href: "/how-it-works.html" },
  { label: "Documentation", href: "/documentation.html" },
  { label: "Support", href: "/support.html" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy.html" },
  { label: "Terms of Service", href: "/terms-of-service.html" },
  { label: "Contact", href: "/contact.html" },
  { label: "Security", href: "/security.html" },
];

const BADGES = ["SQLi", "XSS", "CSRF"];

function LinkColumn({ title, links }) {
  return (
    <div>
      <div className="ft-col-title">{title}</div>
      <div className="ft-links">
        {links.map((l) => (
          <a key={l.label} className="ft-link" href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Footer({ setPage }) {
  return (
    <footer className="ft">
      <div className="ft-wrap">
        <section className="ft-banner">
          <BannerShield />
          <div className="ft-banner-copy">
            <h2>
              Stay Ahead of Threats
              <br />
              <span>with WebGuard</span>
            </h2>
            <p>Scan your website for SQL injection, XSS and CSRF issues in minutes.</p>
          </div>
          <button
            className="ft-cta"
            onClick={() => {
              setPage("scanner");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Start Scanning
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </section>

        <div className="ft-main">
          <div className="ft-brand">
            <div className="ft-logo">
              <LogoMark />
              <span>
                Web<em>Guard</em>
              </span>
            </div>
            <p>Detect vulnerabilities, prevent attacks, and keep your website secure.</p>
          </div>
          <LinkColumn title="Questions" links={QUESTIONS} />
          <LinkColumn title="Legal" links={LEGAL} />
        </div>

        <div className="ft-bottom">
          <span className="ft-copy">© 2026 WebGuard. All rights reserved.</span>
          <div className="ft-badges">
            {BADGES.map((t) => (
              <span key={t} className="ft-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2 4 5.5v6c0 4.7 3.2 8.7 8 10 4.8-1.3 8-5.3 8-10v-6L12 2Z" />
                  <path d="m9 12 2.2 2.2L15.5 10" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
