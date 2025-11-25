import React, { useMemo, useState, useEffect } from "react";
import moment from "moment-timezone";

type EngageRow = {
  matchName: string;
  exposure: number;
  date: string; // ISO or readable string accepted
};

interface EngageModalProps {
  open: boolean;
  onClose: () => void;
  rows: EngageRow[];
  title?: string;
}

const styles = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 12, 20, 0.55)",
    zIndex: 2000,
    padding: 20,
    animation: "fadeIn .12s ease-out",
  },
  container: {
    width: "min(980px, 96%)",
    maxHeight: "90vh",
    overflow: "hidden",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 20px 60px rgba(2,6,23,0.45)",
    display: "flex",
    flexDirection: "column" as const,
    transform: "translateY(0)",
    animation: "slideUp .16s cubic-bezier(.2,.9,.3,1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    background:
      "linear-gradient(90deg, rgba(2,132,199,1) 0%, rgba(34,197,94,0.95) 100%)",
    color: "#fff",
  },
  titleWrap: { display: "flex", alignItems: "center", gap: 12 },
  title: { margin: 0, fontSize: 18, letterSpacing: 0.2, fontWeight: 700, color: "#000" },
  badge: {
    background: "rgba(255,255,255,0.12)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
    color: "",
  },
  headerButtons: { display: "flex", gap: 8, alignItems: "center" },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
  },
  body: {
    padding: 16,
    overflow: "auto" as const,
  },
  controls: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: "wrap" as const,
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e6eef6",
    minWidth: 220,
    outline: "none",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto" as const,
    borderRadius: 8,
    border: "1px solid #f0f4f8",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 14,
    minWidth: 640,
  },
  thead: {
    position: "sticky" as const,
    top: 0,
    background: "#f8fbff",
    zIndex: 1,
  },
  th: {
    textAlign: "left" as const,
    padding: "12px 14px",
    fontWeight: 700,
    fontSize: 13,
    color: "#234",
    borderBottom: "1px solid #eef6ff",
  },
  tr: {
    transition: "background .12s ease",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #f6f9fc",
    verticalAlign: "middle" as const,
  },
  exposurePill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e8f8f0",
    color: "#037a4b",
    fontWeight: 600,
    fontSize: 13,
  },
  emptyRow: {
    padding: 28,
    textAlign: "center" as const,
    color: "#6b7280",
  },
  footer: {
    padding: "12px 16px",
    borderTop: "1px solid #f2f6fb",
    background: "#fff",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  closePrimary: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #e6eef6",
    background: "#fff",
    cursor: "pointer",
  },
  exportBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(90deg, #06b6d4, #06b6a4)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  highlightRow: {
    background: "#fbffff",
  },
  // keyframes (will be injected via style tag below)
};

function formatDate(d: string) {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return d;
  }
}

const EngageModal: React.FC<EngageModalProps> = ({
  open,
  onClose,
  rows,
  title = "User Engaged Chips",
}) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<EngageRow[]>(rows || []);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  // compute total exposure
  const totalExposure = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.exposure) || 0), 0),
    [rows]
  );

  useEffect(() => {
    setFiltered(
      rows.filter((r) =>
        r.matchName.toLowerCase().includes(query.trim().toLowerCase())
      )
    );
  }, [rows, query]);

  useEffect(() => {
    // reset highlight when modal closes
    if (!open) {
      setQuery("");
      setHighlightIdx(null);
    }
  }, [open]);

  if (!open) return null;

  // simple CSV export
  const exportCSV = () => {
    const header = ["Match Name", "Exposure", "Date"];
    const csvRows = [
      header.join(","),
      ...filtered.map((r) => [
        `"${r.matchName.replace(/"/g, '""')}"`,
        r.exposure,
        `"${r.date.replace(/"/g, '""')}"`,
      ].join(",")),
    ];
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engaged-chips-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Inject tiny keyframes so animation works without external CSS */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(8px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        @keyframes fadeIn {
          from { opacity: 0 } to { opacity: 1 }
        }
        .engage-row-zebra:nth-child(odd) { background: #fff; }
        .engage-row-zebra:nth-child(even) { background: #fbfcff; }
        .engage-row-zebra:hover { background: #f0fcf8 !important; }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={styles.overlay}
        onClick={onClose}
      >
        <div
          style={styles.container}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          {/* <div style={styles.header}>
            <div style={styles.titleWrap}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={styles.title}>{title}</h3>
                <div style={{ fontSize: 12, opacity: 0.95 }}>
                  <span style={{ color: "#e6f7ff" }}>
                    Showing {filtered.length} of {rows.length} entries
                  </span>
                </div>
              </div>
              <div style={styles.badge}>
                Total: {totalExposure.toLocaleString()}
              </div>
            </div>

            <div style={styles.headerButtons}>
              <button
                aria-label="Export engaged chips CSV"
                onClick={exportCSV}
                style={styles.exportBtn}
              >
                Export CSV
              </button>

              <button
                onClick={onClose}
                aria-label="Close modal"
                style={styles.closeBtn}
                title="Close"
              >
                ×
              </button>
            </div>
          </div> */}

          <div style={styles.body}>
            <div style={styles.controls}>
              {/* <div style={styles.search}>
                <input
                  type="search"
                  placeholder="Search match name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={styles.searchInput}
                />
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  <strong>{filtered.length}</strong> results
                </div>
              </div> */}

              {/* <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    // quick highlight: focus the first large exposure
                    const idx = filtered.findIndex((r) => r.exposure >= 5000);
                    setHighlightIdx(idx >= 0 ? idx : null);
                    // scroll into view using a tiny timeout to allow DOM to paint
                    setTimeout(() => {
                      const el = document.querySelector(
                        `.engage-row-zebra[data-idx='${idx}']`
                      ) as HTMLElement | null;
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 80);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #e6eef6",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                  title="Highlight big exposures (>= 5000)"
                >
                  Highlight Big
                </button>
              </div> */}
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>Match Name</th>
                    <th style={styles.th}>Exposure</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={styles.emptyRow}>
                        No engagement data
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r:any, idx) => {
                      const isHighlighted = highlightIdx === idx;
                      return (
                        <tr
                          key={idx}
                          className="engage-row-zebra"
                          data-idx={idx}
                          style={{
                            ...styles.tr,
                            ...(isHighlighted ? { background: "#fff9ec" } : {}),
                          }}
                          onMouseEnter={() => setHighlightIdx(idx)}
                          onMouseLeave={() => setHighlightIdx(null)}
                        >
                          <td style={styles.td}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>
                              {r.selectionName}
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280" }}>
                              {/* small helper text */}
                              {r.matchName.includes("v")
                                ? "Head-to-head"
                                : "Market"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.exposurePill}>
                              {Number(r.stack).toLocaleString()}
                            </span>
                          </td>
                          <td style={styles.td}> {moment.utc(r?.betClickTime).format("MMMM Do, h:mm:ss A")}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.footer}>
            <button onClick={onClose} style={styles.closePrimary}>
              Close
            </button>
            {/* <button
              onClick={() => {
                exportCSV();
              }}
              style={styles.exportBtn}
            >
              Export CSV
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default EngageModal;
