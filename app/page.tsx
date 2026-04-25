"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────
interface Listing {
  id: string;
  listingTitle: string;
  listingDescription?: string;
  sellingPrice?: number;
  itemAge?: number;
  itemBrand?: string;
  status?: string;
  address?: { state?: string };
  listingImages?: { url: string; order: number }[];
  ListingAttribute?: { value: string; categoryAttributeId: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtPrice(val?: number) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

// ── Page ──────────────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setListing(null);
    setError(null);

    try {
      const match = url.match(
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
      );
      if (!match) throw new Error("Couldn't find a listing ID in that URL.");

      const res = await fetch(`/api/listing?id=${match[1]}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch listing.");
      setListing(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const invoiceNumber = listing
    ? `GRG-${listing.id.slice(0, 6).toUpperCase()}`
    : null;

  const heroImage = listing?.listingImages?.find(img => img.order === 0)?.url;

  async function handleDownloadPDF() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const W = 612;
  
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  
    const invoiceNum = `GRG-${listing!.id.slice(0, 6).toUpperCase()}`;
  
    // ── Header ──────────────────────────────────────────────
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, W, 90, "F");
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(1.5);
    doc.line(48, 90, W - 48, 90);
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text("INVOICE", 48, 44);
  
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text(invoiceNum, 48, 70);
  
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text("DATE", W - 48, 44, { align: "right" });
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(11);
    doc.text(today, W - 48, 62, { align: "right" });
  
    // ── From / Bill To ──────────────────────────────────────
    let y = 114;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(156, 163, 175);
    doc.text("FROM", 48, y);
    doc.text("BILL TO", W / 2, y);
  
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Garage Technologies, Inc.", 48, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(11);
    doc.text("shopgarage.com", 48, y + 16);
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Fire Department", W / 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Purchasing Department", W / 2, y + 16);
    if (listing!.address?.state) {
      doc.text(`${listing!.address.state}, United States`, W / 2, y + 32);
    }
  
    // ── Vehicle details ─────────────────────────────────────
    y += 72;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(48, y, W - 48, y);
    y += 16;
  
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(156, 163, 175);
    doc.text("VEHICLE DETAILS", 48, y);
    y += 14;
  
    const details = [
      { label: "Year", value: listing!.itemAge?.toString() },
      { label: "Brand", value: listing!.itemBrand },
      { label: "Location", value: listing!.address?.state },
    ].filter(f => f.value);
  
    details.forEach((f, i) => {
      const x = 48 + i * 180;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(156, 163, 175);
      doc.text(f.label.toUpperCase(), x, y);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(f.value!, x, y + 14);
    });
  
    // ── Line items table ────────────────────────────────────
    y += 48;
    doc.setFillColor(249, 250, 251);
    doc.rect(0, y, W, 28, "F");
    doc.setDrawColor(229, 231, 235);
    doc.line(0, y, W, y);
    doc.line(0, y + 28, W, y + 28);
  
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(156, 163, 175);
    doc.text("DESCRIPTION", 48, y + 18);
    doc.text("QTY", W - 250, y + 18);
    doc.text("UNIT PRICE", W - 170, y + 18);
    doc.text("AMOUNT", W - 48, y + 18, { align: "right" });
  
    y += 40;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(listing!.listingTitle, 48, y);
  
    if (listing!.listingDescription) {
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      const descLines = doc.splitTextToSize(listing!.listingDescription, 300);
      const trimmed = descLines.slice(0, 3);
      doc.text(trimmed, 48, y);
      y += trimmed.length * 12;
    }
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    const priceY = y - (listing!.listingDescription ? 14 : 0);
    doc.text("1", W - 242, priceY);
    doc.text(fmtPrice(listing!.sellingPrice), W - 162, priceY);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(fmtPrice(listing!.sellingPrice), W - 48, priceY, { align: "right" });
  
    // ── Totals ──────────────────────────────────────────────
    y += 32;
    doc.setDrawColor(229, 231, 235);
    doc.line(48, y, W - 48, y);
    y += 20;
  
    const totalRows = [
      { label: "Subtotal", value: fmtPrice(listing!.sellingPrice), bold: false },
      { label: "Tax", value: "TBD", bold: false },
      { label: "Delivery", value: "TBD", bold: false },
    ];
  
    totalRows.forEach(row => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.text(row.label, W - 200, y);
      doc.text(row.value, W - 48, y, { align: "right" });
      y += 18;
    });
  
    y += 4;
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(1.5);
    doc.line(W - 200, y, W - 48, y);
    y += 14;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text("Total due", W - 200, y);
    doc.text(fmtPrice(listing!.sellingPrice), W - 48, y, { align: "right" });
  
    // ── Footer ──────────────────────────────────────────────
    y += 48;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(48, y, W - 48, y);
    y += 16;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    const disclaimer = "This invoice is for pre-purchase approval purposes only. Final price subject to negotiation and may exclude taxes, fees, and delivery.";
    const footerLines = doc.splitTextToSize(disclaimer, W - 96);
    doc.text(footerLines, 48, y);
    doc.text(`Generated ${today} · shopgarage.com`, W - 48, y, { align: "right" });
  
    doc.save(`garage-invoice-${invoiceNum}.pdf`);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; min-height: 100vh; }

        :root {
          --accent: rgb(234, 88, 12);
          --accent-dark: rgb(194, 65, 6);
          --ink: #111827;
          --ink-secondary: #6B7280;
          --ink-tertiary: #9CA3AF;
          --border: #E5E7EB;
          --surface: #F9FAFB;
        }

        .fade-in { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .spinner {
          width: 22px; height: 22px;
          border: 2px solid rgba(234,88,12,0.15);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        input[type=text]:focus { outline: none; }

        .btn-generate {
          width: 100%;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-generate:hover:not(:disabled) { background: #1f2937; }
        .btn-generate:active:not(:disabled) { transform: scale(0.98); }
        .btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-dl {
          display: flex; align-items: center; gap: 7px;
          background: var(--accent); color: #fff;
          border: none; border-radius: 10px;
          padding: 11px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-dl:hover { background: var(--accent-dark); }
        .btn-dl:active { transform: scale(0.98); }

        /* ── Invoice styles ── */
        .invoice-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.05);
        }

        .invoice-hero {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        .invoice-header {
          padding: 28px 36px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1.5px solid var(--ink);
        }

        .invoice-number-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-tertiary);
          margin-bottom: 4px;
        }

        .invoice-number {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .invoice-meta-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-tertiary);
          margin-bottom: 3px;
        }

        .invoice-meta-value {
          font-size: 13px;
          color: var(--ink-secondary);
        }

        .invoice-from-to {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border-bottom: 0.5px solid var(--border);
        }

        .invoice-from-to-cell {
          padding: 20px 36px;
        }

        .invoice-from-to-cell:first-child {
          border-right: 0.5px solid var(--border);
        }

        .invoice-vehicle-section {
          padding: 24px 36px;
          border-bottom: 0.5px solid var(--border);
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-table thead tr {
          border-bottom: 0.5px solid var(--border);
        }

        .invoice-table thead th {
          padding: 10px 36px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-tertiary);
          text-align: left;
          background: var(--surface);
        }

        .invoice-table thead th:last-child { text-align: right; }

        .invoice-table tbody td {
          padding: 18px 36px;
          font-size: 13px;
          color: var(--ink);
          vertical-align: top;
          border-bottom: 0.5px solid var(--border);
        }

        .invoice-table tbody td:last-child { text-align: right; }

        .invoice-totals {
          padding: 20px 36px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          border-bottom: 0.5px solid var(--border);
        }

        .invoice-total-row {
          display: flex;
          gap: 48px;
          align-items: baseline;
        }

        .invoice-total-label {
          font-size: 12px;
          color: var(--ink-secondary);
          min-width: 100px;
          text-align: right;
        }

        .invoice-total-value {
          font-size: 13px;
          color: var(--ink);
          min-width: 100px;
          text-align: right;
        }

        .invoice-grand-total-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          min-width: 100px;
          text-align: right;
        }

        .invoice-grand-total-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
          min-width: 100px;
          text-align: right;
          letter-spacing: -0.02em;
        }

        .invoice-grand-total-divider {
          width: 100%;
          max-width: 260px;
          border: none;
          border-top: 1.5px solid var(--ink);
          margin-bottom: 4px;
        }

        .invoice-footer {
          padding: 16px 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--surface);
        }

        .invoice-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          background: rgba(234,88,12,0.08);
          border: 0.5px solid rgba(234,88,12,0.2);
          border-radius: 4px;
          padding: 3px 8px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px 0;
        }

        .detail-cell {
          padding-right: 20px;
        }

        .detail-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-tertiary);
          margin-bottom: 3px;
        }

        .detail-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{
          padding: "16px 40px",
          display: "flex", alignItems: "center", gap: 10,
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          background: "#fff",
          backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <img src="/garage-logo.svg" alt="Garage" style={{ height: 28, width: "auto" }} />
        </header>

        <div style={{ display: "flex", flex: 1 }}>

          {/* ── Left panel ── */}
          <div style={{
            width: 380, flexShrink: 0,
            background: "#fff",
            borderRight: "0.5px solid rgba(0,0,0,0.07)",
            padding: "40px 36px",
            display: "flex", flexDirection: "column", gap: 32,
          }}>
            <div>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 32, fontWeight: 400,
                color: "#1a1a1a", lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}>
                Generate a<br />
                {/* <em style={{ color: "var(--accent)" }}>invoice</em><br /> */}
                invoice
              </h1>
              <p style={{ fontSize: 13, color: "#888", marginTop: 12, lineHeight: 1.75 }}>
                Paste a Garage listing URL below and we'll build a clean PDF invoice for your department's approval process.
              </p>
            </div>

            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Listing URL
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.shopgarage.com/listing/..."
                style={{
                  width: "100%",
                  border: "0.5px solid #e0e0e0", borderRadius: 10,
                  padding: "13px 14px", fontSize: 13,
                  color: "#1a1a1a", background: "#fafafa",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgb(234,88,12)")}
                onBlur={e => (e.target.style.borderColor = "#e0e0e0")}
              />
              <button type="submit" className="btn-generate" disabled={loading || !url.trim()}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                      Fetching listing…
                    </span>
                  : "Generate invoice →"
                }
              </button>
              <p style={{ fontSize: 11, color: "#ccc", lineHeight: 1.6 }}>
                We'll extract the listing ID from the URL automatically.
              </p>
            </form>

            {error && (
              <div style={{
                fontSize: 12, color: "var(--accent)",
                background: "rgba(234,88,12,0.06)",
                border: "0.5px solid rgba(234,88,12,0.2)",
                borderRadius: 10, padding: "12px 14px", lineHeight: 1.6,
              }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: "auto", fontSize: 11, color: "#ccc", lineHeight: 1.7 }}>
              Prices do not include taxes, fees, or delivery. Contact seller for final quote.
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: listing ? "flex-start" : "center",
            justifyContent: "center",
            padding: "48px",
            background: "#fff",
            overflowY: "auto",
          }}>

            {/* Empty state */}
            {!listing && !loading && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 72, height: 72, background: "#fff",
                  borderRadius: 18, margin: "0 auto 14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 12px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.06)",
                  color: "#ddd",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: "#ccc", fontWeight: 500 }}>Invoice preview</p>
                <p style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>Paste a listing URL to get started</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 14px", width: 28, height: 28 }} />
                <p style={{ fontSize: 13, color: "#aaa" }}>Fetching listing data…</p>
              </div>
            )}

            {/* ── Invoice ── */}
            {listing && (
              <div className="fade-in" style={{ width: "100%", maxWidth: 680 }}>

                {/* Action bar */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 16,
                }}>
                  <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
                    {listing.listingTitle}
                  </span>
                  <button className="btn-dl" onClick={handleDownloadPDF}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                  </button>
                </div>

                <div className="invoice-wrap">

                  {/* Hero photo */}
                  {heroImage && (
                    <img src={heroImage} alt={listing.listingTitle} className="invoice-hero" />
                  )}

                  {/* ── Invoice header: From / Invoice number / Date ── */}
                  <div className="invoice-header">
                    {/* Left: seller / from */}
                    <div>
                      <img src="/garage-logo.svg" alt="Garage" style={{ height: 20, width: "auto", marginBottom: 14 }} />
                      <div className="invoice-meta-label">From</div>
                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, lineHeight: 1.6 }}>
                        Garage Technologies, Inc.<br />
                        <span style={{ fontWeight: 400, color: "var(--ink-secondary)" }}>shopgarage.com</span>
                      </div>
                    </div>

                    {/* Right: invoice number + date */}
                    <div style={{ textAlign: "right" }}>
                      <div className="invoice-number-label">Invoice</div>
                      <div className="invoice-number">{invoiceNumber}</div>
                      <div style={{ marginTop: 14 }}>
                        <div className="invoice-meta-label">Date</div>
                        <div className="invoice-meta-value">{today}</div>
                      </div>
                      {listing.status && (
                        <div className="invoice-badge" style={{ marginTop: 12, marginLeft: "auto", width: "fit-content" }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "var(--accent)", display: "inline-block",
                          }} />
                          {listing.status}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Item details ── */}
                  <div className="invoice-vehicle-section">
                    <div className="invoice-meta-label" style={{ marginBottom: 12 }}>Item details</div>
                    <div className="detail-grid">
                      {[
                        { label: "Year",     value: listing.itemAge?.toString() },
                        { label: "Brand", value: listing.itemBrand },
                        { label: "Location", value: listing.address?.state },
                      ].filter(f => f.value).map(f => (
                        <div className="detail-cell" key={f.label}>
                          <div className="detail-label">{f.label}</div>
                          <div className="detail-value">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Line items table ── */}
                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60%" }}>Description</th>
                        <th>Qty</th>
                        <th>Unit price</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{listing.listingTitle}</div>
                          {listing.listingDescription && (
                            <div style={{
                              fontSize: 12, color: "var(--ink-secondary)",
                              lineHeight: 1.6,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}>
                              {listing.listingDescription}
                            </div>
                          )}
                        </td>
                        <td style={{ color: "var(--ink-secondary)" }}>1</td>
                        <td style={{ color: "var(--ink-secondary)" }}>{fmtPrice(listing.sellingPrice)}</td>
                        <td style={{ fontWeight: 500 }}>{fmtPrice(listing.sellingPrice)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* ── Totals ── */}
                  <div className="invoice-totals">
                    <div className="invoice-total-row">
                      <span className="invoice-total-label">Subtotal</span>
                      <span className="invoice-total-value">{fmtPrice(listing.sellingPrice)}</span>
                    </div>
                    <div className="invoice-total-row">
                      <span className="invoice-total-label">Tax</span>
                      <span className="invoice-total-value" style={{ color: "var(--ink-secondary)" }}>TBD</span>
                    </div>
                    <div className="invoice-total-row">
                      <span className="invoice-total-label">Delivery</span>
                      <span className="invoice-total-value" style={{ color: "var(--ink-secondary)" }}>TBD</span>
                    </div>
                    <hr className="invoice-grand-total-divider" />
                    <div className="invoice-total-row">
                      <span className="invoice-grand-total-label">Total due</span>
                      <span className="invoice-grand-total-value">{fmtPrice(listing.sellingPrice)}</span>
                    </div>
                  </div>

                  {/* ── Footer ── */}
                  <div className="invoice-footer">
                    <div style={{ fontSize: 11, color: "var(--ink-tertiary)", lineHeight: 1.6 }}>
                      This invoice is for pre-purchase approval purposes only.<br />
                      Final price subject to negotiation and may exclude taxes, fees, and delivery.
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-tertiary)", textAlign: "right", lineHeight: 1.6 }}>
                      Generated {today}<br />
                      shopgarage.com
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
