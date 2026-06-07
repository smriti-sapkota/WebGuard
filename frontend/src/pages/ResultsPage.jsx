function sevClass(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  return "low";
}

// Matches VulnerabilityOut from backend schemas.py exactly:
// { id, vuln_type, severity, affected_url, parameter,
//   payload, evidence, description, fix }
function FindingCard({ vuln }) {
  const sc = sevClass(vuln.severity);
  return (
    <div className={`fc fc-${sc}`}>
      <div className="fc-top">
        <span className="fc-name">{vuln.vuln_type || "Unknown"}</span>
        <span className={`sev-badge ${sc}`}>{vuln.severity || "LOW"}</span>
      </div>
      <div className="fc-body">
        <div className="ff">
          <strong>URL</strong>
          {vuln.affected_url || "—"}
        </div>
        <div className="ff">
          <strong>Parameter</strong>
          <code>{vuln.parameter || "—"}</code>
        </div>
        <div className="ff">
          <strong>Payload</strong>
          <code>{vuln.payload || "—"}</code>
        </div>
        <div className="ff">
          <strong>Evidence</strong>
          {vuln.evidence || "—"}
        </div>
        {vuln.description && (
          <div className="ff full">
            <strong>Description</strong>
            {vuln.description}
          </div>
        )}
        {vuln.fix && (
          <div className="ff full">
            <strong>Fix</strong>
            {vuln.fix}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage({ vulns, message }) {
  const counts = { high: 0, medium: 0, low: 0 };
  vulns.forEach((v) => {
    const k = String(v.severity || "").toLowerCase();
    if (k in counts) counts[k]++;
  });

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

      {/* Pills */}
      <div className="findings-head">
        <div className="pills">
          <span className="pill p-all">All: {vulns.length}</span>
          <span className="pill p-high">High: {counts.high}</span>
          <span className="pill p-medium">Med: {counts.medium}</span>
          <span className="pill p-low">Low: {counts.low}</span>
        </div>
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
