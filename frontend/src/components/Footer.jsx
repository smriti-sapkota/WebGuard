const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 6v6c0 5.25 3.9 10.15 9 11.35C17.1 17.15 21 12.25 21 12V6L12 2Z"
      fill="var(--green-light)"
      stroke="var(--highlight)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2.5 2.5L15 9"
      stroke="var(--highlight)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <ShieldIcon />
            </div>
            <span className="footer-logo-name">
              Web<span>Guard</span>
            </span>
          </div>
          <p className="footer-tagline">
            Enterprise-grade web vulnerability scanner for modern security
            teams.
          </p>
        </div>

        {/* Questions */}
        <div>
          <div className="footer-col-title">Questions</div>
          <div className="footer-links">
            {QUESTIONS.map((link) => (
              <a
                key={link.label}
                className="footer-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <div className="footer-col-title">Legal</div>
          <div className="footer-links">
            {LEGAL.map((link) => (
              <a
                key={link.label}
                className="footer-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © 2025 WebGuard. All rights reserved.
        </span>
        <div className="footer-badges">
          {["SQLi", "XSS", "CSRF"].map((t) => (
            <span key={t} className="footer-badge">
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
