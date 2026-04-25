"use client";

import { Listing } from "@/types/listing";
import { useRef } from "react";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

interface Props {
  listing: Listing;
}

function fmt(val?: number) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

function fmtMiles(val?: number) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US").format(val) + " mi";
}

export default function InvoicePreview({ listing }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceNumber = `GRG-${listing.id.slice(0, 6).toUpperCase()}`;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const fields = [
    { label: "Year", value: listing.year?.toString() },
    { label: "Make", value: listing.make },
    { label: "Model", value: listing.model },
    { label: "Condition", value: listing.condition },
    { label: "Mileage", value: fmtMiles(listing.mileage) },
    { label: "Location", value: listing.location },
    { label: "Listing ID", value: listing.id, mono: true },
  ].filter((f) => f.value);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[600px]">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#999]">Invoice preview</span>
        <div className="flex gap-2">
          <button
            onClick={() => generateInvoicePDF(listing)}
            className="flex items-center gap-1.5 text-[12px] font-medium bg-[#D63E2A] hover:bg-[#c23525] text-white rounded-lg px-4 py-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice card */}
      <div
        ref={invoiceRef}
        className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden"
      >
        {/* Invoice header */}
        <div className="bg-[#1a1a1a] px-8 py-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#D63E2A] rounded flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="white">
                  <path d="M2 11V6l6-3 6 3v5l-6 3-6-3zm6-1.2 3.6-1.8V7L8 5.2 4.4 7v1l3.6 1.8z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-[14px] tracking-tight">Garage</span>
            </div>
            <p className="text-[11px] text-[#666] uppercase tracking-widest">Invoice</p>
            <p className="text-white text-[20px] font-semibold tracking-tight mt-0.5">{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#666] uppercase tracking-widest">Date issued</p>
            <p className="text-white text-[13px] mt-0.5">{today}</p>
            {listing.condition && (
              <span className="inline-block mt-3 text-[11px] bg-[#D63E2A]/20 text-[#f07060] border border-[#D63E2A]/30 rounded px-2 py-0.5">
                {listing.condition}
              </span>
            )}
          </div>
        </div>

        {/* Truck title */}
        <div className="px-8 py-5 border-b border-black/5">
          <p className="text-[11px] text-[#aaa] uppercase tracking-widest mb-1">Vehicle</p>
          <h2 className="text-[18px] font-semibold text-[#1a1a1a] tracking-tight leading-snug">
            {listing.title}
          </h2>
          {listing.description && (
            <p className="text-[13px] text-[#777] mt-2 leading-relaxed line-clamp-3">
              {listing.description}
            </p>
          )}
        </div>

        {/* Fields grid */}
        <div className="px-8 py-5 border-b border-black/5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-[#bbb] uppercase tracking-widest mb-0.5">{f.label}</p>
                <p className={`text-[13px] text-[#1a1a1a] font-medium ${f.mono ? "font-mono text-[11px] text-[#999]" : ""}`}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="px-8 py-5 flex items-center justify-between bg-[#fafafa]">
          <div>
            <p className="text-[11px] text-[#aaa] uppercase tracking-widest mb-0.5">Asking price</p>
            <p className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight">
              {fmt(listing.price)}
            </p>
          </div>
          <div className="text-right text-[11px] text-[#bbb] leading-relaxed max-w-[180px]">
            Price does not include taxes, fees, or delivery. Contact seller for final quote.
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-[#f5f5f5] border-t border-black/5 flex justify-between items-center">
          <p className="text-[11px] text-[#bbb]">shopgarage.com</p>
          <p className="text-[11px] text-[#bbb]">Generated {today}</p>
        </div>
      </div>
    </div>
  );
}
