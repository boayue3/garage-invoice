"use client"; // Required for React hooks and browser interactivity in Next.js App Router

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────
// Defines the shape of a listing returned by the Garage API.
// Optional fields (?) handle cases where the API omits certain data
// (e.g. equipment listings may not have itemAge).
interface Listing {
  id: string;
  listingTitle: string;
  listingDescription?: string;
  sellingPrice?: number;
  itemAge?: number;        // Year of manufacture
  itemBrand?: string;      // e.g. "Freightliner", "Pierce"
  status?: string;         // e.g. "ACTIVE"
  address?: { state?: string };
  listingImages?: { url: string; order: number }[]; // Sorted by order field
  ListingAttribute?: { value: string; categoryAttributeId: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────
// Formats a number as USD currency (e.g. 800000 → "$800,000")
// Returns "—" if the value is missing or zero
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
  // The URL the user types into the input field
  const [url, setUrl] = useState("");
  // The listing data returned from the API — null until a fetch succeeds
  const [listing, setListing] = useState<Listing | null>(null);
  // Controls the loading spinner while the API request is in flight
  const [loading, setLoading] = useState(false);
  // Holds any error message to display below the form
  const [error, setError] = useState<string | null>(null);

  // ── Handle form submission ─────────────────────────────────────
  // Extracts the UUID from the pasted URL, calls our Next.js API route,
  // and stores the listing data in state.
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload on form submit
    if (!url.trim()) return;

    setLoading(true);
    setListing(null); // Clear any previous invoice
    setError(null);   // Clear any previous error

    try {
      // Extract the UUID from the end of any Garage listing URL.
      // Example: .../listing/2025-Toyne-...-11653dfc-46ea-4c03-9f10-f9f6065909b1
      // The UUID always appears at the very end, after the listing title slug.
      const match = url.match(
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
      );
      if (!match) throw new Error("Couldn't find a listing ID in that URL.");

      // Call our own Next.js API route (/app/api/listing/route.ts).
      // That route proxies the request to garage-backend.onrender.com,
      // which avoids CORS issues that would occur fetching directly from the browser.
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

  // ── Derived values ─────────────────────────────────────────────
  // Formatted date shown on the invoice (e.g. "April 25, 2026")
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Invoice reference number derived from the first 6 chars of the listing UUID
  // e.g. "11653d" → "GRG-11653D"
  const invoiceNumber = listing
    ? `GRG-${listing.id.slice(0, 6).toUpperCase()}`
    : null;

  // Pick the first image (order: 0) to use as the invoice hero photo
  const heroImage = listing?.listingImages?.find(img => img.order === 0)?.url;

  // ── PDF generation ─────────────────────────────────────────────
  // Builds a PDF entirely in the browser using jsPDF (no server needed).
  // Dynamically imports jsPDF so it's only loaded when the user clicks Download.
  async function handleDownloadPDF() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" }); // US Letter: 612 x 792 pt
    const W = 612; // Page width in points

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const invoiceNum = `GRG-${listing!.id.slice(0, 6).toUpperCase()}`;

    // ── PDF Header ─────────────────────────────────────────────
    // Light gray background behind the header area
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, W, 90, "F");

    // Bold bottom border line under the header
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(1.5);
    doc.line(48, 90, W - 48, 90);

    // "INVOICE" label (small, muted)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text("INVOICE", 48, 44);

    // Invoice number (large, dark)
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text(invoiceNum, 48, 70);

    // Date label + value (right-aligned)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text("DATE", W - 48, 44, { align: "right" });
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(11);
    doc.text(today, W - 48, 62, { align: "right" });

    // ── FROM / BILL TO section ─────────────────────────────────
    // Two-column layout: Garage on the left, buyer placeholder on the right
    let y = 114;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(156, 163, 175);
    doc.text("FROM", 48, y);
    doc.text("BILL TO", W / 2, y);

    y += 14;

    // Garage contact info (left column)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Garage Technologies, Inc.", 48, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(11);
    doc.text("shopgarage.com", 48, y + 16);

    // Buyer placeholder (right column)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    // doc.text("Fire Department", W / 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Purchasing Department", W / 2, y + 16);
    if (listing!.address?.state) {
      doc.text(`${listing!.address.state}, United States`, W / 2, y + 32);
    }

    // ── Vehicle / item details row ─────────────────────────────
    y += 72;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(48, y, W - 48, y); // Divider line

    y += 16;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(156, 163, 175);
    doc.text("VEHICLE DETAILS", 48, y);
    y += 14;

    // Render each detail field (Year, Brand, Location) side by side
    const details = [
      { label: "Year", value: listing!.itemAge?.toString() },
      { label: "Brand", value: listing!.itemBrand },
      { label: "Location", value: listing!.address?.state },
    ].filter(f => f.value); // Skip any fields that are empty

    details.forEach((f, i) => {
      const x = 48 + i * 180; // Space each column 180pt apart
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(156, 163, 175);
      doc.text(f.label.toUpperCase(), x, y);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(f.value!, x, y + 14);
    });

    // ── Line items table ───────────────────────────────────────
    // Table header row with light gray background
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
    doc.text("UNIT PRICE", W - 170, y + 18);
    doc.text("AMOUNT", W - 48, y + 18, { align: "right" });

    // Line item: listing title + first 3 lines of description
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
      // splitTextToSize wraps long text to fit within 300pt width
      const descLines = doc.splitTextToSize(listing!.listingDescription, 300);
      const trimmed = descLines.slice(0, 3); // Cap at 3 lines to avoid overflow
      doc.text(trimmed, 48, y);
      y += trimmed.length * 12;
    }

