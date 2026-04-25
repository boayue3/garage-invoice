import { Listing } from "@/types/listing";

function fmt(val?: number) {
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

export async function generateInvoicePDF(listing: Listing) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = 612;
  const invoiceNumber = `GRG-${listing.id.slice(0, 6).toUpperCase()}`;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Header background ──────────────────────────────────────────
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, W, 110, "F");

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Garage", 48, 46);

  // Red accent square
  doc.setFillColor(214, 62, 42);
  doc.roundedRect(28, 30, 14, 14, 2, 2, "F");

  // Invoice label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("INVOICE", 48, 70);

  // Invoice number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(invoiceNumber, 48, 90);

  // Date (right-aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("DATE ISSUED", W - 48, 70, { align: "right" });
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(today, W - 48, 88, { align: "right" });

  // ── Vehicle title section ───────────────────────────────────────
  let y = 138;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  doc.text("VEHICLE", 48, y);
  y += 16;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  const titleLines = doc.splitTextToSize(listing.title, W - 96);
  doc.text(titleLines, 48, y);
  y += titleLines.length * 22;

  if (listing.description) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    const descLines = doc.splitTextToSize(listing.description, W - 96);
    const trimmed = descLines.slice(0, 4);
    doc.text(trimmed, 48, y + 4);
    y += trimmed.length * 14 + 8;
  }

  // Divider
  y += 14;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(48, y, W - 48, y);
  y += 24;

  // ── Details grid ────────────────────────────────────────────────
  const fields = [
    { label: "YEAR", value: listing.year?.toString() },
    { label: "MAKE", value: listing.make },
    { label: "MODEL", value: listing.model },
    { label: "CONDITION", value: listing.condition },
    { label: "MILEAGE", value: fmtMiles(listing.mileage) },
    { label: "LOCATION", value: listing.location },
  ].filter((f) => f.value);

  const colW = (W - 96) / 2;
  fields.forEach((field, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = 48 + col * colW;
    const fy = y + row * 52;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(170, 170, 170);
    doc.text(field.label, fx, fy);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(field.value!, fx, fy + 16);
  });

  y += Math.ceil(fields.length / 2) * 52 + 8;

  // Listing ID
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  doc.text("LISTING ID", 48, y);
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(listing.id, 48, y + 14);
  y += 36;

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(48, y, W - 48, y);
  y += 24;

  // ── Price section ────────────────────────────────────────────────
  doc.setFillColor(250, 250, 250);
  doc.rect(0, y - 12, W, 80, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  doc.text("ASKING PRICE", 48, y + 4);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  doc.text(fmt(listing.price), 48, y + 32);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  const disclaimer = "Price does not include taxes, fees, or delivery.\nContact seller for final quote.";
  doc.text(disclaimer, W - 48, y + 10, { align: "right" });

  y += 80;

  // ── Footer ──────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.rect(0, y, W, 40, "F");
  doc.setDrawColor(230, 230, 230);
  doc.line(0, y, W, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 170, 170);
  doc.text("withgarage.com", 48, y + 24);
  doc.text(`Generated ${today}`, W - 48, y + 24, { align: "right" });

  doc.save(`garage-invoice-${invoiceNumber}.pdf`);
}
