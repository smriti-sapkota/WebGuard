function StatusBadge({ status }) {
  const s = String(status || "idle").toLowerCase();
  const cls =
    s === "completed"
      ? "badge-done"
      : s === "failed"
        ? "badge-failed"
        : s === "idle"
          ? "badge-idle"
          : "badge-running";
  const pulsing = s === "running" || s === "pending";
  return (
    <span className={`badge ${cls}`}>
      {pulsing && <span className="pulse">●</span>}
      {s}
    </span>
  );
}

export default function ScannerPage({
  form,
  setField,
  scanning,
  startScan,
  stopPolling,
  scanId,
  status,
  target,
  updatedAt,
}) {
  return (
    <div className="scanner-wrap">
      <div className="page-head">
        <h2>Scanner</h2>
        <p>Configure your target and authentication, then start a scan.</p>
      </div>
      <div className="hr" />

      <div className="scanner-grid">
        {/* ── Form ── */}
        <div className="card">
          <div className="card-title">Configure Scan</div>
          <form onSubmit={startScan}>
            <div className="frow">
              <div className="fgroup">
                <label className="flabel">API Base</label>
                <input
                  type="url"
                  className="finput"
                  value={form.apiBase}
                  onChange={(e) => setField("apiBase", e.target.value)}
                  required
                />
              </div>
              <div className="fgroup">
                <label className="flabel">Target URL</label>
                <input
                  type="url"
                  className="finput"
                  value={form.targetUrl}
                  onChange={(e) => setField("targetUrl", e.target.value)}
                  required
                />
              </div>
            </div>

            <label className="auth-toggle-row">
              <input
                type="checkbox"
                checked={form.useAuth}
                onChange={(e) => setField("useAuth", e.target.checked)}
              />
              Use Authentication
            </label>

            {form.useAuth && (
              <div className="auth-box">
                <div className="frow">
                  <div className="fgroup">
                    <label className="flabel">Login URL</label>
                    <input
                      type="url"
                      className="finput"
                      value={form.loginUrl}
                      onChange={(e) => setField("loginUrl", e.target.value)}
                    />
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Login Method</label>
                    <select
                      className="fselect"
                      value={form.loginMethod}
                      onChange={(e) => setField("loginMethod", e.target.value)}
                    >
                      <option value="post">POST</option>
                      <option value="get">GET</option>
                    </select>
                  </div>
                </div>

                <div className="frow">
                  <div className="fgroup">
                    <label className="flabel">Username</label>
                    <input
                      type="text"
                      className="finput"
                      value={form.username}
                      onChange={(e) => setField("username", e.target.value)}
                    />
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Password</label>
                    <input
                      type="password"
                      className="finput"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                    />
                  </div>
                </div>

                <div className="frow">
                  <div className="fgroup">
                    <label className="flabel">Username Field</label>
                    <input
                      type="text"
                      className="finput"
                      value={form.usernameField}
                      onChange={(e) =>
                        setField("usernameField", e.target.value)
                      }
                    />
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Password Field</label>
                    <input
                      type="text"
                      className="finput"
                      value={form.passwordField}
                      onChange={(e) =>
                        setField("passwordField", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="frow">
                  <div className="fgroup">
                    <label className="flabel">Security URL</label>
                    <input
                      type="url"
                      className="finput"
                      value={form.securityUrl}
                      onChange={(e) => setField("securityUrl", e.target.value)}
                    />
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Security Level</label>
                    <select
                      className="fselect"
                      value={form.securityLevel}
                      onChange={(e) =>
                        setField("securityLevel", e.target.value)
                      }
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="impossible">impossible</option>
                    </select>
                  </div>
                </div>

                <div className="frow single">
                  <div className="fgroup">
                    <label className="flabel">Security Field</label>
                    <input
                      type="text"
                      className="finput"
                      value={form.securityField}
                      onChange={(e) =>
                        setField("securityField", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="frow single">
                  <div className="fgroup">
                    <label className="flabel">Extra Fields (JSON)</label>
                    <textarea
                      className="ftarea"
                      rows={3}
                      value={form.extraFields}
                      onChange={(e) => setField("extraFields", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="btn-row">
              <button type="submit" className="btn-scan" disabled={scanning}>
                {scanning ? (
                  <>
                    <span className="pulse">●</span> Scanning…
                  </>
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Start Scan
                  </>
                )}
              </button>
              <button type="button" className="btn-stop" onClick={stopPolling}>
                ■ Stop Polling
              </button>
            </div>
          </form>
        </div>

        {/* ── Status ── */}
        <div className="card">
          <div className="card-title">Scan Status</div>
          <div className="sgrid">
            <div className="scell">
              <div className="slabel">Scan ID</div>
              <div className="sval">{scanId ?? "—"}</div>
            </div>
            <div className="scell">
              <div className="slabel">State</div>
              <div className="sval">
                <StatusBadge status={status} />
              </div>
            </div>
            <div className="scell">
              <div className="slabel">Target</div>
              <div className="sval">{target ?? "—"}</div>
            </div>
            <div className="scell">
              <div className="slabel">Last Updated</div>
              <div className="sval">{updatedAt ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
