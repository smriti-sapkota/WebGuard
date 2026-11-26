// Full-screen "Scanning" loader shown while a scan is running.
export default function ScanOverlay({ target, onStop }) {
  return (
    <div className="so" role="alertdialog" aria-live="polite" aria-label="Scanning in progress">
      <div className="so-box">
        <div className="so-loop" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="so-ring so-ring-a">
            <defs>
              <linearGradient id="soGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#39FF65" />
                <stop offset="1" stopColor="#39FF65" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(57,255,101,.12)" strokeWidth="8" />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#soGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="300 270"
            />
          </svg>
          <svg viewBox="0 0 200 200" className="so-ring so-ring-b">
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="#4ee06f"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="4 14"
              opacity="0.7"
            />
          </svg>
          <div className="so-text">
            Scanning<span className="so-dots" />
          </div>
        </div>

        <p className="so-target" title={target}>
          {target || "your website"}
        </p>
        <p className="so-hint">This can take a few minutes. Please keep this page open.</p>
        <button type="button" className="so-stop" onClick={onStop}>
          Stop
        </button>
      </div>
    </div>
  );
}
