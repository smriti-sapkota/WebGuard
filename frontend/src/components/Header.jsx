import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ShieldIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const label = (user.name || user.email || "?").trim();
  const initial = label.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="profile" ref={ref}>
      <button
        className="avatar"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={user.email}
      >
        {initial}
      </button>
      {open && (
        <div className="profile-menu" role="menu">
          <div className="profile-info">
            <div className="avatar avatar-lg">{initial}</div>
            <div className="profile-text">
              {user.name && <div className="profile-name">{user.name}</div>}
              <div className="profile-email">{user.email}</div>
            </div>
          </div>
          <button
            className="profile-logout"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ page, setPage }) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = page === "home" && !scrolled;
  return (
    <header
      className={`header${page === "home" ? " header-home" : ""}${overHero ? " on-hero" : ""}`}
    >
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
            { id: "history", label: "History" },
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
          {user ? (
            <ProfileMenu
              user={user}
              onLogout={() => {
                logout();
                setPage("home");
              }}
            />
          ) : (
            <button
              className={`nav-btn nav-login ${page === "login" ? "active" : ""}`}
              onClick={() => setPage("login")}
            >
              Log in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
