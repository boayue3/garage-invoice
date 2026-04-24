// import Image from "next/image";
// import styles from "./page.module.css";

// export default function Home() {
//   return (
//     <div className={styles.page}>
//       <main className={styles.main}>
//         <Image
//           className={styles.logo}
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className={styles.intro}>
//           <h1>To get started, edit the page.tsx file.</h1>
//           <p>
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className={styles.ctas}>
//           <a
//             className={styles.primary}
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className={styles.logo}
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className={styles.secondary}
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useState } from "react";

// ── Mock listing data — swap out for real API call later ───────────
const MOCK_LISTING = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  title: "2019 Pierce Enforcer Pumper",
  description:
    "This 2019 Pierce Enforcer is a top-of-the-line Class A pumper with a Waterous 1,500 GPM single-stage pump and a 750-gallon polypropylene tank. Features include a Cummins ISL9 450HP engine, Hale foam system, and full LED lighting package. Well maintained with full service records available.",
  price: 385000,
  year: 2019,
  make: "Pierce",
  model: "Enforcer Pumper",
  mileage: 12400,
  location: "Sacramento, CA",
  condition: "Used",
};

function fmtPrice(val?: number) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function fmtMiles(val?: number) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US").format(val) + " mi";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [listing, setListing] = useState<typeof MOCK_LISTING | null>(null);
  const [loading, setLoading] = useState(false);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setListing(null);
    // Simulated delay — replace with real fetch later
    setTimeout(() => {
      setListing(MOCK_LISTING);
      setLoading(false);
    }, 1200);
  }

  function fillExample(label: string, price: string) {
    setUrl("https://withgarage.com/listing/a1b2c3d4-e5f6-7890-abcd-ef1234567890");
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const invoiceNumber = listing
    ? `GRG-${listing.id.slice(0, 6).toUpperCase()}`
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F0EDE8; min-height: 100vh; }

        .fade-in { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .spinner {
          width: 22px; height: 22px;
          border: 2px solid rgba(214,62,42,0.15);
          border-top-color: #D63E2A;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        input[type=text]:focus { outline: none; }

        .btn-generate {
          width: 100%;
          background: #1a1a1a;
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
        .btn-generate:hover:not(:disabled) { background: #2e2e2e; }
        .btn-generate:active:not(:disabled) { transform: scale(0.98); }
        .btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-dl {
          display: flex; align-items: center; gap: 7px;
          background: #D63E2A; color: #fff;
          border: none; border-radius: 10px;
          padding: 11px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-dl:hover { background: #bf3523; }
        .btn-dl:active { transform: scale(0.98); }

        .example-btn {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px;
          border: 0.5px solid #ebebeb;
          border-radius: 10px;
          background: #fafafa;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          transition: border-color 0.15s, background 0.15s;
        }
        .example-btn:hover { border-color: #D63E2A; background: #fff9f8; }

        .invoice-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.09), 0 0 0 0.5px rgba(0,0,0,0.06);
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{
          padding: "16px 40px",
          display: "flex", alignItems: "center", gap: 10,
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          background: "rgba(240,237,232,0.85)",
          backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{
            width: 28, height: 28, background: "#D63E2A", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 16 16" fill="white" style={{ width: 14, height: 14 }}>
              <path d="M2 11V6l6-3 6 3v5l-6 3-6-3zm6-1.2 3.6-1.8V7L8 5.2 4.4 7v1l3.6 1.8z" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Garage</span>
          <span style={{
            marginLeft: 4, fontSize: 11, color: "#999",
            border: "0.5px solid #ddd", borderRadius: 6,
            padding: "2px 8px", background: "#fff",
          }}>Invoice Generator</span>
        </header>

        {/* Body */}
        <div style={{ display: "flex", flex: 1 }}>

          {/* ── Left panel ── */}
          <div style={{
            width: 380, flexShrink: 0,
            background: "#fff",
            borderRight: "0.5px solid rgba(0,0,0,0.07)",
            padding: "40px 36px",
            display: "flex", flexDirection: "column", gap: 32,
          }}>

            {/* Heading */}
            <div>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 32, fontWeight: 400,
                color: "#1a1a1a", lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}>
                Generate a<br />
                <em style={{ color: "#D63E2A" }}>board-ready</em><br />
                invoice
              </h1>
              <p style={{ fontSize: 13, color: "#888", marginTop: 12, lineHeight: 1.75 }}>
                Paste a Garage listing URL below and we'll build a clean PDF invoice for your department's approval process.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Listing URL
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://withgarage.com/listing/..."
                style={{
                  width: "100%",
                  border: "0.5px solid #e0e0e0", borderRadius: 10,
                  padding: "13px 14px", fontSize: 13,
                  color: "#1a1a1a", background: "#fafafa",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "#D63E2A")}
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

            {/* Example listings */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Try an example
              </span>
              {[
                { label: "2019 Pierce Enforcer Pumper", price: "$385,000" },
                { label: "2021 Ferrara Igniter Aerial", price: "$1,200,000" },
                { label: "2017 KME Predator Tanker", price: "$210,000" },
              ].map(ex => (
                <button
                  key={ex.label}
                  className="example-btn"
                  onClick={() => fillExample(ex.label, ex.price)}
                >
                  <span style={{ fontSize: 12, color: "#444" }}>{ex.label}</span>
                  <span style={{ fontSize: 12, color: "#D63E2A", fontWeight: 500 }}>{ex.price}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: "auto", fontSize: 11, color: "#ccc", lineHeight: 1.7 }}>
              Prices do not include taxes, fees, or delivery. Contact seller for final quote.
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{
            flex: 1, display: "flex",
            alignItems: "center", justifyContent: "center",
            padding: "48px 48px",
            background: "#F0EDE8",
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

            {/* Loading state */}
            {loading && (
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 14px", width: 28, height: 28 }} />
                <p style={{ fontSize: 13, color: "#aaa" }}>Fetching listing data…</p>
              </div>
            )}

            {/* Invoice */}
            {listing && (
              <div className="fade-in" style={{ width: "100%", maxWidth: 580 }}>

                {/* Action bar */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 14,
                }}>
                  <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
                    {listing.title}
                  </span>
                  <button className="btn-dl">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                  </button>
                </div>

                {/* Invoice card */}
                <div className="invoice-card">

                  {/* Dark header */}
                  <div style={{
                    background: "#1a1a1a", padding: "28px 32px",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                        <div style={{
                          width: 22, height: 22, background: "#D63E2A",
                          borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg viewBox="0 0 16 16" fill="white" style={{ width: 11, height: 11 }}>
                            <path d="M2 11V6l6-3 6 3v5l-6 3-6-3zm6-1.2 3.6-1.8V7L8 5.2 4.4 7v1l3.6 1.8z" />
                          </svg>
                        </div>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Garage</span>
                      </div>
                      <p style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>Invoice</p>
                      <p style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 2, letterSpacing: "-0.03em" }}>
                        {invoiceNumber}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>Date issued</p>
                      <p style={{ fontSize: 13, color: "#ccc", marginTop: 4 }}>{today}</p>
                      <span style={{
                        display: "inline-block", marginTop: 12,
                        fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
                        background: "rgba(214,62,42,0.15)", color: "#f07060",
                        border: "0.5px solid rgba(214,62,42,0.3)",
                        borderRadius: 5, padding: "3px 10px",
                      }}>
                        {listing.condition}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div style={{ padding: "24px 32px", borderBottom: "0.5px solid #f0f0f0" }}>
                    <p style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Vehicle</p>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                      {listing.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "#777", marginTop: 8, lineHeight: 1.75 }}>
                      {listing.description}
                    </p>
                  </div>

                  {/* Details grid */}
                  <div style={{ padding: "24px 32px", borderBottom: "0.5px solid #f0f0f0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 40px" }}>
                      {[
                        { label: "Year",      value: listing.year?.toString() },
                        { label: "Make",      value: listing.make },
                        { label: "Model",     value: listing.model },
                        { label: "Mileage",   value: fmtMiles(listing.mileage) },
                        { label: "Location",  value: listing.location },
                        { label: "Condition", value: listing.condition },
                      ].map(f => (
                        <div key={f.label}>
                          <p style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{f.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{f.value ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "0.5px solid #f5f5f5" }}>
                      <p style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Listing ID</p>
                      <p style={{ fontSize: 11, color: "#ccc", fontFamily: "monospace" }}>{listing.id}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{
                    padding: "22px 32px", background: "#fafafa",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <p style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Asking price</p>
                      <p style={{ fontSize: 34, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1 }}>
                        {fmtPrice(listing.price)}
                      </p>
                    </div>
                    <p style={{ fontSize: 11, color: "#bbb", maxWidth: 170, textAlign: "right", lineHeight: 1.65 }}>
                      Price does not include taxes, fees, or delivery. Contact seller for final quote.
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: "13px 32px",
                    background: "#f5f5f5",
                    borderTop: "0.5px solid #ebebeb",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <p style={{ fontSize: 11, color: "#bbb" }}>withgarage.com</p>
                    <p style={{ fontSize: 11, color: "#bbb" }}>Generated {today}</p>
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
