// Build + download scan reports (JSON, CSV, HTML) entirely in the browser.

const COLUMNS = [
  ['vuln_type', 'Type'],
  ['severity', 'Severity'],
  ['affected_url', 'Affected URL'],
  ['parameter', 'Parameter'],
  ['payload', 'Payload'],
  ['evidence', 'Evidence'],
  ['description', 'Description'],
  ['fix', 'Fix'],
]

// Backend sends naive UTC timestamps; make sure they parse as UTC.
export function parseDate(value) {
  if (!value) return null
  const s = String(value)
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(value) {
  const d = parseDate(value)
  return d ? d.toLocaleString() : '—'
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/[^a-z0-9.-]/gi, '_') } catch { return 'target' }
}

export function reportFilename(scan, ext) {
  return `webguard-scan-${scan.scan_id ?? 'result'}-${hostOf(scan.target_url)}.${ext}`
}

export function severityCounts(vulns = []) {
  const c = { high: 0, medium: 0, low: 0 }
  vulns.forEach(v => {
    const k = String(v.severity || '').toLowerCase()
    if (k === 'high') c.high++
    else if (k === 'medium') c.medium++
    else c.low++
  })
  return c
}

function toJson(scan) {
  const vulns = scan.vulnerabilities || []
  return JSON.stringify({
    scan_id: scan.scan_id,
    target_url: scan.target_url,
    status: scan.status,
    created_at: scan.created_at,
    completed_at: scan.completed_at,
    summary: { total: vulns.length, ...severityCounts(vulns) },
    vulnerabilities: vulns.map(v => { const copy = { ...v }; delete copy.id; return copy }),
  }, null, 2)
}

function csvCell(value) {
  let s = value == null ? '' : String(value)
  // stop spreadsheet apps from running cell content as a formula
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

const BOM = String.fromCharCode(0xfeff) // helps Excel read UTF-8

function toCsv(scan) {
  const head = COLUMNS.map(([, label]) => csvCell(label)).join(',')
  const rows = (scan.vulnerabilities || []).map(v =>
    COLUMNS.map(([key]) => csvCell(v[key])).join(','))
  return `${BOM}${[head, ...rows].join('\r\n')}\r\n`
}

const esc = s => String(s ?? '—').replace(/[&<>"']/g, ch =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))

function toHtml(scan) {
  const vulns = scan.vulnerabilities || []
  const c = severityCounts(vulns)
  const cards = vulns.map(v => {
    const sev = String(v.severity || 'low').toLowerCase()
    return `<section class="f ${esc(sev)}">
  <h3>${esc(v.vuln_type)} <span class="b ${esc(sev)}">${esc(v.severity)}</span></h3>
  <dl>
    <dt>URL</dt><dd>${esc(v.affected_url)}</dd>
    <dt>Parameter</dt><dd><code>${esc(v.parameter)}</code></dd>
    <dt>Payload</dt><dd><code>${esc(v.payload)}</code></dd>
    <dt>Evidence</dt><dd>${esc(v.evidence)}</dd>
    <dt>Description</dt><dd>${esc(v.description)}</dd>
    <dt>Fix</dt><dd><pre>${esc(v.fix)}</pre></dd>
  </dl>
</section>`
  }).join('\n')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>WebGuard report – ${esc(scan.target_url)}</title>
<style>
body{font:14px/1.5 system-ui,sans-serif;color:#1c231c;max-width:900px;margin:32px auto;padding:0 20px}
h1{margin:0 0 4px}h1 span{color:#34a853}.meta{color:#5a6e5a;margin-bottom:20px}
.sum{display:flex;gap:10px;margin:16px 0 24px}.sum div{flex:1;border:1px solid #dde4dd;border-radius:8px;padding:10px 14px}
.sum b{display:block;font-size:22px}
.f{border:1px solid #dde4dd;border-left:4px solid #34a853;border-radius:8px;padding:12px 16px;margin-bottom:12px;break-inside:avoid}
.f.high{border-left-color:#b83232}.f.medium{border-left-color:#d69a1c}
.f h3{margin:0 0 8px;font-size:15px}.b{font-size:11px;padding:2px 8px;border-radius:5px;background:#edf3e9;margin-left:6px}
.b.high{background:#f7dcdc;color:#b83232}.b.medium{background:#fbefd0;color:#8a5a00}
dl{display:grid;grid-template-columns:110px 1fr;gap:4px 12px;margin:0}dt{font-weight:600;color:#5a6e5a}dd{margin:0;word-break:break-word}
pre{white-space:pre-wrap;margin:0;font:12px/1.5 ui-monospace,monospace;background:#f6f8f6;padding:8px;border-radius:6px}
code{font:12px ui-monospace,monospace;background:#f6f8f6;padding:1px 5px;border-radius:4px}
</style></head><body>
<h1>Web<span>Guard</span> scan report</h1>
<div class="meta">Target: <strong>${esc(scan.target_url)}</strong><br>
Scan #${esc(scan.scan_id)} · Status: ${esc(scan.status)} · Started: ${esc(formatDate(scan.created_at))}${scan.completed_at ? ` · Finished: ${esc(formatDate(scan.completed_at))}` : ''}</div>
<div class="sum"><div><b>${vulns.length}</b>Total</div><div><b>${c.high}</b>High</div><div><b>${c.medium}</b>Medium</div><div><b>${c.low}</b>Low</div></div>
${cards || '<p>No vulnerabilities were found.</p>'}
</body></html>`
}

const FORMATS = {
  json: { build: toJson, mime: 'application/json' },
  csv:  { build: toCsv,  mime: 'text/csv;charset=utf-8' },
  html: { build: toHtml, mime: 'text/html;charset=utf-8' },
}

export function downloadReport(scan, format) {
  const f = FORMATS[format]
  if (!f) throw new Error(`Unknown format: ${format}`)
  const blob = new Blob([f.build(scan)], { type: f.mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = reportFilename(scan, format)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
