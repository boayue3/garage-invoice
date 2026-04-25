"use client";

import { useState } from "react";

interface Props {
  onGenerate: (url: string) => void;
  loading: boolean;
}

export default function UrlInput({ onGenerate, loading }: Props) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onGenerate(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-[11px] font-medium text-[#999] uppercase tracking-widest">
        Listing URL
      </label>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://shopgarage.com/listing/..."
          className="w-full border border-[#e0e0e0] rounded-lg px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#D63E2A] transition-colors bg-[#fafafa]"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-[#D63E2A] hover:bg-[#c23525] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg py-2.5 transition-colors"
        >
          {loading ? "Fetching…" : "Generate invoice"}
        </button>
      </div>
      <p className="text-[11px] text-[#bbb] leading-relaxed">
        Paste any Garage fire truck listing URL — we'll extract the ID automatically.
      </p>
    </form>
  );
}
