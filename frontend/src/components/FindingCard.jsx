function sevClass(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  return "low";
}

// Matches VulnerabilityOut from backend schemas.py:
// { id, vuln_type, severity, affected_url, parameter, payload, evidence, description, fix }
export default function FindingCard({ vuln }) {
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
