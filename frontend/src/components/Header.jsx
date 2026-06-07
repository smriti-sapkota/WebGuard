const ShieldIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 6v6c0 5.25 3.9 10.15 9 11.35C17.1 17.15 21 12.25 21 12V6L12 2Z"
      fill="var(--green-light)"
      stroke="var(--green)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2.5 2.5L15 9"
      stroke="var(--green)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Header({ page, setPage }) {
  return (
    <header className="header">
      <div className="header-inner">
        <button className="logo" onClick={() => setPage("home")}>
          <div className="logo-icon">
            <ShieldIcon size={16} />
          </div>
          <span className="logo-name">
            Web<span>Guard</span>
          </span>
        </button>

        <nav className="nav">
          {[
            { id: "home", label: "Home" },
            { id: "scanner", label: "Scanner" },
            { id: "results", label: "Results" },
          ].map(({ id, label }) => (
            <button
              key={id}
              className={`nav-btn ${page === id ? "active" : ""}`}
              onClick={() => {
                setPage(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