    // Qty, unit price, and amount columns (right side of table)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    const priceY = y - (listing!.listingDescription ? 14 : 0);
    doc.text(fmtPrice(listing!.sellingPrice), W - 162, priceY);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(fmtPrice(listing!.sellingPrice), W - 48, priceY, { align: "right" });

    // ── Totals section ─────────────────────────────────────────
    // Subtotal, Tax (TBD), Delivery (TBD), then bold Total Due
    y += 32;
    doc.setDrawColor(229, 231, 235);
    doc.line(48, y, W - 48, y);
    y += 20;

    const totalRows = [
      { label: "Subtotal", value: fmtPrice(listing!.sellingPrice) },
      { label: "Tax",      value: "TBD" }, // Unknown until sale is finalized
      { label: "Delivery", value: "TBD" }, // Depends on location and method
    ];

    totalRows.forEach(row => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.text(row.label, W - 200, y);
      doc.text(row.value, W - 48, y, { align: "right" });
      y += 18;
    });

    // Bold divider line above Total Due
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

    // ── PDF Footer ─────────────────────────────────────────────
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

    // Trigger browser download of the generated PDF
    doc.save(`garage-invoice-${invoiceNum}.pdf`);
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; min-height: 100vh; }

        :root {
          --accent: rgb(234, 88, 12);       /* Garage orange */
          --accent-dark: rgb(194, 65, 6);   /* Darker orange for hover states */
          --ink: #111827;                   /* Near-black for headings and body */
          --ink-secondary: #6B7280;         /* Muted text */
          --ink-tertiary: #9CA3AF;          /* Very muted labels */
          --border: #E5E7EB;                /* Light gray borders */
          --surface: #F9FAFB;               /* Off-white backgrounds */
        }

        /* Invoice fade-in animation when listing loads */
        .fade-in { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Loading spinner shown while fetching listing data */
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

        /* Generate invoice button */
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

        /* Download PDF / Email invoice buttons */
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

        /* ── Invoice card styles ── */

        /* Outer wrapper with shadow to make it feel like a real document */
        .invoice-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.05);
        }

        /* Full-width hero photo at the top of the invoice */
        .invoice-hero {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        /* Header section: Garage logo, invoice number, date */
        .invoice-header {
          padding: 28px 36px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1.5px solid var(--ink);
        }

        .invoice-number-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ink-tertiary); margin-bottom: 4px;
        }

        /* Large serif invoice number (e.g. GRG-11653D) */
        .invoice-number {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; color: var(--ink);
          letter-spacing: -0.02em; line-height: 1;
        }

        .invoice-meta-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-tertiary); margin-bottom: 3px;
        }

        .invoice-meta-value { font-size: 13px; color: var(--ink-secondary); }

        /* Two-column "From / Bill To" section */
        .invoice-from-to {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0; border-bottom: 0.5px solid var(--border);
        }
        .invoice-from-to-cell { padding: 20px 36px; }
        .invoice-from-to-cell:first-child { border-right: 0.5px solid var(--border); }

        /* Item details section (Year, Brand, Location) */
        .invoice-vehicle-section {
          padding: 24px 36px;
          border-bottom: 0.5px solid var(--border);
        }

        /* Line items table (Description / Qty / Unit Price / Amount) */
        .invoice-table { width: 100%; border-collapse: collapse; }
        .invoice-table thead tr { border-bottom: 0.5px solid var(--border); }
        .invoice-table thead th {
          padding: 10px 36px;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-tertiary); text-align: left;
          background: var(--surface);
        }
        .invoice-table thead th:last-child { text-align: right; }
        .invoice-table tbody td {
          padding: 18px 36px; font-size: 13px;
          color: var(--ink); vertical-align: top;
          border-bottom: 0.5px solid var(--border);
        }
        .invoice-table tbody td:last-child { text-align: right; }

        /* Totals section (Subtotal / Tax / Delivery / Total due) */
        .invoice-totals {
          padding: 20px 36px;
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 8px;
          border-bottom: 0.5px solid var(--border);
        }
        .invoice-total-row { display: flex; gap: 48px; align-items: baseline; }
        .invoice-total-label {
          font-size: 12px; color: var(--ink-secondary);
          min-width: 100px; text-align: right;
        }
        .invoice-total-value {
          font-size: 13px; color: var(--ink);
          min-width: 100px; text-align: right;
        }
        .invoice-grand-total-label {
          font-size: 13px; font-weight: 600; color: var(--ink);
          min-width: 100px; text-align: right;
        }
        .invoice-grand-total-value {
          font-size: 20px; font-weight: 600; color: var(--ink);
          min-width: 100px; text-align: right; letter-spacing: -0.02em;
        }
        /* Bold divider above the Total Due row */
        .invoice-grand-total-divider {
          width: 100%; max-width: 260px;
          border: none; border-top: 1.5px solid var(--ink);
          margin-bottom: 4px;
        }

        /* Footer: disclaimer + generated date */
        .invoice-footer {
          padding: 16px 36px;
          display: flex; justify-content: space-between; align-items: center;
          background: var(--surface);
        }

        /* Status badge (e.g. "ACTIVE") shown in the invoice header */
        .invoice-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--accent);
          background: rgba(234,88,12,0.08);
          border: 0.5px solid rgba(234,88,12,0.2);
          border-radius: 4px; padding: 3px 8px;
        }

        /* 3-column grid for item details (Year / Brand / Location) */
        .detail-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px 0;
        }
        .detail-cell { padding-right: 20px; }
        .detail-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-tertiary); margin-bottom: 3px;
        }
        .detail-value { font-size: 13px; font-weight: 500; color: var(--ink); }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── Top navigation bar ── */}
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

          {/* ── Left panel: URL input form ── */}
          <div style={{
            width: 380, flexShrink: 0,
            background: "#fff",
            borderRight: "0.5px solid rgba(0,0,0,0.07)",
            padding: "40px 36px",
            display: "flex", flexDirection: "column", gap: 32,
          }}>

            {/* Page heading */}
            <div>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 32, fontWeight: 400,
                color: "#1a1a1a", lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}>
                Generate an<br />
                invoice
              </h1>
              <p style={{ fontSize: 13, color: "#888", marginTop: 12, lineHeight: 1.75 }}>
                Paste a Garage listing URL below and we'll build a clean PDF invoice for your department's approval process.
              </p>
            </div>

            {/* URL input + submit button */}
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

            {/* Error message shown if URL is invalid or API call fails */}
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

            {/* Legal disclaimer pinned to the bottom of the left panel */}
            <div style={{ marginTop: "auto", fontSize: 11, color: "#ccc", lineHeight: 1.7 }}>
              Prices do not include taxes, fees, or delivery. Contact seller for final quote.
            </div>
          </div>

          {/* ── Right panel: invoice preview ── */}
          <div style={{
            flex: 1,
            display: "flex",
            // Center the empty/loading state; align to top once invoice loads
            alignItems: listing ? "flex-start" : "center",
            justifyContent: "center",
            padding: "48px",
            background: "#fff",
            overflowY: "auto",
          }}>

            {/* Empty state — shown before any URL is submitted */}
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

            {/* Loading state — shown while the API request is in flight */}
            {loading && (
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 14px", width: 28, height: 28 }} />
                <p style={{ fontSize: 13, color: "#aaa" }}>Fetching listing data…</p>
              </div>
            )}

            {/* ── Invoice preview — shown once listing data is loaded ── */}
            {listing && (
              <div className="fade-in" style={{ width: "100%", maxWidth: 680 }}>

                {/* Action bar: listing title + Download / Email buttons */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 16,
                }}>
                  <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
                    {listing.listingTitle}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* Download PDF — triggers jsPDF generation in the browser */}
                    <button className="btn-dl" onClick={handleDownloadPDF}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download PDF
                    </button>

                    {/* Email invoice — opens the user's mail app with invoice details pre-filled */}
                    <button
                      className="btn-dl"
                      style={{ background: "#fff", color: "var(--ink)", border: "0.5px solid var(--border)" }}
                      onClick={() => {
                        const subject = `Invoice ${invoiceNumber} — ${listing!.listingTitle}`;
                        const body = `Please find the invoice details below:\n\nInvoice: ${invoiceNumber}\nDate: ${today}\nItem: ${listing!.listingTitle}\nYear: ${listing!.itemAge ?? "—"}\nBrand: ${listing!.itemBrand ?? "—"}\nLocation: ${listing!.address?.state ?? "—"}\nAsking Price: ${fmtPrice(listing!.sellingPrice)}\n\nListing ID: ${listing!.id}\n\nPrices do not include taxes, fees, or delivery.\n\nView listing: https://www.shopgarage.com/listing/${listing!.id}`;
                        // mailto: opens the default mail app — no backend required
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      Email invoice
                    </button>
                  </div>
                </div>

                {/* ── Invoice card ── */}
                <div className="invoice-wrap">

                  {/* Hero photo — first image from the listing (order: 0) */}
                  {heroImage && (
                    <img src={heroImage} alt={listing.listingTitle} className="invoice-hero" />
                  )}

                  {/* Invoice header: Garage logo, invoice number, date, status badge */}
                  <div className="invoice-header">
                    <div>
                      <img src="/garage-logo.svg" alt="Garage" style={{ height: 20, width: "auto", marginBottom: 14 }} />
                      <div className="invoice-meta-label">From</div>
                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, lineHeight: 1.6 }}>
                        Garage Technologies, Inc.<br />
                        <span style={{ fontWeight: 400, color: "var(--ink-secondary)" }}>shopgarage.com</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div className="invoice-number-label">Invoice</div>
                      <div className="invoice-number">{invoiceNumber}</div>
                      <div style={{ marginTop: 14 }}>
                        <div className="invoice-meta-label">Date</div>
                        <div className="invoice-meta-value">{today}</div>
                      </div>
                      {/* Only render the status badge if status is present */}
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

                  {/* Item details: Year, Brand, Location */}
                  <div className="invoice-vehicle-section">
                    <div className="invoice-meta-label" style={{ marginBottom: 12 }}>Item details</div>
                    <div className="detail-grid">
                      {[
                        { label: "Year",     value: listing.itemAge?.toString() },
                        { label: "Brand",    value: listing.itemBrand },
                        { label: "Location", value: listing.address?.state },
                      ].filter(f => f.value) // Hide fields with no data
                       .map(f => (
                        <div className="detail-cell" key={f.label}>
                          <div className="detail-label">{f.label}</div>
                          <div className="detail-value">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Line items table: one row per listing */}
                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60%" }}>Description</th>
                        <th>Unit price</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{listing.listingTitle}</div>
                          {/* Show first 3 lines of description to keep invoice concise */}
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
                        <td style={{ color: "var(--ink-secondary)" }}>{fmtPrice(listing.sellingPrice)}</td>
                        <td style={{ fontWeight: 500 }}>{fmtPrice(listing.sellingPrice)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Totals: Subtotal / Tax / Delivery / Total due */}
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

                  {/* Invoice footer: legal disclaimer + generated date */}
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
