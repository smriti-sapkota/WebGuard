import { useState } from "react";
import { downloadReport } from "../utils/report";

// `getScan` returns the full scan (sync or async) so history rows can fetch on demand.
export default function DownloadButtons({ getScan, disabled, compact }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function go(format) {
    setBusy(true);
    setError(null);
    try {
      downloadReport(await getScan(), format);
    } catch (e) {
      setError(e.message || "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`dl ${compact ? "dl-compact" : ""}`}>
      {!compact && <span className="dl-label">Download</span>}
      {["json", "csv", "html"].map((f) => (
        <button
          key={f}
          type="button"
          className="dl-btn"
          disabled={disabled || busy}
          onClick={() => go(f)}
          title={`Download as ${f.toUpperCase()}`}
        >
          {f.toUpperCase()}
        </button>
      ))}
      {error && <span className="dl-err">{error}</span>}
    </div>
  );
}
