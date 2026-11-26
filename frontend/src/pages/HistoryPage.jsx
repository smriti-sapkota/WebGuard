import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { fetchScanHistory, fetchScanStatus } from "../utils/scanApi";
import { formatDate } from "../utils/report";
import FindingCard from "../components/FindingCard";
import DownloadButtons from "../components/DownloadButtons";

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return { cls: "badge-done", label: "Completed" };
  if (s === "failed") return { cls: "badge-failed", label: "Failed" };
  if (s === "running" || s === "pending") return { cls: "badge-running", label: s };
  return { cls: "badge-idle", label: s || "unknown" };
}

function HistoryRow({ scan }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const badge = statusBadge(scan.status);
  const finished = ["completed", "failed"].includes(String(scan.status).toLowerCase());

  // Full scan (with findings) — fetched once, then reused by View and Download.
  const loadDetail = useCallback(async () => {
    if (detail) return detail;
    const data = await fetchScanStatus(API_BASE, scan.scan_id);
    setDetail(data);
    return data;
  }, [detail, scan.scan_id]);

  async function toggle() {
    if (open) return setOpen(false);
    setOpen(true);
    if (detail) return;
    setLoading(true);
    setError(null);
    try {
      await loadDetail();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hrow">
      <div className="hrow-main">
        <div className="hrow-target">
          <div className="hrow-url" title={scan.target_url}>{scan.target_url}</div>
          <div className="hrow-meta">
            Scan #{scan.scan_id} · {formatDate(scan.created_at)}
          </div>
        </div>

        <span className={`badge ${badge.cls}`}>{badge.label}</span>

        <div className="pills">
          <span className="pill p-all">{scan.total} found</span>
          {scan.high > 0 && <span className="pill p-high">High: {scan.high}</span>}
          {scan.medium > 0 && <span className="pill p-medium">Med: {scan.medium}</span>}
          {scan.low > 0 && <span className="pill p-low">Low: {scan.low}</span>}
        </div>

        <div className="hrow-actions">
          <button
            type="button"
            className="btn-stop hrow-view"
            onClick={toggle}
            disabled={!finished}
            aria-expanded={open}
          >
            {open ? "Hide" : "View"}
          </button>
          <DownloadButtons compact disabled={!finished} getScan={loadDetail} />
        </div>
      </div>

      {scan.status === "failed" && scan.error_message && (
        <div className="hrow-error">{scan.error_message}</div>
      )}

      {open && (
        <div className="hrow-detail">
          {loading && <div className="empty-state">Loading findings…</div>}
          {error && <div className="empty-state">{error}</div>}
          {detail && detail.vulnerabilities.length === 0 && (
            <div className="empty-state">No vulnerabilities were found in this scan.</div>
          )}
          {detail && detail.vulnerabilities.map((v, i) => (
            <FindingCard key={v.id ?? i} vuln={v} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage({ setPage }) {
  const [scans, setScans] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchScanHistory(API_BASE)
      .then((data) => {
        if (!alive) return;
        setError(null);
        setScans(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        setScans([]);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const totalFindings = (scans || []).reduce((n, s) => n + s.total, 0);

  return (
    <div className="results-wrap">
      <div className="page-head hist-head">
        <div>
          <h2>Scan History</h2>
          <p>Every website you have scanned. Open a scan to see its findings or download the report.</p>
        </div>
        <button type="button" className="btn-stop" onClick={() => setReloadKey((k) => k + 1)}>Refresh</button>
      </div>
      <div className="hr" />

      {scans && scans.length > 0 && (
        <div className="pills hist-summary">
          <span className="pill p-all">Scans: {scans.length}</span>
          <span className="pill p-all">Total findings: {totalFindings}</span>
        </div>
      )}

      {scans === null && <div className="empty-state">Loading your history…</div>}
      {error && <div className="empty-state">{error}</div>}

      {scans && !error && scans.length === 0 && (
        <div className="empty-state">
          You haven&apos;t scanned anything yet.{" "}
          <button type="button" className="hist-link" onClick={() => setPage("scanner")}>
            Start your first scan
          </button>
        </div>
      )}

      {scans && scans.map((s) => (
        <HistoryRow key={s.scan_id} scan={s} />
      ))}
    </div>
  );
}
