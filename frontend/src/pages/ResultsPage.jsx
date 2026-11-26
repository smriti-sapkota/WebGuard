import FindingCard from "../components/FindingCard";
import DownloadButtons from "../components/DownloadButtons";
import { severityCounts } from "../utils/report";

export default function ResultsPage({ vulns, message, scanId, target, status }) {
  const counts = severityCounts(vulns);
  const canDownload = vulns.length > 0 && scanId != null;

  return (
    <div className="results-wrap">
      <div className="page-head">
        <h2>Results</h2>
        <p>Vulnerabilities found in the last scan, grouped by severity.</p>
      </div>
      <div className="hr" />

      {/* Severity counters */}
      <div className="sev-indicators">
        <div className="sev-card">
          <div className="sev-dot dot-high" />
          <div>
            <div className="sev-count high">{counts.high}</div>
            <div className="sev-name">High Severity</div>
          </div>
        </div>
        <div className="sev-card">
          <div className="sev-dot dot-medium" />
          <div>
            <div className="sev-count medium">{counts.medium}</div>
            <div className="sev-name">Medium Severity</div>
          </div>
        </div>
        <div className="sev-card">
          <div className="sev-dot dot-low" />
          <div>
            <div className="sev-count low">{counts.low}</div>
            <div className="sev-name">Low Severity</div>
          </div>
        </div>
      </div>

      {/* Pills + download */}
      <div className="findings-head">
        <div className="pills">
          <span className="pill p-all">All: {vulns.length}</span>
          <span className="pill p-high">High: {counts.high}</span>
          <span className="pill p-medium">Med: {counts.medium}</span>
          <span className="pill p-low">Low: {counts.low}</span>
        </div>
        <DownloadButtons
          disabled={!canDownload}
          getScan={() => ({
            scan_id: scanId,
            target_url: target,
            status,
            vulnerabilities: vulns,
          })}
        />
      </div>

      {/* Message while scanning / no results */}
      {message && vulns.length === 0 && (
        <div className="empty-state">{message}</div>
      )}
      {!message && vulns.length === 0 && (
        <div className="empty-state">
          No results yet — start a scan from the Scanner page.
        </div>
      )}

      {/* Finding cards */}
      {vulns.map((v, i) => (
        <FindingCard key={v.id ?? i} vuln={v} />
      ))}
    </div>
  );
}
